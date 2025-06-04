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

    if (isUserLoggedIn()) {
        websocketManager.connect()
            .then(() => websocketManager.updateStatus('online'))
            .catch(console.error);
    }
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
}

function isUserLoggedIn(): boolean {
    const protectedRoutes = ['/home', '/setting', '/friends', '/history', '/startPGame', '/startSGame', '/snek', '/snekHistory'];
    const currentPath = window.location.pathname;
    return protectedRoutes.includes(currentPath);
}