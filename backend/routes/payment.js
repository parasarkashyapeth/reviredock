import { Router } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { authenticate } from '../middleware/auth.js';
import { supabase } from '../db/supabase.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// ── Razorpay instance ──
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;
const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:8000').replace(/\/+$/, '');

let razorpay = null;

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

/**
 * POST /api/payment/create-payment-link
 * Create a Razorpay Payment Link (hosted checkout — no domain whitelisting needed)
 */
router.post('/create-payment-link', authenticate, async (req, res) => {
    try {
        if (!razorpay) {
            return res.status(503).json({ error: 'Payment gateway not configured. Contact support.' });
        }

        const { planId } = req.body;
        const { businessId, userId } = req.user;

        if (!planId || !PLANS[planId]) {
            return res.status(400).json({ error: 'Invalid plan selected' });
        }

        const plan = PLANS[planId];

        // Check if user already has this plan
        const { data: business } = await supabase
            .from('businesses')
            .select('subscription_plan')
            .eq('id', businessId)
            .single();

        if (business?.subscription_plan === 'paid') {
            return res.status(400).json({ error: 'You already have an active Pro plan' });
        }

        // Fetch user email for prefill
        const { data: userData } = await supabase
            .from('users')
            .select('email')
            .eq('id', userId)
            .single();

        // Generate a unique reference ID for this payment
        const referenceId = `pay_${businessId.substring(0, 8)}_${Date.now()}`;

        // Create Razorpay Payment Link (hosted checkout)
        const paymentLink = await razorpay.paymentLink.create({
            amount: plan.amount,
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
            },
            callback_url: `${FRONTEND_URL}/payment/callback`,
            callback_method: 'get',
            reference_id: referenceId,
            expire_by: Math.floor(Date.now() / 1000) + 30 * 60, // Expires in 30 minutes
        });

        // Store the payment record in our database
        const paymentId = uuidv4();
        await supabase
            .from('payments')
            .insert({
                id: paymentId,
                business_id: businessId,
                user_id: userId,
                razorpay_order_id: paymentLink.order_id || '',
                razorpay_payment_link_id: paymentLink.id,
                plan_id: planId,
                amount: plan.amount,
                currency: plan.currency,
                status: 'created',
                reference_id: referenceId,
            });

        console.log(`📦 [Payment] Payment link created for business ${businessId}: ${paymentLink.short_url}`);

        res.json({
            paymentLinkUrl: paymentLink.short_url,
            paymentLinkId: paymentLink.id,
            referenceId: referenceId,
            amount: plan.amount,
            currency: plan.currency,
            planName: plan.name,
        });
    } catch (error) {
        console.error('Create payment link error:', error);
        res.status(500).json({ error: 'Failed to create payment link' });
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
            const { data: payment, error: fetchError } = await supabase
                .from('payments')
                .select('*')
                .eq('reference_id', referenceId)
                .eq('business_id', businessId)
                .single();

            if (fetchError || !payment) {
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
            await supabase
                .from('payments')
                .update({
                    razorpay_payment_id: razorpayPaymentId,
                    razorpay_order_id: razorpayOrderId,
                    razorpay_payment_link_id: paymentLinkId,
                    status: 'paid',
                    paid_at: now.toISOString(),
                    expires_at: expiresAt.toISOString(),
                    updated_at: now.toISOString(),
                })
                .eq('id', payment.id);

            // ── Step 6: Upgrade the business plan ──
            await supabase
                .from('businesses')
                .update({
                    subscription_plan: plan.subscription_plan,
                    monthly_feedback_limit: plan.monthly_feedback_limit,
                })
                .eq('id', businessId);

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
                await supabase
                    .from('payments')
                    .update({
                        status: 'failed',
                        updated_at: new Date().toISOString(),
                    })
                    .eq('reference_id', referenceId)
                    .eq('business_id', businessId);

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

        const { data: payment, error } = await supabase
            .from('payments')
            .select('id, plan_id, amount, currency, status, paid_at, expires_at, created_at')
            .eq('reference_id', referenceId)
            .eq('business_id', businessId)
            .single();

        if (error || !payment) {
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

        const { data: payments, error } = await supabase
            .from('payments')
            .select('id, plan_id, amount, currency, status, paid_at, expires_at, created_at')
            .eq('business_id', businessId)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch payment history' });
        }

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
