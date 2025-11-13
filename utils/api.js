// NeuraPath AI API Helper
// Purpose: Handle communication with Gemini API for AI-powered insights

// Gemini API Configuration
const GEMINI_API_KEY = 'AIzaSyD646fiIdD2Zz1r47AB-gExDC3tgU50XRA';
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

/**
 * Fetch AI-generated insight from Gemini API
 * @param {Object} sessionSummary - The processed session data
 * @param {Array} recentSessions - Optional: Recent sessions for context (Phase 6)
 * @returns {Promise<string>} - AI-generated insight text
 */
async function fetchGeminiInsight(sessionSummary, recentSessions = null) {
  try {
    console.log('🤖 Calling Gemini API for AI insight...');
    
    // Prepare the prompt for Gemini (Phase 6: with historical context)
    const prompt = buildPrompt(sessionSummary, recentSessions);
    
    // Make API request
    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 500,
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    
    // Extract the generated text
    if (data.candidates && data.candidates.length > 0) {
      const insight = data.candidates[0].content.parts[0].text;
      console.log('✅ AI insight generated successfully');
      return insight;
    } else {
      throw new Error('No insight generated from API');
    }
    
  } catch (error) {
    console.error('❌ Error fetching Gemini insight:', error);
    // Return a fallback message if API fails
    return getFallbackInsight(sessionSummary);
  }
}

/**
 * Build a comprehensive prompt for Gemini based on session data
 * @param {Object} session - Session summary object
 * @param {Array} recentSessions - Optional: last 5 sessions for context (Phase 6)
 * @returns {string} - Formatted prompt
 */
function buildPrompt(session, recentSessions = null) {
  const { duration, metrics, topDomains, focusAnalysis } = session;
  
  // Format top domains for the prompt
  const domainsText = topDomains && topDomains.length > 0
    ? topDomains.slice(0, 5).map(d => `${d.domain} (${d.count} visits)`).join(', ')
    : 'none recorded';
  
  // Build focus analysis section if available (Phase 4)
  let focusSection = '';
  if (focusAnalysis && focusAnalysis.hasSignificantData) {
    focusSection = '\n\nFocus & Context Switching:';
    
    if (focusAnalysis.focusRecovery) {
      focusSection += `\n- Average focus recovery time: ${focusAnalysis.focusRecovery.averageRecoveryMinutes} minutes (after ${focusAnalysis.focusRecovery.recoveryCount} distractions)`;
      focusSection += `\n- Total time lost to recovery: ${focusAnalysis.focusRecovery.totalTimeLost} minutes`;
    }
    
    if (focusAnalysis.deepFocus) {
      focusSection += `\n- Deep focus periods: ${focusAnalysis.deepFocus.periodCount} (longest: ${focusAnalysis.deepFocus.longestPeriodMinutes} min)`;
      focusSection += `\n- Total deep focus time: ${focusAnalysis.deepFocus.totalDeepFocusMinutes} minutes`;
    }
    
    if (focusAnalysis.distractionImpact) {
      focusSection += `\n- Time on distractions: ${focusAnalysis.distractionImpact.totalDistractionMinutes} minutes (${focusAnalysis.distractionImpact.distractionPercentage}%)`;
    }
    
    focusSection += `\n- Total context switches: ${focusAnalysis.totalContextSwitches}`;
  }

  // Phase 6: Add historical context if available
  let historySection = '';
  if (recentSessions && recentSessions.length > 0) {
    const ratedSessions = recentSessions.filter(s => s.userRating && s.userRating.stars);
    
    if (ratedSessions.length > 0) {
      const avgHistoricalRating = ratedSessions.reduce((sum, s) => sum + s.userRating.stars, 0) / ratedSessions.length;
      const avgHistoricalDuration = ratedSessions.reduce((sum, s) => sum + s.duration.minutes, 0) / ratedSessions.length;
      const avgHistoricalProductivity = ratedSessions.reduce((sum, s) => sum + s.metrics.productivePercentage, 0) / ratedSessions.length;
      
      historySection = `\n\nHistorical Context (Last ${ratedSessions.length} Sessions):`;
      historySection += `\n- Average rating: ${avgHistoricalRating.toFixed(1)} stars`;
      historySection += `\n- Average duration: ${Math.round(avgHistoricalDuration)} minutes`;
      historySection += `\n- Average productivity: ${Math.round(avgHistoricalProductivity)}%`;
      
      // Add trend if enough data
      if (ratedSessions.length >= 3) {
        const recent3 = ratedSessions.slice(-3);
        const recentAvg = recent3.reduce((sum, s) => sum + s.userRating.stars, 0) / 3;
        
        if (recentAvg > avgHistoricalRating + 0.3) {
          historySection += `\n- Trend: Improving! (recent avg: ${recentAvg.toFixed(1)} stars)`;
        } else if (recentAvg < avgHistoricalRating - 0.3) {
          historySection += `\n- Trend: Declining (recent avg: ${recentAvg.toFixed(1)} stars)`;
        } else {
          historySection += `\n- Trend: Stable`;
        }
      }
      
      // Compare current to historical
      if (session.userRating && session.userRating.stars) {
        const currentRating = session.userRating.stars;
        if (currentRating > avgHistoricalRating + 0.5) {
          historySection += `\n- This session: Above your average! (${currentRating} vs ${avgHistoricalRating.toFixed(1)})`;
        } else if (currentRating < avgHistoricalRating - 0.5) {
          historySection += `\n- This session: Below your average (${currentRating} vs ${avgHistoricalRating.toFixed(1)})`;
        }
      }
    }
  }
  
  const prompt = `You are NeuraPath, an empathetic AI productivity coach. Analyze this browsing session and provide a personalized, narrative insight in 2-3 paragraphs. Be encouraging, specific, and actionable.

Session Data:
- Duration: ${duration.formatted} (${duration.minutes} minutes)
- Total sites visited: ${metrics.totalVisits}
- Productive sites: ${metrics.productiveVisits} (${metrics.productivePercentage}%)
- Distracting sites: ${metrics.distractingVisits} (${metrics.distractingPercentage}%)
- Neutral sites: ${metrics.neutralVisits}
- Focus switches: ${metrics.focusSwitches}
- Top domains: ${domainsText}${focusSection}${historySection}

Write a personalized insight that:
1. Acknowledges their session pattern with empathy${historySection ? ' and historical context' : ''}
2. Highlights what they did well (especially if focus recovery time < 12 min or deep focus periods)
3. ${historySection ? 'Compares to their typical performance and notes trends' : 'Offers 1-2 specific, actionable recommendations'}
4. ${historySection ? 'Offers specific recommendations based on their history' : 'Mention the 12-minute focus recovery principle if relevant'}
5. Ends with encouragement

Keep it conversational, warm, and under 150 words. Don't use bullet points. Write in natural paragraphs.`;

  return prompt;
}

/**
 * Generate a fallback insight if API fails
 * @param {Object} session - Session summary object
 * @returns {string} - Fallback insight text
 */
function getFallbackInsight(session) {
  const productivePercent = session.metrics.productivePercentage;
  
  if (productivePercent >= 60) {
    return "Great session! You maintained strong focus and made productive use of your time. Your browsing patterns show discipline and intentionality. Keep building on this momentum, and consider tracking what times of day you're most focused to optimize your future sessions.";
  } else if (productivePercent >= 40) {
    return "You had some good focused moments in this session, though there's room to reduce distractions. Try setting specific time blocks for focused work and separate breaks for browsing. Small changes in your routine can lead to significant improvements in productivity over time.";
  } else {
    return "This session showed some challenges with maintaining focus. That's okay - awareness is the first step to improvement. Consider using website blockers during work sessions or trying the Pomodoro technique to build better browsing habits. Remember, every session is a fresh opportunity to improve.";
  }
}

/**
 * Phase 6: Generate AI-powered weekly summary
 * Analyzes patterns across multiple sessions for deeper insights
 * @param {Array} weeklySessions - Sessions from past 7 days
 * @returns {Promise<string>} - Weekly AI summary
 */
async function generateWeeklyAISummary(weeklySessions) {
  try {
    console.log('🤖 Generating weekly AI summary...');
    
    if (!weeklySessions || weeklySessions.length === 0) {
      return null;
    }

    const ratedSessions = weeklySessions.filter(s => s.userRating && s.userRating.stars && !s.userRating.skipped);
    
    if (ratedSessions.length < 3) {
      return null; // Need minimum data for meaningful weekly summary
    }

    // Calculate weekly statistics
    const totalSessions = weeklySessions.length;
    const avgRating = ratedSessions.reduce((sum, s) => sum + s.userRating.stars, 0) / ratedSessions.length;
    const totalMinutes = weeklySessions.reduce((sum, s) => sum + s.duration.minutes, 0);
    const avgProductivity = weeklySessions.reduce((sum, s) => sum + s.metrics.productivePercentage, 0) / weeklySessions.length;
    const avgFocusSwitches = weeklySessions.reduce((sum, s) => sum + s.metrics.focusSwitches, 0) / weeklySessions.length;

    // Identify trends
    let trendDirection = 'stable';
    if (ratedSessions.length >= 4) {
      const firstHalf = ratedSessions.slice(0, Math.floor(ratedSessions.length / 2));
      const secondHalf = ratedSessions.slice(Math.floor(ratedSessions.length / 2));
      
      const firstAvg = firstHalf.reduce((sum, s) => sum + s.userRating.stars, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, s) => sum + s.userRating.stars, 0) / secondHalf.length;
      
      if (secondAvg > firstAvg + 0.5) {
        trendDirection = 'improving significantly';
      } else if (secondAvg > firstAvg + 0.2) {
        trendDirection = 'improving';
      } else if (secondAvg < firstAvg - 0.5) {
        trendDirection = 'declining significantly';
      } else if (secondAvg < firstAvg - 0.2) {
        trendDirection = 'declining';
      }
    }

    // Find best and worst sessions
    const bestSession = ratedSessions.reduce((best, s) => 
      s.userRating.stars > best.userRating.stars ? s : best
    );
    const worstSession = ratedSessions.reduce((worst, s) => 
      s.userRating.stars < worst.userRating.stars ? s : worst
    );

    // Get most used domains
    const domainFrequency = {};
    weeklySessions.forEach(session => {
      if (session.topDomains) {
        session.topDomains.forEach(domain => {
          domainFrequency[domain.domain] = (domainFrequency[domain.domain] || 0) + domain.count;
        });
      }
    });
    const topDomains = Object.entries(domainFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([domain]) => domain);

    // Build comprehensive weekly prompt
    const weeklyPrompt = `You are NeuraPath, an empathetic AI productivity coach. Analyze this week's study sessions and provide a comprehensive weekly summary in 3-4 paragraphs. Be insightful, encouraging, and strategic.

Weekly Overview:
- Total sessions: ${totalSessions}
- Rated sessions: ${ratedSessions.length}
- Total study time: ${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m
- Average rating: ${avgRating.toFixed(1)} ⭐
- Average productivity: ${Math.round(avgProductivity)}%
- Average focus switches: ${avgFocusSwitches.toFixed(1)}
- Trend: ${trendDirection}

Session Highlights:
- Best session: ${bestSession.userRating.stars}⭐ with ${bestSession.metrics.productivePercentage}% productivity
- Worst session: ${worstSession.userRating.stars}⭐ with ${worstSession.metrics.productivePercentage}% productivity
- Most used domains: ${topDomains.join(', ')}

Write a comprehensive weekly summary that:
1. Celebrates wins and progress (be specific about what's working)
2. Identifies patterns - what made your best sessions successful vs what held back weaker ones
3. Notes the trend direction and what it means (${trendDirection})
4. Provides 2-3 strategic recommendations for next week based on the data
5. Ends with personalized encouragement and actionable next steps

Keep it conversational yet insightful, around 200-250 words. Make it feel like a personal check-in from a supportive mentor who's been watching your progress all week.`;

    // Make API request
    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: weeklyPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 500,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const summary = data.candidates[0].content.parts[0].text;
      console.log('✅ Weekly AI summary generated successfully');
      return summary;
    } else {
      throw new Error('No summary generated from API');
    }
    
  } catch (error) {
    console.error('❌ Error generating weekly AI summary:', error);
    return getWeeklyFallbackSummary(weeklySessions);
  }
}

/**
 * Fallback weekly summary if AI fails
 */
function getWeeklyFallbackSummary(sessions) {
  const ratedSessions = sessions.filter(s => s.userRating && s.userRating.stars);
  
  if (ratedSessions.length === 0) {
    return "Keep tracking your sessions! Rate them to unlock personalized weekly summaries and deeper insights about your study patterns.";
  }

  const avgRating = ratedSessions.reduce((sum, s) => sum + s.userRating.stars, 0) / ratedSessions.length;
  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration.minutes, 0);

  return `This week you completed ${sessions.length} study sessions totaling ${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m with an average rating of ${avgRating.toFixed(1)} stars. ${avgRating >= 3.5 ? 'Great consistency! You\'re building strong study habits.' : 'You\'re tracking your progress - that\'s the first step to improvement.'} Keep rating your sessions to unlock deeper AI-powered insights about what helps you focus best.`;
}

// Export for use in background.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { fetchGeminiInsight };
}
