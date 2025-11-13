// NeuraPath Debrief Script
// Purpose: Load and display session data in a professional report

// DOM elements
const loadingDiv = document.getElementById('loading');
const reportDiv = document.getElementById('report');
const errorDiv = document.getElementById('error');

// Load and display session data
async function loadSessionData() {
  try {
    // Get the latest session from storage
    const result = await browser.storage.local.get('latestSession');
    
    if (!result.latestSession) {
      throw new Error('No session data found');
    }
    
    const session = result.latestSession;
    
    // Hide loading, show report
    loadingDiv.style.display = 'none';
    reportDiv.style.display = 'block';
    
    // Populate the report
    populateReport(session);
    
  } catch (error) {
    console.error('Error loading session data:', error);
    loadingDiv.style.display = 'none';
    errorDiv.style.display = 'block';
  }
}

// Populate the report with session data
function populateReport(session) {
  // Display user rating if available
  displayUserRating(session);

  // Display historical comparison
  displayHistoricalComparison(session);
  
  // Display time of day insights
  displayTimeInsights(session);
  
  // Display focus analysis (Phase 4)
  displayFocusAnalysis(session);
  
  // Session Overview
  document.getElementById('duration').textContent = session.duration.formatted;
  document.getElementById('total-visits').textContent = session.metrics.totalVisits;
  document.getElementById('focus-switches').textContent = session.metrics.focusSwitches;
  document.getElementById('session-time').textContent = 
    new Date(session.startTime).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  
  // Productivity Breakdown
  const productivePercent = session.metrics.productivePercentage;
  const distractingPercent = session.metrics.distractingPercentage;
  const neutralPercent = 100 - productivePercent - distractingPercent;
  
  // Update percentages
  document.getElementById('productive-percent').textContent = `${productivePercent}%`;
  document.getElementById('distracting-percent').textContent = `${distractingPercent}%`;
  document.getElementById('neutral-percent').textContent = `${neutralPercent}%`;
  
  // Update counts
  document.getElementById('productive-count').textContent = 
    `${session.metrics.productiveVisits} visit${session.metrics.productiveVisits !== 1 ? 's' : ''}`;
  document.getElementById('distracting-count').textContent = 
    `${session.metrics.distractingVisits} visit${session.metrics.distractingVisits !== 1 ? 's' : ''}`;
  document.getElementById('neutral-count').textContent = 
    `${session.metrics.neutralVisits} visit${session.metrics.neutralVisits !== 1 ? 's' : ''}`;
  
  // Animate bars
  setTimeout(() => {
    document.getElementById('productive-bar').style.width = `${productivePercent}%`;
    document.getElementById('distracting-bar').style.width = `${distractingPercent}%`;
    document.getElementById('neutral-bar').style.width = `${neutralPercent}%`;
  }, 100);
  
  // Top Domains
  const topDomainsDiv = document.getElementById('top-domains');
  if (session.topDomains && session.topDomains.length > 0) {
    session.topDomains.forEach((item, index) => {
      const domainItem = document.createElement('div');
      domainItem.className = 'domain-item';
      domainItem.innerHTML = `
        <div class="domain-info">
          <span class="domain-rank">#${index + 1}</span>
          <span class="domain-name">${item.domain}</span>
        </div>
        <span class="domain-count">${item.count} visit${item.count !== 1 ? 's' : ''}</span>
      `;
      topDomainsDiv.appendChild(domainItem);
    });
  } else {
    topDomainsDiv.innerHTML = '<p style="color: #8892b0;">No domain data available.</p>';
  }
  
  // Display AI Insight
  displayAiInsight(session);
  
  // Generate Insights
  generateInsights(session);
  
  // Session Details
  document.getElementById('session-id').textContent = session.sessionId;
  document.getElementById('start-time').textContent = 
    new Date(session.startTime).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  document.getElementById('end-time').textContent = 
    new Date(session.endTime).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
}

/**
 * Display the AI-generated or local insight
 * @param {Object} session - Session data
 */
function displayAiInsight(session) {
  const aiInsightDiv = document.getElementById('ai-insight');
  const aiLoadingDiv = document.getElementById('ai-insight-loading');
  const aiBadge = document.getElementById('ai-badge');
  
  if (session.aiInsight) {
    // Hide loading
    aiLoadingDiv.style.display = 'none';
    
    // Format the insight text (convert newlines to paragraphs)
    const paragraphs = session.aiInsight
      .split('\n')
      .filter(p => p.trim().length > 0)
      .map(p => `<p>${p.trim()}</p>`)
      .join('');
    
    aiInsightDiv.innerHTML = paragraphs;
    
    // Show AI badge if it's AI-generated
    if (session.isAiGenerated) {
      aiBadge.style.display = 'flex';
    }
  } else {
    // Show loading state
    aiLoadingDiv.style.display = 'flex';
    aiInsightDiv.innerHTML = '';
  }
}

// Generate personalized insights based on session data
function generateInsights(session) {
  const insightsDiv = document.getElementById('insights');
  const insights = [];
  
  const productivePercent = session.metrics.productivePercentage;
  const distractingPercent = session.metrics.distractingPercentage;
  const focusSwitches = session.metrics.focusSwitches;
  const durationMinutes = session.duration.minutes;
  
  // Productivity insights
  if (productivePercent >= 70) {
    insights.push({
      type: 'success',
      text: `🎉 Excellent focus! ${productivePercent}% of your browsing was productive. Keep up the great work!`
    });
  } else if (productivePercent >= 50) {
    insights.push({
      type: 'info',
      text: `👍 Good job! ${productivePercent}% productivity is solid. Consider reducing distractions to boost this further.`
    });
  } else if (productivePercent >= 30) {
    insights.push({
      type: 'warning',
      text: `⚠️ Your productivity was at ${productivePercent}%. Try blocking distracting sites during work sessions.`
    });
  } else {
    insights.push({
      type: 'warning',
      text: `🔴 Only ${productivePercent}% of your time was productive. Consider using website blockers or the Pomodoro technique.`
    });
  }
  
  // Distraction insights
  if (distractingPercent >= 30) {
    insights.push({
      type: 'warning',
      text: `📱 ${distractingPercent}% of your browsing was on distracting sites. Try scheduling specific break times for these sites.`
    });
  }
  
  // Focus switch insights
  if (focusSwitches > 10) {
    insights.push({
      type: 'warning',
      text: `🔄 You switched focus ${focusSwitches} times. Frequent context switching reduces productivity. Try batching similar tasks together.`
    });
  } else if (focusSwitches <= 3 && session.metrics.totalVisits > 5) {
    insights.push({
      type: 'success',
      text: `🎯 Great focus discipline! Only ${focusSwitches} focus switches. You stayed on task well.`
    });
  }
  
  // Session duration insights
  if (durationMinutes < 5) {
    insights.push({
      type: 'info',
      text: `⏱️ Short session (${session.duration.formatted}). Consider longer focused work sessions (25-50 minutes) for deeper work.`
    });
  } else if (durationMinutes > 90) {
    insights.push({
      type: 'info',
      text: `⏱️ Long session (${session.duration.formatted}). Remember to take regular breaks to maintain focus and energy.`
    });
  }
  
  // Top domain insight
  if (session.topDomains && session.topDomains.length > 0) {
    const topDomain = session.topDomains[0];
    insights.push({
      type: 'info',
      text: `🌐 Most visited: ${topDomain.domain} (${topDomain.count} visits). This is where you spent most of your time.`
    });
  }
  
  // Render insights
  insights.forEach(insight => {
    const insightItem = document.createElement('div');
    insightItem.className = `insight-item ${insight.type}`;
    insightItem.textContent = insight.text;
    insightsDiv.appendChild(insightItem);
  });
}

/**
 * Display user rating if available
 */
function displayUserRating(session) {
  if (!session.userRating) {
    return;
  }

  const rating = session.userRating;
  
  // Skip if user skipped rating
  if (rating.skipped) {
    return;
  }

  // Show the rating section
  const ratingSection = document.getElementById('user-rating-section');
  ratingSection.style.display = 'block';

  // Display stars
  const starsDisplay = document.getElementById('stars-display');
  if (rating.stars) {
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('span');
      star.textContent = '★';
      star.className = i <= rating.stars ? 'star-filled' : 'star-empty';
      starsDisplay.appendChild(star);
    }
  }

  // Display tags
  const tagsDiv = document.getElementById('rating-tags');
  if (rating.tags && rating.tags.length > 0) {
    rating.tags.forEach(tag => {
      const tagElement = document.createElement('span');
      tagElement.className = 'rating-tag';
      tagElement.textContent = tag;
      tagsDiv.appendChild(tagElement);
    });
  }

  // Display notes
  const notesDiv = document.getElementById('rating-notes');
  if (rating.notes && rating.notes.trim()) {
    notesDiv.textContent = rating.notes;
  } else {
    notesDiv.style.display = 'none';
  }
}

/**
 * Display historical comparison
 */
async function displayHistoricalComparison(currentSession) {
  try {
    const result = await browser.storage.local.get('sessions');
    const allSessions = result.sessions || [];
    
    // Get historical sessions (exclude current one)
    const historicalSessions = allSessions.filter(s => s.sessionId !== currentSession.sessionId);
    
    if (historicalSessions.length < 3) {
      // Need at least 3 previous sessions for meaningful comparison
      return;
    }

    // Use pattern analyzer to compare
    if (typeof compareToHistory === 'function') {
      const comparison = compareToHistory(currentSession, historicalSessions);
      
      if (!comparison) {
        return;
      }

      // Show the section
      const section = document.getElementById('history-comparison');
      section.style.display = 'block';

      const content = document.getElementById('comparison-content');
      let html = '';

      // Duration comparison
      const durationBadge = comparison.duration.status === 'longer' 
        ? (comparison.duration.difference > 5 ? 'better' : 'same')
        : (comparison.duration.difference < -5 ? 'worse' : 'same');
      
      html += `
        <div class="comparison-item">
          <div class="comparison-label">Session Duration</div>
          <div class="comparison-values">
            <div class="comparison-current">${comparison.duration.current} min</div>
            <div class="comparison-avg">avg: ${comparison.duration.average} min</div>
            <span class="comparison-badge ${durationBadge}">
              ${comparison.duration.difference > 0 ? '+' : ''}${comparison.duration.difference} min
            </span>
          </div>
        </div>
      `;

      // Productivity comparison
      const productivityBadge = comparison.productivity.status === 'better' ? 'better' : 'worse';
      
      html += `
        <div class="comparison-item">
          <div class="comparison-label">Productivity</div>
          <div class="comparison-values">
            <div class="comparison-current">${comparison.productivity.current}%</div>
            <div class="comparison-avg">avg: ${comparison.productivity.average}%</div>
            <span class="comparison-badge ${productivityBadge}">
              ${comparison.productivity.difference > 0 ? '+' : ''}${comparison.productivity.difference}%
            </span>
          </div>
        </div>
      `;

      // Focus switches comparison
      const focusBadge = comparison.focusSwitches.status === 'better' ? 'better' : 'worse';
      
      html += `
        <div class="comparison-item">
          <div class="comparison-label">Focus Switches</div>
          <div class="comparison-values">
            <div class="comparison-current">${comparison.focusSwitches.current}</div>
            <div class="comparison-avg">avg: ${comparison.focusSwitches.average.toFixed(1)}</div>
            <span class="comparison-badge ${focusBadge}">
              ${comparison.focusSwitches.difference > 0 ? '+' : ''}${comparison.focusSwitches.difference.toFixed(1)}
            </span>
          </div>
        </div>
      `;

      content.innerHTML = html;
    }
  } catch (error) {
    console.error('Error displaying historical comparison:', error);
  }
}

/**
 * Display time of day insights
 */
async function displayTimeInsights(currentSession) {
  try {
    const result = await browser.storage.local.get('sessions');
    const allSessions = result.sessions || [];
    
    // Need at least 5 sessions for meaningful time analysis
    if (allSessions.length < 5) {
      return;
    }

    // Use pattern analyzer to get best time
    if (typeof getBestTimeOfDay === 'function') {
      const bestTime = getBestTimeOfDay(allSessions);
      
      if (!bestTime) {
        return;
      }

      // Get current session time period
      const currentDate = new Date(currentSession.startTime);
      const currentHour = currentDate.getHours();
      let currentPeriod = '';
      
      if (currentHour >= 6 && currentHour < 12) {
        currentPeriod = 'morning';
      } else if (currentHour >= 12 && currentHour < 18) {
        currentPeriod = 'afternoon';
      } else if (currentHour >= 18 && currentHour < 24) {
        currentPeriod = 'evening';
      } else {
        currentPeriod = 'night';
      }

      // Show the section
      const section = document.getElementById('time-insight');
      section.style.display = 'block';

      const content = document.getElementById('time-insight-content');
      
      // Create insight message
      const periodName = bestTime.period.charAt(0).toUpperCase() + bestTime.period.slice(1);
      const isCurrentBest = currentPeriod === bestTime.period;
      
      let html = `
        <div class="time-insight-highlight">
          <strong>🎯 You focus best during the ${periodName}</strong>
          <br><br>
          Based on ${bestTime.sessionCount} ${bestTime.sessionCount === 1 ? 'session' : 'sessions'} during <span class="time-period-badge">${bestTime.timeRange}</span>, 
          you average <strong>${bestTime.averageRating} stars</strong> with <strong>${bestTime.averageProductivity}%</strong> productivity.
          ${isCurrentBest ? '<br><br>✅ This session is during your peak focus time!' : '<br><br>💡 Consider scheduling important work during this time.'}
        </div>
      `;

      // Add time stats
      html += `
        <div class="time-stats">
          <div class="time-stat-item">
            <div class="time-stat-label">Best Period</div>
            <div class="time-stat-value">${periodName}</div>
          </div>
          <div class="time-stat-item">
            <div class="time-stat-label">Avg Rating</div>
            <div class="time-stat-value">${bestTime.averageRating} ⭐</div>
          </div>
          <div class="time-stat-item">
            <div class="time-stat-label">Productivity</div>
            <div class="time-stat-value">${bestTime.averageProductivity}%</div>
          </div>
          <div class="time-stat-item">
            <div class="time-stat-label">Sessions</div>
            <div class="time-stat-value">${bestTime.sessionCount}</div>
          </div>
        </div>
      `;

      content.innerHTML = html;
    }
  } catch (error) {
    console.error('Error displaying time insights:', error);
  }
}

/**
 * Display focus analysis (Phase 4)
 */
function displayFocusAnalysis(session) {
  // Check if focus analysis data exists
  if (!session.focusAnalysis || !session.focusAnalysis.hasSignificantData) {
    return;
  }

  const section = document.getElementById('focus-analysis');
  const content = document.getElementById('focus-analysis-content');
  section.style.display = 'block';

  const focusData = session.focusAnalysis;
  let html = '';

  // Focus Recovery Time (The "12 minutes" feature)
  if (focusData.focusRecovery) {
    const recovery = focusData.focusRecovery;
    const isGood = recovery.averageRecoveryMinutes < 12;
    
    html += `
      <div class="focus-highlight-box ${isGood ? '' : 'warning'}">
        <div class="focus-highlight-number">${recovery.averageRecoveryMinutes} min</div>
        <div class="focus-highlight-text">
          ${isGood 
            ? '⚡ Your average focus recovery time - faster than the 12-minute average!' 
            : '⚠️ Your average focus recovery time - research shows it takes 12+ minutes to regain deep focus after distractions'}
        </div>
      </div>
    `;
  }

  // Metrics Grid
  html += '<div class="focus-metrics-grid">';

  // Deep Focus Periods
  if (focusData.deepFocus) {
    const deep = focusData.deepFocus;
    const quality = deep.averagePeriodMinutes >= 25 ? 'success' : (deep.averagePeriodMinutes >= 15 ? '' : 'warning');
    
    html += `
      <div class="focus-metric-card ${quality}">
        <div class="focus-metric-label">Deep Focus Periods</div>
        <div class="focus-metric-value">${deep.periodCount}</div>
        <div class="focus-metric-subtitle">Longest: ${deep.longestPeriodMinutes} min</div>
      </div>
    `;

    html += `
      <div class="focus-metric-card">
        <div class="focus-metric-label">Total Deep Focus Time</div>
        <div class="focus-metric-value">${deep.totalDeepFocusMinutes} min</div>
        <div class="focus-metric-subtitle">Avg period: ${deep.averagePeriodMinutes} min</div>
      </div>
    `;
  }

  // Distraction Impact
  if (focusData.distractionImpact) {
    const distract = focusData.distractionImpact;
    const quality = distract.distractionPercentage < 15 ? 'success' : (distract.distractionPercentage < 30 ? '' : 'warning');
    
    html += `
      <div class="focus-metric-card ${quality}">
        <div class="focus-metric-label">Time on Distractions</div>
        <div class="focus-metric-value">${distract.totalDistractionMinutes} min</div>
        <div class="focus-metric-subtitle">${distract.distractionPercentage}% of session</div>
      </div>
    `;
  }

  // Context Switches
  const switchQuality = focusData.totalContextSwitches < 5 ? 'success' : (focusData.totalContextSwitches < 10 ? '' : 'warning');
  html += `
    <div class="focus-metric-card ${switchQuality}">
      <div class="focus-metric-label">Context Switches</div>
      <div class="focus-metric-value">${focusData.totalContextSwitches}</div>
      <div class="focus-metric-subtitle">Category changes</div>
    </div>
  `;

  html += '</div>'; // Close metrics grid

  // Detailed breakdown
  if (focusData.focusRecovery && focusData.focusRecovery.recoveryInstances.length > 0) {
    html += '<div class="focus-details">';
    html += '<h3 style="color: #ccd6f6; margin-bottom: 15px;">Focus Recovery Details</h3>';
    
    const instances = focusData.focusRecovery.recoveryInstances.slice(0, 3); // Show first 3
    instances.forEach((instance, index) => {
      html += `
        <div class="focus-detail-item">
          <div class="focus-detail-label">
            Recovery ${index + 1}: ${instance.distractionDomain} → ${instance.returnDomain}
          </div>
          <div class="focus-detail-value">${instance.recoveryMinutes} min</div>
        </div>
      `;
    });

    html += `
      <div class="focus-detail-item">
        <div class="focus-detail-label"><strong>Total Time Lost to Recovery</strong></div>
        <div class="focus-detail-value">${focusData.focusRecovery.totalTimeLost} min</div>
      </div>
    `;
    
    html += '</div>';
  }

  content.innerHTML = html;
}

// Quick Actions button handlers
function setupQuickActions() {
  // Weekly Summary button
  const weeklyBtn = document.getElementById('weekly-btn');
  if (weeklyBtn) {
    weeklyBtn.addEventListener('click', () => {
      window.location.href = '../weekly/weekly.html';
    });
  }

  // Done button - try to close, or go back to popup
  const doneBtn = document.getElementById('done-btn');
  if (doneBtn) {
    doneBtn.addEventListener('click', () => {
      // Try to close the window (works if opened by extension)
      if (window.opener) {
        window.close();
      } else {
        // If can't close, redirect to popup or home
        browser.tabs.getCurrent().then(tab => {
          browser.tabs.remove(tab.id);
        }).catch(() => {
          // If browser API not available, just reload popup
          window.location.href = '../popup/popup.html';
        });
      }
    });
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadSessionData();
  setupQuickActions();
});
