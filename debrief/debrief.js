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

// Initialize when page loads
document.addEventListener('DOMContentLoaded', loadSessionData);
