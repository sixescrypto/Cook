-- Fix existing players who have wrong referral_code in players table
-- This updates players.referral_code to match the code they OWN in invite_codes table

-- Update Zero's referral_code
UPDATE players 
SET referral_code = (
    SELECT code 
    FROM invite_codes 
    WHERE owner_username = 'Zero' 
    LIMIT 1
)
WHERE username = 'Zero';

-- Update Tester1's referral_code (should be EM01K)
UPDATE players 
SET referral_code = (
    SELECT code 
    FROM invite_codes 
    WHERE owner_username = 'Tester1' 
    LIMIT 1
)
WHERE username = 'Tester1';

-- Fix ALL players automatically (in case there are more)
UPDATE players 
SET referral_code = (
    SELECT code 
    FROM invite_codes 
    WHERE invite_codes.owner_username = players.username 
    LIMIT 1
)
WHERE username IS NOT NULL 
  AND username != 'SYSTEM'
  AND EXISTS (
    SELECT 1 
    FROM invite_codes 
    WHERE invite_codes.owner_username = players.username
  );

-- Verify the fix worked
SELECT 
    p.username,
    p.referral_code as player_code,
    p.referred_by,
    ic.code as invite_code,
    ic.owner_username,
    ic.times_used
FROM players p
LEFT JOIN invite_codes ic ON ic.owner_username = p.username
WHERE p.username IS NOT NULL
ORDER BY p.created_at DESC;
