# 🌿 BUD GARDEN - Isometric Room Builder & Plant Growing Game

A cyberpunk-inspired pixel art idle game where players build their isometric room with furniture, place plants that generate BUD tokens, and manage their virtual garden.

## 🎨 Design Style

- **Dark Cyberpunk Aesthetic**: Inspired by retro terminal interfaces
- **Green-on-Dark Color Scheme**: #00ff41 on #1a1f28 background
- **Isometric Room View**: Interactive grid-based placement system
- **CRT Effects**: Scanlines and vignette for authentic retro feel
- **Minimalist UI**: Clean, functional interface with glowing borders
- **Pixel Perfect**: Press Start 2P font for authentic 8-bit look

## 🎮 Game Overview

- **Duration**: Unlimited - Play as long as you want!
- **Token Supply**: 1,000,000,000 BUD tokens
- **Estimated Users**: 100 players
- **Generation Rate**: Based on placed items (each item has different BUD/min rate)
- **100% Server-Side**: All data stored in Supabase - cheat-proof architecture

## 🏠 How to Play

### Room Building System
1. **Shop for Items** - Browse the shop to purchase furniture and plants
2. **Place Items** - Use the isometric grid to place items in your room
3. **Rotate Items** - Click the rotate button on placed items to flip them horizontally
4. **Remove Items** - Click placed items to remove and return them to inventory
5. **Generate BUD** - Placed items automatically generate BUD over time

### Starting Inventory
- **New Players**: Start with 1 free Sprout automatically
- **Starting BUD**: 0 BUD (earn by placing items)

### Available Items

#### Plants (BUD Generators)
- **Sprout** 🌱 - 1000 BUD/min (Cost: 5.76M BUD)
- **Mini-Mary** 🌿 - 5000 BUD/min (Cost: 28.8M BUD)

#### Furniture
- **Radio** 📻 - 0 BUD/min, Plays music! (Cost: FREE, limit 1)
  - Track 1: Reggae Vibes
  - Track 2: Lo-Fi Hip Hop

### Radio Features
- Click track buttons to play music
- Animated blue glow when playing
- Volume control
- Can be rotated like other items

## 🎮 Controls

### Inventory System
1. **Select Item** - Click an item in your inventory
2. **Equip** - Click EQUIP button to enable placement mode
3. **Place** - Click any open grid tile to place
4. **Unequip** - Auto-unequips when out of items

### Grid System
- **5x5 Isometric Grid** - 25 total tiles
- **Blocked Area** - Front-center tiles reserved for decorative items
- **Visual Feedback** - Tiles glow green on hover when placeable

### Item Rotation
- **Rotate Button** - Appears on placed items
- **Click to Rotate** - Flips item horizontally
- **Sound Effect** - Plays rotation sound (boosted 3x volume)
- **Persistent** - Rotation state saved to database

## 💰 BUD Generation

### How It Works
- Each placed item generates BUD per minute
- Generation happens **server-side** (cheat-proof)
- Offline generation: Catch up on missed time when you return
- BUD automatically accumulates while you're away

### Generation Rates
| Item | Rate | Cost |
|------|------|------|
| Sprout | 1,000 BUD/min | 5.76M BUD |
| Mini-Mary | 5,000 BUD/min | 28.8M BUD |
| Radio | 0 BUD/min | FREE |

### Earning Strategy
1. Place your free Sprout immediately
2. Wait for BUD to accumulate
3. Buy more Sprouts with earned BUD
4. Upgrade to Mini-Marys for higher generation
5. Fill your 5x5 grid with high-value items

## 🔐 Security & Architecture

### 100% Server-Side (Cheat-Proof)
- **No localStorage Loading** - Server is the only source of truth
- **Database Validation** - All purchases, placements verified server-side
- **Real-Time Sync** - Inventory updates instantly to Supabase
- **Offline Protection** - Can't cheat by editing local files

### Database (Supabase PostgreSQL)
- **players** - Player accounts with BUD balance
- **inventory** - Item ownership and counts
- **placed_plants** - Grid positions with rotation state

### Data Flow
```
User Action → Client Request → Supabase Validation → Database Update → Client Refresh
```

All critical operations (purchase, place, remove) go through server validation.

## 🎵 Audio System

### Sound Effects
- **Purchase** - Ka-ching! sound when buying items
- **Place** - Knock/thud sound when placing on grid
- **Rotate** - Whoosh sound when rotating items (3x volume boost)
- **Error** - Buzzer for failed actions

### Music
- **Radio Item** - Place in your room to play music tracks
- **Custom Audio** - Replace `/assets/sounds/track1.mp3` and `track2.mp3` with your own

### Adding Custom Sounds
See `HOW-TO-ADD-SOUNDS.md` for guide on adding custom audio files.

## 🔧 Technical Details

### Files Structure
```
weed-bud-game/
├── index.html              # Main game interface
├── css/
│   └── style.css          # Pixel art styling + isometric grid
├── js/
│   ├── config.js          # Game configuration
│   ├── gameState.js       # Local state management
│   ├── supabaseClient.js  # Server API client
│   ├── inventorySystem.js # Inventory with server sync
│   ├── plantPlacement.js  # Grid placement + rotation
│   ├── shopSystem.js      # Shop with server validation
│   ├── gridSystem.js      # Isometric grid management
│   ├── itemsConfig.js     # Item definitions
│   ├── sounds/
│   │   └── soundEffects.js # Audio system
│   └── main.js            # Game initialization
├── assets/
│   ├── sprites/           # Item images (radio, mini-mary)
│   └── sounds/            # Audio files (rotate.mp3, track1/2.mp3)
└── docs/
    ├── SECURITY.md                    # Security architecture
    ├── 100-PERCENT-SERVER-SIDE.md    # Server-first loading
    ├── HOW-TO-ADD-SOUNDS.md          # Audio guide
    └── STARTING-INVENTORY.md         # New player setup
```

### Database Schema
See `supabase_setup.sql` for complete table definitions.

### Starting Inventory Trigger
New players automatically receive 1 Sprout via PostgreSQL trigger.  
See `supabase_starting_inventory.sql` for implementation.

## � How to Run

### Development (Local)
```bash
# Simply open index.html in a web browser
open index.html

# Or use a local server
python -m http.server 8000
# Navigate to http://localhost:8000
```

### Production (Vercel)
1. Push to GitHub
2. Vercel auto-deploys
3. **Cache Issues?** See `VERCEL-CACHE-TROUBLESHOOTING.md`

### Supabase Setup
1. Create Supabase project
2. Run `supabase_setup.sql` in SQL Editor
3. Run `supabase_starting_inventory.sql` for new player setup
4. Update `js/supabaseClient.js` with your credentials

## 📱 Responsive Design

The game works on:
- ✅ Desktop computers (best experience)
- ✅ Tablets (touch controls)
- ⚠️ Mobile devices (limited by screen size)

## 🎨 Visual Effects

- ✅ Animated earning particles (+BUD floats up)
- ✅ Glowing green grid tiles on hover
- ✅ Item rotation with smooth transform
- ✅ Scanline CRT effect
- ✅ Vignette darkening
- ✅ Radio glow animation when playing

## 🐛 Known Issues & Fixes

All major bugs have been fixed! See documentation:
- `FIXED-INVENTORY-DUPLICATION.md` - Inventory sync bug fix
- `NO-LOCAL-STORAGE-LOADING.md` - Server-only loading implementation

## 🔮 Future Enhancements

- [ ] More furniture items (bed, desk, lamp, etc.)
- [ ] More plant varieties with different generation rates
- [ ] Item stacking (show quantity on grid)
- [ ] Room size upgrades (bigger grids)
- [ ] Visual plant growth stages
- [ ] More music tracks
- [ ] Achievement system
- [ ] Leaderboard (top BUD earners)
- [ ] Real blockchain integration
- [ ] NFT room sharing

## ⚠️ Important Notes

### For Players
- Game saves automatically to Supabase server
- Can play from any device (same account)
- Offline generation catches up when you return
- Can't cheat - everything verified server-side
- Clear browser cache if updates don't show (`Cmd+Shift+R`)

### For Developers  
- All data loads from Supabase on every refresh
- localStorage is write-only (cache only, never read)
- Item images must match IDs in ITEMS_CONFIG
- Sound effects use Web Audio API with MP3 fallback
- Grid positioning uses absolute CSS positioning

## 📊 Balance & Economy

### Progression Path
1. **Start**: 1 free Sprout (1000 BUD/min)
2. **Early Game**: Buy more Sprouts (5.76M BUD each)
3. **Mid Game**: Upgrade to Mini-Marys (28.8M BUD each)
4. **End Game**: Fill 5x5 grid with Mini-Marys (125k BUD/min!)

### Time to Milestones
- **First Sprout**: Instant (free)
- **Second Sprout**: ~96 minutes (5.76M / 1000/min)
- **First Mini-Mary**: ~288 minutes with 1 Sprout
- **Full Grid**: Several days of active play

## 📜 Credits & License

**Game Design**: BUD Garden Team  
**Architecture**: 100% Server-Side (Supabase + Vercel)  
**Audio**: Custom sound effects + Web Audio API  
**Art Style**: Cyberpunk pixel art aesthetic  

This is a demo game for entertainment purposes. Tokenomics are simulated.

---

🌿 **Happy Growing!** 💚

Build your isometric room and watch your BUD tokens grow!

## 📊 Balance & Economy

### Progression Path
1. **Start**: 1 free Sprout (1000 BUD/min)
2. **Early Game**: Buy more Sprouts (5.76M BUD each)
3. **Mid Game**: Upgrade to Mini-Marys (28.8M BUD each)
4. **End Game**: Fill 5x5 grid with Mini-Marys (125k BUD/min!)

### Time to Milestones
- **First Sprout**: Instant (free)
- **Second Sprout**: ~96 minutes (5.76M / 1000/min)
- **First Mini-Mary**: ~288 minutes with 1 Sprout
- **Full Grid**: Several days of active play

## � Credits & License

**Game Design**: BUD Garden Team  
**Architecture**: 100% Server-Side (Supabase + Vercel)  
**Audio**: Custom sound effects + Web Audio API  
**Art Style**: Cyberpunk pixel art aesthetic  

This is a demo game for entertainment purposes. Tokenomics are simulated.

---

🌿 **Happy Growing!** 💚

Build your isometric room and watch your BUD tokens grow!