# 🎯 Puff Daddy Item - Deployment Checklist

## ✅ Changes Made

### 1. **itemsConfig.js** - Item Definition
- ✅ Added Puff Daddy to ITEMS_CONFIG array
- ID: `puff-daddy`
- Name: `Puff Daddy`
- Description: `This is one puffy mfer..`
- Image path: `assets/sprites/puff-daddy.png`
- Type: `placeable`
- Reward rate: `10000 BUD/min`

### 2. **shopSystem.js** - Shop Listing
- ✅ Added Puff Daddy to shopItems array (last position)
- Price: `57600000` (57.6 million BUD)
- Reward rate: `10000 BUD/min`
- Position: Bottom of shop (after Mini-Mary)

### 3. **style.css** - Scrollable Shop
- ✅ Added `max-height: 400px` to `.shop-items`
- ✅ Added `overflow-y: auto` for scrolling
- ✅ Custom scrollbar styling (green with gold hover)
- ✅ Shop UI box size unchanged

### 4. **Database/Server-Side**
- ✅ No changes needed! Game uses client-defined items
- ✅ Server automatically handles via existing RPC functions:
  - `purchase_item()` - Validates purchase, deducts BUD
  - Stores in `inventory` table (player_id, item_id, count)
  - Stores in `placed_plants` table when placed
  - Calculates BUD generation server-side

### 5. **Image Asset**
- ⚠️ **ACTION REQUIRED**: User must manually upload image
- File: `puff-daddy.png` (from attachment)
- Location: `/Users/ryloe/Desktop/Dope/weed-bud-game/assets/sprites/puff-daddy.png`
- Then upload to GitHub: `Cook/assets/sprites/puff-daddy.png`

## 📋 Deployment Steps

### Step 1: Save Image Locally
1. Save the attached Puff Daddy image
2. Name it: `puff-daddy.png`
3. Place in: `/Users/ryloe/Desktop/Dope/weed-bud-game/assets/sprites/`

### Step 2: Upload to GitHub
Upload these files to https://github.com/sixescrypto/Cook:

```
Cook/
├── js/
│   ├── itemsConfig.js        ← Updated ✅
│   └── shopSystem.js         ← Updated ✅
├── css/
│   └── style.css             ← Updated ✅
└── assets/
    └── sprites/
        └── puff-daddy.png    ← Upload this! ⚠️
```

### Step 3: Verify on GitHub
Check that all files are in the correct locations:
- https://github.com/sixescrypto/Cook/blob/main/js/itemsConfig.js
- https://github.com/sixescrypto/Cook/blob/main/js/shopSystem.js
- https://github.com/sixescrypto/Cook/blob/main/css/style.css
- https://github.com/sixescrypto/Cook/blob/main/assets/sprites/puff-daddy.png

### Step 4: Vercel Auto-Deploy
1. Wait 30-60 seconds for Vercel to build
2. Check deployment status: https://vercel.com/dashboard
3. Should see "Ready" with recent timestamp

### Step 5: Test on Live Site
Go to https://cook-beryl.vercel.app and test:

#### Shop Visibility
- [ ] Shop items list is scrollable
- [ ] Scroll bar appears (green with gold hover)
- [ ] Puff Daddy appears at bottom of shop
- [ ] Shop UI box size is unchanged

#### Item Display
- [ ] Puff Daddy image loads correctly
- [ ] Name displays: "Puff Daddy"
- [ ] Description shows: "This is one puffy mfer.."
- [ ] Reward rate shows: "10000 BUD/min"
- [ ] Price shows: "57.60M BUD"

#### Purchase Flow
- [ ] Buy button shows "BUY" (not "GET FREE")
- [ ] Cannot buy if insufficient BUD
- [ ] Can buy if have 57.6M+ BUD
- [ ] Inventory count increases after purchase
- [ ] BUD balance decreases by 57.6M

#### Placement & Function
- [ ] Can equip from inventory
- [ ] Can place on grid tiles
- [ ] Image displays correctly on grid
- [ ] Generates 10,000 BUD/min server-side
- [ ] Can rotate item (horizontal flip)
- [ ] Rotation state persists after refresh

#### Server Sync
- [ ] Purchase syncs to server (visible after refresh)
- [ ] Placed items persist after refresh
- [ ] BUD generation continues server-side
- [ ] No console errors

### Step 6: Clear Cache & Hard Refresh
After deployment:
1. Open site in incognito/private window
2. Or clear cache: `Cmd + Shift + R` (Mac)
3. Test all features again

## 🔍 Troubleshooting

### Image Not Loading (404)
**Problem:** Puff Daddy shows broken image
**Solution:**
1. Check file uploaded to GitHub: `Cook/assets/sprites/puff-daddy.png`
2. Check file name is exactly: `puff-daddy.png` (lowercase, with hyphen)
3. Clear browser cache and hard refresh
4. Wait for Vercel redeploy

### Not in Shop
**Problem:** Puff Daddy doesn't appear in shop
**Solution:**
1. Verify `js/shopSystem.js` uploaded correctly
2. Check browser console for errors
3. Hard refresh page (`Cmd + Shift + R`)

### Shop Not Scrollable
**Problem:** Can't scroll to see Puff Daddy
**Solution:**
1. Verify `css/style.css` uploaded correctly
2. Check if shop has more than 3-4 items (needed for scroll)
3. Hard refresh page

### Purchase Fails
**Problem:** Cannot buy even with enough BUD
**Solution:**
1. Check console for error messages
2. Verify price is `57600000` in `shopSystem.js`
3. Check Supabase logs for RPC errors
4. Verify `purchase_item` RPC function exists in Supabase

### Wrong BUD Generation
**Problem:** Not generating 10000 BUD/min
**Solution:**
1. Check `itemsConfig.js` has `rewardRate: '10000 BUD/min'`
2. Verify server-side BUD calculation function
3. Wait 1 minute and refresh to see accumulated BUD

## 📊 Expected Behavior

### Shop Display
```
┌─────────────────────────────┐
│ Radio       FREE     [BUY]  │
│ Sprout      5.76M    [BUY]  │
│ Mini-Mary   FREE     [BUY]  │
│ Puff Daddy  57.60M   [BUY]  │  ← Scroll to see
└─────────────────────────────┘
     ↕ Scrollbar (green)
```

### Reward Comparison
- Sprout: 1,000 BUD/min (5.76M cost) = 0.17 BUD per 1K spent
- Mini-Mary: 5,000 BUD/min (FREE) = ∞ value (testing)
- Puff Daddy: 10,000 BUD/min (57.6M cost) = 0.17 BUD per 1K spent

### Progression Path
1. Start with 1 free Sprout (1K BUD/min)
2. Buy more Sprouts → Eventually afford Mini-Mary
3. Save up to 57.6M BUD
4. Buy first Puff Daddy (2x Mini-Mary generation)
5. Fill grid with Puff Daddies (250K BUD/min max!)

## ✅ Final Checklist

Before declaring done:
- [ ] Image saved locally: `assets/sprites/puff-daddy.png`
- [ ] Image uploaded to GitHub: `Cook/assets/sprites/puff-daddy.png`
- [ ] All code files uploaded to GitHub
- [ ] Vercel deployment succeeded
- [ ] Shop is scrollable
- [ ] Puff Daddy visible in shop (at bottom)
- [ ] Item details correct (name, desc, price, reward)
- [ ] Can purchase with enough BUD
- [ ] Can place on grid
- [ ] Image displays correctly
- [ ] Generates 10K BUD/min
- [ ] Survives refresh (server persistence)
- [ ] No console errors

## 🎉 Success Criteria

Puff Daddy is successfully integrated when:
1. ✅ Appears at bottom of scrollable shop
2. ✅ Shows correct stats (57.6M BUD, 10K BUD/min)
3. ✅ Can be purchased with server validation
4. ✅ Can be placed and rotated on grid
5. ✅ Generates 10,000 BUD/min server-side
6. ✅ Persists after browser refresh
7. ✅ No errors in console or Supabase logs

## 📝 Notes

- **NO local storage involvement** - All data server-side (cheat-proof)
- **Server validates everything** - Price, BUD balance, inventory
- **Existing RPC functions handle it** - No database schema changes needed
- **Client defines items** - itemsConfig.js + shopSystem.js
- **Database stores instances** - inventory + placed_plants tables

The architecture is designed so adding new items requires:
1. Update `itemsConfig.js` (metadata)
2. Update `shopSystem.js` (shop listing + price)
3. Add image to `assets/sprites/`
4. Deploy to GitHub/Vercel

That's it! No database migrations needed. 🎯
