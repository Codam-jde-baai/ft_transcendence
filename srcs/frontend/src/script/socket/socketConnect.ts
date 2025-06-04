import { websocketManager } from "./socketClass";

let listenersSetup = false;

export function initializeWebSocket() {
    setupWebSocketEventListeners();
}

function setupWebSocketEventListeners() {
    if (listenersSetup) {
        return;
    }
    listenersSetup = true;

    setupUserStatusTracking();

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            if (!websocketManager.isConnected() && isUserLoggedIn()) {
                websocketManager.connect().catch(console.error);
            }
        }
    });
}

function setupUserStatusTracking() {
    window.addEventListener('beforeunload', () => {
        if (websocketManager.isConnected()) {
            websocketManager.updateStatus('offline');
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


function isUserLoggedIn(): boolean {
    const protectedRoutes = ['/home', '/setting', '/friends', '/history', '/startPGame', '/startSGame', '/snek', '/snekHistory'];
    const currentPath = window.location.pathname;
    return protectedRoutes.includes(currentPath);
}