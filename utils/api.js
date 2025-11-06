// NeuraPath AI API Helper
// Purpose: Handle communication with Gemini API for AI-powered insights

// Gemini API Configuration
const GEMINI_API_KEY = 'AIzaSyD646fiIdD2Zz1r47AB-gExDC3tgU50XRA';
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

/**
 * Fetch AI-generated insight from Gemini API
 * @param {Object} sessionSummary - The processed session data
 * @returns {Promise<string>} - AI-generated insight text
 */
async function fetchGeminiInsight(sessionSummary) {
  try {
    console.log('🤖 Calling Gemini API for AI insight...');
    
    // Prepare the prompt for Gemini
    const prompt = buildPrompt(sessionSummary);
    
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
 * @returns {string} - Formatted prompt
 */
function buildPrompt(session) {
  const { duration, metrics, topDomains } = session;
  
  // Format top domains for the prompt
  const domainsText = topDomains && topDomains.length > 0
    ? topDomains.slice(0, 5).map(d => `${d.domain} (${d.count} visits)`).join(', ')
    : 'none recorded';
  
  const prompt = `You are NeuraPath, an empathetic AI productivity coach. Analyze this browsing session and provide a personalized, narrative insight in 2-3 paragraphs. Be encouraging, specific, and actionable.

Session Data:
- Duration: ${duration.formatted} (${duration.minutes} minutes)
- Total sites visited: ${metrics.totalVisits}
- Productive sites: ${metrics.productiveVisits} (${metrics.productivePercentage}%)
- Distracting sites: ${metrics.distractingVisits} (${metrics.distractingPercentage}%)
- Neutral sites: ${metrics.neutralVisits}
- Focus switches: ${metrics.focusSwitches}
- Top domains: ${domainsText}

Write a personalized insight that:
1. Acknowledges their session pattern with empathy
2. Highlights what they did well
3. Offers 1-2 specific, actionable recommendations
4. Ends with encouragement

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

// Export for use in background.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { fetchGeminiInsight };
}
