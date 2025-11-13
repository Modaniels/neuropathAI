// NeuraPath Activity Impact Analyzer
// Purpose: Analyze which specific activities/domains help or hurt study session quality

/**
 * Analyze activity impact across all sessions
 * Identifies which domains correlate with high vs low ratings
 * @param {Array} sessions - Array of session objects with ratings
 * @returns {Object} - Activity impact analysis
 */
function analyzeActivityImpact(sessions) {
  if (!sessions || sessions.length === 0) {
    return null;
  }

  // Filter sessions with ratings
  const ratedSessions = sessions.filter(s => s.userRating && s.userRating.stars && !s.userRating.skipped);
  
  if (ratedSessions.length < 5) {
    return null; // Need minimum data for meaningful analysis
  }

  // Build domain impact map
  const domainImpact = {};

  ratedSessions.forEach(session => {
    const rating = session.userRating.stars;
    
    // Process each visited domain
    if (session.visitedDomains && session.visitedDomains.length > 0) {
      const uniqueDomains = [...new Set(session.visitedDomains.map(v => v.domain))];
      
      uniqueDomains.forEach(domain => {
        if (!domainImpact[domain]) {
          domainImpact[domain] = {
            domain: domain,
            sessionsUsed: 0,
            totalRating: 0,
            ratings: [],
            categories: new Set(),
            avgProductivity: 0,
            productivitySum: 0
          };
        }
        
        domainImpact[domain].sessionsUsed++;
        domainImpact[domain].totalRating += rating;
        domainImpact[domain].ratings.push(rating);
        
        // Track category
        const domainData = session.visitedDomains.find(v => v.domain === domain);
        if (domainData && domainData.category) {
          domainImpact[domain].categories.add(domainData.category);
        }
        
        // Track productivity when used
        if (session.metrics && session.metrics.productivePercentage) {
          domainImpact[domain].productivitySum += session.metrics.productivePercentage;
        }
      });
    }
  });

  // Calculate statistics for each domain
  const domainStats = Object.values(domainImpact).map(item => {
    const avgRating = item.totalRating / item.sessionsUsed;
    const avgProductivity = item.sessionsUsed > 0 ? item.productivitySum / item.sessionsUsed : 0;
    
    // Calculate variance for significance testing
    const variance = item.ratings.reduce((sum, r) => {
      return sum + Math.pow(r - avgRating, 2);
    }, 0) / item.ratings.length;
    
    const stdDev = Math.sqrt(variance);
    
    // Determine impact category
    let impact = 'neutral';
    if (item.sessionsUsed >= 3) { // Need minimum frequency
      if (avgRating >= 4.0) {
        impact = 'positive';
      } else if (avgRating <= 2.5) {
        impact = 'negative';
      }
    }
    
    return {
      domain: item.domain,
      frequency: item.sessionsUsed,
      avgRatingWhenUsed: Math.round(avgRating * 10) / 10,
      avgProductivityWhenUsed: Math.round(avgProductivity),
      impact: impact,
      category: Array.from(item.categories)[0] || 'neutral',
      ratings: item.ratings,
      variance: Math.round(variance * 100) / 100,
      stdDev: Math.round(stdDev * 100) / 100,
      isSignificant: item.sessionsUsed >= 3 && stdDev < 1.5 // Consistent impact
    };
  });

  // Sort by frequency (most used first)
  domainStats.sort((a, b) => b.frequency - a.frequency);

  return {
    totalSessions: ratedSessions.length,
    totalDomains: domainStats.length,
    domains: domainStats
  };
}

/**
 * Identify activities that correlate with high ratings
 * @param {Array} sessions - Array of session objects
 * @returns {Object} - Helpful activities analysis
 */
function identifyHelpfulActivities(sessions) {
  const impact = analyzeActivityImpact(sessions);
  
  if (!impact) {
    return null;
  }

  // Filter for positive impact domains
  const helpful = impact.domains.filter(d => 
    d.impact === 'positive' && 
    d.frequency >= 3 &&
    d.isSignificant
  );

  if (helpful.length === 0) {
    return null;
  }

  // Sort by average rating (best first)
  helpful.sort((a, b) => b.avgRatingWhenUsed - a.avgRatingWhenUsed);

  // Calculate overall statistics
  const avgRating = helpful.reduce((sum, d) => sum + d.avgRatingWhenUsed, 0) / helpful.length;
  const avgProductivity = helpful.reduce((sum, d) => sum + d.avgProductivityWhenUsed, 0) / helpful.length;

  return {
    count: helpful.length,
    averageRating: Math.round(avgRating * 10) / 10,
    averageProductivity: Math.round(avgProductivity),
    activities: helpful.slice(0, 10), // Top 10
    recommendation: generateHelpfulRecommendation(helpful)
  };
}

/**
 * Identify activities that correlate with low ratings
 * @param {Array} sessions - Array of session objects
 * @returns {Object} - Harmful activities analysis
 */
function identifyHarmfulActivities(sessions) {
  const impact = analyzeActivityImpact(sessions);
  
  if (!impact) {
    return null;
  }

  // Filter for negative impact domains
  const harmful = impact.domains.filter(d => 
    d.impact === 'negative' && 
    d.frequency >= 3 &&
    d.isSignificant
  );

  if (harmful.length === 0) {
    return null;
  }

  // Sort by average rating (worst first)
  harmful.sort((a, b) => a.avgRatingWhenUsed - b.avgRatingWhenUsed);

  // Calculate overall statistics
  const avgRating = harmful.reduce((sum, d) => sum + d.avgRatingWhenUsed, 0) / harmful.length;
  const avgProductivity = harmful.reduce((sum, d) => sum + d.avgProductivityWhenUsed, 0) / harmful.length;

  return {
    count: harmful.length,
    averageRating: Math.round(avgRating * 10) / 10,
    averageProductivity: Math.round(avgProductivity),
    activities: harmful.slice(0, 10), // Top 10 worst
    recommendation: generateHarmfulRecommendation(harmful)
  };
}

/**
 * Calculate statistical significance of activity impact
 * @param {Object} activityData - Activity statistics
 * @param {Number} overallAvgRating - Overall average rating across all sessions
 * @returns {Object} - Significance analysis
 */
function calculateStatisticalSignificance(activityData, overallAvgRating) {
  if (!activityData || activityData.frequency < 3) {
    return {
      isSignificant: false,
      reason: 'Insufficient data (need 3+ sessions)'
    };
  }

  // Simple significance test based on:
  // 1. Frequency (more sessions = more reliable)
  // 2. Consistency (low std dev = more reliable)
  // 3. Difference from mean (larger difference = more meaningful)

  const difference = Math.abs(activityData.avgRatingWhenUsed - overallAvgRating);
  const consistency = activityData.stdDev < 1.5;
  const sufficient = activityData.frequency >= 3;

  const isSignificant = sufficient && consistency && difference >= 0.5;

  return {
    isSignificant: isSignificant,
    confidence: sufficient && consistency ? 'moderate' : 'low',
    difference: Math.round(difference * 10) / 10,
    consistency: consistency ? 'consistent' : 'variable',
    reason: isSignificant 
      ? `${activityData.frequency} sessions with consistent impact (σ=${activityData.stdDev})`
      : 'Not enough data or too variable'
  };
}

/**
 * Compare activity impact between two time periods
 * @param {Array} recentSessions - Recent sessions
 * @param {Array} olderSessions - Older sessions
 * @returns {Object} - Trend analysis
 */
function compareActivityTrends(recentSessions, olderSessions) {
  const recentImpact = analyzeActivityImpact(recentSessions);
  const olderImpact = analyzeActivityImpact(olderSessions);

  if (!recentImpact || !olderImpact) {
    return null;
  }

  const trends = [];

  // Find domains that appear in both periods
  recentImpact.domains.forEach(recentDomain => {
    const olderDomain = olderImpact.domains.find(d => d.domain === recentDomain.domain);
    
    if (olderDomain) {
      const ratingChange = recentDomain.avgRatingWhenUsed - olderDomain.avgRatingWhenUsed;
      
      if (Math.abs(ratingChange) >= 0.5) {
        trends.push({
          domain: recentDomain.domain,
          oldRating: olderDomain.avgRatingWhenUsed,
          newRating: recentDomain.avgRatingWhenUsed,
          change: Math.round(ratingChange * 10) / 10,
          trend: ratingChange > 0 ? 'improving' : 'declining',
          oldImpact: olderDomain.impact,
          newImpact: recentDomain.impact
        });
      }
    }
  });

  // Sort by magnitude of change
  trends.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

  return {
    changedActivities: trends.length,
    trends: trends.slice(0, 5) // Top 5 changes
  };
}

/**
 * Generate personalized recommendation based on activity impact
 * @param {Array} sessions - Array of session objects
 * @returns {Object} - Personalized action plan
 */
function generatePersonalizedActionPlan(sessions) {
  const helpful = identifyHelpfulActivities(sessions);
  const harmful = identifyHarmfulActivities(sessions);

  if (!helpful && !harmful) {
    return null;
  }

  const recommendations = [];

  // Helpful activities recommendation
  if (helpful && helpful.activities.length > 0) {
    const topActivity = helpful.activities[0];
    recommendations.push({
      type: 'success',
      category: 'Leverage Strengths',
      action: `Continue using ${topActivity.domain}`,
      reason: `Sessions with this site average ${topActivity.avgRatingWhenUsed} stars (used in ${topActivity.frequency} sessions)`,
      priority: 'high'
    });

    if (helpful.activities.length >= 2) {
      const secondBest = helpful.activities[1];
      recommendations.push({
        type: 'success',
        category: 'Leverage Strengths',
        action: `Prioritize ${secondBest.domain}`,
        reason: `Consistent positive impact: ${secondBest.avgRatingWhenUsed} stars`,
        priority: 'medium'
      });
    }
  }

  // Harmful activities recommendation
  if (harmful && harmful.activities.length > 0) {
    const worstActivity = harmful.activities[0];
    recommendations.push({
      type: 'warning',
      category: 'Reduce Barriers',
      action: `Limit time on ${worstActivity.domain}`,
      reason: `Sessions with this site average ${worstActivity.avgRatingWhenUsed} stars (${worstActivity.frequency} sessions affected)`,
      priority: 'high'
    });

    if (harmful.activities.length >= 2) {
      const secondWorst = harmful.activities[1];
      recommendations.push({
        type: 'warning',
        category: 'Reduce Barriers',
        action: `Consider blocking ${secondWorst.domain} during study`,
        reason: `Consistent negative impact: ${secondWorst.avgRatingWhenUsed} stars`,
        priority: 'medium'
      });
    }
  }

  return {
    totalRecommendations: recommendations.length,
    recommendations: recommendations,
    summary: generateActionPlanSummary(helpful, harmful)
  };
}

/**
 * Helper: Generate recommendation text for helpful activities
 */
function generateHelpfulRecommendation(activities) {
  if (activities.length === 0) return '';
  
  const top = activities[0];
  return `Focus more on ${top.domain}. Sessions with this site average ${top.avgRatingWhenUsed}⭐ and ${top.avgProductivityWhenUsed}% productivity.`;
}

/**
 * Helper: Generate recommendation text for harmful activities
 */
function generateHarmfulRecommendation(activities) {
  if (activities.length === 0) return '';
  
  const worst = activities[0];
  return `Limit ${worst.domain}. Sessions with this site average only ${worst.avgRatingWhenUsed}⭐ and ${worst.avgProductivityWhenUsed}% productivity.`;
}

/**
 * Helper: Generate action plan summary
 */
function generateActionPlanSummary(helpful, harmful) {
  let summary = '';
  
  if (helpful && harmful) {
    summary = `You have ${helpful.count} activities that boost performance and ${harmful.count} that hinder it. Focus on your strengths while reducing time on problem sites.`;
  } else if (helpful) {
    summary = `You have ${helpful.count} activities that consistently boost performance. Keep leveraging these strengths!`;
  } else if (harmful) {
    summary = `You have ${harmful.count} activities that consistently hurt performance. Consider limiting or blocking these during study time.`;
  }
  
  return summary;
}
