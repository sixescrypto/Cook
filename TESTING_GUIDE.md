## 🚀 Quick Setup & Testing Guide - Auto-Generated Referral System

### Step 1: Setup Database (5 minutes)

1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

2. Run this SQL:
```sql
CREATE_INVITE_CODES_TABLE.sql
```

3. Verify table created with GROW! code:
```sql
-- Check invite codes (should only show GROW!)
SELECT * FROM invite_codes;

-- Check players table has new columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'players' 
AND column_name IN ('wallet_address', 'referral_code', 'referred_by');
```

### Step 2: Test Auto-Code Generation (10 minutes)

#### Part A: First Player (Uses GROW!)

1. **Clear your browser data**:
```javascript
// Open browser console (F12) and run:
localStorage.clear();
location.reload();
```

2. **You should see**: Referral code overlay (fullscreen, green theme)

3. **Enter bootstrap code**: Type `GROW!`
   - This is the ONLY initial code that exists
   - Uppercase G-R-O-W-!

4. **Click PROCEED**: Should validate and show registration

5. **Register first player**:
   - Username: `alice`
   - Wallet: `5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpBoiwapDVnH9E`

6. **Click CONFIRM**: 
   - Account created
   - **Auto-generated code appears top-left!** (e.g., `X7K2M`)
   - Copy your code using the 📋 button

7. **Verify in console**: Look for log message showing generated code

#### Part B: Second Player (Uses First Player's Code)

1. **Open incognito/private window** (or different browser)

2. **Clear storage and reload**:
```javascript
localStorage.clear();
location.reload();
```

3. **Enter first player's code**: Type the code you copied (e.g., `X7K2M`)

4. **Register second player**:
   - Username: `bob`
   - Wallet: `8xYz...` (any valid format)

5. **Click CONFIRM**:
   - Account created
   - **New auto-generated code appears!** (e.g., `P9BQ4`)
   - Different from first player's code

6. **Place plants** and let Bob generate BUD

7. **Check Alice's earnings** - she should earn 2% of Bob's BUD!

#### Part C: Verify Auto-Generation

```sql
-- Check all referral codes (should show GROW!, X7K2M, P9BQ4)
SELECT code, owner_username, times_used FROM invite_codes;

-- Expected:
-- GROW! | SYSTEM  | 1
-- X7K2M | alice   | 1
-- P9BQ4 | bob     | 0

-- Check referral relationships
SELECT id, referral_code, referred_by FROM players;

-- Expected:
-- alice | GROW! | SYSTEM
-- bob   | X7K2M | alice
```

### Step 3: Test Referral Earnings

1. **Let Bob generate BUD** (place plants, wait ~60 seconds)

2. **Check Alice's earnings**:
```sql
-- Alice's direct BUD earnings
SELECT id, total_bud FROM players WHERE id = 'alice';

-- Alice's referral earnings
SELECT code, total_referral_earnings FROM invite_codes WHERE owner_username = 'alice';

-- Should show 2% of Bob's total_bud
```

### Available Initial Code
```
GROW!  (Owned by SYSTEM - bootstrap code)
```

**Note**: This is the ONLY code that exists initially. All other codes are auto-generated!

## 🐛 Common Issues

### "Invalid referral code"
- Make sure SQL script ran successfully
- Check Supabase URL/Key in `js/config/supabase.config.js`
- Verify code exists: `SELECT * FROM invite_codes WHERE code = 'TEST1';`

### Auth overlay won't close
- Check browser console for errors
- Verify game container has class `authenticated`
- Try: `document.querySelector('.game-container').classList.add('authenticated')`

### Player not loading
- Check localStorage: `localStorage.getItem('herbone_username')`
- Verify Supabase connection: `window.supabaseClient.isInitialized`
- Check network tab for API errors

### Referral earnings not showing
- Verify player has `referred_by` field set
- Check console for `payReferralEarnings` logs
- Ensure referrer exists in players table
- Confirm referred player is generating BUD (place plants!)
- System referrals ('SYSTEM') don't pay out

### Referrer total_bud not updating
```sql
-- Check if referral relationship exists
SELECT id, referred_by FROM players WHERE id = 'referred_player';

-- Manually verify referrer exists
SELECT id, total_bud FROM players WHERE id = 'referrer_test';

-- Check referral code ownership
SELECT code, owner_username FROM invite_codes WHERE code = 'TEST1';
```

## 📱 Mobile Testing

1. Open Chrome DevTools (F12)
2. Click device toolbar (Ctrl+Shift+M)
3. Select "iPhone 12 Pro" or similar
4. Reload page
5. Auth screens should be responsive:
   - Smaller code inputs (45x45px)
   - Compact text (6-8px fonts)
   - Fits 400px width

## 🔄 Reset Testing

To test again with same code (codes are reusable):
```sql
-- Just delete test players
DELETE FROM players WHERE id IN ('referred_player', 'referrer_test');

-- Referral code stays active and can be used again!
```

Then clear localStorage and reload.

## ✅ Success Checklist

- [ ] Referral code overlay shows on first visit
- [ ] Code auto-focuses between inputs
- [ ] Paste works (fills all 5 boxes)
- [ ] Invalid code shows error
- [ ] Valid code proceeds to registration
- [ ] Username validation works (min 3 chars)
- [ ] Wallet validation works (32-44 chars)
- [ ] Registration creates player with referral tracking
- [ ] `referred_by` field set correctly
- [ ] `times_used` increments on invite_codes
- [ ] Reload bypasses auth (remembers user)
- [ ] Referred player generates BUD
- [ ] Referrer receives 2% of generated BUD
- [ ] `total_referral_earnings` updates
- [ ] Game loads and functions normally
- [ ] Mobile responsive (test at 400px width)

## 🎮 Next Steps - Referral System is Live!

Your referral system is complete! Here's how it works:

**For Players**:
- Get a referral code from a friend
- Sign up and start playing
- Your referrer earns 2% of your BUD forever

**For Referrers**:
- Share your code with friends
- Earn 2% of everything they generate
- Passive income scales with referrals

**To create codes for your players**:
```sql
INSERT INTO invite_codes (code, owner_username) VALUES ('CODE5', 'player_username');
```

**To check referral stats**:
```sql
-- Top referrers
SELECT 
    owner_username,
    times_used,
    total_referral_earnings
FROM invite_codes 
ORDER BY total_referral_earnings DESC 
LIMIT 10;

-- Player's referral network
SELECT 
    id as "Referred Player",
    total_bud as "Their BUD"
FROM players 
WHERE referred_by = 'your_username'
ORDER BY total_bud DESC;
```

**To monitor earnings**:
```sql
-- Real-time referral earnings
SELECT 
    i.code,
    i.owner_username,
    i.times_used,
    i.total_referral_earnings,
    p.total_bud as "Owner's Total BUD"
FROM invite_codes i
LEFT JOIN players p ON p.id = i.owner_username
WHERE i.owner_username != 'SYSTEM'
ORDER BY i.total_referral_earnings DESC;
```
