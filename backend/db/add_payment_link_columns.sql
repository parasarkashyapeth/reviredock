-- ============================================
-- PAYMENTS TABLE MIGRATION — Run in Supabase SQL Editor
-- Adds columns needed for Payment Links + Webhook flow
-- ============================================

-- Add payment link ID column
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS razorpay_payment_link_id TEXT;

-- Add reference_id column (unique per payment attempt)
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS reference_id TEXT;

-- Index on reference_id (used for webhook lookups)
CREATE INDEX IF NOT EXISTS idx_payments_reference_id ON payments(reference_id);

-- Index on payment_link_id
CREATE INDEX IF NOT EXISTS idx_payments_payment_link_id ON payments(razorpay_payment_link_id);

-- ============================================
-- DONE! Payment Link columns added.
-- ============================================
