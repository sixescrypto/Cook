# 🔧 Audio 404 Troubleshooting - Cache Issues

## You've uploaded the files but still getting 404s?

### Step 1: Verify Files on GitHub
1. Go to: https://github.com/sixescrypto/Cook/tree/main/assets/sounds
2. You should see:
   - `track1.mp3`
   - `track2.mp3`
   - `rotate.mp3`

**If files are NOT there:** Upload didn't work. Try again.
**If files ARE there:** Continue to Step 2.

### Step 2: Check Vercel Deployment
1. Go to Vercel dashboard: https://vercel.com/dashboard
2. Find your project: **Cook**
3. Check latest deployment:
   - Status should be "Ready" (not "Building")
   - Time should be AFTER you uploaded the files
4. Click on the deployment
5. Look at the deployment files - check if `assets/sounds/` exists

**If deployment is old:** GitHub push didn't trigger Vercel. Try Step 3.
**If deployment is new but no sounds folder:** Files not in the right place on GitHub.

### Step 3: Force Vercel Redeploy
1. Go to your Vercel project settings
2. Click "Deployments" tab
3. Find latest deployment
4. Click "..." → "Redeploy"
5. Wait 30-60 seconds for build to complete

### Step 4: Test Direct File Access
Open these URLs in a NEW incognito/private window:

```
https://cook-beryl.vercel.app/assets/sounds/track1.mp3
https://cook-beryl.vercel.app/assets/sounds/track2.mp3
https://cook-beryl.vercel.app/assets/sounds/rotate.mp3
```

**Expected:** File downloads or plays in browser
**If 404:** Files not deployed yet

### Step 5: Clear ALL Caches

#### A) Clear Browser Cache
**Hard Refresh:**
- Mac: `Cmd + Shift + R`
- Windows: `Ctrl + Shift + R`

**Or clear manually:**
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

#### B) Clear Service Worker (if you have one)
1. DevTools → Application tab
2. Service Workers section
3. Click "Unregister"

#### C) Clear localStorage
Console:
```javascript
localStorage.clear();
location.reload();
```

### Step 6: Check File Paths on GitHub

The files MUST be at:
```
Cook/
├── assets/
│   └── sounds/
│       ├── track1.mp3
│       ├── track2.mp3
│       └── rotate.mp3
```

**Common mistakes:**
- ❌ `Cook/sounds/` (missing assets folder)
- ❌ `Cook/assets/sound/` (wrong folder name)
- ❌ `Cook/weed-bud-game/assets/sounds/` (extra folder)

### Step 7: Verify File Names (Case Sensitive!)
Files must be named EXACTLY:
- `track1.mp3` (not Track1.mp3, not track1.MP3)
- `track2.mp3`
- `rotate.mp3`

Linux/Vercel servers are case-sensitive!

## Quick Diagnostic Commands

### Test from terminal:
```bash
# Test if files are accessible
curl -I https://cook-beryl.vercel.app/assets/sounds/track1.mp3

# Should return: HTTP/2 200 (not 404)
```

### Test in browser console:
```javascript
// Test file loading
fetch('https://cook-beryl.vercel.app/assets/sounds/track1.mp3')
  .then(r => console.log('Status:', r.status))
  .catch(e => console.error('Error:', e));

// Should log: Status: 200
```

## Still Not Working?

### Check GitHub File Structure
Run this to see your GitHub repo structure:
```bash
# Clone repo to temp location to inspect
cd ~/Desktop
git clone https://github.com/sixescrypto/Cook.git temp-check
cd temp-check
ls -la assets/sounds/
```

Should show:
```
track1.mp3
track2.mp3
rotate.mp3
```

### Check Vercel Build Logs
1. Vercel dashboard → Your project
2. Click latest deployment
3. Click "Building" or "Deployment Logs"
4. Look for errors like:
   - "File too large"
   - "Invalid file type"
   - Build warnings

### File Size Issue?
If MP3 files are huge (>50MB each), Vercel might reject them:

```bash
# Check file sizes
ls -lh assets/sounds/
```

If too large, compress them:
```bash
# Install ffmpeg (if needed)
brew install ffmpeg

# Compress audio
ffmpeg -i track1.mp3 -b:a 128k track1-compressed.mp3
```

## Nuclear Option: Fresh Upload

If nothing works:

1. **Delete the sounds folder on GitHub**
2. **Re-upload ALL files**:
   - Go to GitHub → Cook repo
   - Create `assets/sounds/` folder
   - Upload track1.mp3
   - Upload track2.mp3
   - Upload rotate.mp3
3. **Force Vercel redeploy**
4. **Hard refresh browser** (Cmd+Shift+R)
5. **Test in incognito window**

## Expected Console Output (Working)

When audio works, you should see:
```
🎵 Playing: Reggae Vibes
🎵 Playing Track 1 from assets/sounds/track1.mp3
(Audio plays - no errors)
```

**NOT:**
```
❌ Error playing audio: NotSupportedError
GET track1.mp3 404 (Not Found)
```

## Common Solutions

| Problem | Solution |
|---------|----------|
| Files on GitHub but 404 | Clear browser cache, hard refresh |
| Old deployment time | Force Vercel redeploy |
| Wrong file path | Check GitHub structure matches `assets/sounds/` |
| Case sensitivity | Rename files to lowercase |
| Service worker cache | Unregister service worker |
| Vercel not deploying | Check Vercel GitHub integration |

## Need More Help?

Share these details:
1. Screenshot of GitHub repo showing assets/sounds/ folder
2. Latest Vercel deployment time
3. Result of: `curl -I https://cook-beryl.vercel.app/assets/sounds/track1.mp3`
4. Browser console error (full message)
