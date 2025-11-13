// NeuraPath Focus Analyzer
// Purpose: Analyze context switching and focus recovery patterns

/**
 * Calculate focus recovery time after distractions
 * Measures how long it takes to return to productive work after visiting distracting sites
 * @param {Array} visitedUrls - Array of URL objects with timestamps and categories
 * @returns {Object} - Focus recovery analysis
 */
function calculateFocusRecoveryTime(visitedUrls) {
  if (!visitedUrls || visitedUrls.length < 3) {
    return null;
  }

  const recoveryTimes = [];
  let lastDistractionIndex = -1;

  // Find patterns: productive → distracting → productive
  for (let i = 0; i < visitedUrls.length; i++) {
    const current = visitedUrls[i];
    
    if (current.category === 'distracting') {
      lastDistractionIndex = i;
    } else if (current.category === 'productive' && lastDistractionIndex >= 0) {
      // Found return to productive work
      const distractionStart = new Date(visitedUrls[lastDistractionIndex].timestamp);
      const productiveReturn = new Date(current.timestamp);
      const recoveryMinutes = (productiveReturn - distractionStart) / (1000 * 60);
      
      // Only count reasonable recovery times (< 60 minutes)
      if (recoveryMinutes > 0 && recoveryMinutes < 60) {
        recoveryTimes.push({
          distractionUrl: visitedUrls[lastDistractionIndex].url,
          distractionDomain: visitedUrls[lastDistractionIndex].domain,
          recoveryMinutes: Math.round(recoveryMinutes * 10) / 10,
          returnUrl: current.url,
          returnDomain: current.domain
        });
      }
      
      lastDistractionIndex = -1;
    }
  }

  if (recoveryTimes.length === 0) {
    return null;
  }

  // Calculate average recovery time
  const avgRecovery = recoveryTimes.reduce((sum, r) => sum + r.recoveryMinutes, 0) / recoveryTimes.length;
  const maxRecovery = Math.max(...recoveryTimes.map(r => r.recoveryMinutes));
  const minRecovery = Math.min(...recoveryTimes.map(r => r.recoveryMinutes));

  return {
    averageRecoveryMinutes: Math.round(avgRecovery * 10) / 10,
    maxRecoveryMinutes: Math.round(maxRecovery * 10) / 10,
    minRecoveryMinutes: Math.round(minRecovery * 10) / 10,
    recoveryCount: recoveryTimes.length,
    recoveryInstances: recoveryTimes,
    totalTimeLost: Math.round(recoveryTimes.reduce((sum, r) => sum + r.recoveryMinutes, 0) * 10) / 10
  };
}

/**
 * Detect deep focus periods (sustained productive work without interruptions)
 * @param {Array} visitedUrls - Array of URL objects with timestamps and categories
 * @returns {Object} - Deep focus analysis
 */
function detectDeepFocusPeriods(visitedUrls) {
  if (!visitedUrls || visitedUrls.length < 2) {
    return null;
  }

  const deepFocusPeriods = [];
  let currentFocusStart = null;
  let currentFocusUrls = [];

  for (let i = 0; i < visitedUrls.length; i++) {
    const current = visitedUrls[i];
    
    if (current.category === 'productive') {
      if (!currentFocusStart) {
        currentFocusStart = new Date(current.timestamp);
        currentFocusUrls = [current];
      } else {
        currentFocusUrls.push(current);
      }
    } else {
      // Interruption detected
      if (currentFocusStart && currentFocusUrls.length > 0) {
        const focusEnd = new Date(currentFocusUrls[currentFocusUrls.length - 1].timestamp);
        const durationMinutes = (focusEnd - currentFocusStart) / (1000 * 60);
        
        // Only count focus periods >= 5 minutes
        if (durationMinutes >= 5) {
          deepFocusPeriods.push({
            startTime: currentFocusStart.toISOString(),
            endTime: focusEnd.toISOString(),
            durationMinutes: Math.round(durationMinutes * 10) / 10,
            urlCount: currentFocusUrls.length,
            domains: [...new Set(currentFocusUrls.map(u => u.domain))]
          });
        }
      }
      
      currentFocusStart = null;
      currentFocusUrls = [];
    }
  }

  // Handle final focus period if session ended during productive work
  if (currentFocusStart && currentFocusUrls.length > 0) {
    const focusEnd = new Date(currentFocusUrls[currentFocusUrls.length - 1].timestamp);
    const durationMinutes = (focusEnd - currentFocusStart) / (1000 * 60);
    
    if (durationMinutes >= 5) {
      deepFocusPeriods.push({
        startTime: currentFocusStart.toISOString(),
        endTime: focusEnd.toISOString(),
        durationMinutes: Math.round(durationMinutes * 10) / 10,
        urlCount: currentFocusUrls.length,
        domains: [...new Set(currentFocusUrls.map(u => u.domain))]
      });
    }
  }

  if (deepFocusPeriods.length === 0) {
    return null;
  }

  // Calculate statistics
  const totalDeepFocusTime = deepFocusPeriods.reduce((sum, p) => sum + p.durationMinutes, 0);
  const avgPeriodLength = totalDeepFocusTime / deepFocusPeriods.length;
  const longestPeriod = Math.max(...deepFocusPeriods.map(p => p.durationMinutes));

  return {
    periodCount: deepFocusPeriods.length,
    totalDeepFocusMinutes: Math.round(totalDeepFocusTime * 10) / 10,
    averagePeriodMinutes: Math.round(avgPeriodLength * 10) / 10,
    longestPeriodMinutes: Math.round(longestPeriod * 10) / 10,
    periods: deepFocusPeriods
  };
}

/**
 * Measure the impact of distractions on the session
 * @param {Array} visitedUrls - Array of URL objects with timestamps and categories
 * @param {Number} totalSessionMinutes - Total session duration in minutes
 * @returns {Object} - Distraction impact analysis
 */
function measureDistractionImpact(visitedUrls, totalSessionMinutes) {
  if (!visitedUrls || visitedUrls.length === 0 || !totalSessionMinutes) {
    return null;
  }

  let distractingMinutes = 0;
  let lastDistractionStart = null;
  const distractionSessions = [];

  for (let i = 0; i < visitedUrls.length; i++) {
    const current = visitedUrls[i];
    
    if (current.category === 'distracting') {
      if (!lastDistractionStart) {
        lastDistractionStart = new Date(current.timestamp);
      }
    } else {
      // End of distraction period
      if (lastDistractionStart) {
        const distractionEnd = new Date(visitedUrls[i - 1].timestamp);
        const durationMinutes = (distractionEnd - lastDistractionStart) / (1000 * 60);
        
        if (durationMinutes > 0 && durationMinutes < 60) {
          distractingMinutes += durationMinutes;
          distractionSessions.push({
            startTime: lastDistractionStart.toISOString(),
            durationMinutes: Math.round(durationMinutes * 10) / 10
          });
        }
        
        lastDistractionStart = null;
      }
    }
  }

  // Handle final distraction if session ended during distraction
  if (lastDistractionStart) {
    const lastUrl = visitedUrls[visitedUrls.length - 1];
    const distractionEnd = new Date(lastUrl.timestamp);
    const durationMinutes = (distractionEnd - lastDistractionStart) / (1000 * 60);
    
    if (durationMinutes > 0 && durationMinutes < 60) {
      distractingMinutes += durationMinutes;
      distractionSessions.push({
        startTime: lastDistractionStart.toISOString(),
        durationMinutes: Math.round(durationMinutes * 10) / 10
      });
    }
  }

  const distractingPercentage = Math.round((distractingMinutes / totalSessionMinutes) * 100);
  const productiveMinutes = totalSessionMinutes - distractingMinutes;

  return {
    totalDistractionMinutes: Math.round(distractingMinutes * 10) / 10,
    distractionPercentage: distractingPercentage,
    productiveMinutes: Math.round(productiveMinutes * 10) / 10,
    distractionSessionCount: distractionSessions.length,
    averageDistractionLength: distractionSessions.length > 0 
      ? Math.round((distractingMinutes / distractionSessions.length) * 10) / 10 
      : 0
  };
}

/**
 * Generate comprehensive context switch report
 * @param {Array} visitedUrls - Array of URL objects with timestamps and categories
 * @param {Number} totalSessionMinutes - Total session duration in minutes
 * @returns {Object} - Complete focus analysis report
 */
function generateContextSwitchReport(visitedUrls, totalSessionMinutes) {
  if (!visitedUrls || visitedUrls.length === 0) {
    return null;
  }

  const focusRecovery = calculateFocusRecoveryTime(visitedUrls);
  const deepFocus = detectDeepFocusPeriods(visitedUrls);
  const distractionImpact = measureDistractionImpact(visitedUrls, totalSessionMinutes);

  // Calculate context switches
  let switches = 0;
  for (let i = 1; i < visitedUrls.length; i++) {
    if (visitedUrls[i].category !== visitedUrls[i - 1].category) {
      switches++;
    }
  }

  return {
    totalContextSwitches: switches,
    focusRecovery: focusRecovery,
    deepFocus: deepFocus,
    distractionImpact: distractionImpact,
    hasSignificantData: focusRecovery !== null || deepFocus !== null
  };
}

/**
 * Generate insights text based on focus analysis
 * @param {Object} focusReport - Report from generateContextSwitchReport
 * @returns {Array} - Array of insight strings
 */
function generateFocusInsights(focusReport) {
  if (!focusReport || !focusReport.hasSignificantData) {
    return [];
  }

  const insights = [];

  // Focus recovery insights
  if (focusReport.focusRecovery) {
    const avgRecovery = focusReport.focusRecovery.averageRecoveryMinutes;
    const totalLost = focusReport.focusRecovery.totalTimeLost;
    
    if (avgRecovery >= 12) {
      insights.push({
        type: 'warning',
        text: `⏱️ It took you an average of ${avgRecovery} minutes to refocus after distractions. Research shows it takes 12+ minutes to regain deep focus. Total time lost: ${totalLost} minutes.`
      });
    } else if (avgRecovery >= 8) {
      insights.push({
        type: 'info',
        text: `⏱️ Your average focus recovery time is ${avgRecovery} minutes. You're recovering faster than the 12-minute average! Total recovery time: ${totalLost} minutes.`
      });
    } else {
      insights.push({
        type: 'success',
        text: `⚡ Excellent! You recovered focus in just ${avgRecovery} minutes on average. You're bouncing back quickly from distractions.`
      });
    }
  }

  // Deep focus insights
  if (focusReport.deepFocus) {
    const periods = focusReport.deepFocus.periodCount;
    const avgLength = focusReport.deepFocus.averagePeriodMinutes;
    const longest = focusReport.deepFocus.longestPeriodMinutes;
    
    if (periods >= 3) {
      insights.push({
        type: 'success',
        text: `🎯 You achieved ${periods} deep focus periods! Your longest was ${longest} minutes. Average focus block: ${avgLength} minutes.`
      });
    } else if (periods > 0) {
      insights.push({
        type: 'info',
        text: `🎯 You had ${periods} deep focus period(s). Longest: ${longest} minutes. Try to increase sustained focus blocks to 25+ minutes.`
      });
    }
  }

  // Distraction impact insights
  if (focusReport.distractionImpact) {
    const distPercent = focusReport.distractionImpact.distractionPercentage;
    const distMinutes = focusReport.distractionImpact.totalDistractionMinutes;
    
    if (distPercent >= 30) {
      insights.push({
        type: 'warning',
        text: `⚠️ Distractions consumed ${distPercent}% of your session (${distMinutes} minutes). Consider using website blockers during focused work.`
      });
    } else if (distPercent >= 15) {
      insights.push({
        type: 'info',
        text: `📊 Distractions took ${distPercent}% of your time (${distMinutes} minutes). Room for improvement in maintaining focus.`
      });
    }
  }

  // Context switching insights
  if (focusReport.totalContextSwitches >= 10) {
    insights.push({
      type: 'warning',
      text: `🔄 You switched contexts ${focusReport.totalContextSwitches} times. Frequent switching reduces productivity. Try batching similar tasks.`
    });
  } else if (focusReport.totalContextSwitches >= 5) {
    insights.push({
      type: 'info',
      text: `🔄 You had ${focusReport.totalContextSwitches} context switches. Keep this number low for better focus.`
    });
  } else if (focusReport.totalContextSwitches > 0) {
    insights.push({
      type: 'success',
      text: `✅ Only ${focusReport.totalContextSwitches} context switches! You maintained excellent focus discipline.`
    });
  }

  return insights;
}
