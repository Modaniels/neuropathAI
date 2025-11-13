// NeuraPath Rating Page Script
// Purpose: Handle session rating and feedback collection

let sessionData = null;
let selectedRating = 0;
let selectedTags = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  await loadSessionData();
  setupEventListeners();
});

/**
 * Load the latest session data from storage
 */
async function loadSessionData() {
  try {
    const result = await browser.storage.local.get('latestSession');
    
    if (result.latestSession) {
      sessionData = result.latestSession;
      displaySessionSummary();
      hideLoading();
    } else {
      showError('No session data found');
    }
  } catch (error) {
    console.error('Error loading session data:', error);
    showError('Failed to load session data');
  }
}

/**
 * Display session summary in the UI
 */
function displaySessionSummary() {
  const duration = sessionData.duration?.formatted || '--';
  const focusSwitches = sessionData.metrics?.focusSwitches || 0;
  const productivePercent = sessionData.metrics?.productivePercentage || 0;

  document.getElementById('duration').textContent = duration;
  document.getElementById('focus-switches').textContent = focusSwitches;
  document.getElementById('productive-percent').textContent = `${productivePercent}%`;
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  // Star rating
  const stars = document.querySelectorAll('.star');
  stars.forEach(star => {
    star.addEventListener('click', () => handleStarClick(star));
    star.addEventListener('mouseenter', () => handleStarHover(star));
    star.addEventListener('mouseleave', () => resetStarHover());
  });

  // Tags
  const tags = document.querySelectorAll('.tag');
  tags.forEach(tag => {
    tag.addEventListener('click', () => handleTagClick(tag));
  });

  // Notes character count
  const notesTextarea = document.getElementById('session-notes');
  notesTextarea.addEventListener('input', updateCharCount);

  // Buttons
  document.getElementById('submit-btn').addEventListener('click', handleSubmit);
  document.getElementById('skip-btn').addEventListener('click', handleSkip);
}

/**
 * Handle star rating click
 */
function handleStarClick(clickedStar) {
  const rating = parseInt(clickedStar.dataset.rating);
  selectedRating = rating;

  // Update star visuals
  const stars = document.querySelectorAll('.star');
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });

  // Show feedback message
  showRatingFeedback(rating);

  // Enable submit button
  document.getElementById('submit-btn').disabled = false;
}

/**
 * Handle star hover effect
 */
function handleStarHover(hoveredStar) {
  const rating = parseInt(hoveredStar.dataset.rating);
  const stars = document.querySelectorAll('.star');
  
  stars.forEach((star, index) => {
    if (index < rating) {
      star.style.color = 'var(--star-color)';
    } else {
      star.style.color = 'var(--star-inactive)';
    }
  });
}

/**
 * Reset star hover effect
 */
function resetStarHover() {
  const stars = document.querySelectorAll('.star');
  stars.forEach((star, index) => {
    if (index < selectedRating) {
      star.style.color = 'var(--star-color)';
    } else {
      star.style.color = 'var(--star-inactive)';
    }
  });
}

/**
 * Show feedback message based on rating
 */
function showRatingFeedback(rating) {
  const feedback = document.getElementById('rating-feedback');
  const messages = {
    1: { text: "Let's figure out what went wrong", class: 'negative' },
    2: { text: "Room for improvement", class: 'negative' },
    3: { text: "Not bad! Could be better", class: 'neutral' },
    4: { text: "Great session!", class: 'positive' },
    5: { text: "Excellent work! 🎉", class: 'positive' }
  };

  const message = messages[rating];
  feedback.textContent = message.text;
  feedback.className = `rating-feedback ${message.class}`;
}

/**
 * Handle tag selection
 */
function handleTagClick(clickedTag) {
  const tagValue = clickedTag.dataset.tag;
  
  if (clickedTag.classList.contains('selected')) {
    // Deselect
    clickedTag.classList.remove('selected');
    selectedTags = selectedTags.filter(tag => tag !== tagValue);
  } else {
    // Select
    clickedTag.classList.add('selected');
    selectedTags.push(tagValue);
  }
}

/**
 * Update character count for notes
 */
function updateCharCount() {
  const notes = document.getElementById('session-notes').value;
  const count = notes.length;
  document.getElementById('char-count').textContent = count;
}

/**
 * Handle submit button click
 */
async function handleSubmit() {
  if (selectedRating === 0) {
    alert('Please select a star rating');
    return;
  }

  const notes = document.getElementById('session-notes').value.trim();

  // Create rating data
  const userRating = {
    stars: selectedRating,
    tags: selectedTags,
    notes: notes,
    ratedAt: new Date().toISOString()
  };

  // Add rating to session data
  sessionData.userRating = userRating;

  // Save updated session back to storage
  try {
    await saveRatingToSession(sessionData);
    
    // Show success and redirect to debrief
    showSuccess();
    setTimeout(() => {
      window.location.href = browser.runtime.getURL('debrief/debrief.html');
    }, 800);
  } catch (error) {
    console.error('Error saving rating:', error);
    alert('Failed to save rating. Please try again.');
  }
}

/**
 * Save rating to session in storage
 */
async function saveRatingToSession(updatedSession) {
  try {
    // Update latestSession
    await browser.storage.local.set({ latestSession: updatedSession });
    
    // Also update in sessions array
    const result = await browser.storage.local.get('sessions');
    const sessions = result.sessions || [];
    
    // Find and update the matching session
    const sessionIndex = sessions.findIndex(s => s.sessionId === updatedSession.sessionId);
    if (sessionIndex !== -1) {
      sessions[sessionIndex] = updatedSession;
      await browser.storage.local.set({ sessions: sessions });
    }
    
    console.log('✅ Rating saved successfully!');
  } catch (error) {
    console.error('❌ Error saving rating:', error);
    throw error;
  }
}

/**
 * Handle skip button click
 */
function handleSkip() {
  if (confirm('Are you sure you want to skip rating? This helps us personalize your insights.')) {
    // Mark as skipped but still save
    sessionData.userRating = {
      stars: null,
      tags: [],
      notes: '',
      ratedAt: new Date().toISOString(),
      skipped: true
    };
    
    saveRatingToSession(sessionData).then(() => {
      window.location.href = browser.runtime.getURL('debrief/debrief.html');
    }).catch(error => {
      console.error('Error:', error);
      window.location.href = browser.runtime.getURL('debrief/debrief.html');
    });
  }
}

/**
 * Show loading state
 */
function hideLoading() {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('rating-form').style.display = 'block';
}

/**
 * Show error message
 */
function showError(message) {
  document.getElementById('loading').innerHTML = `
    <div style="color: var(--error-color); text-align: center;">
      <h2>❌ Error</h2>
      <p>${message}</p>
      <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--accent-color); border: none; border-radius: 8px; cursor: pointer;">
        Retry
      </button>
    </div>
  `;
}

/**
 * Show success animation
 */
function showSuccess() {
  const submitBtn = document.getElementById('submit-btn');
  submitBtn.textContent = '✓ Saved!';
  submitBtn.style.background = 'var(--success-color)';
}
