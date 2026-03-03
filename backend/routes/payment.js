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
 * POST /api/payment/create-order
 * Create a Razorpay order for a plan upgrade
 */
router.post('/create-order', authenticate, async (req, res) => {
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

        // Create Razorpay order (receipt max length is 40 chars)
        const order = await razorpay.orders.create({
            amount: plan.amount,
            currency: plan.currency, // businessId is uuid(36), so grab first 8 chars max
            receipt: `b_${businessId.substring(0, 8)}_${Date.now()}`,
            notes: {
                business_id: businessId,
                user_id: userId,
                plan_id: planId,
                plan_name: plan.name,
            },
        });

        // Store the order in our database for verification later
        const paymentId = uuidv4();
        await supabase
            .from('payments')
            .insert({
                id: paymentId,
                business_id: businessId,
                user_id: userId,
                razorpay_order_id: order.id,
                plan_id: planId,
                amount: plan.amount,
                currency: plan.currency,
                status: 'created',
            });

        res.json({
            orderId: order.id,
            amount: plan.amount,
            currency: plan.currency,
            planName: plan.name,
            key: RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create payment order' });
    }
});

/**
 * POST /api/payment/verify
 * Verify Razorpay payment signature and activate the plan
 */
router.post('/verify', authenticate, async (req, res) => {
    try {
        if (!razorpay) {
            return res.status(503).json({ error: 'Payment gateway not configured' });
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const { businessId } = req.user;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ error: 'Missing payment verification data' });
        }

        // 1. Verify the signature
        const generatedSignature = crypto
            .createHmac('sha256', RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (generatedSignature !== razorpay_signature) {
            console.error('[Payment] Signature mismatch!', {
                expected: generatedSignature,
                received: razorpay_signature,
            });

            // Mark payment as failed
            await supabase
                .from('payments')
                .update({ status: 'failed', updated_at: new Date().toISOString() })
                .eq('razorpay_order_id', razorpay_order_id)
                .eq('business_id', businessId);

            return res.status(400).json({ error: 'Payment verification failed. Signature mismatch.' });
        }

        // 2. Fetch our stored payment record
        const { data: payment, error: fetchError } = await supabase
            .from('payments')
            .select('*')
            .eq('razorpay_order_id', razorpay_order_id)
            .eq('business_id', businessId)
            .single();

        if (fetchError || !payment) {
            return res.status(404).json({ error: 'Payment record not found' });
        }

        if (payment.status === 'paid') {
            return res.json({ message: 'Payment already verified', plan: 'paid' });
        }

        const plan = PLANS[payment.plan_id];
        if (!plan) {
            return res.status(400).json({ error: 'Invalid plan in payment record' });
        }

        // 3. Calculate plan expiry
        const now = new Date();
        const expiresAt = new Date(now);
        expiresAt.setMonth(expiresAt.getMonth() + plan.duration_months);

        // 4. Update payment record
        await supabase
            .from('payments')
            .update({
                razorpay_payment_id,
                razorpay_signature,
                status: 'paid',
                paid_at: now.toISOString(),
                expires_at: expiresAt.toISOString(),
                updated_at: now.toISOString(),
            })
            .eq('id', payment.id);

        // 5. Upgrade the business plan
        await supabase
            .from('businesses')
            .update({
                subscription_plan: plan.subscription_plan,
                monthly_feedback_limit: plan.monthly_feedback_limit,
            })
            .eq('id', businessId);

        console.log(`✅ [Payment] Business ${businessId} upgraded to ${plan.name} (expires ${expiresAt.toISOString()})`);

        res.json({
            message: 'Payment verified and plan activated!',
            plan: plan.subscription_plan,
            planName: plan.name,
            expiresAt: expiresAt.toISOString(),
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ error: 'Failed to verify payment' });
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

