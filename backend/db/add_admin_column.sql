-- ============================================
-- ADD is_admin COLUMN TO USERS TABLE
-- Run this in Supabase SQL Editor
-- ============================================

-- Add is_admin column (defaults to false)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_admin') THEN
        ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Create index for admin lookups
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);

-- ============================================
-- TO MAKE A USER AN ADMIN, run:
-- UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';
-- ============================================
