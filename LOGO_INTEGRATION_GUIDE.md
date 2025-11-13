# NeuraPath Logo Integration Guide

## Step 1: Remove Background from Logo

### Quick Option (Recommended):
1. Go to **https://www.remove.bg/**
2. Upload `icons/neuropathlogo.jpg`
3. Download the result
4. Save as `icons/neuropathlogo-nobg.png` in the icons folder

### Alternative Options:
- **Photopea** (free online): https://www.photopea.com/
- **Paint.NET** (Windows app): https://www.getpaint.net/
- **GIMP** (free desktop): https://www.gimp.org/

---

## Step 2: Pages That Will Get the Logo

Once you save `neuropathlogo-nobg.png`, I'll automatically update these pages:

### 1. **Popup** (`popup/popup.html`)
- Add logo above "NeuraPath" title
- Small size, centered

### 2. **Debrief Page** (`debrief/debrief.html`)
- Logo in header next to title
- Medium size

### 3. **Weekly Summary** (`weekly/weekly.html`)
- Logo in header
- Branding consistency

### 4. **Rating Page** (`rating/rating.html`)
- Logo in header
- Professional look

### 5. **Insights Page** (`insights/insights.html`)
- Logo in header
- Consistent branding

### 6. **Landing Page** (`docs/index.html`)
- Hero section logo
- Large, prominent display

---

## Logo Placement Design

### Popup (Small - 40px)
```
┌───────────────┐
│   [🧠 LOGO]   │
│   NeuraPath   │
│               │
│ [Start Sess...│
└───────────────┘
```

### Main Pages (Medium - 60px)
```
┌─────────────────────────┐
│  [🧠 LOGO] NeuraPath    │
│  Session Debrief         │
└─────────────────────────┘
```

### Landing Page (Large - 120px)
```
┌───────────────────────────┐
│                           │
│       [🧠 LARGE LOGO]     │
│        NeuraPath          │
│   Stop Guessing. Start    │
│        Learning.          │
│                           │
└───────────────────────────┘
```

---

## Current Status

✅ Manifest updated to use `neuropathlogo.jpg`
⏳ Waiting for `neuropathlogo-nobg.png` (transparent version)
⏳ Page updates ready to apply

---

## After You Create the Transparent PNG

**Just tell me:** "I've created the transparent logo"

**And I'll:**
1. Update all 6 pages to include the logo
2. Add proper styling for each page
3. Ensure consistent branding across the extension
4. Make it look professional and polished

---

## Quick Command

Once you have the file, check if it's there:
```powershell
Test-Path "icons\neuropathlogo-nobg.png"
```

If it returns `True`, you're ready! 🎉
