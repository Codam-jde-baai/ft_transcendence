import { websocketManager } from "./socketClass";

let listenersSetup = false;

export function initializeWebSocket() {
    setupWebSocketEventListeners();
}

// Set up event listeners (but don't connect yet)
function setupWebSocketEventListeners() {
    if (listenersSetup) {
        return;
    }
    listenersSetup = true;

    setupUserStatusTracking();

    // Handle visibility changes - only relevant when user is logged in
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            if (!websocketManager.isConnected() && isUserLoggedIn()) {
                websocketManager.connect().catch(console.error);
            }
        }
    });
}

function setupUserStatusTracking() {
    // Handle browser close/refresh - send offline status
    window.addEventListener('beforeunload', () => {
        if (websocketManager.isConnected()) {
            websocketManager.updateStatus('offline');
            // Small delay to allow message to send
            setTimeout(() => {
                websocketManager.disconnect();
            }, 50);
        }
    });

    // Use Page Visibility API for better detection
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && websocketManager.isConnected()) {
            websocketManager.updateStatus('offline');
        } else if (!document.hidden && !websocketManager.isConnected() && isUserLoggedIn()) {
            websocketManager.connect()
                .then(() => websocketManager.updateStatus('online'))
                .catch(console.error);
        }
    });

    window.addEventListener('focus', () => {
        if (!websocketManager.isConnected() && isUserLoggedIn()) {
            websocketManager.connect()
                .then(() => websocketManager.updateStatus('online'))
                .catch(console.error);
        }
    });

    window.addEventListener('blur', () => {
        if (websocketManager.isConnected()) {
            websocketManager.updateStatus('offline');
        }
    });
}

// Helper function to check if user is logged in
function isUserLoggedIn(): boolean {
    const protectedRoutes = ['/home', '/setting', '/friends', '/history', '/startPGame', '/startSGame', '/snek', '/snekHistory'];
    const currentPath = window.location.pathname;
    return protectedRoutes.includes(currentPath);
}