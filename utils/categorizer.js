// NeuraPath URL Categorizer
// Purpose: Classify URLs as productive or distracting based on domain patterns

const PRODUCTIVE_DOMAINS = [
  'github.com',
  'stackoverflow.com',
  'developer.mozilla.org',
  'docs.microsoft.com',
  'learn.microsoft.com',
  'w3schools.com',
  'freecodecamp.org',
  'coursera.org',
  'udemy.com',
  'edx.org',
  'khanacademy.org',
  'arxiv.org',
  'scholar.google.com',
  'medium.com',
  'dev.to',
  'notion.so',
  'trello.com',
  'asana.com',
  'slack.com',
  'teams.microsoft.com',
  'zoom.us',
  'docs.google.com',
  'drive.google.com',
  'dropbox.com',
  'wikipedia.org',
  'linkedin.com/learning',
  'pluralsight.com',
  'codecademy.com'
];

const DISTRACTING_DOMAINS = [
  'youtube.com',
  'facebook.com',
  'twitter.com',
  'instagram.com',
  'reddit.com',
  'tiktok.com',
  'twitch.tv',
  'netflix.com',
  'hulu.com',
  'disneyplus.com',
  'amazon.com/prime',
  'spotify.com',
  'pinterest.com',
  'tumblr.com',
  'snapchat.com',
  '9gag.com',
  'buzzfeed.com',
  'dailymail.co.uk',
  'tmz.com'
];

/**
 * Extract domain from a URL
 * @param {string} url - Full URL
 * @returns {string} - Domain name
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch (error) {
    console.error('Error parsing URL:', url, error);
    return '';
  }
}

/**
 * Categorize a URL as productive, distracting, or neutral
 * @param {string} url - URL to categorize
 * @returns {string} - Category: 'productive', 'distracting', or 'neutral'
 */
function categorizeUrl(url) {
  const domain = extractDomain(url);
  
  // Check if it's a productive domain
  if (PRODUCTIVE_DOMAINS.some(pd => domain.includes(pd))) {
    return 'productive';
  }
  
  // Check if it's a distracting domain
  if (DISTRACTING_DOMAINS.some(dd => domain.includes(dd))) {
    return 'distracting';
  }
  
  // Default to neutral
  return 'neutral';
}

/**
 * Analyze a list of visited URLs and generate metrics
 * @param {Array} visitedUrls - Array of URL objects with url, title, timestamp
 * @returns {Object} - Analysis results with categories and counts
 */
function analyzeUrls(visitedUrls) {
  const categorized = {
    productive: [],
    distracting: [],
    neutral: []
  };
  
  const domainCounts = {};
  
  visitedUrls.forEach(entry => {
    const category = categorizeUrl(entry.url);
    const domain = extractDomain(entry.url);
    
    // Add to appropriate category
    categorized[category].push({
      url: entry.url,
      title: entry.title,
      timestamp: entry.timestamp,
      domain: domain
    });
    
    // Count domain visits
    domainCounts[domain] = (domainCounts[domain] || 0) + 1;
  });
  
  return {
    categorized,
    domainCounts,
    totals: {
      productive: categorized.productive.length,
      distracting: categorized.distracting.length,
      neutral: categorized.neutral.length,
      total: visitedUrls.length
    }
  };
}

/**
 * Calculate focus switches (transitions between productive and distracting sites)
 * @param {Array} visitedUrls - Array of URL objects in chronological order
 * @returns {number} - Number of focus switches
 */
function calculateFocusSwitches(visitedUrls) {
  let switches = 0;
  let previousCategory = null;
  
  visitedUrls.forEach(entry => {
    const currentCategory = categorizeUrl(entry.url);
    
    // Only count switches between productive and distracting (not neutral)
    if (previousCategory && 
        previousCategory !== 'neutral' && 
        currentCategory !== 'neutral' &&
        previousCategory !== currentCategory) {
      switches++;
    }
    
    previousCategory = currentCategory;
  });
  
  return switches;
}

/**
 * Generate anonymized domain summary (hide full URLs for privacy)
 * @param {Object} domainCounts - Object with domain visit counts
 * @returns {Array} - Array of top domains with counts
 */
function getTopDomains(domainCounts, limit = 10) {
  return Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([domain, count]) => ({ domain, count }));
}

// Export functions for use in background.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    categorizeUrl,
    analyzeUrls,
    calculateFocusSwitches,
    getTopDomains,
    extractDomain
  };
}
