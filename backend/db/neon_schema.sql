-- ============================================
-- NEON POSTGRESQL SCHEMA FOR FEEDBACK SYSTEM
-- Copy and paste this entire file into:
-- Neon Dashboard > SQL Editor
-- Then click "Run"
-- ============================================

-- ============================================
-- TABLE 1: BUSINESSES
-- Stores business information for each owner
-- ============================================
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    logo_url TEXT,
    google_review_url TEXT NOT NULL,
    subscription_plan TEXT DEFAULT 'free',
    monthly_feedback_limit INTEGER DEFAULT 50,
    monthly_feedback_count INTEGER DEFAULT 0,
    last_reset_date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE 2: USERS
-- Stores business owner login credentials
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT, -- Can be NULL for Google OAuth users
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    owner_name TEXT,
    profile_picture_url TEXT,
    google_id TEXT, -- Google OAuth user ID
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE 3: FEEDBACKS
-- Stores customer feedback for each business
-- ============================================
CREATE TABLE IF NOT EXISTS feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    message TEXT,
    customer_email TEXT,            -- Optional email from the customer for reply
    is_positive BOOLEAN NOT NULL DEFAULT FALSE,
    notified BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    owner_reply TEXT,               -- Business owner's reply to the feedback
    replied_at TIMESTAMPTZ,         -- When the owner replied
    source TEXT,                    -- Source: 'qr', 'external', 'google_form', etc.
    ai_sentiment TEXT,              -- AI-detected sentiment: 'positive', 'negative', 'neutral'
    ai_confidence INTEGER,          -- AI confidence score 0-100
    ai_summary TEXT,                -- AI-generated summary for external feedback
    ai_category TEXT,               -- AI-detected category (Food Quality, Service, etc.)
    sentiment_mismatch BOOLEAN DEFAULT FALSE,  -- true when stars don't match AI sentiment
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE 4: PASSWORD RESET TOKENS
-- Stores password reset tokens for users
-- ============================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE 5: EMAIL VERIFICATION OTPs
-- Stores OTP codes for email verification during signup
-- ============================================
CREATE TABLE IF NOT EXISTS email_verification_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE 6: REVIEW PLATFORMS
-- Stores multiple review platform URLs per business
-- ============================================
CREATE TABLE IF NOT EXISTS review_platforms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    platform_name TEXT NOT NULL, 
    platform_label TEXT, 
    url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE, 
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE 7: EXTERNAL SUMMARIES
-- Stores Google Form summaries, Google Reviews, and other external feedback text
-- ============================================
CREATE TABLE IF NOT EXISTS external_summaries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    source_type VARCHAR(50) NOT NULL DEFAULT 'other',
    title VARCHAR(255),
    raw_text TEXT NOT NULL,
    analysis_result JSONB DEFAULT NULL,
    overall_sentiment VARCHAR(20) DEFAULT NULL,
    overall_score INTEGER DEFAULT NULL,
    positive_count INTEGER DEFAULT 0,
    negative_count INTEGER DEFAULT 0,
    total_reviews_found INTEGER DEFAULT 0,
    is_analyzed BOOLEAN DEFAULT FALSE,
    analyzed_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE 8: PAYMENTS
-- Stores subscription payments
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_payment_link_id TEXT,
    plan_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'created',
    reference_id TEXT NOT NULL,
    paid_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR FASTER QUERIES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_feedbacks_business_id ON feedbacks(business_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON feedbacks(created_at);
CREATE INDEX IF NOT EXISTS idx_feedbacks_is_positive ON feedbacks(is_positive);
CREATE INDEX IF NOT EXISTS idx_feedbacks_pinned ON feedbacks(is_pinned) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_feedbacks_replied_at ON feedbacks(replied_at) WHERE replied_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_feedbacks_customer_email ON feedbacks(customer_email) WHERE customer_email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_feedbacks_sentiment_mismatch ON feedbacks(sentiment_mismatch);
CREATE INDEX IF NOT EXISTS idx_feedbacks_ai_sentiment ON feedbacks(ai_sentiment);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_otps_email ON email_verification_otps(email);
CREATE INDEX IF NOT EXISTS idx_email_verification_otps_otp_code ON email_verification_otps(otp_code);
CREATE INDEX IF NOT EXISTS idx_review_platforms_business_id ON review_platforms(business_id);
CREATE INDEX IF NOT EXISTS idx_review_platforms_platform ON review_platforms(platform_name);
CREATE INDEX IF NOT EXISTS idx_external_summaries_business ON external_summaries(business_id);
CREATE INDEX IF NOT EXISTS idx_external_summaries_created ON external_summaries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_business_id ON payments(business_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference_id ON payments(reference_id);
