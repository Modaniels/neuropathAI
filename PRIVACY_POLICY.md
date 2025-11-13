# Privacy Policy for NeuraPath

**Last Updated:** November 13, 2025

## Overview

NeuraPath is committed to protecting your privacy. This extension is built with a privacy-first philosophy - your data stays on your device.

## Data Collection

### What We Collect Locally
NeuraPath stores the following data **locally on your device only**:
- Session timestamps (start and end times)
- Website domains visited during sessions (not full URLs)
- Session duration
- User ratings (1-5 stars)
- Optional notes and tags you add
- Calculated metrics (productivity percentage, focus switches)

### What We DO NOT Collect
- Personal information (name, email, etc.)
- Full URLs or page titles
- Passwords or form data
- Browsing history outside of active sessions
- Any data that identifies you personally

## Data Storage

- **Local Storage Only:** All your session data is stored in Firefox's local storage API on your device
- **No Cloud Sync:** We do not sync or upload your data to any servers
- **Your Control:** You can delete all data at any time from the Weekly Summary page

## Third-Party Services

### Google Gemini AI API
When you complete a study session, NeuraPath may send **anonymized session metrics** to Google's Gemini AI to generate personalized insights. This includes:

**What is sent:**
- Session duration (e.g., "45 minutes")
- Productivity metrics (e.g., "70% productive, 20% neutral, 10% distracting")
- Focus switch count (e.g., "12 focus switches")
- Historical averages (when available)

**What is NOT sent:**
- Website URLs or domains
- Personal information
- Browser history
- Any identifiable data

**Opt-out:** If the AI service is unavailable, NeuraPath automatically uses local insights instead. All core features work without AI.

### Google Gemini Privacy Policy
When AI insights are generated, the data sent is subject to [Google's Privacy Policy](https://policies.google.com/privacy). Google may process this data according to their terms, but no personally identifiable information is included.

## Permissions Explained

NeuraPath requests the following Firefox permissions:

### `storage`
**Why:** To save your session data locally on your device
**Access:** Local browser storage only
**Use:** Storing sessions, ratings, notes, and analytics

### `tabs`
**Why:** To track which websites you visit during active study sessions
**Access:** Only during active sessions (when you click "Start Session")
**Use:** Categorizing your browsing as productive/neutral/distracting
**Important:** This permission only monitors tabs while a session is active. We do not track your browsing at any other time.

## Data Retention

- **Automatic Limit:** By default, NeuraPath keeps your last 50 sessions
- **User Control:** You can clear all data anytime from the extension
- **No External Storage:** Data is never uploaded or backed up externally

## Data Security

- **Local Encryption:** Data is stored using Firefox's secure storage API
- **No Transmission:** Except for anonymized AI requests, no data leaves your browser
- **No Accounts:** No registration, no user accounts, no authentication

## Your Rights

You have complete control over your data:
- **Access:** View all your sessions in the Weekly Summary page
- **Delete:** Clear individual sessions or all data at once
- **Export:** (Future feature) Export your data in JSON format
- **Control:** Enable/disable AI insights through settings

## Changes to Privacy Policy

We may update this privacy policy occasionally. Changes will be reflected in the extension update notes and on our GitHub repository.

## Children's Privacy

NeuraPath does not knowingly collect data from anyone under 13. The extension is designed for students and professionals of all ages, with privacy as the top priority.

## Contact

For privacy concerns or questions:
- **GitHub Issues:** [github.com/Modaniels/neuropathAI/issues](https://github.com/Modaniels/neuropathAI/issues)
- **Email:** [Your contact email if you want to provide one]

## Open Source

NeuraPath is open source. You can review the entire codebase to verify our privacy practices at:
[github.com/Modaniels/neuropathAI](https://github.com/Modaniels/neuropathAI)

---

**Summary:** Your data stays on your device. We only send anonymized metrics to AI for insights. No personal information is ever collected or transmitted.
