-- Create invite_codes table for referral system
-- Each code can be used multiple times
-- Code owner earns 2% of referred players' BUD generation
CREATE TABLE IF NOT EXISTS invite_codes (
    code TEXT PRIMARY KEY,
    owner_username TEXT NOT NULL,
    times_used INTEGER DEFAULT 0,
    total_referral_earnings NUMERIC DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add referral tracking columns to players table
ALTER TABLE players ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE players ADD COLUMN IF NOT EXISTS wallet_address TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS referred_by TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_invite_codes_owner ON invite_codes(owner_username);
CREATE INDEX IF NOT EXISTS idx_players_referral_code ON players(referral_code);
CREATE INDEX IF NOT EXISTS idx_players_referred_by ON players(referred_by);

-- Insert initial referral code (only GROW!)
-- New players will automatically get their own codes generated
INSERT INTO invite_codes (code, owner_username) VALUES
    ('GROW!', 'SYSTEM')
ON CONFLICT (code) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can read invite codes" ON invite_codes;
DROP POLICY IF EXISTS "Anyone can update invite code stats" ON invite_codes;
DROP POLICY IF EXISTS "Anyone can create invite codes" ON invite_codes;

-- Create policy to allow reading invite codes (for validation)
CREATE POLICY "Anyone can read invite codes"
    ON invite_codes FOR SELECT
    USING (true);

-- Create policy to allow updating invite codes (incrementing usage counter)
CREATE POLICY "Anyone can update invite code stats"
    ON invite_codes FOR UPDATE
    USING (true);

-- Create policy to allow inserting new invite codes (for new players)
CREATE POLICY "Anyone can create invite codes"
    ON invite_codes FOR INSERT
    WITH CHECK (true);

-- Grant permissions
GRANT SELECT, UPDATE, INSERT ON invite_codes TO anon, authenticated;

