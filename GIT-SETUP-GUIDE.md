# 🔄 Sync Local Files with GitHub Repo

## Your Situation
- **Local Folder**: `/Users/ryloe/Desktop/Dope/weed-bud-game/` (not a Git repo)
- **GitHub Repo**: `https://github.com/sixescrypto/Cook.git`
- **Vercel**: Deploys from GitHub repo

## Problem
Your local files aren't connected to Git, so changes don't push to GitHub/Vercel.

## Solution Options

### **Option 1: Link Local Folder to GitHub (Recommended)**

```bash
# Navigate to your project
cd /Users/ryloe/Desktop/Dope/weed-bud-game

# Initialize Git
git init

# Add your GitHub repo as remote
git remote add origin https://github.com/sixescrypto/Cook.git

# Pull existing files from GitHub (if any)
git pull origin main

# Add all your files
git add .

# Commit
git commit -m "Add all game files including audio"

# Push to GitHub
git push -u origin main
```

### **Option 2: Clone GitHub Repo, Copy Files Over**

```bash
# Go to Desktop
cd /Users/ryloe/Desktop/Dope

# Clone your GitHub repo
git clone https://github.com/sixescrypto/Cook.git Cook-github

# Copy your files to the cloned repo
cp -r weed-bud-game/* Cook-github/

# Go to cloned repo
cd Cook-github

# Add files
git add .

# Commit
git commit -m "Update all game files"

# Push
git push origin main
```

### **Option 3: Use GitHub Desktop (Easiest)**

1. Download **GitHub Desktop**: https://desktop.github.com
2. Open GitHub Desktop
3. Click "Add" → "Add Existing Repository"
4. Choose `/Users/ryloe/Desktop/Dope/weed-bud-game`
5. It will detect it's not a Git repo and offer to create one
6. Link to your GitHub repo: `sixescrypto/Cook`
7. Click "Publish repository"
8. All files will upload automatically

## Step-by-Step: Option 1 (Command Line)

### Step 1: Initialize Git
```bash
cd /Users/ryloe/Desktop/Dope/weed-bud-game
git init
```
**Expected:** `Initialized empty Git repository in...`

### Step 2: Add Remote
```bash
git remote add origin https://github.com/sixescrypto/Cook.git
```

### Step 3: Configure Git (if first time)
```bash
git config user.name "Your Name"
git config user.email "your-email@example.com"
```

### Step 4: Pull Existing Code (if repo not empty)
```bash
# If repo has files already
git pull origin main --allow-unrelated-histories

# Or if repo is empty
git branch -M main
```

### Step 5: Add All Files
```bash
# Add everything
git add .

# Check what will be committed
git status
```

You should see:
- All your `.js` files
- All your `.html`, `.css` files
- `assets/sounds/` folder with MP3 files
- `README.md` and other docs

### Step 6: Commit
```bash
git commit -m "Initial commit: Complete game with audio files"
```

### Step 7: Push to GitHub
```bash
git push -u origin main
```

If you get an error about authentication:
- Use Personal Access Token instead of password
- Or use SSH key
- Or use GitHub Desktop (easier)

## Verify Upload

### Check GitHub
1. Go to https://github.com/sixescrypto/Cook
2. You should see all your files
3. Check `assets/sounds/` folder exists
4. Click on `track1.mp3` to verify it's there

### Check Vercel
1. Go to Vercel dashboard
2. Wait for auto-deployment (30 seconds)
3. Check deployment logs for success
4. Visit your site and test audio

### Test Audio URLs
Open these in browser:
```
https://cook-beryl.vercel.app/assets/sounds/track1.mp3
https://cook-beryl.vercel.app/assets/sounds/track2.mp3
https://cook-beryl.vercel.app/assets/sounds/rotate.mp3
```

Should download/play the audio (not 404).

## Common Issues

### Issue: "Permission denied (publickey)"
**Solution:** Use Personal Access Token
```bash
# Use token as password when prompted
git push origin main
```

Or generate token at: https://github.com/settings/tokens

### Issue: "Updates were rejected because the remote contains work"
**Solution:** Pull first, then push
```bash
git pull origin main --allow-unrelated-histories
git push origin main
```

### Issue: Large files cause push to fail
**Solution:** Check file sizes
```bash
# Check audio file sizes
ls -lh assets/sounds/
```

If MP3 files > 50MB each, compress them.

### Issue: ".git already exists"
**Solution:** Remove and reinitialize
```bash
rm -rf .git
git init
# Then repeat steps above
```

## Future Workflow

Once Git is set up, your workflow will be:

```bash
# 1. Make changes to your files
# 2. Add changes
git add .

# 3. Commit
git commit -m "Description of changes"

# 4. Push (triggers Vercel deploy)
git push origin main

# 5. Wait 30 seconds for Vercel
# 6. Clear browser cache and test
```

## Quick Commands Reference

```bash
# Check Git status
git status

# See what changed
git diff

# Add specific file
git add path/to/file.js

# Add all changes
git add .

# Commit with message
git commit -m "Your message"

# Push to GitHub
git push origin main

# Pull latest from GitHub
git pull origin main

# See commit history
git log --oneline

# Undo last commit (keep changes)
git reset --soft HEAD~1
```

## Need Help?

If Git setup is confusing, **use GitHub Desktop** - it's much easier!

Download: https://desktop.github.com

It has a visual interface and handles all Git commands for you.
