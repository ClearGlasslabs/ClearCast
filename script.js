// Global variables declaration
var canvas; // Canvas element
var ctx; // Canvas context
var animationFrameId; // ID for animation frame
var signalStrength = 0; // Simulated signal strength
var nerveActivity = 0; // Simulated nerve activity
var trackingStatus = 'Offline'; // Initial status
var lastFrameTime = Date.now(); // Timestamp for frame performance monitoring

// Function to initialize the application
function initializeApp() {
    // Get canvas element by ID
    canvas = document.getElementById('nerveCanvas');

    // Guard against missing canvas in DOM
    if (!canvas) {
        return;
    }

    // Get 2D context
    ctx = canvas.getContext('2d');

    // Ensure canvas is sized for current viewport
    handleResize();

    // Add touch listener after canvas initialization
    canvas.addEventListener('touchstart', handleTouch, { passive: false });

    // Start real-time updates
    startRealTimeUpdates();

    // Start animation loop
    animateNerveFibers();

    // Update status to online
    trackingStatus = 'Online';

    // Update display
    updateDataDisplay();

    // Startup log
    logMessage('App initialized for ClearGlassInc by Desmond Otieno.');
}

// Function to start real-time updates
function startRealTimeUpdates() {
    // Set interval for updates every 1000ms
    setInterval(function () {
        // Update simulated data
        updateSimulatedData();

        // Update display
        updateDataDisplay();
    }, 1000);
}

// Function to update simulated data
function updateSimulatedData() {
    // Generate random signal strength between 0 and 100
    signalStrength = Math.floor(Math.random() * 101);

    // Generate random nerve activity between 0 and 50
    nerveActivity = Math.floor(Math.random() * 51);

    // Validate generated data
    validatedUpdate();
}

// Function to update data display
function updateDataDisplay() {
    // Get signal strength element
    var signalElem = document.getElementById('signalStrength');

    // Get nerve activity element
    var activityElem = document.getElementById('nerveActivity');

    // Get tracking status element
    var statusElem = document.getElementById('trackingStatus');

    // Safely update text content if elements exist
    if (signalElem) {
        signalElem.textContent = 'Signal Strength: ' + signalStrength + '%';
    }

    if (activityElem) {
        activityElem.textContent = 'Nerve Activity: ' + nerveActivity + ' units';
    }

    if (statusElem) {
        statusElem.textContent = 'Tracking Status: ' + trackingStatus;
    }
}

// Function for color change based on signal
function getColorBasedOnSignal() {
    // If high signal
    if (signalStrength > 50) {
        return '#00ff00'; // Green
    }

    return '#ff0000'; // Red
}

// Function to draw additional nerve branch
function drawPrimaryBranch() {
    ctx.beginPath();
    ctx.moveTo(200, 200);
    ctx.lineTo(250, 150);
    ctx.stroke();
}

// Function to draw secondary branch
function drawSecondaryBranch() {
    ctx.beginPath();
    ctx.moveTo(200, 200);
    ctx.lineTo(150, 250);
    ctx.stroke();
}

// Function for text overlay on canvas
function addTextOverlay() {
    // Set font
    ctx.font = '20px Arial';

    // Set fill style
    ctx.fillStyle = '#000000';

    // Fill text
    ctx.fillText('Nerve Path', 10, 50);
}

// Function for performance monitoring
function monitorPerformance() {
    // Calculate delta time
    var now = Date.now();
    var delta = now - lastFrameTime;

    // Update last frame timestamp
    lastFrameTime = now;

    // If unusually slow frame, log
    if (delta > 100) {
        logMessage('Performance lag detected. Frame delta: ' + delta + 'ms');
    }
}

// Function to animate nerve fibers
function animateNerveFibers() {
    if (!ctx || !canvas) {
        return;
    }

    // Track performance
    monitorPerformance();

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set line style
    ctx.strokeStyle = getColorBasedOnSignal();
    ctx.lineWidth = 2;

    // Draw primary nerve curve
    ctx.beginPath();
    ctx.moveTo(100, 100);
    ctx.quadraticCurveTo(200 + Math.sin(Date.now() / 1000) * 10, 200, 300, 300);
    ctx.stroke();

    // Draw branches
    drawPrimaryBranch();
    drawSecondaryBranch();

    // Draw text overlay
    addTextOverlay();

    // Draw pulsing node
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(300 + Math.cos(Date.now() / 500) * 5, 300, 10, 0, 2 * Math.PI);
    ctx.fill();

    // Request next animation frame
    animationFrameId = requestAnimationFrame(animateNerveFibers);
}

// Function to stop animation if needed
function stopAnimation() {
    // Cancel animation frame
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
}

// Additional utility function: log message
function logMessage(message) {
    // Console log for debugging
    console.log(message);
}

// Function to handle resize
function handleResize() {
    if (!canvas) {
        return;
    }

    // Adjust canvas width
    canvas.width = Math.floor(window.innerWidth * 0.9);

    // Adjust canvas height
    canvas.height = Math.floor(window.innerHeight * 0.5);
}

// Function to simulate error handling
function simulateErrorCheck() {
    // Placeholder for bug checks; returning true for healthy state
    return true;
}

// Extended function for data validation
function validateData(value, min, max) {
    // Check if value is number
    if (typeof value !== 'number') {
        return false;
    }

    // Check range
    if (value < min || value > max) {
        return false;
    }

    // Valid
    return true;
}

// Use validation in updates
function validatedUpdate() {
    // Validate signal
    if (validateData(signalStrength, 0, 100)) {
        logMessage('Signal valid.');
    }

    // Validate activity
    if (validateData(nerveActivity, 0, 50)) {
        logMessage('Activity valid.');
    }
}

// Function to handle touch events for mobile
function handleTouch(event) {
    // Prevent default
    event.preventDefault();

    // Log touch
    logMessage('Touch detected.');
}

// Event listener for DOM content loaded
document.addEventListener('DOMContentLoaded', function () {
    // Initialize app when DOM is ready
    initializeApp();

    // Run basic error check
    if (!simulateErrorCheck()) {
        logMessage('Issue detected in simulation check.');
    }
});

// Add resize event listener
window.addEventListener('resize', handleResize);

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('service-worker.js').catch(function (error) {
            logMessage('Service worker registration failed: ' + error.message);
        });
    });
}
