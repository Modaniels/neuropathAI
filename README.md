# NeuraPath - Privacy-First AI Study Tracker

## What is NeuraPath?

NeuraPath is a privacy-first Firefox extension that helps you understand and improve your study habits through AI-powered insights. Track your focus patterns, identify distractions, and get personalized coaching—all while keeping your data 100% local.

## ✨ Key Features

### 🎯 Draggable Floating Widget (NEW!)
- **Always visible** during study sessions
- **Drag anywhere** on the screen
- **Live timer** showing session duration
- **One-click** to end session from any page
- Beautiful animated brain icon with glow effect

### 🎯 Smart Session Tracking
- One-click start/stop for study sessions
- Real-time activity monitoring
- Automatic categorization of websites (productive/neutral/distracting)

### 🤖 AI-Powered Insights
- Personalized coaching after each session
- Historical context-aware recommendations
- Weekly AI summaries with strategic advice
- Pattern change detection and milestone celebrations

### 📊 Advanced Analytics
- **Time-of-Day Analysis:** Learn when you focus best
- **Context Switching Metrics:** Understand focus recovery time (the famous 12-minute rule)
- **Activity Impact Analysis:** Discover which websites help or hurt your productivity
- **Trend Detection:** Track if you're improving, stable, or declining

### ⭐ Enhanced Rating System
- Rate sessions 1-5 stars with optional notes
- Tag sessions for better organization
- Build a comprehensive study history

### 🔒 Privacy First
- **100% local storage** - Your data never leaves your browser
- No account required, no personal data collected
- Only session metrics sent to AI (no identifiable information)
- Open source for full transparency

## 🚀 How It Works

1. **Start a Session:** Click the NeuraPath icon and hit "Start Session"
2. **Floating Widget Appears:** A draggable brain icon 🧠 appears on all your tabs with a live timer
3. **Study Normally:** Browse and work as usual - NeuraPath tracks in the background
4. **End When Done:** Click the floating widget or the toolbar icon to end your session
5. **Get AI Insights:** Receive personalized coaching based on your patterns
6. **Rate & Reflect:** Rate your session and add optional notes
7. **Track Progress:** View weekly summaries and long-term trends

## 📈 What You'll Learn

- **Your Peak Focus Times:** Discover if you're a morning person or night owl
- **Focus Recovery Patterns:** How long it takes to regain deep focus after switching
- **Helpful vs Harmful Sites:** Which activities boost or drain your productivity
- **Weekly Progress:** AI-generated summaries showing your growth and areas to improve
- **Pattern Changes:** Get notified when your habits shift significantly

## 🎓 Perfect For

- Students tracking study sessions
- Researchers managing reading and writing time
- Remote workers improving focus
- Anyone wanting to build better digital habits

## 🛡️ Privacy & Security

NeuraPath is built with privacy as the foundation:

- ✅ All data stored locally using Firefox's secure storage API
- ✅ No external servers (except Gemini AI for insight generation)
- ✅ No personal information collected or transmitted
- ✅ No analytics, no tracking, no ads
- ✅ Open source - audit the code yourself
- ✅ You can delete all data anytime from the Weekly page

## 🤖 AI Technology

NeuraPath uses Google's Gemini 2.0 Flash API for generating personalized insights. Only anonymized session metrics are sent:
- Session duration
- Productivity percentage
- Focus switches count
- Category breakdowns
- Historical averages (when available)

**No personal data, URLs, or identifiable information is ever sent to the AI.**

## 📦 What's Included

- **6 Comprehensive Phases** of features (all complete)
- Session tracking with AI insights
- Enhanced rating system with notes & tags
- Historical pattern analysis
- Time-of-day analytics
- Context switching & focus recovery analysis
- Activity impact analysis
- Weekly AI summaries with historical context

## 🔄 Version History

### Version 1.1.0 (Current)
- **NEW:** Draggable floating widget with live timer
- Click widget to end session from any page
- Widget appears on all tabs during sessions
- Smooth animations and drag-anywhere functionality

### Version 1.0.0 (Initial Release)
- Complete session tracking system
- AI-powered personalized insights
- Enhanced rating with notes and tags
- Historical pattern analysis
- Time-of-day analytics
- Context switching analysis (12-minute focus recovery)
- Activity impact analysis
- Weekly AI summaries
- Milestone celebrations
- Pattern change detection

## 🌟 Why NeuraPath?

Unlike other productivity trackers:
- **AI that learns YOUR patterns** - Not generic advice
- **Privacy-first architecture** - Your data stays yours
- **Scientific backing** - Based on research (like the 12-minute context switching study)
- **Comprehensive analytics** - From micro (per session) to macro (weekly trends)
- **Free and open source** - No subscriptions, no hidden costs

## 🛠️ Technical Details

- **Manifest Version:** 2 (Firefox standard)
- **Minimum Firefox:** 58.0+
- **Permissions Required:**
  - `storage` - Save your session data locally
  - `tabs` - Track visited URLs during active sessions only
- **Storage Limit:** Last 50 sessions (configurable)
- **AI Provider:** Google Gemini 2.0 Flash (optional - works offline with local insights)

## 🔨 Build Instructions

### Requirements
- **No build process required!** This extension uses vanilla JavaScript with no transpilation, minification, or bundling.
- **Operating System:** Any (Windows, macOS, Linux)
- **Firefox:** Version 58.0 or higher

### Build Steps
This extension is **source-ready** and requires no compilation:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Modaniels/neuropathAI.git
   cd neuropathAI
   ```

2. **The source code is ready to use as-is.** No build tools needed!

3. **Load in Firefox for testing:**
   - Open Firefox
   - Navigate to `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on..."
   - Select the `manifest.json` file from the repository

4. **Create distribution ZIP (for Mozilla Add-ons submission):**
   
   **On Windows (PowerShell):**
   ```powershell
   # Navigate to the extension directory
   cd path\to\neuropathAI
   
   # Create ZIP with proper structure
   Add-Type -Assembly System.IO.Compression.FileSystem
   $zipPath = Join-Path (Get-Location) 'neuropath-extension.zip'
   if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
   $zip = [System.IO.Compression.ZipFile]::Open($zipPath, 'Create')
   $files = @('manifest.json', 'background.js', 'content.js') + (Get-ChildItem popup,debrief,weekly,rating,insights,utils,icons -Recurse -File)
   foreach ($file in $files) {
       if ($file -is [string]) {
           $filePath = Join-Path (Get-Location) $file
           $entryName = $file.Replace('\', '/')
       } else {
           $filePath = $file.FullName
           $entryName = $file.FullName.Substring((Get-Location).Path.Length + 1).Replace('\', '/')
       }
       [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $filePath, $entryName, 'Optimal') | Out-Null
   }
   $zip.Dispose()
   Write-Host "ZIP created: neuropath-extension.zip"
   ```

   **On Linux/macOS:**
   ```bash
   # Navigate to the extension directory
   cd path/to/neuropathAI
   
   # Create ZIP with proper structure (excludes docs, git files, markdown files)
   zip -r neuropath-extension.zip \
     manifest.json \
     background.js \
     content.js \
     popup/ \
     debrief/ \
     weekly/ \
     rating/ \
     insights/ \
     utils/ \
     icons/ \
     -x "*.md" "*.git*" "docs/*" "*.zip"
   ```

### File Structure
```
neuropathAI/
├── manifest.json          # Extension configuration
├── background.js          # Background service worker
├── content.js             # Floating widget content script
├── popup/                 # Extension popup UI
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── debrief/              # Session debrief page
├── weekly/               # Weekly summary page
├── rating/               # Session rating page
├── insights/             # Activity impact analysis page
├── utils/                # Utility modules
│   ├── categorizer.js    # Website categorization
│   ├── pattern-analyzer.js
│   ├── focus-analyzer.js
│   ├── activity-impact.js
│   └── api.js           # AI integration
└── icons/               # Extension icons
```

### Source Code Notes
- **No transpilation:** All JavaScript is vanilla ES6+, directly executable by Firefox
- **No minification:** All source code is human-readable and commented
- **No bundling:** Files are loaded individually via manifest.json
- **No dependencies:** Pure JavaScript with no npm packages or build tools
- **API Key:** The Gemini API key in `utils/api.js` should be replaced with your own for production use

### Verification
To verify the extension source matches the distributed version:
1. Extract the ZIP file
2. Compare with the GitHub repository
3. All files should match exactly (no generated or compiled files)

## 📞 Support & Feedback

- **Issues:** Report bugs on [GitHub Issues](https://github.com/Modaniels/neuropathAI/issues)
- **Feature Requests:** Open a discussion on GitHub
- **Source Code:** [github.com/Modaniels/neuropathAI](https://github.com/Modaniels/neuropathAI)

## 📄 License

Open source - Check repository for license details.

---

**Start building better study habits today with NeuraPath!** 🚀
