# How to Build NeuraPath - Step by Step Guide

This guide will walk you through the process of building NeuraPath, a privacy-first AI study tracker Firefox extension from scratch.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Phase 1: Core Extension Structure](#phase-1-core-extension-structure)
4. [Phase 2: Session Tracking](#phase-2-session-tracking)
5. [Phase 3: AI Integration](#phase-3-ai-integration)
6. [Phase 4: Rating System](#phase-4-rating-system)
7. [Phase 5: Analytics & Insights](#phase-5-analytics--insights)
8. [Phase 6: Floating Widget](#phase-6-floating-widget)
9. [Testing & Debugging](#testing--debugging)
10. [Publishing](#publishing)

## Prerequisites

Before you start, make sure you have:

- **Firefox Developer Edition** or **Firefox Nightly** (for testing)
- **Text Editor/IDE** (VS Code, Sublime, or your favorite editor)
- **Google Gemini API Key** (free at [Google AI Studio](https://makersuite.google.com/app/apikey))
- **Basic knowledge of:**
  - HTML/CSS
  - JavaScript (ES6+)
  - Browser Extensions API
  - JSON

## Project Setup

### Step 1: Create the Project Structure

Create a new folder for your project and set up the following structure:

```
neuropathAI/
├── manifest.json          # Extension configuration
├── background.js          # Background script for session management
├── content.js            # Content script for floating widget
├── LICENSE               # MIT License
├── README.md             # Project documentation
├── icons/                # Extension icons
│   ├── icon-48.png
│   ├── icon-96.png
│   └── icon-128.png
├── popup/                # Main popup UI
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── debrief/              # Post-session insights
│   ├── debrief.html
│   ├── debrief.css
│   └── debrief.js
├── rating/               # Session rating interface
│   ├── rating.html
│   ├── rating.css
│   └── rating.js
├── insights/             # Historical insights
│   ├── insights.html
│   ├── insights.css
│   └── insights.js
├── weekly/               # Weekly summaries
│   ├── weekly.html
│   ├── weekly.css
│   └── weekly.js
└── utils/                # Utility modules
    ├── api.js
    ├── categorizer.js
    ├── pattern-analyzer.js
    ├── focus-analyzer.js
    └── activity-impact.js
```

### Step 2: Create Icons

Design or download icons for your extension in three sizes:
- 48x48 pixels (for toolbar)
- 96x96 pixels (for addon manager)
- 128x128 pixels (for high-DPI displays)

Save them in the `icons/` folder. I used a brain icon (🧠) theme for NeuraPath.

## Phase 1: Core Extension Structure

### Step 3: Create the Manifest File

The `manifest.json` is the heart of your extension. It defines permissions, scripts, and metadata.

```json
{
  "manifest_version": 2,
  "name": "NeuraPath - AI Study Tracker",
  "version": "1.0.0",
  "description": "Privacy-first AI study habit tracker.",
  
  "icons": {
    "48": "icons/icon-48.png",
    "96": "icons/icon-96.png",
    "128": "icons/icon-128.png"
  },
  
  "permissions": [
    "storage",
    "tabs"
  ],
  
  "background": {
    "scripts": [
      "utils/categorizer.js",
      "utils/pattern-analyzer.js",
      "utils/focus-analyzer.js",
      "utils/activity-impact.js",
      "utils/api.js",
      "background.js"
    ]
  },
  
  "browser_action": {
    "default_icon": "icons/icon-48.png",
    "default_popup": "popup/popup.html",
    "default_title": "NeuraPath"
  },
  
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ]
}
```

**Key Points:**
- `manifest_version: 2` for Firefox compatibility
- `storage` permission for local data storage
- `tabs` permission to track active pages
- Background scripts run continuously
- Content scripts inject into all pages

### Step 4: Create the Basic Popup

Create `popup/popup.html` - this is what users see when they click the extension icon:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>NeuraPath</title>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="popup-container">
    <h1>🧠 NeuraPath</h1>
    <div id="status">Ready to track</div>
    <button id="startBtn">Start Session</button>
    <button id="stopBtn" style="display:none;">End Session</button>
  </div>
  <script src="popup.js"></script>
</body>
</html>
```

Style it with `popup/popup.css` using modern gradients and animations.

### Step 5: Initialize Popup Logic

In `popup/popup.js`, add logic to handle session start/stop:

```javascript
document.addEventListener('DOMContentLoaded', async () => {
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  
  // Check if session is active
  const { sessionActive } = await browser.storage.local.get('sessionActive');
  
  if (sessionActive) {
    startBtn.style.display = 'none';
    stopBtn.style.display = 'block';
  }
  
  startBtn.addEventListener('click', () => {
    browser.runtime.sendMessage({ action: 'startSession' });
  });
  
  stopBtn.addEventListener('click', () => {
    browser.runtime.sendMessage({ action: 'stopSession' });
  });
});
```

## Phase 2: Session Tracking

### Step 6: Build the Background Script

The `background.js` handles all session logic. Here's the core structure:

```javascript
let sessionData = {
  startTime: null,
  activities: [],
  currentTab: null
};

// Listen for messages from popup
browser.runtime.onMessage.addListener((message) => {
  if (message.action === 'startSession') {
    startSession();
  } else if (message.action === 'stopSession') {
    stopSession();
  }
});

function startSession() {
  sessionData.startTime = Date.now();
  browser.storage.local.set({ sessionActive: true });
  
  // Start tracking
  browser.tabs.onActivated.addListener(handleTabChange);
  browser.tabs.onUpdated.addListener(handleTabUpdate);
}

async function stopSession() {
  const duration = Date.now() - sessionData.startTime;
  
  // Calculate metrics
  const metrics = calculateMetrics(sessionData.activities, duration);
  
  // Save session
  await saveSession(metrics);
  
  // Clean up
  browser.storage.local.set({ sessionActive: false });
  sessionData = { startTime: null, activities: [], currentTab: null };
}
```

### Step 7: Create the Website Categorizer

In `utils/categorizer.js`, create a function to classify websites:

```javascript
const categorizer = {
  productive: [
    'github.com', 'stackoverflow.com', 'developer.mozilla.org',
    'coursera.org', 'udemy.com', 'edx.org', 'khanacademy.org'
  ],
  
  distracting: [
    'youtube.com', 'netflix.com', 'facebook.com', 'instagram.com',
    'twitter.com', 'reddit.com', 'tiktok.com'
  ],
  
  categorize(url) {
    const domain = new URL(url).hostname.replace('www.', '');
    
    if (this.productive.some(site => domain.includes(site))) {
      return 'productive';
    }
    if (this.distracting.some(site => domain.includes(site))) {
      return 'distracting';
    }
    return 'neutral';
  }
};
```

## Phase 3: AI Integration

### Step 8: Set Up Gemini API

Create `utils/api.js` to handle AI requests:

```javascript
const GEMINI_API_KEY = 'YOUR_API_KEY_HERE';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

async function getAIInsight(sessionMetrics, historicalData = null) {
  const prompt = buildPrompt(sessionMetrics, historicalData);
  
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('AI Error:', error);
    return 'Unable to generate insights at this time.';
  }
}
```

**Important:** Store the API key securely. Consider using environment variables or user-provided keys.

### Step 9: Create the Debrief Page

After each session, show AI insights in `debrief/debrief.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Session Complete - NeuraPath</title>
  <link rel="stylesheet" href="debrief.css">
</head>
<body>
  <div class="container">
    <h1>🎯 Session Complete!</h1>
    
    <div class="metrics">
      <div class="metric">
        <span class="label">Duration</span>
        <span id="duration" class="value">--</span>
      </div>
      <div class="metric">
        <span class="label">Productivity</span>
        <span id="productivity" class="value">--</span>
      </div>
      <div class="metric">
        <span class="label">Focus Switches</span>
        <span id="switches" class="value">--</span>
      </div>
    </div>
    
    <div class="ai-insight">
      <h2>🤖 AI Coach Says:</h2>
      <div id="insight">Generating insights...</div>
    </div>
    
    <button id="rateBtn">Rate This Session</button>
  </div>
  <script src="debrief.js"></script>
</body>
</html>
```

## Phase 4: Rating System

### Step 10: Build the Rating Interface

Create `rating/rating.html` for users to rate their sessions:

```html
<div class="rating-stars">
  <span class="star" data-rating="1">⭐</span>
  <span class="star" data-rating="2">⭐</span>
  <span class="star" data-rating="3">⭐</span>
  <span class="star" data-rating="4">⭐</span>
  <span class="star" data-rating="5">⭐</span>
</div>

<textarea id="notes" placeholder="Add notes about this session..."></textarea>

<input type="text" id="tags" placeholder="Tags (comma-separated)">

<button id="saveRating">Save Rating</button>
```

Add interactivity in `rating/rating.js`:

```javascript
const stars = document.querySelectorAll('.star');
let selectedRating = 0;

stars.forEach(star => {
  star.addEventListener('click', () => {
    selectedRating = parseInt(star.dataset.rating);
    updateStarDisplay(selectedRating);
  });
});

document.getElementById('saveRating').addEventListener('click', async () => {
  const notes = document.getElementById('notes').value;
  const tags = document.getElementById('tags').value.split(',').map(t => t.trim());
  
  // Save to storage
  await saveRating(selectedRating, notes, tags);
  
  // Redirect to insights
  window.location.href = '../insights/insights.html';
});
```

## Phase 5: Analytics & Insights

### Step 11: Build Pattern Analyzers

Create `utils/pattern-analyzer.js` for time-of-day analysis:

```javascript
const patternAnalyzer = {
  analyzeTimeOfDay(sessions) {
    const hourlyData = Array(24).fill(0).map(() => ({
      count: 0,
      totalProductivity: 0,
      totalDuration: 0
    }));
    
    sessions.forEach(session => {
      const hour = new Date(session.timestamp).getHours();
      hourlyData[hour].count++;
      hourlyData[hour].totalProductivity += session.productivity;
      hourlyData[hour].totalDuration += session.duration;
    });
    
    return hourlyData.map((data, hour) => ({
      hour,
      avgProductivity: data.count > 0 ? data.totalProductivity / data.count : 0,
      avgDuration: data.count > 0 ? data.totalDuration / data.count : 0,
      sessionCount: data.count
    }));
  }
};
```

### Step 12: Create Focus Analyzer

In `utils/focus-analyzer.js`, analyze context switching:

```javascript
const focusAnalyzer = {
  analyzeFocusSwitches(activities) {
    let switches = 0;
    let lastCategory = null;
    let switchTimestamps = [];
    
    activities.forEach(activity => {
      const category = categorizer.categorize(activity.url);
      if (lastCategory && category !== lastCategory) {
        switches++;
        switchTimestamps.push(activity.timestamp);
      }
      lastCategory = category;
    });
    
    // Calculate average time between switches
    const avgTimeBetweenSwitches = calculateAverageInterval(switchTimestamps);
    
    return {
      totalSwitches: switches,
      avgTimeBetweenSwitches,
      focusRecoveryTime: estimateRecoveryTime(switches)
    };
  }
};
```

### Step 13: Build Activity Impact Analyzer

Create `utils/activity-impact.js` to track which sites help or hurt:

```javascript
const activityImpact = {
  analyze(sessions) {
    const siteImpact = {};
    
    sessions.forEach(session => {
      session.activities.forEach(activity => {
        const domain = new URL(activity.url).hostname;
        
        if (!siteImpact[domain]) {
          siteImpact[domain] = {
            visits: 0,
            totalTime: 0,
            avgProductivity: 0,
            category: categorizer.categorize(activity.url)
          };
        }
        
        siteImpact[domain].visits++;
        siteImpact[domain].totalTime += activity.duration;
      });
    });
    
    // Calculate correlations
    return Object.entries(siteImpact)
      .sort((a, b) => b[1].visits - a[1].visits)
      .slice(0, 10);
  }
};
```

### Step 14: Create the Insights Page

Build `insights/insights.html` to display all analytics:

```html
<div class="insights-container">
  <h1>📊 Your Study Insights</h1>
  
  <section class="time-of-day">
    <h2>⏰ Best Study Times</h2>
    <canvas id="timeChart"></canvas>
  </section>
  
  <section class="focus-patterns">
    <h2>🎯 Focus Analysis</h2>
    <div id="focusStats"></div>
  </section>
  
  <section class="top-activities">
    <h2>🌐 Top Activities</h2>
    <div id="activityList"></div>
  </section>
</div>
```

## Phase 6: Floating Widget

### Step 15: Create the Content Script

The `content.js` injects a floating widget on all pages:

```javascript
let widget = null;
let startTime = null;
let timerInterval = null;

// Listen for session start/stop
browser.runtime.onMessage.addListener((message) => {
  if (message.action === 'showWidget') {
    showWidget();
  } else if (message.action === 'hideWidget') {
    hideWidget();
  }
});

function showWidget() {
  if (widget) return;
  
  widget = document.createElement('div');
  widget.id = 'neuropath-widget';
  widget.innerHTML = `
    <div class="widget-content">
      <div class="brain-icon">🧠</div>
      <div class="timer">00:00</div>
      <button class="end-btn">End</button>
    </div>
  `;
  
  // Make it draggable
  makeDraggable(widget);
  
  // Add click handler
  widget.querySelector('.end-btn').addEventListener('click', () => {
    browser.runtime.sendMessage({ action: 'stopSession' });
  });
  
  document.body.appendChild(widget);
  startTimer();
}

function makeDraggable(element) {
  let pos = { x: 0, y: 0, startX: 0, startY: 0 };
  
  element.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('end-btn')) return;
    
    pos.startX = e.clientX;
    pos.startY = e.clientY;
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
  });
  
  function drag(e) {
    pos.x = pos.startX - e.clientX;
    pos.y = pos.startY - e.clientY;
    pos.startX = e.clientX;
    pos.startY = e.clientY;
    
    element.style.top = (element.offsetTop - pos.y) + 'px';
    element.style.left = (element.offsetLeft - pos.x) + 'px';
  }
  
  function stopDrag() {
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
  }
}
```

Add beautiful CSS styling with animations, gradients, and shadows.

## Testing & Debugging

### Step 16: Load the Extension in Firefox

1. Open Firefox
2. Type `about:debugging` in the address bar
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Navigate to your project folder and select `manifest.json`

### Step 17: Test Core Features

- ✅ Start/stop sessions work
- ✅ Widget appears and is draggable
- ✅ Activities are tracked correctly
- ✅ AI insights generate properly
- ✅ Ratings save successfully
- ✅ Analytics display correctly

### Step 18: Debug Common Issues

**Widget not appearing?**
- Check content script injection in manifest
- Verify `all_urls` permission

**Storage not working?**
- Use `browser.storage.local.get()` correctly
- Check async/await usage

**AI not responding?**
- Verify API key is valid
- Check network requests in DevTools
- Review API quota limits

## Publishing

### Step 19: Prepare for Release

1. Update version in `manifest.json`
2. Test on multiple Firefox versions
3. Create screenshots for the store
4. Write a compelling description

### Step 20: Submit to Firefox Add-ons

1. Go to [addons.mozilla.org/developers](https://addons.mozilla.org/developers)
2. Create an account or sign in
3. Click "Submit a New Add-on"
4. Upload your extension as a .zip file
5. Fill in all required metadata
6. Submit for review

## 🎉 Congratulations!

You've built a complete AI-powered study tracker extension! Here's what you learned:

- Browser extension architecture
- Real-time activity tracking
- AI API integration
- Local storage management
- Advanced analytics algorithms
- Draggable UI components
- Content script injection

## 📚 Next Steps

- Add more AI models (Claude, GPT-4)
- Implement data export/import
- Create mobile companion app
- Add study goals and achievements
- Build community features

## 🤝 Contributing

Feel free to fork this project and make it your own! Share your improvements with the community.

## 📞 Support

If you get stuck, check:
- [Firefox Extension Workshop](https://extensionworkshop.com/)
- [MDN Web Extensions API](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions)
- [Gemini API Documentation](https://ai.google.dev/docs)

---

**Built with ❤️ by Modaniels**

*Last Updated: November 2025*
