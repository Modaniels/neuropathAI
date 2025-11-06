// NeuraPath Popup Script
// Purpose: Handle user interaction within the popup

// Get references to the buttons and timer elements
const sessionBtn = document.getElementById('session-btn');
const endSessionBtn = document.getElementById('end-session-btn');
const timerDisplay = document.getElementById('timer-display');
const timerElement = document.getElementById('timer');

// Timer update interval
let timerInterval = null;

// Check session state on popup open
checkSessionState();

// Add click event listener to Start Session button
sessionBtn.addEventListener('click', async () => {
  // Disable button and update text to show loading state
  sessionBtn.disabled = true;
  sessionBtn.textContent = 'Starting...';
  
  try {
    // Send message to background script and wait for response
    const response = await browser.runtime.sendMessage({
      command: "start-session"
    });
    
    // Update UI based on response
    if (response && response.success) {
      showEndSessionButton();
    } else {
      sessionBtn.textContent = 'Start Session';
      sessionBtn.disabled = false;
    }
  } catch (error) {
    console.error('Error starting session:', error);
    sessionBtn.textContent = 'Error - Try Again';
    sessionBtn.disabled = false;
  }
});

// Add click event listener to End Session button
endSessionBtn.addEventListener('click', async () => {
  // Disable button and update text to show loading state
  endSessionBtn.disabled = true;
  endSessionBtn.textContent = 'Ending...';
  
  try {
    // Send message to background script and wait for response
    const response = await browser.runtime.sendMessage({
      command: "end-session"
    });
    
    // Update UI based on response
    if (response && response.success) {
      showStartSessionButton();
    } else {
      endSessionBtn.textContent = 'End Session';
      endSessionBtn.disabled = false;
    }
  } catch (error) {
    console.error('Error ending session:', error);
    endSessionBtn.textContent = 'Error - Try Again';
    endSessionBtn.disabled = false;
  }
});

// Function to show End Session button and hide Start Session button
function showEndSessionButton() {
  sessionBtn.style.display = 'none';
  endSessionBtn.style.display = 'block';
  endSessionBtn.disabled = false;
  endSessionBtn.textContent = 'End Session';
  timerDisplay.style.display = 'block';
  startTimerUpdates();
}

// Function to show Start Session button and hide End Session button
function showStartSessionButton() {
  endSessionBtn.style.display = 'none';
  sessionBtn.style.display = 'block';
  sessionBtn.disabled = false;
  sessionBtn.textContent = 'Start Session';
  timerDisplay.style.display = 'none';
  stopTimerUpdates();
}

// Function to format time as HH:MM:SS
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Function to update timer display
async function updateTimer() {
  try {
    const response = await browser.runtime.sendMessage({
      command: "get-session-time"
    });
    
    if (response && response.elapsed !== undefined) {
      timerElement.textContent = formatTime(response.elapsed);
    }
  } catch (error) {
    console.error('Error updating timer:', error);
  }
}

// Function to start timer updates
function startTimerUpdates() {
  // Update immediately
  updateTimer();
  
  // Clear any existing interval
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  
  // Update every second
  timerInterval = setInterval(updateTimer, 1000);
}

// Function to stop timer updates
function stopTimerUpdates() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  timerElement.textContent = '00:00:00';
}

// Function to check current session state
async function checkSessionState() {
  try {
    const response = await browser.runtime.sendMessage({
      command: "check-session"
    });
    
    if (response && response.active) {
      showEndSessionButton();
    } else {
      showStartSessionButton();
    }
  } catch (error) {
    console.error('Error checking session state:', error);
    showStartSessionButton();
  }
}
