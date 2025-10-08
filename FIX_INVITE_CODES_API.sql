-- Fix for 406 errors when querying invite_codes table
-- Run this in Supabase SQL Editor if you're getting 406 errors

-- First, ensure the table is in the public schema
ALTER TABLE IF EXISTS invite_codes SET SCHEMA public;

-- Enable Row Level Security (if not already enabled)
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Anyone can read invite codes" ON invite_codes;
DROP POLICY IF EXISTS "Anyone can update invite code stats" ON invite_codes;
DROP POLICY IF EXISTS "Anyone can create invite codes" ON invite_codes;
DROP POLICY IF EXISTS "Enable read access for all users" ON invite_codes;
DROP POLICY IF EXISTS "Enable insert for all users" ON invite_codes;
DROP POLICY IF EXISTS "Enable update for all users" ON invite_codes;

-- Create simple, permissive policies for testing
CREATE POLICY "Enable read access for all users"
    ON invite_codes FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Enable insert for all users"
    ON invite_codes FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update for all users"
    ON invite_codes FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Grant explicit permissions
GRANT ALL ON invite_codes TO anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Verify the table exists and has data
SELECT 'Table exists with ' || COUNT(*) || ' codes' as status FROM invite_codes;
