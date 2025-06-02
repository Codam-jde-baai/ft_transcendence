import {websocketManager} from "./socketClass.ts";

let listenersSetup = false;

export function initializeWebSocket() {
    setupWebSocketEventListeners();
}

export function connectWebSocket() {
    return websocketManager.connect();
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
            // Don't disconnect immediately, let the status update send first
        }
    });

    // More reliable disconnect detection for modern browsers
    let isUnloading = false;
    window.addEventListener('beforeunload', () => {
        isUnloading = true;
    });

    window.addEventListener('unload', () => {
        if (isUnloading && websocketManager.isConnected()) {
            // Use sendBeacon for more reliable delivery during page unload
            navigator.sendBeacon('/user/offline', JSON.stringify({ 
                action: 'status_update',
                status: 'offline'
            }));
        }
    });

    window.addEventListener('focus', () => {
        if (!websocketManager.isConnected() && isUserLoggedIn()) {
            websocketManager.connect().catch(console.error);
        }
    });
}

// Helper function to check if user is logged in
// You might want to implement this based on your session/auth logic
function isUserLoggedIn(): boolean {
    const protectedRoutes = ['/home', '/setting', '/friends', '/history', '/startPGame', '/startSGame', '/snek', '/snekHistory'];
    const currentPath = window.location.pathname;
    return protectedRoutes.includes(currentPath);
}