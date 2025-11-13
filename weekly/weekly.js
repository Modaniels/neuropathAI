// NeuraPath Weekly Summary Script
// Purpose: Display weekly analytics and insights

let weeklySessions = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  await loadWeeklyData();
});

/**
 * Load sessions from the past 7 days
 */
async function loadWeeklyData() {
  try {
    const result = await browser.storage.local.get('sessions');
    const allSessions = result.sessions || [];

    // Filter sessions from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    weeklySessions = allSessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= sevenDaysAgo;
    });

    // Update date range display
    updateDateRange(sevenDaysAgo);

    // Check if we have enough data
    if (weeklySessions.length === 0) {
      showNoData();
      return;
    }

    // Analyze and display
    displayWeeklySummary();
    hideLoading();

  } catch (error) {
    console.error('Error loading weekly data:', error);
    showError();
  }
}

/**
 * Update date range display
 */
function updateDateRange(startDate) {
  const endDate = new Date();
  const options = { month: 'short', day: 'numeric' };
  const start = startDate.toLocaleDateString('en-US', options);
  const end = endDate.toLocaleDateString('en-US', options);
  document.getElementById('date-range').textContent = `${start} - ${end}`;
}

/**
 * Display the weekly summary
 */
function displayWeeklySummary() {
  // Overview stats
  displayOverviewStats();

  // Trend analysis
  displayTrendAnalysis();

  // Time patterns
  displayTimePatterns();

  // Best patterns
  displayBestPatterns();

  // Weak patterns
  displayWeakPatterns();

  // Correlations
  displayCorrelations();

  // Recommendations
  displayRecommendations();

  // Session list
  displaySessionsList();
  
  // Phase 6: Initialize AI Weekly Summary
  initAIWeeklySummary();
}

/**
 * Display overview statistics
 */
function displayOverviewStats() {
  const totalSessions = weeklySessions.length;
  const totalMinutes = weeklySessions.reduce((sum, s) => sum + s.duration.minutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  const ratedSessions = weeklySessions.filter(s => s.userRating && s.userRating.stars && !s.userRating.skipped);
  const avgRating = ratedSessions.length > 0
    ? (ratedSessions.reduce((sum, s) => sum + s.userRating.stars, 0) / ratedSessions.length).toFixed(1)
    : 'N/A';

  document.getElementById('total-sessions').textContent = totalSessions;
  document.getElementById('total-time').textContent = `${totalHours}h ${remainingMinutes}m`;
  document.getElementById('avg-rating').textContent = avgRating === 'N/A' ? '-' : `${avgRating} ⭐`;

  // Trend
  const trends = analyzeSessionTrends(weeklySessions);
  if (trends) {
    const trendCard = document.getElementById('trend-card');
    const trendValue = document.getElementById('trend-value');

    if (trends.trendDirection === 'improving') {
      trendCard.classList.add('improving');
      trendValue.textContent = '📈 Improving';
    } else if (trends.trendDirection === 'declining') {
      trendCard.classList.add('declining');
      trendValue.textContent = '📉 Declining';
    } else {
      trendValue.textContent = '➡️ Stable';
    }
  }
}

/**
 * Display trend analysis
 */
function displayTrendAnalysis() {
  const trends = analyzeSessionTrends(weeklySessions);
  const trendContent = document.getElementById('trend-content');

  if (!trends) {
    trendContent.innerHTML = '<p style="color: var(--slate);">Need more rated sessions to analyze trends.</p>';
    return;
  }

  let trendClass = 'stable';
  let trendIcon = '➡️';
  let trendMessage = '';

  if (trends.trendDirection === 'improving') {
    trendClass = 'improving';
    trendIcon = '📈';
    trendMessage = `Great progress! Your recent sessions show improvement. Your average rating is ${trends.averageRating} stars, and you're building positive momentum.`;
  } else if (trends.trendDirection === 'declining') {
    trendClass = 'declining';
    trendIcon = '📉';
    trendMessage = `Your recent sessions show a declining trend. Your average rating is ${trends.averageRating} stars. Let's identify what changed and adjust your approach.`;
  } else {
    trendMessage = `You're maintaining steady performance with an average rating of ${trends.averageRating} stars. Consider experimenting with new techniques to push higher.`;
  }

  trendContent.innerHTML = `
    <div class="trend-message ${trendClass}">
      <div class="trend-icon">${trendIcon}</div>
      <div>${trendMessage}</div>
    </div>
  `;
}

/**
 * Display time of day patterns
 */
function displayTimePatterns() {
  const section = document.getElementById('time-patterns-section');
  const content = document.getElementById('time-patterns-content');

  // Need pattern analyzer functions
  if (typeof analyzeTimePatterns !== 'function') {
    section.style.display = 'none';
    return;
  }

  const timePatterns = analyzeTimePatterns(weeklySessions);
  
  if (!timePatterns || Object.keys(timePatterns).length === 0) {
    section.style.display = 'none';
    return;
  }

  // Get best and worst times
  const bestTime = getBestTimeOfDay(weeklySessions);
  const worstTime = getWorstTimeOfDay(weeklySessions);

  // Show section
  section.style.display = 'block';

  // Build time periods grid
  let html = '<div class="time-patterns-grid">';

  const periodOrder = ['morning', 'afternoon', 'evening', 'night'];
  const periodRanges = {
    morning: '6am - 12pm',
    afternoon: '12pm - 6pm',
    evening: '6pm - 12am',
    night: '12am - 6am'
  };

  periodOrder.forEach(period => {
    if (timePatterns[period]) {
      const stats = timePatterns[period];
      const isBest = bestTime && bestTime.period === period;
      const isWorst = worstTime && worstTime.period === period;
      const cardClass = isBest ? 'best' : (isWorst ? 'worst' : '');

      html += `
        <div class="time-period-card ${cardClass}">
          ${isBest ? '<div style="color: var(--accent-color); margin-bottom: 0.5rem;">⭐ Best Time</div>' : ''}
          ${isWorst ? '<div style="color: var(--error); margin-bottom: 0.5rem;">⚠️ Needs Work</div>' : ''}
          <div class="time-period-name">${period}</div>
          <div class="time-period-range">${periodRanges[period]}</div>
          <div class="time-period-stats">
            <div class="time-stat">
              <div class="time-stat-value">${stats.averageRating}</div>
              <div class="time-stat-label">Avg Rating</div>
            </div>
            <div class="time-stat">
              <div class="time-stat-value">${stats.averageProductivity}%</div>
              <div class="time-stat-label">Productivity</div>
            </div>
            <div class="time-stat">
              <div class="time-stat-value">${stats.count}</div>
              <div class="time-stat-label">Sessions</div>
            </div>
          </div>
        </div>
      `;
    }
  });

  html += '</div>';

  // Add recommendation
  if (bestTime) {
    const periodName = bestTime.period.charAt(0).toUpperCase() + bestTime.period.slice(1);
    html += `
      <div class="time-recommendation">
        <p>
          <strong>💡 Recommendation:</strong> Schedule your most important study sessions during the <strong>${periodName}</strong> 
          (${bestTime.timeRange}). Based on ${bestTime.sessionCount} sessions, this is when you achieve your highest ratings 
          (${bestTime.averageRating} ⭐) and productivity (${bestTime.averageProductivity}%).
        </p>
      </div>
    `;
  }

  content.innerHTML = html;
}

/**
 * Display best performing patterns
 */
function displayBestPatterns() {
  const bestPatterns = findBestPerformingPatterns(weeklySessions);
  const section = document.getElementById('best-patterns-section');
  const content = document.getElementById('best-patterns-content');

  if (!bestPatterns || bestPatterns.sessionCount === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';

  let html = `
    <div class="pattern-item">
      <h3>Your Best Sessions (${bestPatterns.sessionCount} sessions)</h3>
      <div class="pattern-stat">
        <span class="pattern-stat-label">Average Duration</span>
        <span class="pattern-stat-value">${bestPatterns.averageDuration} minutes</span>
      </div>
      <div class="pattern-stat">
        <span class="pattern-stat-label">Productivity</span>
        <span class="pattern-stat-value">${bestPatterns.averageProductivity}%</span>
      </div>
      <div class="pattern-stat">
        <span class="pattern-stat-label">Focus Switches</span>
        <span class="pattern-stat-value">${bestPatterns.averageFocusSwitches}</span>
      </div>
  `;

  if (bestPatterns.commonTags && bestPatterns.commonTags.length > 0) {
    html += '<div class="pattern-tags">';
    bestPatterns.commonTags.forEach(tag => {
      html += `<span class="pattern-tag">${tag.tag} (${tag.count})</span>`;
    });
    html += '</div>';
  }

  html += '</div>';
  content.innerHTML = html;
}

/**
 * Display weak patterns
 */
function displayWeakPatterns() {
  const weakPatterns = identifyWeakPatterns(weeklySessions);
  const section = document.getElementById('weak-patterns-section');
  const content = document.getElementById('weak-patterns-content');

  if (!weakPatterns || weakPatterns.sessionCount === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';

  let html = `
    <div class="pattern-item">
      <h3>Sessions That Struggled (${weakPatterns.sessionCount} sessions)</h3>
      <div class="pattern-stat">
        <span class="pattern-stat-label">Average Duration</span>
        <span class="pattern-stat-value">${weakPatterns.averageDuration} minutes</span>
      </div>
      <div class="pattern-stat">
        <span class="pattern-stat-label">Productivity</span>
        <span class="pattern-stat-value">${weakPatterns.averageProductivity}%</span>
      </div>
      <div class="pattern-stat">
        <span class="pattern-stat-label">Focus Switches</span>
        <span class="pattern-stat-value">${weakPatterns.averageFocusSwitches}</span>
      </div>
      <div class="pattern-stat">
        <span class="pattern-stat-label">Distracting Content</span>
        <span class="pattern-stat-value">${weakPatterns.averageDistractingPercent}%</span>
      </div>
  `;

  if (weakPatterns.commonTags && weakPatterns.commonTags.length > 0) {
    html += '<div class="pattern-tags">';
    weakPatterns.commonTags.forEach(tag => {
      html += `<span class="pattern-tag">${tag.tag} (${tag.count})</span>`;
    });
    html += '</div>';
  }

  html += '</div>';
  content.innerHTML = html;
}

/**
 * Display correlation insights
 */
function displayCorrelations() {
  const correlations = analyzeRatingCorrelations(weeklySessions);
  const content = document.getElementById('correlations-content');

  if (!correlations) {
    content.innerHTML = '<p style="color: var(--slate);">Need more diverse session data to identify correlations.</p>';
    return;
  }

  let html = '';

  // Focus switches insight
  if (Math.abs(correlations.focusSwitches.difference) > 2) {
    html += `
      <div class="insight-item">
        🔄 <strong>Focus Switches:</strong> Your higher-rated sessions (${correlations.focusSwitches.highRated} switches) 
        have ${Math.abs(correlations.focusSwitches.difference)} ${correlations.focusSwitches.difference > 0 ? 'more' : 'fewer'} 
        focus switches than lower-rated sessions (${correlations.focusSwitches.lowRated} switches).
      </div>
    `;
  }

  // Productivity insight
  if (Math.abs(correlations.productivity.difference) > 10) {
    html += `
      <div class="insight-item">
        ✅ <strong>Productivity:</strong> Your best sessions have ${correlations.productivity.difference}% more productive content 
        (${correlations.productivity.highRated}% vs ${correlations.productivity.lowRated}%).
      </div>
    `;
  }

  // Distracting content insight
  if (Math.abs(correlations.distracting.difference) > 10) {
    html += `
      <div class="insight-item">
        🚫 <strong>Distractions:</strong> Your lower-rated sessions had ${Math.abs(correlations.distracting.difference)}% more distracting content 
        (${correlations.distracting.lowRated}% vs ${correlations.distracting.highRated}%).
      </div>
    `;
  }

  if (html === '') {
    html = '<p style="color: var(--slate);">No significant correlations found yet. Keep rating your sessions!</p>';
  }

  content.innerHTML = html;
}

/**
 * Display personalized recommendations
 */
function displayRecommendations() {
  const recommendations = generatePersonalizedRecommendations(weeklySessions);
  const content = document.getElementById('recommendations-content');

  if (!recommendations || recommendations.length === 0) {
    content.innerHTML = '<p style="color: var(--slate);">Complete more rated sessions to unlock personalized recommendations.</p>';
    return;
  }

  let html = '';
  recommendations.forEach(rec => {
    html += `
      <div class="recommendation ${rec.type}">
        <h3>${rec.title}</h3>
        <p>${rec.message}</p>
      </div>
    `;
  });

  content.innerHTML = html;
}

/**
 * Display list of all sessions
 */
function displaySessionsList() {
  const listDiv = document.getElementById('sessions-list');

  if (weeklySessions.length === 0) {
    listDiv.innerHTML = '<p style="color: var(--slate); text-align: center;">No sessions this week.</p>';
    return;
  }

  // Sort by date (newest first)
  const sortedSessions = [...weeklySessions].sort((a, b) => 
    new Date(b.startTime) - new Date(a.startTime)
  );

  let html = '';
  sortedSessions.forEach(session => {
    const date = new Date(session.startTime).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const rating = session.userRating && session.userRating.stars && !session.userRating.skipped
      ? session.userRating.stars
      : null;

    let starsHTML = '';
    if (rating) {
      for (let i = 1; i <= 5; i++) {
        starsHTML += `<span class="${i <= rating ? 'star-filled' : 'star-empty'}">★</span>`;
      }
    } else {
      starsHTML = '<span style="color: var(--slate); font-size: 0.9rem;">Not rated</span>';
    }

    html += `
      <div class="session-item">
        <div class="session-info">
          <div class="session-date">${date}</div>
          <div class="session-metrics">
            ${session.duration.formatted} · 
            ${session.metrics.productivePercentage}% productive · 
            ${session.metrics.focusSwitches} switches
          </div>
        </div>
        <div class="session-rating">${starsHTML}</div>
      </div>
    `;
  });

  listDiv.innerHTML = html;
}

/**
 * Hide loading and show content
 */
function hideLoading() {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('content').style.display = 'block';
}

/**
 * Show no data state
 */
function showNoData() {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('no-data').style.display = 'block';
  document.getElementById('content').style.display = 'block';
}

/**
 * Show error state
 */
function showError() {
  document.getElementById('loading').innerHTML = `
    <div style="color: var(--error); text-align: center;">
      <h2>❌ Error</h2>
      <p>Unable to load weekly data.</p>
      <button onclick="location.reload()" class="btn" style="margin-top: 1rem;">
        Retry
      </button>
    </div>
  `;
}

/**
 * Phase 6: Initialize AI Weekly Summary
 */
function initAIWeeklySummary() {
  const aiSection = document.getElementById('ai-summary-section');
  const generateBtn = document.getElementById('generate-summary-btn');
  const aiContent = document.getElementById('ai-summary-content');
  const aiLoading = document.getElementById('ai-summary-loading');
  
  // Count rated sessions
  const ratedSessions = weeklySessions.filter(s => 
    s.userRating && s.userRating.stars && !s.userRating.skipped
  );
  
  // Only show section if we have enough data
  if (ratedSessions.length >= 3) {
    aiSection.style.display = 'block';
    
    // Add click handler to generate button
    generateBtn.addEventListener('click', async () => {
      try {
        // Disable button and show loading
        generateBtn.disabled = true;
        generateBtn.textContent = '⏳ Generating...';
        aiLoading.style.display = 'block';
        aiContent.classList.remove('visible');
        
        // Request weekly summary from background script
        const response = await browser.runtime.sendMessage({
          command: 'generate-weekly-summary'
        });
        
        // Hide loading
        aiLoading.style.display = 'none';
        
        if (response.success && response.summary) {
          // Display the AI summary
          aiContent.textContent = response.summary;
          aiContent.classList.add('visible');
          
          // Update button
          generateBtn.textContent = '🔄 Regenerate Summary';
          generateBtn.disabled = false;
          
          console.log('✅ AI weekly summary generated successfully');
        } else {
          // Show error
          aiContent.textContent = response.error || 'Unable to generate summary. Please try again.';
          aiContent.classList.add('visible');
          aiContent.style.color = 'var(--error)';
          
          // Re-enable button
          generateBtn.disabled = false;
          generateBtn.textContent = '🔄 Try Again';
        }
        
      } catch (error) {
        console.error('Error generating AI summary:', error);
        
        // Hide loading
        aiLoading.style.display = 'none';
        
        // Show error message
        aiContent.textContent = 'An error occurred while generating your AI summary. Please try again.';
        aiContent.classList.add('visible');
        aiContent.style.color = 'var(--error)';
        
        // Re-enable button
        generateBtn.disabled = false;
        generateBtn.textContent = '🔄 Try Again';
      }
    });
  }
}
