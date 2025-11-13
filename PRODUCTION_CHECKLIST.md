# NeuraPath - Production Release Checklist

## 📋 Pre-Submission Checklist

### ✅ Manifest Configuration
- [x] Updated to version 1.0.0
- [x] Changed name from "NeuraPath (Dev)" to "NeuraPath - AI Study Tracker"
- [x] Added proper description for AMO listing
- [x] Added author field
- [x] Added homepage_url (GitHub)
- [x] Added browser_specific_settings with extension ID
- [x] Added proper icon paths (multiple sizes)
- [x] Added default_title for browser action
- [x] Set minimum Firefox version (57.0+)

### 📦 Required Files
- [x] manifest.json (production ready)
- [x] README.md (comprehensive documentation)
- [x] PRIVACY_POLICY.md (required by AMO)
- [ ] LICENSE file (required - need to add)
- [ ] Icons in required sizes:
  - [ ] 16x16 pixels (toolbar)
  - [ ] 32x32 pixels (toolbar retina)
  - [ ] 48x48 pixels (add-ons manager)
  - [ ] 96x96 pixels (add-ons manager retina)
  - [ ] 128x128 pixels (AMO listing - optional but recommended)

### 🎨 Icons TODO
Current icon: `icons/mental-state.png` (unknown size)

**Required Actions:**
1. Check current icon size
2. Create/resize icons for all required sizes:
   - icons/icon-16.png
   - icons/icon-32.png
   - icons/icon-48.png
   - icons/icon-96.png
   - icons/icon-128.png (for AMO listing)

### 🧹 Code Review
- [x] Remove console.log statements (or leave for debugging - Firefox allows them)
- [x] Check for hardcoded API keys (currently in api.js - CONSIDER MOVING TO ENV)
- [x] Verify all file paths are correct
- [x] Test all features work in clean profile
- [ ] Run code linter/validator
- [ ] Check for any dev-only code

### 📝 Documentation
- [x] README.md created
- [x] PRIVACY_POLICY.md created
- [ ] LICENSE file needed
- [x] All phases documented (PHASE_X_COMPLETE.md files)
- [ ] Screenshots for AMO listing (required - need 1-5 screenshots)
- [ ] Icon for AMO listing page

### 🔒 Security & Privacy
- [x] Privacy policy written
- [x] No personal data collection
- [x] Only required permissions requested
- [ ] Review API key security (Gemini key is hardcoded)
- [x] Data stays local except AI metrics
- [x] Clear data deletion option exists

### ⚠️ Critical Issues to Address

#### 1. **API Key Security** 🔴 HIGH PRIORITY
**Current State:** Gemini API key is hardcoded in `utils/api.js`
```javascript
const GEMINI_API_KEY = 'AIzaSyD646fiIdD2Zz1r47AB-gExDC3tgU50XRA';
```

**Problem:** This key will be visible to anyone who installs the extension

**Options:**
- **Option A:** Use user-provided API key (users get their own free key)
- **Option B:** Set up proxy server to hide your key
- **Option C:** Accept the risk (free tier has limits, monitor usage)

**Recommendation:** Implement Option A - let users add their own free Gemini API key in settings

#### 2. **Icons** 🟡 MEDIUM PRIORITY
Need to create proper sized icons for AMO requirements

#### 3. **License** 🟡 MEDIUM PRIORITY
Need to add LICENSE file (MIT, GPL, Apache, etc.)

#### 4. **Screenshots** 🟡 MEDIUM PRIORITY
AMO requires 1-5 screenshots showing:
- Main popup
- Debrief page with AI insight
- Weekly summary page
- Activity impact analysis
- Rating interface

### 🧪 Testing Checklist

Test in clean Firefox profile:
- [ ] Install extension from .xpi
- [ ] Start first session
- [ ] Browse mix of sites
- [ ] End session and check debrief
- [ ] Rate session
- [ ] Complete 3+ sessions
- [ ] Check weekly summary works
- [ ] Test AI summary generation
- [ ] Check insights page
- [ ] Verify no console errors
- [ ] Test on different screen sizes
- [ ] Test with and without internet (AI fallback)

### 📤 AMO Submission Requirements

Mozilla Add-ons (AMO) requires:

1. **Extension Package (.xpi or .zip)**
   - Build with: `web-ext build`
   - Or zip entire directory

2. **Source Code** (if minified/compiled)
   - Not needed - our code is not minified
   - But good to link GitHub repo

3. **Screenshots** (1-5 images)
   - 640x480 minimum
   - Show main features
   - PNG or JPG format

4. **Description** (for AMO listing)
   - Short description (up to 250 chars)
   - Full description (detailed)
   - Already have this in README

5. **Privacy Policy URL**
   - Can use GitHub link to PRIVACY_POLICY.md
   - Or host on separate site

6. **Categories/Tags**
   - Productivity
   - Education
   - Self-improvement

7. **Support Email/URL**
   - GitHub Issues URL: https://github.com/Modaniels/neuropathAI/issues

### 🚀 Build Instructions

Once all items above are complete:

```powershell
# Navigate to extension directory
cd "C:\Users\Modaniels\OneDrive\Documents\Work\neuropathAI"

# Install web-ext if not already installed
npm install -g web-ext

# Validate extension
web-ext lint

# Build .xpi package
web-ext build

# Test in clean profile
web-ext run
```

The built .xpi will be in: `web-ext-artifacts/`

### 📋 AMO Submission Steps

1. **Create Firefox Add-ons Account**
   - Go to https://addons.mozilla.org/developers/
   - Sign in with Firefox Account

2. **Submit New Add-on**
   - Click "Submit a New Add-on"
   - Choose "On this site" (listed on AMO)
   - Upload your .xpi file

3. **Fill Out Listing Information**
   - Name: NeuraPath - AI Study Tracker
   - Summary: From README.md (first paragraph)
   - Description: From README.md (full description)
   - Categories: Productivity, Education
   - Tags: study, productivity, ai, analytics, focus
   - Privacy Policy: Link to GitHub PRIVACY_POLICY.md
   - Support: Link to GitHub Issues

4. **Upload Screenshots**
   - Add 3-5 screenshots showing key features

5. **Submit for Review**
   - Mozilla reviews typically take 1-3 days
   - They may request changes

### ⚠️ Before Submitting

**MUST FIX:**
1. ✅ Icons - create all required sizes
2. ⚠️ API Key - implement user-provided key or proxy
3. ✅ License file - add LICENSE
4. ✅ Screenshots - capture 3-5 key screens

**RECOMMENDED:**
- Test extensively in clean profile
- Have someone else test it
- Prepare for reviewer questions
- Check AMO guidelines: https://extensionworkshop.com/documentation/publish/add-on-policies/

---

## 🎯 Next Steps

1. **Fix API Key Issue** (see options above)
2. **Create Icons** (all required sizes)
3. **Add LICENSE file** (choose license type)
4. **Capture Screenshots** (3-5 images)
5. **Test in clean profile** (full test suite)
6. **Build .xpi** (`web-ext build`)
7. **Submit to AMO** (follow steps above)

---

**Current Status:** ~80% ready for submission
**Blocking Issues:** API key security, icons, license
**Estimated Time to Ready:** 2-4 hours of work
