// NeuraPath Background Script
// Purpose: Core background script that listens for commands from the popup and tracks browser activity

// Track session state
let sessionActive = false;
let sessionStartTime = null;
let visitedUrls = [];
let sessionId = null;

// Generate unique session ID
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Event listeners for tab tracking
function onTabUpdated(tabId, changeInfo, tab) {
  // Only track when session is active and page has completed loading
  if (sessionActive && changeInfo.status === 'complete' && tab.url) {
    // Filter out internal Firefox URLs
    if (!tab.url.startsWith('about:') && !tab.url.startsWith('moz-extension:')) {
      console.log(`Tab updated: ${tab.url}`);
      visitedUrls.push({
        url: tab.url,
        title: tab.title || 'Unknown',
        timestamp: new Date().toISOString()
      });
      
      // Show floating widget on newly loaded tabs
      browser.tabs.sendMessage(tabId, { command: 'show-floating-widget' }).catch(err => {
        // Ignore errors for special tabs
      });
    }
  }
}

function onTabActivated(activeInfo) {
  // Only track when session is active
  if (sessionActive) {
    browser.tabs.get(activeInfo.tabId).then(tab => {
      if (tab.url && !tab.url.startsWith('about:') && !tab.url.startsWith('moz-extension:')) {
        console.log(`Tab activated: ${tab.url}`);
        visitedUrls.push({
          url: tab.url,
          title: tab.title || 'Unknown',
          timestamp: new Date().toISOString()
        });
      }
    }).catch(error => {
      console.error('Error getting tab info:', error);
    });
  }
}

// Function to start tracking
function startTracking() {
  console.log('Started tracking browser activity...');
  visitedUrls = []; // Reset the array
  sessionId = generateSessionId();
  browser.tabs.onUpdated.addListener(onTabUpdated);
  browser.tabs.onActivated.addListener(onTabActivated);
}

// Function to stop tracking
function stopTracking() {
  console.log('Stopped tracking browser activity.');
  browser.tabs.onUpdated.removeListener(onTabUpdated);
  browser.tabs.onActivated.removeListener(onTabActivated);
  
  // Process and save session data
  if (visitedUrls.length > 0) {
    processAndSaveSession();
  } else {
    console.log('No URLs were tracked during this session.');
  }
}

// Function to process session data and save to storage
async function processAndSaveSession() {
  console.log('Processing session data...');
  
  // Calculate session duration
  const sessionEndTime = Date.now();
  const durationSeconds = Math.floor((sessionEndTime - sessionStartTime) / 1000);
  const durationMinutes = Math.floor(durationSeconds / 60);
  
  // Use categorizer to analyze URLs
  const analysis = analyzeUrls(visitedUrls);
  const focusSwitches = calculateFocusSwitches(visitedUrls);
  const topDomains = getTopDomains(analysis.domainCounts);
  
  // Generate focus analysis report (Phase 4)
  const focusReport = typeof generateContextSwitchReport === 'function'
    ? generateContextSwitchReport(visitedUrls.map(entry => ({
        url: entry.url,
        domain: extractDomain(entry.url),
        category: categorizeUrl(entry.url),
        timestamp: entry.timestamp
      })), durationMinutes)
    : null;
  
  // Calculate productivity metrics
  const totalVisits = analysis.totals.total;
  const productivePercentage = totalVisits > 0 
    ? Math.round((analysis.totals.productive / totalVisits) * 100) 
    : 0;
  const distractingPercentage = totalVisits > 0 
    ? Math.round((analysis.totals.distracting / totalVisits) * 100) 
    : 0;
  
  // Create anonymized session summary
  const sessionSummary = {
    sessionId: sessionId,
    startTime: new Date(sessionStartTime).toISOString(),
    endTime: new Date(sessionEndTime).toISOString(),
    duration: {
      seconds: durationSeconds,
      minutes: durationMinutes,
      formatted: formatDuration(durationSeconds)
    },
    metrics: {
      totalVisits: totalVisits,
      productiveVisits: analysis.totals.productive,
      distractingVisits: analysis.totals.distracting,
      neutralVisits: analysis.totals.neutral,
      productivePercentage: productivePercentage,
      distractingPercentage: distractingPercentage,
      focusSwitches: focusSwitches
    },
    topDomains: topDomains,
    // Store anonymized data (domains only, not full URLs for privacy)
    visitedDomains: visitedUrls.map(entry => ({
      domain: extractDomain(entry.url),
      category: categorizeUrl(entry.url),
      timestamp: entry.timestamp
    })),
    // Phase 4: Focus analysis data
    focusAnalysis: focusReport,
    aiInsight: null, // Will be populated by Smart Dispatcher
    isAiGenerated: false
  };
  
  // Log summary to console
  console.log('=== SESSION SUMMARY ===');
  console.log(`Session ID: ${sessionSummary.sessionId}`);
  console.log(`Duration: ${sessionSummary.duration.formatted}`);
  console.log(`Total Visits: ${sessionSummary.metrics.totalVisits}`);
  console.log(`Productive: ${sessionSummary.metrics.productiveVisits} (${productivePercentage}%)`);
  console.log(`Distracting: ${sessionSummary.metrics.distractingVisits} (${distractingPercentage}%)`);
  console.log(`Neutral: ${sessionSummary.metrics.neutralVisits}`);
  console.log(`Focus Switches: ${focusSwitches}`);
  console.log('Top Domains:');
  topDomains.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.domain} (${item.count} visits)`);
  });
  console.log('======================');
  
  // Run Smart Dispatcher to decide on AI insight
  await runSmartDispatcher(sessionSummary);
  
  // Save to browser storage
  try {
    // Get existing sessions
    const result = await browser.storage.local.get('sessions');
    const sessions = result.sessions || [];
    
    // Add new session
    sessions.push(sessionSummary);
    
    // Keep only last 50 sessions to avoid storage bloat
    if (sessions.length > 50) {
      sessions.shift();
    }
    
    // Save back to storage
    await browser.storage.local.set({ sessions: sessions });
    console.log('✅ Session data saved to local storage successfully!');
    
    // Also save latest session separately for quick access
    await browser.storage.local.set({ latestSession: sessionSummary });
    
    // Open rating page first (then user goes to debrief)
    browser.tabs.create({ url: browser.runtime.getURL('rating/rating.html') });
    
  } catch (error) {
    console.error('❌ Error saving session data:', error);
  }
}

/**
 * Phase 6: Enhanced Smart Dispatcher with Historical Context
 * Decides whether to use local insight or call AI, now with historical awareness
 * @param {Object} sessionSummary - The session data to analyze
 */
async function runSmartDispatcher(sessionSummary) {
  console.log('🧠 Running Enhanced Smart Dispatcher (Phase 6)...');
  
  const { duration, metrics } = sessionSummary;
  
  // Get recent sessions for historical context
  const recentSessions = await getRecentRatedSessions(5);
  
  // Dispatcher Rules - Base conditions
  const isShortSession = duration.minutes < 10;
  const isSimpleSession = metrics.totalVisits < 5;
  const isLowActivity = metrics.focusSwitches < 3;
  const isVeryProductive = metrics.productivePercentage >= 80;
  const isVeryDistracting = metrics.distractingPercentage >= 70;
  
  // Phase 6: Enhanced rules with historical pattern detection
  const hasHistoricalContext = recentSessions.length >= 3;
  let isSignificantChange = false;
  let isMilestoneSession = false;
  
  if (hasHistoricalContext) {
    // Calculate historical averages
    const avgHistoricalProductivity = recentSessions.reduce((sum, s) => 
      sum + s.metrics.productivePercentage, 0) / recentSessions.length;
    const avgHistoricalRating = recentSessions.reduce((sum, s) => 
      sum + s.userRating.stars, 0) / recentSessions.length;
    
    // Detect significant changes (>20% difference from historical avg)
    const productivityChange = Math.abs(metrics.productivePercentage - avgHistoricalProductivity);
    isSignificantChange = productivityChange > 20;
    
    // Detect milestone sessions
    const totalSessions = await getSessionCount();
    isMilestoneSession = (totalSessions % 10 === 0 && totalSessions > 0); // Every 10th session
  }
  
  // Determine if session is "interesting" enough for AI
  const isComplexSession = !isShortSession && 
                           !isSimpleSession && 
                           (metrics.focusSwitches >= 5 || 
                            (metrics.distractingVisits > 0 && metrics.productiveVisits > 0));
  
  // Phase 6: Trigger AI for complex sessions, pattern changes, or milestones
  const shouldUseAI = isComplexSession || isSignificantChange || isMilestoneSession;
  
  if (shouldUseAI) {
    // Call AI with historical context
    if (hasHistoricalContext) {
      console.log('📊 Calling Gemini API with historical context (last 5 sessions)...');
      sessionSummary.aiInsight = await fetchGeminiInsight(sessionSummary, recentSessions);
    } else {
      console.log('📊 Calling Gemini API (no historical context yet)...');
      sessionSummary.aiInsight = await fetchGeminiInsight(sessionSummary);
    }
    sessionSummary.isAiGenerated = true;
    
    if (isSignificantChange) {
      console.log('🔄 Significant pattern change detected - AI providing context');
    }
    if (isMilestoneSession) {
      console.log('🎯 Milestone session - AI celebrating progress');
    }
  } else {
    // Use local insight for simple sessions
    console.log('📝 Simple session - using local insight');
    sessionSummary.aiInsight = generateLocalInsight(sessionSummary);
    sessionSummary.isAiGenerated = false;
  }
}

/**
 * Phase 6: Get recent rated sessions for historical context
 * @param {number} limit - Maximum number of sessions to return
 * @returns {Promise<Array>} - Array of recent rated sessions
 */
async function getRecentRatedSessions(limit = 5) {
  try {
    const result = await browser.storage.local.get(['sessions']);
    const allSessions = result.sessions || [];
    
    // Filter for rated sessions only, sorted by timestamp (newest first)
    const ratedSessions = allSessions
      .filter(s => s.userRating && s.userRating.stars && !s.userRating.skipped)
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
      .slice(0, limit);
    
    return ratedSessions;
  } catch (error) {
    console.error('Error fetching recent sessions:', error);
    return [];
  }
}

/**
 * Phase 6: Get total session count
 * @returns {Promise<number>} - Total number of sessions
 */
async function getSessionCount() {
  try {
    const result = await browser.storage.local.get(['sessions']);
    const allSessions = result.sessions || [];
    return allSessions.length;
  } catch (error) {
    console.error('Error getting session count:', error);
    return 0;
  }
}

/**
 * Generate a local (non-AI) insight for simple sessions
 * @param {Object} session - Session summary object
 * @returns {string} - Local insight text
 */
function generateLocalInsight(session) {
  const { duration, metrics } = session;
  
  // Very short session
  if (duration.minutes < 5) {
    return "Quick session! While brief, every focused moment counts. Consider extending your next session to 25-50 minutes for deeper work. Even short bursts of productivity add up over time.";
  }
  
  // Very productive session
  if (metrics.productivePercentage >= 80) {
    return "Excellent focus session! You stayed on task and avoided distractions effectively. This is exactly the kind of disciplined browsing that leads to great work. Keep this momentum going!";
  }
  
  // Low activity session
  if (metrics.totalVisits < 5) {
    return "Focused session with minimal tab switching. You demonstrated great restraint and concentration. This kind of single-tasking is increasingly rare and valuable. Well done!";
  }
  
  // Mostly neutral browsing
  if (metrics.neutralVisits > metrics.productiveVisits + metrics.distractingVisits) {
    return "This session showed exploratory browsing. While not highly productive, exploration has its place in learning and discovery. For focused work sessions, try setting clearer goals beforehand.";
  }
  
  // Default local insight
  return "You completed a session! Every tracked session helps build awareness of your browsing habits. Keep tracking to identify patterns and optimize your focus over time.";
}

// Helper function to format duration
function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle start-session command
  if (message.command === "start-session") {
    console.log("Start command received from popup.");
    sessionActive = true;
    sessionStartTime = Date.now();
    startTracking();
    
    // Show floating widget on all tabs
    browser.tabs.query({}).then(tabs => {
      tabs.forEach(tab => {
        browser.tabs.sendMessage(tab.id, { command: 'show-floating-widget' }).catch(err => {
          // Ignore errors for tabs that can't receive messages (like about:, moz-extension:, etc.)
        });
      });
    });
    
    // Send response back to popup to confirm session started
    sendResponse({ success: true });
  }
  
  // Handle end-session command
  else if (message.command === "end-session") {
    console.log("End command received from popup.");
    
    // Calculate total session time
    if (sessionStartTime) {
      const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
      console.log(`Session ended. Duration: ${elapsed} seconds`);
    }
    
    // Hide floating widget on all tabs
    browser.tabs.query({}).then(tabs => {
      tabs.forEach(tab => {
        browser.tabs.sendMessage(tab.id, { command: 'hide-floating-widget' }).catch(err => {
          // Ignore errors
        });
      });
    });
    
    stopTracking();
    sessionActive = false;
    sessionStartTime = null;
    
    // Send response back to popup to confirm session ended
    sendResponse({ success: true });
  }
  
  // Handle check-session command
  else if (message.command === "check-session") {
    // Send current session state
    sendResponse({ active: sessionActive });
  }
  
  // Handle get-session-time command
  else if (message.command === "get-session-time") {
    let elapsed = 0;
    
    if (sessionActive && sessionStartTime) {
      elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
    }
    
    sendResponse({ elapsed: elapsed });
  }
  
  // Phase 6: Handle weekly AI summary request
  else if (message.command === "generate-weekly-summary") {
    console.log("📅 Weekly AI summary requested...");
    
    (async () => {
      try {
        // Get sessions from the last 7 days
        const result = await browser.storage.local.get(['sessions']);
        const allSessions = result.sessions || [];
        
        const now = Date.now();
        const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
        
        const weeklySessions = allSessions.filter(session => {
          const sessionTime = new Date(session.startTime).getTime();
          return sessionTime >= sevenDaysAgo && sessionTime <= now;
        });
        
        console.log(`Found ${weeklySessions.length} sessions in the last 7 days`);
        
        if (weeklySessions.length === 0) {
          sendResponse({ 
            success: false, 
            error: 'No sessions found in the last 7 days' 
          });
          return;
        }
        
        // Generate AI summary
        const summary = await generateWeeklyAISummary(weeklySessions);
        
        if (summary) {
          sendResponse({ 
            success: true, 
            summary: summary,
            sessionCount: weeklySessions.length
          });
        } else {
          sendResponse({ 
            success: false, 
            error: 'Need at least 3 rated sessions for weekly summary' 
          });
        }
      } catch (error) {
        console.error('Error generating weekly summary:', error);
        sendResponse({ 
          success: false, 
          error: error.message 
        });
      }
    })();
    
    return true; // Async response
  }
  
  // Return true to indicate we will send a response asynchronously
  return true;
});
