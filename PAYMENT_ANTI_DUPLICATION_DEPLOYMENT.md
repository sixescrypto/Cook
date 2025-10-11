# Payment Anti-Duplication System - Deployment Instructions

## Overview
This system prevents users from reusing the same blockchain payment signature to claim multiple upgrades/items. Each payment can only be used once.

## Database Setup

### 1. Run the SQL Script
Execute the SQL script in your Supabase SQL editor:
```bash
File: CREATE_VERIFIED_PAYMENTS_TABLE.sql
```

This will create:
- `verified_payments` table to store used payment signatures
- Indexes for fast lookups
- RPC functions for checking and storing payment signatures

### 2. Verify Table Creation
Check that the following table exists in your Supabase dashboard:
- `verified_payments` with columns: id, signature, player_id, wallet_from, wallet_to, amount_sol, transaction_time, verified_at, item_purchased, used_for, created_at

## How It Works

### Security Flow:
1. **Payment Verification**: When a user claims their payment was sent, the system checks the blockchain
2. **Signature Check**: Before accepting the payment, the system checks if this exact transaction signature has been used before
3. **Signature Storage**: If the payment is valid and unused, the signature is immediately stored in the database
4. **Upgrade Completion**: Only after successful signature storage does the user receive their items

### Protection Against:
- ✅ **Double Spending**: Same payment used twice
- ✅ **Race Conditions**: Multiple simultaneous claims of same payment
- ✅ **Payment Reuse**: Using old payments for new upgrades
- ✅ **Database Consistency**: Atomic operations ensure data integrity

## Code Changes Made

### 1. New Database Functions (supabaseClient.js)
- `checkPaymentSignatureUsed(signature)` - Check if signature was used
- `storeVerifiedPayment(paymentDetails, usedFor, itemPurchased)` - Store verified payment

### 2. Enhanced Payment Verification (plantPlacement.js v2.2)
- Checks database before accepting any payment
- Stores signature immediately after verification
- Prevents upgrade if signature already used
- Shows clear error messages to users

### 3. Database Schema (CREATE_VERIFIED_PAYMENTS_TABLE.sql)
- Complete table structure with indexes
- RPC functions for secure access
- Proper foreign key relationships

## Testing

### Test Scenarios:
1. **Normal Payment**: User pays 0.1 SOL → Gets upgrade → Payment stored
2. **Duplicate Attempt**: Same user tries to use same payment again → Blocked with error
3. **Different User**: Different user tries to use someone else's payment → Blocked
4. **Race Condition**: Two users try to use same payment simultaneously → Only first succeeds

### Error Messages Users Will See:
- "This payment has already been used. Each payment can only be used once."
- "Database error checking payment history. Please try again."
- "Error storing payment verification. Please try again."

## Production Deployment

### Prerequisites:
1. Supabase database with all tables set up
2. RPC functions deployed and accessible
3. Proper database permissions configured

### Deployment Steps:
1. Run `CREATE_VERIFIED_PAYMENTS_TABLE.sql` in Supabase
2. Deploy updated JavaScript files with version 2.2
3. Clear browser cache to ensure new versions load
4. Test payment flow thoroughly before going live

## Monitoring

### Key Metrics to Watch:
- Payment signature collision attempts
- Database errors during payment storage
- User complaints about legitimate payments being rejected

### Database Queries for Monitoring:
```sql
-- Check recent payment activity
SELECT * FROM verified_payments ORDER BY verified_at DESC LIMIT 50;

-- Check for duplicate signature attempts (should be rare)
SELECT signature, COUNT(*) FROM verified_payments GROUP BY signature HAVING COUNT(*) > 1;

-- Monitor payment volume
SELECT DATE(verified_at), COUNT(*) FROM verified_payments GROUP BY DATE(verified_at) ORDER BY DATE(verified_at) DESC;
```

## Rollback Plan
If issues arise, you can temporarily disable signature checking by commenting out the database check in `plantPlacement.js` line ~2208-2224, but this removes anti-duplication protection.

## Security Notes
- Payment signatures are cryptographically unique per transaction
- Database uses UNIQUE constraint to prevent duplicates at DB level
- RPC functions use SECURITY DEFINER for proper access control
- All payment verification happens server-side for security