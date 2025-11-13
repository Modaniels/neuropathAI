// NeuraPath Activity Impact Insights Script
// Purpose: Display activity impact analysis

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  await loadActivityInsights();
});

/**
 * Load and display activity impact insights
 */
async function loadActivityInsights() {
  try {
    // Get all sessions from storage
    const result = await browser.storage.local.get('sessions');
    const sessions = result.sessions || [];

    // Hide loading
    document.getElementById('loading').style.display = 'none';

    // Check if we have enough data
    const ratedSessions = sessions.filter(s => s.userRating && s.userRating.stars && !s.userRating.skipped);
    
    if (ratedSessions.length < 5) {
      showNoData();
      return;
    }

    // Show content
    document.getElementById('content').style.display = 'block';

    // Analyze and display
    displayActivityInsights(sessions);

  } catch (error) {
    console.error('Error loading activity insights:', error);
    showError();
  }
}

/**
 * Display all activity insights
 */
function displayActivityInsights(sessions) {
  // Get activity impact data
  const impact = analyzeActivityImpact(sessions);
  const helpful = identifyHelpfulActivities(sessions);
  const harmful = identifyHarmfulActivities(sessions);
  const actionPlan = generatePersonalizedActionPlan(sessions);

  // Display summary stats
  displaySummaryStats(impact, helpful, harmful);

  // Display action plan
  if (actionPlan) {
    displayActionPlan(actionPlan);
  }

  // Display helpful activities
  if (helpful) {
    displayHelpfulActivities(helpful);
  }

  // Display harmful activities
  if (harmful) {
    displayHarmfulActivities(harmful);
  }

  // Display all activities table
  if (impact) {
    displayAllActivities(impact);
  }
}

/**
 * Display summary statistics
 */
function displaySummaryStats(impact, helpful, harmful) {
  const helpfulCount = helpful ? helpful.count : 0;
  const harmfulCount = harmful ? harmful.count : 0;
  const sessionsCount = impact ? impact.totalSessions : 0;
  const domainsCount = impact ? impact.totalDomains : 0;

  document.getElementById('helpful-count').textContent = helpfulCount;
  document.getElementById('harmful-count').textContent = harmfulCount;
  document.getElementById('analyzed-sessions').textContent = sessionsCount;
  document.getElementById('total-domains').textContent = domainsCount;
}

/**
 * Display personalized action plan
 */
function displayActionPlan(actionPlan) {
  const section = document.getElementById('action-plan-section');
  const summary = document.getElementById('action-plan-summary');
  const content = document.getElementById('action-plan-content');

  section.style.display = 'block';
  summary.textContent = actionPlan.summary;

  let html = '';

  actionPlan.recommendations.forEach(rec => {
    const icon = rec.type === 'success' ? '✅' : '⚠️';
    
    html += `
      <div class="action-item ${rec.type}">
        <div class="action-icon">${icon}</div>
        <div class="action-content">
          <div class="action-category">${rec.category}</div>
          <div class="action-text">${rec.action}</div>
          <div class="action-reason">${rec.reason}</div>
        </div>
        <span class="action-priority ${rec.priority}">${rec.priority}</span>
      </div>
    `;
  });

  content.innerHTML = html;
}

/**
 * Display helpful activities
 */
function displayHelpfulActivities(helpful) {
  const section = document.getElementById('helpful-section');
  const content = document.getElementById('helpful-activities');

  section.style.display = 'block';

  let html = '';

  helpful.activities.forEach((activity, index) => {
    html += `
      <div class="activity-card">
        <div class="activity-info">
          <div class="activity-domain">${index + 1}. ${activity.domain}</div>
          <div class="activity-stats">
            <div class="activity-stat">
              <span class="activity-stat-label">Avg Rating</span>
              <span class="activity-stat-value">${activity.avgRatingWhenUsed} ⭐</span>
            </div>
            <div class="activity-stat">
              <span class="activity-stat-label">Productivity</span>
              <span class="activity-stat-value">${activity.avgProductivityWhenUsed}%</span>
            </div>
            <div class="activity-stat">
              <span class="activity-stat-label">Frequency</span>
              <span class="activity-stat-value">${activity.frequency} sessions</span>
            </div>
          </div>
        </div>
        <div class="activity-badge impact-positive">
          ${activity.isSignificant ? 'Significant Impact' : 'Positive'}
        </div>
      </div>
    `;
  });

  if (html === '') {
    html = '<p style="color: var(--slate);">No activities with significant positive impact yet. Keep tracking!</p>';
  }

  content.innerHTML = html;
}

/**
 * Display harmful activities
 */
function displayHarmfulActivities(harmful) {
  const section = document.getElementById('harmful-section');
  const content = document.getElementById('harmful-activities');

  section.style.display = 'block';

  let html = '';

  harmful.activities.forEach((activity, index) => {
    html += `
      <div class="activity-card">
        <div class="activity-info">
          <div class="activity-domain">${index + 1}. ${activity.domain}</div>
          <div class="activity-stats">
            <div class="activity-stat">
              <span class="activity-stat-label">Avg Rating</span>
              <span class="activity-stat-value">${activity.avgRatingWhenUsed} ⭐</span>
            </div>
            <div class="activity-stat">
              <span class="activity-stat-label">Productivity</span>
              <span class="activity-stat-value">${activity.avgProductivityWhenUsed}%</span>
            </div>
            <div class="activity-stat">
              <span class="activity-stat-label">Frequency</span>
              <span class="activity-stat-value">${activity.frequency} sessions</span>
            </div>
          </div>
        </div>
        <div class="activity-badge impact-negative">
          ${activity.isSignificant ? 'Significant Impact' : 'Negative'}
        </div>
      </div>
    `;
  });

  if (html === '') {
    html = '<p style="color: var(--slate);">No activities with significant negative impact. Great job!</p>';
  }

  content.innerHTML = html;
}

/**
 * Display all activities in a table
 */
function displayAllActivities(impact) {
  const section = document.getElementById('all-activities-section');
  const content = document.getElementById('all-activities');

  section.style.display = 'block';

  let html = `
    <table>
      <thead>
        <tr>
          <th>Domain</th>
          <th>Impact</th>
          <th>Avg Rating</th>
          <th>Productivity</th>
          <th>Frequency</th>
          <th>Category</th>
        </tr>
      </thead>
      <tbody>
  `;

  impact.domains.forEach(domain => {
    const impactClass = domain.impact === 'positive' ? 'impact-positive' : 
                        domain.impact === 'negative' ? 'impact-negative' : 'impact-neutral';
    const impactText = domain.impact.charAt(0).toUpperCase() + domain.impact.slice(1);

    html += `
      <tr>
        <td style="color: var(--light-slate); font-weight: 600;">${domain.domain}</td>
        <td><span class="activity-badge ${impactClass}">${impactText}</span></td>
        <td>${domain.avgRatingWhenUsed} ⭐</td>
        <td>${domain.avgProductivityWhenUsed}%</td>
        <td>${domain.frequency} sessions</td>
        <td style="text-transform: capitalize;">${domain.category}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  content.innerHTML = html;
}

/**
 * Show no data state
 */
function showNoData() {
  document.getElementById('no-data').style.display = 'block';
}

/**
 * Show error state
 */
function showError() {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('error').style.display = 'block';
}
