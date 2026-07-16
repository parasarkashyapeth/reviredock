import { Router } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { authenticate } from '../middleware/auth.js';
import { query } from '../db/neon.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// ── Razorpay instance ──
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;
const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:8000').replace(/\/+$/, '');

let razorpay = null;

// ── Diagnostic boot logs ──
console.log('[Razorpay] KEY_ID present :', !!RAZORPAY_KEY_ID);
console.log('[Razorpay] KEY_ID prefix  :', RAZORPAY_KEY_ID ? RAZORPAY_KEY_ID.substring(0, 12) + '...' : 'MISSING');
console.log('[Razorpay] SECRET present :', !!RAZORPAY_KEY_SECRET);
console.log('[Razorpay] SECRET length  :', RAZORPAY_KEY_SECRET ? RAZORPAY_KEY_SECRET.length : 0);
console.log('[Razorpay] MODE           :', RAZORPAY_KEY_ID?.startsWith('rzp_live_') ? 'LIVE 🔴' : RAZORPAY_KEY_ID?.startsWith('rzp_test_') ? 'TEST 🟢' : 'UNKNOWN ⚠️');

if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
    });
    console.log('✅ Razorpay payment gateway configured');
} else {
    console.warn('⚠️  RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET not set. Payments will fail.');
}

if (!RAZORPAY_WEBHOOK_SECRET) {
    console.warn('⚠️  RAZORPAY_WEBHOOK_SECRET not set. Webhooks will fail verification.');
}

// ── Plan definitions ──
const PLANS = {
    'pro-monthly': {
        name: 'Pro Monthly',
        amount: 29900,          // ₹299 in paise
        currency: 'INR',
        duration_months: 1,
        subscription_plan: 'paid',
        monthly_feedback_limit: 999999,
    },
    'pro-yearly': {
        name: 'Pro Yearly',
        amount: 299900,         // ₹2,999 in paise
        currency: 'INR',
        duration_months: 12,
        subscription_plan: 'paid',
        monthly_feedback_limit: 999999,
    },
};

// ── Coupon definitions ──
// discountPct: percentage off (e.g. 10 = 10% off)
const COUPONS = {
    'WELCOME10':      { discountPct: 10,  description: '10% off for new users' },
    'REVIEWDOCK10':   { discountPct: 10,  description: '10% off – ReviewDock promo' },
    '100XSOLUTIONS':  { discountPct: 10,  description: '10% off – 100X Solutions' },
    'TOP100':         { discountPct: 30,  description: '30% off – Top 100 partner' },
    'TOP500':         { discountPct: 20,  description: '20% off – Top 500 partner' },
    'SAVE15':         { discountPct: 15,  description: '15% off' },
    'SPECIAL15':      { discountPct: 15,  description: '15% off – Special offer' },
};

/**
 * Helper: apply coupon discount to an amount (in paise)
 * Returns { discountedAmount, discountPct, discountAmount } or null if invalid code.
 */
function applyCoupon(baseAmount, couponCode) {
    if (!couponCode) return null;
    const coupon = COUPONS[couponCode.toUpperCase().trim()];
    if (!coupon) return null;
    const discountAmount = Math.round(baseAmount * coupon.discountPct / 100);
    return {
        discountPct: coupon.discountPct,
        discountAmount,
        discountedAmount: baseAmount - discountAmount,
        description: coupon.description,
    };
}

/**
 * POST /api/payment/validate-coupon
 * Validate a coupon code and return discount info — no auth required.
 */
router.post('/validate-coupon', async (req, res) => {
    const { couponCode, planId } = req.body;
    if (!couponCode) {
        return res.status(400).json({ error: 'Coupon code is required' });
    }
    if (!planId || !PLANS[planId]) {
        return res.status(400).json({ error: 'Invalid plan' });
    }
    const plan = PLANS[planId];
    const result = applyCoupon(plan.amount, couponCode);
    if (!result) {
        return res.status(404).json({ error: 'Invalid or expired coupon code' });
    }
    res.json({
        valid: true,
        couponCode: couponCode.toUpperCase().trim(),
        discountPct: result.discountPct,
        discountAmount: result.discountAmount,
        discountAmountDisplay: `₹${(result.discountAmount / 100).toLocaleString('en-IN')}`,
        originalAmount: plan.amount,
        originalAmountDisplay: `₹${(plan.amount / 100).toLocaleString('en-IN')}`,
        finalAmount: result.discountedAmount,
        finalAmountDisplay: `₹${(result.discountedAmount / 100).toLocaleString('en-IN')}`,
        description: result.description,
    });
});

/**
 * POST /api/payment/create-payment-link
 * Create a Razorpay Payment Link (hosted checkout — no domain whitelisting needed)
 */
router.post('/create-payment-link', authenticate, async (req, res) => {
    try {
        if (!razorpay) {
            return res.status(503).json({ error: 'Payment gateway not configured. Contact support.' });
        }

        const { planId, couponCode } = req.body;
        const { businessId, userId } = req.user;

        console.log(`[Payment] create-payment-link called by userId=${userId} businessId=${businessId} planId=${planId} coupon=${couponCode || 'none'}`);
        console.log('[Payment] Using KEY_ID :', RAZORPAY_KEY_ID ? RAZORPAY_KEY_ID.substring(0, 12) + '...' : 'MISSING');
        console.log('[Payment] KEY_ID mode  :', RAZORPAY_KEY_ID?.startsWith('rzp_live_') ? 'LIVE' : 'TEST');

        if (!planId || !PLANS[planId]) {
            return res.status(400).json({ error: 'Invalid plan selected' });
        }

        const plan = PLANS[planId];

        // Apply coupon discount server-side (cannot be tampered by client)
        const couponResult = applyCoupon(plan.amount, couponCode);
        const finalAmount = couponResult ? couponResult.discountedAmount : plan.amount;

        console.log(`[Payment] Plan: ${plan.name} | Base: ${plan.amount} paise | Final: ${finalAmount} paise | Coupon: ${couponResult ? couponResult.discountPct + '%' : 'none'}`);

        // Check if user already has this plan
        const { rows: businessRows } = await query(
            'SELECT subscription_plan FROM businesses WHERE id = $1',
            [businessId]
        );

        const business = businessRows[0];

        if (business?.subscription_plan === 'paid') {
            return res.status(400).json({ error: 'You already have an active Pro plan' });
        }

        // Fetch user email for prefill
        const { rows: userRows } = await query(
            'SELECT email FROM users WHERE id = $1',
            [userId]
        );

        const userData = userRows[0];

        // Generate a unique reference ID for this payment
        const referenceId = `pay_${businessId.substring(0, 8)}_${Date.now()}`;

        const paymentLinkPayload = {
            amount: finalAmount,
            currency: plan.currency,
            description: `ReviewDock ${plan.name} Subscription`,
            reference_id: referenceId,
            callback_url: `${FRONTEND_URL}/payment/callback`,
        };
        console.log('[Payment] Sending to Razorpay:', JSON.stringify(paymentLinkPayload));

        // Create Razorpay Payment Link (hosted checkout)
        const paymentLink = await razorpay.paymentLink.create({
            amount: finalAmount,
            currency: plan.currency,
            accept_partial: false,
            description: `ReviewDock ${plan.name} Subscription`,
            customer: {
                email: userData?.email || '',
            },
            notify: {
                email: true,
            },
            reminder_enable: true,
            notes: {
                business_id: businessId,
                user_id: userId,
                plan_id: planId,
                plan_name: plan.name,
                reference_id: referenceId,
                coupon_code: couponResult ? couponResult.discountPct + '% off' : 'none',
            },
            callback_url: `${FRONTEND_URL}/payment/callback`,
            callback_method: 'get',
            reference_id: referenceId,
            expire_by: Math.floor(Date.now() / 1000) + 30 * 60, // Expires in 30 minutes
        });

        // Store the payment record in our database
        const paymentId = uuidv4();
        await query(
            `INSERT INTO payments (id, business_id, user_id, razorpay_order_id, razorpay_payment_link_id, plan_id, amount, currency, status, reference_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [paymentId, businessId, userId, paymentLink.order_id || '', paymentLink.id, planId, finalAmount, plan.currency, 'created', referenceId]
        );

        console.log(`📦 [Payment] Payment link created for business ${businessId}: ${paymentLink.short_url}`);

        res.json({
            paymentLinkUrl: paymentLink.short_url,
            paymentLinkId: paymentLink.id,
            referenceId: referenceId,
            amount: finalAmount,
            originalAmount: plan.amount,
            currency: plan.currency,
            planName: plan.name,
            couponApplied: couponResult ? true : false,
            discountPct: couponResult?.discountPct || 0,
        });
    } catch (error) {
        console.error('[Payment] ❌ Create payment link FAILED');
        console.error('[Payment] Error statusCode :', error?.statusCode);
        console.error('[Payment] Error description :', error?.error?.description);
        console.error('[Payment] Error code       :', error?.error?.code);
        console.error('[Payment] Full error dump  :', JSON.stringify(error, null, 2));
        res.status(500).json({ error: 'Failed to create payment link', razorpayError: error?.error?.description });
    }
});

/**
 * POST /api/payment/webhook
 * Razorpay webhook — verifies signature and activates the plan
 * 
 * IMPORTANT: This route uses raw body (configured in server.js) for signature verification.
 * Razorpay sends events like `payment_link.paid` and `payment.captured`.
 */
router.post('/webhook', async (req, res) => {
    try {
        // ── Step 1: Verify webhook signature ──
        const webhookSignature = req.headers['x-razorpay-signature'];
        if (!webhookSignature) {
            console.error('[Webhook] Missing x-razorpay-signature header');
            return res.status(400).json({ error: 'Missing signature' });
        }

        if (!RAZORPAY_WEBHOOK_SECRET) {
            console.error('[Webhook] RAZORPAY_WEBHOOK_SECRET not configured');
            return res.status(500).json({ error: 'Webhook secret not configured' });
        }

        // req.rawBody is set by our middleware in server.js
        const rawBody = req.rawBody;
        if (!rawBody) {
            console.error('[Webhook] No raw body available for signature verification');
            return res.status(400).json({ error: 'No body for verification' });
        }

        const expectedSignature = crypto
            .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
            .update(rawBody)
            .digest('hex');

        if (expectedSignature !== webhookSignature) {
            console.error('[Webhook] Signature mismatch!', {
                expected: expectedSignature,
                received: webhookSignature,
            });
            return res.status(400).json({ error: 'Invalid signature' });
        }

        // ── Step 2: Parse the event ──
        const event = req.body;
        console.log(`🔔 [Webhook] Event received: ${event.event}`);

        // We handle `payment_link.paid` — fired when a payment link is fully paid
        if (event.event === 'payment_link.paid') {
            const paymentLinkEntity = event.payload?.payment_link?.entity;
            const paymentEntity = event.payload?.payment?.entity;

            if (!paymentLinkEntity) {
                console.error('[Webhook] No payment_link entity in payload');
                return res.status(200).json({ status: 'ignored' });
            }

            const referenceId = paymentLinkEntity.reference_id;
            const razorpayPaymentId = paymentEntity?.id || '';
            const razorpayOrderId = paymentLinkEntity.order_id || paymentEntity?.order_id || '';
            const paymentLinkId = paymentLinkEntity.id;

            const notes = paymentLinkEntity.notes || {};
            const businessId = notes.business_id;
            const planId = notes.plan_id;

            if (!businessId || !planId) {
                console.error('[Webhook] Missing business_id or plan_id in notes:', notes);
                return res.status(200).json({ status: 'ignored — missing notes' });
            }

            const plan = PLANS[planId];
            if (!plan) {
                console.error('[Webhook] Unknown plan_id:', planId);
                return res.status(200).json({ status: 'ignored — unknown plan' });
            }

            // ── Step 3: Find the payment record ──
            const { rows: paymentRows } = await query(
                'SELECT * FROM payments WHERE reference_id = $1 AND business_id = $2',
                [referenceId, businessId]
            );

            const payment = paymentRows[0];

            if (!payment) {
                console.error('[Webhook] Payment record not found for reference_id:', referenceId);
                // Still return 200 so Razorpay doesn't retry endlessly
                return res.status(200).json({ status: 'payment record not found' });
            }

            // Skip if already processed
            if (payment.status === 'paid') {
                console.log(`[Webhook] Payment ${referenceId} already processed. Skipping.`);
                return res.status(200).json({ status: 'already processed' });
            }

            // ── Step 4: Calculate plan expiry ──
            const now = new Date();
            const expiresAt = new Date(now);
            expiresAt.setMonth(expiresAt.getMonth() + plan.duration_months);

            // ── Step 5: Update payment record ──
            await query(
                `UPDATE payments SET razorpay_payment_id = $1, razorpay_order_id = $2, razorpay_payment_link_id = $3,
                 status = 'paid', paid_at = $4, expires_at = $5, updated_at = $6
                 WHERE id = $7`,
                [razorpayPaymentId, razorpayOrderId, paymentLinkId, now.toISOString(), expiresAt.toISOString(), now.toISOString(), payment.id]
            );

            // ── Step 6: Upgrade the business plan ──
            await query(
                'UPDATE businesses SET subscription_plan = $1, monthly_feedback_limit = $2 WHERE id = $3',
                [plan.subscription_plan, plan.monthly_feedback_limit, businessId]
            );

            console.log(`✅ [Webhook] Business ${businessId} upgraded to ${plan.name} (expires ${expiresAt.toISOString()})`);
            return res.status(200).json({ status: 'ok' });
        }

        // Handle payment.failed — mark payment as failed
        if (event.event === 'payment.failed') {
            const paymentEntity = event.payload?.payment?.entity;
            const notes = paymentEntity?.notes || {};
            const referenceId = notes.reference_id;
            const businessId = notes.business_id;

            if (referenceId && businessId) {
                await query(
                    `UPDATE payments SET status = 'failed', updated_at = $1
                     WHERE reference_id = $2 AND business_id = $3`,
                    [new Date().toISOString(), referenceId, businessId]
                );

                console.log(`❌ [Webhook] Payment failed for reference ${referenceId}`);
            }

            return res.status(200).json({ status: 'ok' });
        }

        // Any other event — acknowledge but don't process
        console.log(`[Webhook] Unhandled event type: ${event.event}`);
        return res.status(200).json({ status: 'ignored' });

    } catch (error) {
        console.error('[Webhook] Error processing webhook:', error);
        // Always return 200 to prevent Razorpay from retrying
        return res.status(200).json({ status: 'error' });
    }
});

/**
 * GET /api/payment/status/:referenceId
 * Check payment status by reference ID (used by callback page after redirect)
 */
router.get('/status/:referenceId', authenticate, async (req, res) => {
    try {
        const { referenceId } = req.params;
        const { businessId } = req.user;

        const { rows } = await query(
            'SELECT id, plan_id, amount, currency, status, paid_at, expires_at, created_at FROM payments WHERE reference_id = $1 AND business_id = $2',
            [referenceId, businessId]
        );

        const payment = rows[0];

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        res.json({
            status: payment.status,
            planName: PLANS[payment.plan_id]?.name || payment.plan_id,
            plan: payment.status === 'paid' ? 'paid' : 'free',
            amountDisplay: `₹${(payment.amount / 100).toLocaleString('en-IN')}`,
            paidAt: payment.paid_at,
            expiresAt: payment.expires_at,
        });
    } catch (error) {
        console.error('Payment status error:', error);
        res.status(500).json({ error: 'Failed to fetch payment status' });
    }
});

/**
 * GET /api/payment/history
 * Get payment history for the business
 */
router.get('/history', authenticate, async (req, res) => {
    try {
        const { businessId } = req.user;

        const { rows: payments } = await query(
            'SELECT id, plan_id, amount, currency, status, paid_at, expires_at, created_at FROM payments WHERE business_id = $1 ORDER BY created_at DESC LIMIT 20',
            [businessId]
        );

        res.json({
            payments: (payments || []).map(p => ({
                ...p,
                amountDisplay: `₹${(p.amount / 100).toLocaleString('en-IN')}`,
                planName: PLANS[p.plan_id]?.name || p.plan_id,
            })),
        });
    } catch (error) {
        console.error('Payment history error:', error);
        res.status(500).json({ error: 'Failed to fetch payment history' });
    }
});

/**
 * GET /api/payment/key
 * Return the Razorpay public key (safe to expose)
 */
router.get('/key', (req, res) => {
    if (!RAZORPAY_KEY_ID) {
        return res.status(503).json({ error: 'Payment gateway not configured' });
    }
    res.json({ key: RAZORPAY_KEY_ID });
});

export default router;
