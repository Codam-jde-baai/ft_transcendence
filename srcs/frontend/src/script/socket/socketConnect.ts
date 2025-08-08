import { connectFunc, requestBody } from "../connections";
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

    document.addEventListener('visibilitychange', async () => {
        if (document.visibilityState === 'visible') {
            if (!websocketManager.isConnected() && await isUserLoggedIn()) {
                websocketManager.connect().catch(console.error);
            }
        }
    });

    (async () => {
        if (await isUserLoggedIn()) {
            websocketManager.connect()
                .then(() => websocketManager.updateStatus('online'))
                .catch(console.error);
        }
    })();
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

async function isUserLoggedIn(): Promise<boolean> {
    const response = await connectFunc("/auth/check", requestBody("GET", null))
    if (response.ok)
        return true;
    return false;
}