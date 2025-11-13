# 🦊 Firefox Installation Guide

## Quick Installation Steps

### Method 1: Temporary Installation (for testing)

1. **Open Firefox** and type in the address bar:
   ```
   about:debugging#/runtime/this-firefox
   ```

2. **Click "Load Temporary Add-on..."** button

3. **Navigate to your extension folder:**
   ```
   C:\Users\Modaniels\OneDrive\Documents\Work\neuropathAI
   ```

4. **Select the `manifest.json` file** and click "Open"

5. **Done!** The extension will appear in your toolbar with the brain icon 🧠

**Note:** Temporary extensions are removed when you close Firefox. Use this for testing.

---

### Method 2: Permanent Installation (Development)

#### Step 1: Enable Extension Development Mode
1. Open Firefox and go to `about:config`
2. Search for `xpinstall.signatures.required`
3. Set it to `false` (double-click to toggle)

#### Step 2: Create a Firefox Profile for Development
1. Close Firefox completely
2. Open Run dialog (Win + R)
3. Type: `firefox.exe -P`
4. Click "Create Profile"
5. Name it "NeuraPath Dev" or similar
6. Click "Start Firefox" with the new profile

#### Step 3: Load Your Extension
1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on..."
3. Select `manifest.json` from your extension folder
4. Extension will stay loaded in this profile

---

### Method 3: Package as .xpi (For Distribution)

**To create an installable .xpi file:**

1. **Install web-ext tool** (requires Node.js):
   ```powershell
   npm install -g web-ext
   ```

2. **Navigate to your extension folder:**
   ```powershell
   cd "C:\Users\Modaniels\OneDrive\Documents\Work\neuropathAI"
   ```

3. **Build the extension:**
   ```powershell
   web-ext build
   ```

4. **Your .xpi file will be created in:**
   ```
   web-ext-artifacts/neuropath_dev-0.2.0.xpi
   ```

5. **Install the .xpi:**
   - Drag and drop the .xpi file into Firefox
   - Click "Add" when prompted

---

## ✅ Verification Steps

After installation, verify everything works:

### 1. Check Extension Appears
- Look for the brain icon 🧠 in your Firefox toolbar
- Click it to open the popup

### 2. Test Basic Functionality
- [ ] Click "Start Session" button
- [ ] Browse some websites (try a mix of productive and distracting sites)
- [ ] Click "End Session" button
- [ ] You should be redirected to the Debrief page

### 3. Test AI Features
- [ ] Check if AI insight appears on Debrief page
- [ ] Rate your session (1-5 stars)
- [ ] Add optional notes and tags

### 4. Test Analytics Pages
- [ ] Click "View Weekly Summary" to see weekly analytics
- [ ] After 3+ rated sessions, try "Generate AI Weekly Summary"
- [ ] Click "View Activity Impact Analysis" from Weekly page

### 5. Check Console for Errors
- Press `F12` to open Developer Tools
- Click "Console" tab
- Look for any red error messages
- You should see logs like:
  ```
  🧠 Running Enhanced Smart Dispatcher (Phase 6)...
  📊 Calling Gemini API with historical context...
  ```

---

## 🔧 Troubleshooting

### Issue: Extension doesn't appear
**Solution:** Make sure you selected `manifest.json` file, not a folder

### Issue: "This add-on could not be installed because it appears to be corrupt"
**Solution:** Check that manifest.json is valid JSON with no syntax errors

### Issue: AI insights not appearing
**Solution:** 
1. Check browser console for API errors
2. Verify Gemini API key in `utils/api.js`
3. Check internet connection

### Issue: Pages not loading correctly
**Solution:**
1. Check browser console for errors
2. Verify all file paths in manifest.json are correct
3. Make sure all HTML/CSS/JS files are present

### Issue: Data not persisting
**Solution:**
1. Check Firefox permissions (should show "storage" and "tabs")
2. Look in browser console for storage errors
3. Try clearing extension data: `about:debugging` → Remove → Reload

---

## 🎯 Quick Test Checklist

Use this checklist for a full test after installation:

- [ ] Extension icon appears in toolbar
- [ ] Popup opens with Start/End Session buttons
- [ ] Start Session button works (shows timer)
- [ ] Timer counts up during session
- [ ] Browse websites - URLs are tracked
- [ ] End Session button works
- [ ] Debrief page opens with session summary
- [ ] AI insight appears (for complex sessions)
- [ ] Rating page opens after rating
- [ ] Rating is saved (check Weekly page)
- [ ] Weekly page shows sessions list
- [ ] Time patterns section appears (after multiple sessions)
- [ ] Insights page shows activity impact (after 5+ sessions)
- [ ] Weekly AI summary button appears (after 3+ rated sessions)
- [ ] All navigation links work

---

## 📱 Current Extension Status

**Version:** 0.2.0 (Dev)  
**Manifest Version:** 2 (Firefox compatible)  
**Permissions Required:**
- `storage` - Save session data locally
- `tabs` - Track visited URLs during sessions

**Phases Implemented:**
- ✅ Phase 1: Enhanced Session Rating System
- ✅ Phase 2: Historical Pattern Analysis
- ✅ Phase 3: Time-of-Day Analytics
- ✅ Phase 4: Context Switching Analytics
- ✅ Phase 5: Activity Impact Analysis
- ✅ Phase 6: Enhanced AI Insights

---

## 🚀 Ready to Install!

Your extension is fully prepared and ready for installation. Choose Method 1 (Temporary) for quick testing, or Method 2 (Permanent Development) if you plan to keep developing.

**Recommended:** Start with Method 1 to test everything, then move to Method 2 or 3 if needed.

**Need help?** Check the console logs (F12) for detailed debugging information.
