-- ============================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- Adds ALL missing columns to your live database
-- Safe to run multiple times (uses IF NOT EXISTS)
-- ============================================

-- 1. Add missing columns to FEEDBACKS table
ALTER TABLE feedbacks ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE feedbacks ADD COLUMN IF NOT EXISTS owner_reply TEXT;
ALTER TABLE feedbacks ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ;
ALTER TABLE feedbacks ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;
ALTER TABLE feedbacks ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE feedbacks ADD COLUMN IF NOT EXISTS ai_summary TEXT;
ALTER TABLE feedbacks ADD COLUMN IF NOT EXISTS ai_category TEXT;
ALTER TABLE feedbacks ADD COLUMN IF NOT EXISTS ai_sentiment TEXT;
ALTER TABLE feedbacks ADD COLUMN IF NOT EXISTS ai_confidence INTEGER;
ALTER TABLE feedbacks ADD COLUMN IF NOT EXISTS sentiment_mismatch BOOLEAN DEFAULT FALSE;

-- 2. Add missing column to USERS table
ALTER TABLE feedbacks ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_admin') THEN
        ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 3. Create EXTERNAL_SUMMARIES table if missing
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

-- 4. Add indexes
CREATE INDEX IF NOT EXISTS idx_feedbacks_pinned ON feedbacks(is_pinned) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_feedbacks_replied_at ON feedbacks(replied_at) WHERE replied_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_feedbacks_customer_email ON feedbacks(customer_email) WHERE customer_email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_feedbacks_sentiment_mismatch ON feedbacks(sentiment_mismatch);
CREATE INDEX IF NOT EXISTS idx_feedbacks_ai_sentiment ON feedbacks(ai_sentiment);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);
CREATE INDEX IF NOT EXISTS idx_external_summaries_business ON external_summaries(business_id);
CREATE INDEX IF NOT EXISTS idx_external_summaries_created ON external_summaries(created_at DESC);

-- 5. Enable RLS on new tables
ALTER TABLE external_summaries ENABLE ROW LEVEL SECURITY;

-- 6. Add RLS policies for new tables
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'external_summaries' AND policyname = 'Allow all on external_summaries') THEN
        CREATE POLICY "Allow all on external_summaries" ON external_summaries FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'password_reset_tokens' AND policyname = 'Allow all on password_reset_tokens') THEN
        CREATE POLICY "Allow all on password_reset_tokens" ON password_reset_tokens FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- ============================================
-- DONE! All columns and tables are now in sync.
-- ============================================
