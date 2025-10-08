# Joint Starter Item - Implementation Summary

## What Changed:

### ✅ Added Joint Item
- **Name:** Joint
- **Description:** "Have the first one on us.."
- **Max Allowed:** 1 per player
- **Generation Rate:** 0 BUD/min (decorative only)
- **Cost:** FREE (given automatically)
- **Location:** Not in shop - auto-given to new players

### ✅ Removed Sprout Starter
- Old system gave 1 free Sprout (1000 BUD/min)
- New system gives 1 free Joint (0 BUD/min)

## Implementation Steps:

### 1. Code Changes (Already Done ✅)
- Added joint to `js/itemsConfig.js`
- Joint will not appear in shop (no price entry)

### 2. Database Setup (Run SQL in Supabase)
Run `REMOVE_STARTER_SPROUT.sql` which will:
1. Add joint to `items` table
2. Remove old sprout trigger
3. Create new joint trigger
4. Give joint to new players automatically

### 3. Add Joint Image
- Create or find a joint PNG image
- Save as: `assets/joint.png`
- Recommended size: Similar to sprout.png (probably ~100-200px)

## How It Works:

### For New Players:
1. Player registers with invite code + username
2. **Trigger automatically fires**
3. 1 Joint added to their inventory
4. Player starts with a free decorative item
5. Player must earn/buy real BUD-generating plants

### For Existing Players:
- Optional SQL command in the script to give joints to existing players
- Uncomment the section if you want to give joints retroactively

## Game Impact:

### Before:
- New player gets 1 Sprout (1000 BUD/min)
- Can immediately start earning BUD
- Easier progression

### After:
- New player gets 1 Joint (0 BUD/min)
- Must buy first real plant (Sprout = 5.76M BUD)
- Harder start - encourages:
  - Referring friends (earn 2% of their generation)
  - Purchasing BUD with real money
  - Social engagement

## Next Steps:

1. ✅ Code updated
2. ⏳ Run SQL in Supabase
3. ⏳ Add `assets/joint.png` image
4. ⏳ Test with new player registration
5. ⏳ Push to GitHub

## Testing Checklist:

- [ ] Run SQL in Supabase
- [ ] Clear browser cache
- [ ] Register new player with invite code
- [ ] Check inventory - should have 1 Joint
- [ ] Place joint on grid - should show 0 BUD/min
- [ ] Try to buy joint from shop - should not be available
- [ ] Verify max = 1 (can't have multiple)
