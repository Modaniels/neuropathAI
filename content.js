// NeuraPath Floating Widget
// Purpose: Draggable floating button that appears during active sessions

let isDragging = false;
let hasMoved = false;
let currentX = 0;
let currentY = 0;
let initialX = 0;
let initialY = 0;
let xOffset = 0;
let yOffset = 0;

// Create the floating widget
function createFloatingWidget() {
  // Check if widget already exists
  if (document.getElementById('neuropath-floating-widget')) {
    return;
  }

  const widget = document.createElement('div');
  widget.id = 'neuropath-floating-widget';
  widget.className = 'neuropath-widget';
  
  // Widget structure
  widget.innerHTML = `
    <div class="neuropath-widget-inner">
      <div class="neuropath-icon">🧠</div>
      <div class="neuropath-timer" id="neuropath-timer">00:00</div>
      <div class="neuropath-pulse"></div>
    </div>
    <div class="neuropath-popup" id="neuropath-popup">
      <div class="neuropath-popup-header">NeuraPath Session</div>
      <div class="neuropath-popup-timer" id="neuropath-popup-timer">00:00:00</div>
      <button class="neuropath-popup-btn" id="neuropath-end-btn">End Session</button>
      <button class="neuropath-popup-btn neuropath-popup-btn-secondary" id="neuropath-close-btn">Close</button>
    </div>
  `;

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .neuropath-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 70px;
      height: 70px;
      background: linear-gradient(135deg, #0a192f 0%, #112240 100%);
      border-radius: 50%;
      box-shadow: 0 4px 20px rgba(100, 255, 218, 0.3), 0 0 0 2px rgba(100, 255, 218, 0.5);
      cursor: pointer;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      animation: neuropath-slide-in 0.4s ease-out;
      touch-action: none;
    }

    .neuropath-widget:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 25px rgba(100, 255, 218, 0.4), 0 0 0 3px rgba(100, 255, 218, 0.6);
    }

    .neuropath-widget:active {
      cursor: grabbing;
    }

    .neuropath-widget.dragging {
      cursor: grabbing !important;
      transition: none;
    }

    .neuropath-widget.dragging:hover {
      transform: scale(1) !important;
    }

    .neuropath-widget-inner {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .neuropath-icon {
      font-size: 28px;
      line-height: 1;
      animation: neuropath-float 3s ease-in-out infinite;
    }

    .neuropath-timer {
      position: absolute;
      bottom: 8px;
      font-size: 9px;
      font-weight: 600;
      color: #64ffda;
      font-family: 'Courier New', monospace;
      text-shadow: 0 0 5px rgba(100, 255, 218, 0.5);
    }

    .neuropath-pulse {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: rgba(100, 255, 218, 0.1);
      animation: neuropath-pulse 2s ease-out infinite;
    }

    .neuropath-popup {
      position: absolute;
      bottom: 85px;
      right: 0;
      background: linear-gradient(135deg, #112240 0%, #0a192f 100%);
      border: 2px solid #64ffda;
      border-radius: 12px;
      padding: 16px;
      min-width: 200px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(100, 255, 218, 0.2);
      opacity: 0;
      visibility: hidden;
      transform: translateY(10px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
      z-index: 1;
    }

    .neuropath-popup.visible {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
      pointer-events: all;
    }

    .neuropath-popup-header {
      color: #64ffda;
      font-weight: 700;
      font-size: 14px;
      margin-bottom: 12px;
      text-align: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    .neuropath-popup-timer {
      color: #ccd6f6;
      font-size: 24px;
      font-weight: 700;
      font-family: 'Courier New', monospace;
      text-align: center;
      margin-bottom: 16px;
      text-shadow: 0 0 10px rgba(100, 255, 218, 0.3);
    }

    .neuropath-popup-btn {
      width: 100%;
      padding: 10px 16px;
      margin-bottom: 8px;
      background: linear-gradient(135deg, #64ffda 0%, #5ce8c8 100%);
      color: #0a192f;
      border: none;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .neuropath-popup-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(100, 255, 218, 0.4);
    }

    .neuropath-popup-btn:active {
      transform: translateY(0);
    }

    .neuropath-popup-btn-secondary {
      background: rgba(100, 255, 218, 0.1);
      color: #64ffda;
      border: 1px solid #64ffda;
      margin-bottom: 0;
    }

    .neuropath-popup-btn-secondary:hover {
      background: rgba(100, 255, 218, 0.2);
    }

    @keyframes neuropath-slide-in {
      from {
        opacity: 0;
        transform: translateY(100px) scale(0.5);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes neuropath-float {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-5px);
      }
    }

    @keyframes neuropath-pulse {
      0% {
        transform: scale(1);
        opacity: 0.3;
      }
      50% {
        transform: scale(1.1);
        opacity: 0.15;
      }
      100% {
        transform: scale(1.2);
        opacity: 0;
      }
    }

    .neuropath-widget-tooltip {
      position: absolute;
      bottom: 80px;
      right: 0;
      background: rgba(17, 34, 64, 0.95);
      color: #64ffda;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    .neuropath-widget:hover .neuropath-widget-tooltip {
      opacity: 1;
    }

    .neuropath-widget.popup-open .neuropath-widget-tooltip {
      opacity: 0 !important;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(widget);

  // Add tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'neuropath-widget-tooltip';
  tooltip.textContent = 'Click to open controls';
  widget.appendChild(tooltip);

  // Initialize timer
  updateTimer();
  const timerInterval = setInterval(() => {
    updateTimer();
  }, 1000);

  // Store interval ID
  widget.dataset.timerInterval = timerInterval;

  // Get popup element
  const popup = document.getElementById('neuropath-popup');
  const endBtn = document.getElementById('neuropath-end-btn');
  const closeBtn = document.getElementById('neuropath-close-btn');

  // Add event listeners for dragging
  widget.addEventListener('mousedown', dragStart);
  widget.addEventListener('touchstart', dragStart, { passive: false });

  // Click to toggle popup (only if not dragging)
  widget.addEventListener('click', (e) => {
    if (!hasMoved) {
      popup.classList.toggle('visible');
      widget.classList.toggle('popup-open');
    }
  });

  // End session button
  endBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    endSessionFromWidget();
  });

  // Close popup button
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    popup.classList.remove('visible');
    widget.classList.remove('popup-open');
  });

  // Close popup when clicking outside
  document.addEventListener('click', (e) => {
    if (!widget.contains(e.target) && popup.classList.contains('visible')) {
      popup.classList.remove('visible');
      widget.classList.remove('popup-open');
    }
  });

  console.log('✨ NeuraPath floating widget created');
}

// Remove the floating widget
function removeFloatingWidget() {
  const widget = document.getElementById('neuropath-floating-widget');
  if (widget) {
    // Clear timer interval
    const intervalId = widget.dataset.timerInterval;
    if (intervalId) {
      clearInterval(parseInt(intervalId));
    }
    
    // Animate out
    widget.style.animation = 'neuropath-slide-in 0.3s ease-in reverse';
    setTimeout(() => {
      widget.remove();
      console.log('👋 NeuraPath floating widget removed');
    }, 300);
  }
}

// Update timer display
function updateTimer() {
  browser.runtime.sendMessage({ command: 'get-session-time' }).then(response => {
    const elapsed = response.elapsed || 0;
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    // Update small timer on widget
    const timerElement = document.getElementById('neuropath-timer');
    if (timerElement) {
      timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    
    // Update popup timer (hours:minutes:seconds)
    const popupTimerElement = document.getElementById('neuropath-popup-timer');
    if (popupTimerElement) {
      const hours = Math.floor(elapsed / 3600);
      const mins = Math.floor((elapsed % 3600) / 60);
      const secs = elapsed % 60;
      popupTimerElement.textContent = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
  });
}

// Drag start
function dragStart(e) {
  const widget = document.getElementById('neuropath-floating-widget');
  if (!widget) return;

  // Don't drag if clicking on popup
  const popup = document.getElementById('neuropath-popup');
  if (popup && popup.contains(e.target)) {
    return;
  }

  if (e.type === 'touchstart') {
    initialX = e.touches[0].clientX - xOffset;
    initialY = e.touches[0].clientY - yOffset;
  } else {
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
  }

  if (e.target === widget || widget.contains(e.target)) {
    hasMoved = false;
    widget.classList.add('dragging');

    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', dragEnd);
  }
}

// Drag
function drag(e) {
  const widget = document.getElementById('neuropath-floating-widget');
  if (!widget) return;

  e.preventDefault();
  hasMoved = true;

  if (e.type === 'touchmove') {
    currentX = e.touches[0].clientX - initialX;
    currentY = e.touches[0].clientY - initialY;
  } else {
    currentX = e.clientX - initialX;
    currentY = e.clientY - initialY;
  }

  xOffset = currentX;
  yOffset = currentY;

  setTranslate(currentX, currentY, widget);
}

// Drag end
function dragEnd() {
  const widget = document.getElementById('neuropath-floating-widget');
  if (widget) {
    widget.classList.remove('dragging');
  }

  initialX = currentX;
  initialY = currentY;

  document.removeEventListener('mousemove', drag);
  document.removeEventListener('mouseup', dragEnd);
  document.removeEventListener('touchmove', drag);
  document.removeEventListener('touchend', dragEnd);
}

// Set position with smooth transform
function setTranslate(xPos, yPos, el) {
  el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
  el.style.willChange = 'transform';
}

// End session from widget
function endSessionFromWidget() {
  console.log('🛑 Ending session from floating widget...');
  
  // Send message to background to end session
  browser.runtime.sendMessage({ command: 'end-session' }).then(response => {
    if (response.success) {
      // Remove widget
      removeFloatingWidget();
      
      // Open debrief page (background script will do this, but widget can initiate)
      console.log('✅ Session ended from widget');
    }
  }).catch(error => {
    console.error('Error ending session from widget:', error);
  });
}

// Listen for messages from background script
browser.runtime.onMessage.addListener((message) => {
  console.log('Content script received message:', message);
  if (message.command === 'show-floating-widget') {
    console.log('Showing floating widget...');
    createFloatingWidget();
  } else if (message.command === 'hide-floating-widget') {
    console.log('Hiding floating widget...');
    removeFloatingWidget();
  }
});

// Check if session is active on page load
console.log('NeuraPath content script loaded');
browser.runtime.sendMessage({ command: 'check-session' }).then(response => {
  console.log('Session check response:', response);
  if (response.active) {
    console.log('Active session detected, creating widget');
    createFloatingWidget();
  }
}).catch(error => {
  console.error('Error checking session:', error);
});
