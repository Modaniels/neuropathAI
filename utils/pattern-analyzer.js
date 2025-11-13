// NeuraPath Pattern Analyzer
// Purpose: Analyze historical session data to identify patterns and trends

/**
 * Analyze trends across multiple sessions
 * @param {Array} sessions - Array of session objects
 * @returns {Object} - Trend analysis results
 */
function analyzeSessionTrends(sessions) {
  if (!sessions || sessions.length === 0) {
    return null;
  }

  // Filter only rated sessions
  const ratedSessions = sessions.filter(s => s.userRating && s.userRating.stars && !s.userRating.skipped);
  
  if (ratedSessions.length === 0) {
    return null;
  }

  // Calculate average metrics
  const avgRating = ratedSessions.reduce((sum, s) => sum + s.userRating.stars, 0) / ratedSessions.length;
  const avgDuration = sessions.reduce((sum, s) => sum + s.duration.minutes, 0) / sessions.length;
  const avgProductivity = sessions.reduce((sum, s) => sum + s.metrics.productivePercentage, 0) / sessions.length;
  const avgFocusSwitches = sessions.reduce((sum, s) => sum + s.metrics.focusSwitches, 0) / sessions.length;

  // Detect trend direction (last 3 sessions vs previous)
  let trendDirection = 'stable';
  if (ratedSessions.length >= 6) {
    const recent = ratedSessions.slice(-3);
    const previous = ratedSessions.slice(-6, -3);
    
    const recentAvg = recent.reduce((sum, s) => sum + s.userRating.stars, 0) / recent.length;
    const previousAvg = previous.reduce((sum, s) => sum + s.userRating.stars, 0) / previous.length;
    
    if (recentAvg > previousAvg + 0.3) {
      trendDirection = 'improving';
    } else if (recentAvg < previousAvg - 0.3) {
      trendDirection = 'declining';
    }
  }

  return {
    totalSessions: sessions.length,
    ratedSessions: ratedSessions.length,
    averageRating: Math.round(avgRating * 10) / 10,
    averageDuration: Math.round(avgDuration),
    averageProductivity: Math.round(avgProductivity),
    averageFocusSwitches: Math.round(avgFocusSwitches * 10) / 10,
    trendDirection: trendDirection
  };
}

/**
 * Find patterns in high-performing sessions
 * @param {Array} sessions - Array of session objects
 * @returns {Object} - Patterns found in best sessions
 */
function findBestPerformingPatterns(sessions) {
  const ratedSessions = sessions.filter(s => s.userRating && s.userRating.stars && !s.userRating.skipped);
  
  if (ratedSessions.length < 3) {
    return null;
  }

  // Define "best" as 4-5 stars
  const bestSessions = ratedSessions.filter(s => s.userRating.stars >= 4);
  
  if (bestSessions.length === 0) {
    return null;
  }

  // Analyze patterns in best sessions
  const avgDuration = bestSessions.reduce((sum, s) => sum + s.duration.minutes, 0) / bestSessions.length;
  const avgProductivity = bestSessions.reduce((sum, s) => sum + s.metrics.productivePercentage, 0) / bestSessions.length;
  const avgFocusSwitches = bestSessions.reduce((sum, s) => sum + s.metrics.focusSwitches, 0) / bestSessions.length;
  const avgDistractingPercent = bestSessions.reduce((sum, s) => sum + s.metrics.distractingPercentage, 0) / bestSessions.length;

  // Find common tags
  const tagCounts = {};
  bestSessions.forEach(s => {
    if (s.userRating.tags) {
      s.userRating.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });

  const commonTags = Object.entries(tagCounts)
    .filter(([_, count]) => count >= Math.max(2, bestSessions.length * 0.4))
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  // Find time-of-day patterns (will be enhanced in Phase 3)
  const hourCounts = {};
  bestSessions.forEach(s => {
    const hour = new Date(s.startTime).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  const bestHours = Object.entries(hourCounts)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return {
    sessionCount: bestSessions.length,
    averageDuration: Math.round(avgDuration),
    averageProductivity: Math.round(avgProductivity),
    averageFocusSwitches: Math.round(avgFocusSwitches * 10) / 10,
    averageDistractingPercent: Math.round(avgDistractingPercent),
    commonTags: commonTags,
    bestHours: bestHours
  };
}

/**
 * Identify weak patterns in low-performing sessions
 * @param {Array} sessions - Array of session objects
 * @returns {Object} - Patterns found in worst sessions
 */
function identifyWeakPatterns(sessions) {
  const ratedSessions = sessions.filter(s => s.userRating && s.userRating.stars && !s.userRating.skipped);
  
  if (ratedSessions.length < 3) {
    return null;
  }

  // Define "weak" as 1-2 stars
  const weakSessions = ratedSessions.filter(s => s.userRating.stars <= 2);
  
  if (weakSessions.length === 0) {
    return null;
  }

  // Analyze patterns in weak sessions
  const avgDuration = weakSessions.reduce((sum, s) => sum + s.duration.minutes, 0) / weakSessions.length;
  const avgProductivity = weakSessions.reduce((sum, s) => sum + s.metrics.productivePercentage, 0) / weakSessions.length;
  const avgFocusSwitches = weakSessions.reduce((sum, s) => sum + s.metrics.focusSwitches, 0) / weakSessions.length;
  const avgDistractingPercent = weakSessions.reduce((sum, s) => sum + s.metrics.distractingPercentage, 0) / weakSessions.length;

  // Find common tags
  const tagCounts = {};
  weakSessions.forEach(s => {
    if (s.userRating.tags) {
      s.userRating.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });

  const commonTags = Object.entries(tagCounts)
    .filter(([_, count]) => count >= Math.max(2, weakSessions.length * 0.4))
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  return {
    sessionCount: weakSessions.length,
    averageDuration: Math.round(avgDuration),
    averageProductivity: Math.round(avgProductivity),
    averageFocusSwitches: Math.round(avgFocusSwitches * 10) / 10,
    averageDistractingPercent: Math.round(avgDistractingPercent),
    commonTags: commonTags
  };
}

/**
 * Calculate correlation between session characteristics and ratings
 * @param {Array} sessions - Array of session objects
 * @returns {Object} - Correlation insights
 */
function analyzeRatingCorrelations(sessions) {
  const ratedSessions = sessions.filter(s => s.userRating && s.userRating.stars && !s.userRating.skipped);
  
  if (ratedSessions.length < 5) {
    return null;
  }

  // Analyze relationship between metrics and ratings
  const highRated = ratedSessions.filter(s => s.userRating.stars >= 4);
  const lowRated = ratedSessions.filter(s => s.userRating.stars <= 2);

  if (highRated.length === 0 || lowRated.length === 0) {
    return null;
  }

  // Compare focus switches
  const highRatedFocusSwitches = highRated.reduce((sum, s) => sum + s.metrics.focusSwitches, 0) / highRated.length;
  const lowRatedFocusSwitches = lowRated.reduce((sum, s) => sum + s.metrics.focusSwitches, 0) / lowRated.length;

  // Compare productive percentage
  const highRatedProductivity = highRated.reduce((sum, s) => sum + s.metrics.productivePercentage, 0) / highRated.length;
  const lowRatedProductivity = lowRated.reduce((sum, s) => sum + s.metrics.productivePercentage, 0) / lowRated.length;

  // Compare distracting percentage
  const highRatedDistracting = highRated.reduce((sum, s) => sum + s.metrics.distractingPercentage, 0) / highRated.length;
  const lowRatedDistracting = lowRated.reduce((sum, s) => sum + s.metrics.distractingPercentage, 0) / lowRated.length;

  return {
    focusSwitches: {
      highRated: Math.round(highRatedFocusSwitches * 10) / 10,
      lowRated: Math.round(lowRatedFocusSwitches * 10) / 10,
      difference: Math.round((lowRatedFocusSwitches - highRatedFocusSwitches) * 10) / 10
    },
    productivity: {
      highRated: Math.round(highRatedProductivity),
      lowRated: Math.round(lowRatedProductivity),
      difference: Math.round(highRatedProductivity - lowRatedProductivity)
    },
    distracting: {
      highRated: Math.round(highRatedDistracting),
      lowRated: Math.round(lowRatedDistracting),
      difference: Math.round(lowRatedDistracting - highRatedDistracting)
    }
  };
}

/**
 * Generate personalized recommendations based on patterns
 * @param {Array} sessions - Array of session objects
 * @returns {Array} - Array of recommendation objects
 */
function generatePersonalizedRecommendations(sessions) {
  const recommendations = [];
  
  const trends = analyzeSessionTrends(sessions);
  const bestPatterns = findBestPerformingPatterns(sessions);
  const weakPatterns = identifyWeakPatterns(sessions);
  const correlations = analyzeRatingCorrelations(sessions);

  if (!trends) {
    return recommendations;
  }

  // Recommendation based on trend
  if (trends.trendDirection === 'improving') {
    recommendations.push({
      type: 'success',
      title: 'You\'re On Fire! 🔥',
      message: `Your sessions are improving! Keep doing what you're doing. Your average rating has increased to ${trends.averageRating} stars.`
    });
  } else if (trends.trendDirection === 'declining') {
    recommendations.push({
      type: 'warning',
      title: 'Time to Adjust 🔄',
      message: `Your recent sessions show a declining trend. Let's identify what changed and get you back on track.`
    });
  }

  // Recommendations based on best patterns
  if (bestPatterns && bestPatterns.sessionCount >= 3) {
    if (bestPatterns.averageDuration > 0) {
      recommendations.push({
        type: 'info',
        title: 'Your Sweet Spot ⏱️',
        message: `Your best sessions average ${bestPatterns.averageDuration} minutes. Try to aim for similar session lengths.`
      });
    }

    if (bestPatterns.averageFocusSwitches < 5) {
      recommendations.push({
        type: 'success',
        title: 'Focus Strategy 🎯',
        message: `In your top sessions, you averaged ${bestPatterns.averageFocusSwitches} focus switches. Minimize distractions to stay in this zone.`
      });
    }
  }

  // Recommendations based on correlations
  if (correlations) {
    if (correlations.focusSwitches.difference > 3) {
      recommendations.push({
        type: 'warning',
        title: 'Focus Switches Matter ⚡',
        message: `Low-rated sessions had ${correlations.focusSwitches.difference} more focus switches on average. Try to reduce context switching.`
      });
    }

    if (correlations.distracting.difference > 15) {
      recommendations.push({
        type: 'warning',
        title: 'Distractions Impact 🚫',
        message: `Your lower-rated sessions had ${correlations.distracting.difference}% more distracting content. Consider blocking these sites during study time.`
      });
    }
  }

  // General recommendations
  if (trends.averageFocusSwitches > 10) {
    recommendations.push({
      type: 'info',
      title: 'Too Much Switching 🔄',
      message: `You average ${trends.averageFocusSwitches} focus switches per session. Try staying on one task longer before switching.`
    });
  }

  return recommendations;
}

/**
 * Get comparison between current and historical sessions
 * @param {Object} currentSession - Current session data
 * @param {Array} historicalSessions - Previous sessions
 * @returns {Object} - Comparison results
 */
function compareToHistory(currentSession, historicalSessions) {
  if (!historicalSessions || historicalSessions.length === 0) {
    return null;
  }

  const trends = analyzeSessionTrends(historicalSessions);
  if (!trends) {
    return null;
  }

  const comparison = {
    duration: {
      current: currentSession.duration.minutes,
      average: trends.averageDuration,
      difference: currentSession.duration.minutes - trends.averageDuration,
      status: currentSession.duration.minutes > trends.averageDuration ? 'longer' : 'shorter'
    },
    productivity: {
      current: currentSession.metrics.productivePercentage,
      average: trends.averageProductivity,
      difference: currentSession.metrics.productivePercentage - trends.averageProductivity,
      status: currentSession.metrics.productivePercentage > trends.averageProductivity ? 'better' : 'worse'
    },
    focusSwitches: {
      current: currentSession.metrics.focusSwitches,
      average: trends.averageFocusSwitches,
      difference: currentSession.metrics.focusSwitches - trends.averageFocusSwitches,
      status: currentSession.metrics.focusSwitches < trends.averageFocusSwitches ? 'better' : 'worse'
    }
  };

  return comparison;
}

/**
 * Analyze time-of-day patterns across sessions
 * @param {Array} sessions - Array of session objects with startTime
 * @returns {Object} - Time pattern analysis
 */
function analyzeTimePatterns(sessions) {
  if (!sessions || sessions.length === 0) {
    return null;
  }

  const ratedSessions = sessions.filter(s => s.userRating && s.userRating.stars && !s.userRating.skipped);
  
  if (ratedSessions.length === 0) {
    return null;
  }

  // Categorize sessions by time period
  const timePeriods = {
    morning: [],    // 6am-12pm
    afternoon: [],  // 12pm-6pm
    evening: [],    // 6pm-12am
    night: []       // 12am-6am
  };

  ratedSessions.forEach(session => {
    const sessionDate = new Date(session.startTime);
    const hour = sessionDate.getHours();
    
    if (hour >= 6 && hour < 12) {
      timePeriods.morning.push(session);
    } else if (hour >= 12 && hour < 18) {
      timePeriods.afternoon.push(session);
    } else if (hour >= 18 && hour < 24) {
      timePeriods.evening.push(session);
    } else {
      timePeriods.night.push(session);
    }
  });

  // Calculate average rating for each period
  const periodStats = {};
  for (const [period, periodSessions] of Object.entries(timePeriods)) {
    if (periodSessions.length > 0) {
      const avgRating = periodSessions.reduce((sum, s) => sum + s.userRating.stars, 0) / periodSessions.length;
      const avgProductivity = periodSessions.reduce((sum, s) => sum + s.metrics.productivePercentage, 0) / periodSessions.length;
      
      periodStats[period] = {
        count: periodSessions.length,
        averageRating: Math.round(avgRating * 10) / 10,
        averageProductivity: Math.round(avgProductivity),
        sessions: periodSessions
      };
    }
  }

  return periodStats;
}

/**
 * Find the user's best time of day for productivity
 * @param {Array} sessions - Array of session objects
 * @returns {Object|null} - Best time period info
 */
function getBestTimeOfDay(sessions) {
  const timePatterns = analyzeTimePatterns(sessions);
  
  if (!timePatterns || Object.keys(timePatterns).length === 0) {
    return null;
  }

  // Find period with highest average rating (with minimum 2 sessions)
  let bestPeriod = null;
  let highestRating = 0;

  for (const [period, stats] of Object.entries(timePatterns)) {
    if (stats.count >= 2 && stats.averageRating > highestRating) {
      highestRating = stats.averageRating;
      bestPeriod = period;
    }
  }

  if (!bestPeriod) {
    return null;
  }

  return {
    period: bestPeriod,
    timeRange: getTimeRange(bestPeriod),
    averageRating: timePatterns[bestPeriod].averageRating,
    sessionCount: timePatterns[bestPeriod].count,
    averageProductivity: timePatterns[bestPeriod].averageProductivity
  };
}

/**
 * Find the user's worst time of day for productivity
 * @param {Array} sessions - Array of session objects
 * @returns {Object|null} - Worst time period info
 */
function getWorstTimeOfDay(sessions) {
  const timePatterns = analyzeTimePatterns(sessions);
  
  if (!timePatterns || Object.keys(timePatterns).length === 0) {
    return null;
  }

  // Find period with lowest average rating (with minimum 2 sessions)
  let worstPeriod = null;
  let lowestRating = 6; // Higher than max rating

  for (const [period, stats] of Object.entries(timePatterns)) {
    if (stats.count >= 2 && stats.averageRating < lowestRating) {
      lowestRating = stats.averageRating;
      worstPeriod = period;
    }
  }

  if (!worstPeriod) {
    return null;
  }

  return {
    period: worstPeriod,
    timeRange: getTimeRange(worstPeriod),
    averageRating: timePatterns[worstPeriod].averageRating,
    sessionCount: timePatterns[worstPeriod].count,
    averageProductivity: timePatterns[worstPeriod].averageProductivity
  };
}

/**
 * Get productivity breakdown by hour of day
 * @param {Array} sessions - Array of session objects
 * @returns {Array} - Hourly productivity data
 */
function getProductivityByHour(sessions) {
  if (!sessions || sessions.length === 0) {
    return [];
  }

  const ratedSessions = sessions.filter(s => s.userRating && s.userRating.stars && !s.userRating.skipped);
  
  if (ratedSessions.length === 0) {
    return [];
  }

  // Initialize hourly buckets
  const hourlyData = {};
  for (let hour = 0; hour < 24; hour++) {
    hourlyData[hour] = {
      hour: hour,
      sessions: [],
      totalRating: 0,
      totalProductivity: 0
    };
  }

  // Group sessions by hour
  ratedSessions.forEach(session => {
    const sessionDate = new Date(session.startTime);
    const hour = sessionDate.getHours();
    
    hourlyData[hour].sessions.push(session);
    hourlyData[hour].totalRating += session.userRating.stars;
    hourlyData[hour].totalProductivity += session.metrics.productivePercentage;
  });

  // Calculate averages
  const result = [];
  for (let hour = 0; hour < 24; hour++) {
    const data = hourlyData[hour];
    if (data.sessions.length > 0) {
      result.push({
        hour: hour,
        hourLabel: formatHour(hour),
        sessionCount: data.sessions.length,
        averageRating: Math.round((data.totalRating / data.sessions.length) * 10) / 10,
        averageProductivity: Math.round(data.totalProductivity / data.sessions.length)
      });
    }
  }

  return result;
}

/**
 * Helper: Get time range string for a period
 */
function getTimeRange(period) {
  const ranges = {
    morning: '6am - 12pm',
    afternoon: '12pm - 6pm',
    evening: '6pm - 12am',
    night: '12am - 6am'
  };
  return ranges[period] || '';
}

/**
 * Helper: Format hour as 12-hour time
 */
function formatHour(hour) {
  if (hour === 0) return '12am';
  if (hour < 12) return `${hour}am`;
  if (hour === 12) return '12pm';
  return `${hour - 12}pm`;
}
