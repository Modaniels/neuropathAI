# 🎯 Floating Widget Feature

## What's New

NeuraPath now includes a **draggable floating widget** that appears on every webpage during your study sessions!

## Features

### 🧠 Visual Indicator
- **Brain icon (🧠)** floats on your screen
- **Live timer** showing session duration
- **Pulsing animation** to remind you a session is active
- **Beautiful gradient** with teal glow

### 🖱️ Draggable
- **Click and drag** to move anywhere on the screen
- **Smooth animations** when dragging
- **Stays where you put it** across pages
- **Works on all websites** (except Firefox internal pages)

### ⏱️ Real-Time Timer
- Shows **minutes:seconds** (e.g., "00:00", "15:42")
- Updates every second
- Visible at bottom of floating button

### ✨ Interactive
- **Hover** to see tooltip: "Click to end session"
- **Click** the widget to instantly end your session
- **Scales up** on hover for feedback
- **Smooth transitions** for all interactions

## How It Works

### Starting a Session
1. Click the NeuraPath toolbar icon
2. Click "Start Session" in the popup
3. **Floating widget appears** on all your tabs
4. Widget shows live timer

### During Session
- Widget stays visible while you browse
- **Drag it anywhere** you want on the screen
- Timer counts up automatically
- Floating animation keeps it visible but not distracting

### Ending a Session
**Two ways to end:**
1. **Click the floating widget** - Quick and easy!
2. Click toolbar icon → "End Session" button (original method)

Both methods work the same - you'll be taken to the debrief page.

## Design Details

### Appearance
- **Size:** 70x70 pixels (circular)
- **Position:** Bottom-right corner by default
- **Colors:** Dark blue gradient with teal glow
- **Icon:** 🧠 Brain emoji (28px)
- **Timer:** Teal text with glow effect

### Animations
- **Slide in:** Widget appears with smooth slide-up animation
- **Float:** Subtle up/down floating animation
- **Pulse:** Expanding glow effect every 2 seconds
- **Hover:** Scales to 105% with stronger glow
- **Drag:** Smooth dragging with no lag

### Positioning
- **Default:** Bottom-right corner (20px from edges)
- **Draggable:** Move anywhere on screen
- **Persistent:** Stays in position across page navigations
- **Z-index:** Maximum (2147483647) to stay on top

## Technical Details

### Content Script
- Injected into all web pages
- Runs at `document_idle` (after page load)
- Checks session state on load
- Listens for show/hide commands

### Communication
- Background script sends messages to all tabs
- Widget appears/disappears on all tabs simultaneously
- Real-time timer synced with background script

### Compatibility
- Works on all normal web pages
- Doesn't inject into:
  - `about:` pages (Firefox internal)
  - `moz-extension:` pages (extension pages)
  - Other special Firefox URLs

## User Benefits

### 1. **Always Visible Reminder**
- Never forget you're in a session
- Visual feedback keeps you accountable
- Less likely to get distracted

### 2. **Convenient Access**
- No need to click toolbar icon
- One click to end session from any page
- Drag to preferred position (out of the way)

### 3. **Live Feedback**
- See how long you've been studying
- Builds awareness of time passing
- Motivates longer focus sessions

### 4. **Non-Intrusive**
- Small and elegant design
- Drag it anywhere you want
- Subtle animations don't distract
- Easy to ignore when focused

## Customization Ideas (Future)

Potential enhancements users might like:
- [ ] Choose widget position (corners, edges)
- [ ] Customize colors/theme
- [ ] Toggle animations on/off
- [ ] Keyboard shortcut to show/hide
- [ ] Mini productivity meter
- [ ] Session goal progress bar
- [ ] Collapse to just timer
- [ ] Different icon options

## Screenshots Needed

For AMO submission, capture:
1. Widget in default position (bottom-right)
2. Widget being dragged
3. Widget on different websites
4. Hover state with tooltip
5. Widget alongside study content

## Code Structure

```
content.js
├── Widget Creation (HTML/CSS)
├── Dragging Logic (mouse/touch events)
├── Timer Updates (real-time sync)
├── Message Listeners (show/hide)
└── Session Management (end session)
```

---

**This feature makes NeuraPath more immersive and always accessible during study sessions!** 🚀
