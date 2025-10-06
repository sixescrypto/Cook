# 🎵 Fix: Audio Files Not Found (404)

## Problem
The game is looking for audio files but getting 404 errors:
- `assets/sounds/track1.mp3` - Reggae Vibes
- `assets/sounds/track2.mp3` - Lo-Fi Hip Hop
- `assets/sounds/rotate.mp3` - Rotation sound

## Solution: Upload Audio Files to GitHub

### Step 1: Check if Files Exist Locally
```bash
ls assets/sounds/
```

You should see:
- `rotate.mp3`
- `track1.mp3`
- `track2.mp3`

### Step 2: Add Files to Git
```bash
cd /Users/ryloe/Desktop/Dope/weed-bud-game

# Add the sounds directory
git add assets/sounds/

# Check what will be committed
git status
```

### Step 3: Commit and Push
```bash
# Commit the audio files
git commit -m "Add audio files (track1, track2, rotate)"

# Push to GitHub
git push origin main
```

### Step 4: Wait for Vercel Deployment
- Go to your Vercel dashboard
- Wait for the new deployment to complete (usually 30 seconds)
- Look for ✅ Ready status

### Step 5: Clear Browser Cache
```javascript
// In browser console
localStorage.clear();
location.reload();
```

## Alternative: Use Free Placeholder Music

If you don't have music files yet, you can find free music here:

### Free Music Resources:
1. **Pixabay** - https://pixabay.com/music/
   - Free for commercial use
   - No attribution required
   - Download as MP3

2. **FreePD** - https://freepd.com/
   - Public domain music
   - Free to use anywhere

3. **Incompetech** - https://incompetech.com/music/
   - Royalty-free music
   - Attribution required

### How to Add Downloaded Music:
1. Download two MP3 files
2. Rename them:
   - `track1.mp3` (for Reggae Vibes)
   - `track2.mp3` (for Lo-Fi Hip Hop)
3. Place in `assets/sounds/` folder
4. Commit and push to GitHub

## Temporary Fix: Disable Audio Errors

If you want to silence the errors temporarily, add this to your browser console:
```javascript
// Mute audio errors temporarily
window.addEventListener('error', function(e) {
    if (e.message && e.message.includes('audio')) {
        e.preventDefault();
        return false;
    }
}, true);
```

## Verify Files Are Uploaded

After pushing to GitHub and Vercel deploys, test:
```
https://cook-beryl.vercel.app/assets/sounds/track1.mp3
https://cook-beryl.vercel.app/assets/sounds/track2.mp3
https://cook-beryl.vercel.app/assets/sounds/rotate.mp3
```

These URLs should:
- ✅ Download/play the audio file (not 404)
- ❌ Show 404 error = files not uploaded

## Common Issues

### Issue: Files show in `git status` as untracked
**Solution:** Files are not added to Git
```bash
git add assets/sounds/*.mp3
git commit -m "Add audio files"
git push
```

### Issue: Files not in GitHub repo
**Solution:** Check GitHub repo → assets/sounds folder
- If folder missing: Files weren't pushed
- If folder empty: Files weren't committed

### Issue: Files in GitHub but 404 on Vercel
**Solution:** Vercel deployment issue
- Check Vercel deployment logs
- Look for errors during build
- Try manually triggering redeploy

### Issue: Large MP3 files
**Solution:** Optimize file size
```bash
# Compress MP3 (requires ffmpeg)
ffmpeg -i track1.mp3 -b:a 128k track1-compressed.mp3
```

Recommended: Keep MP3 files under 5MB each

## File Size Recommendations

| File | Recommended Size | Max Size |
|------|------------------|----------|
| track1.mp3 | 2-5MB | 10MB |
| track2.mp3 | 2-5MB | 10MB |
| rotate.mp3 | 10-50KB | 100KB |

## Quick Command Summary

```bash
# Navigate to project
cd /Users/ryloe/Desktop/Dope/weed-bud-game

# Check files exist
ls -lh assets/sounds/

# Add to Git
git add assets/sounds/

# Commit
git commit -m "Add audio files"

# Push to GitHub (triggers Vercel deploy)
git push origin main

# Check Vercel dashboard for deployment status
```

## Expected Result

After successful upload:
1. Click Radio in game
2. Click Track 1 button
3. ✅ Music plays (no 404 error)
4. Radio glows blue
5. Check console: `🎵 Playing: Reggae Vibes` (no errors)

## Need Help?

If audio still doesn't work after uploading:
1. Check browser console for errors
2. Verify URLs directly in browser
3. Check Vercel deployment logs
4. Ensure file names match exactly (case-sensitive)
