import {websocketManager} from "./socketClass.ts";

// Main initialization function to be called from index.ts
export function initializeWebSocket() {
    setupUserStatusTracking();
    setupWebSocketConnection();
}

function setupWebSocketConnection() {    
    // Handle visibility changes
    if (websocketManager.isConnected()) {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                console.log('Page hidden, keeping WebSocket connection alive');
            } else if (document.visibilityState === 'visible') {
                // User came back - ensure connection is still alive
                if (!websocketManager.isConnected()) {
                    console.log('Page visible, attempting to reconnect WebSocket');
                    websocketManager.connect().catch(console.error);
                }
            }
        });
    }
}

function setupUserStatusTracking() {
    // Handle browser close/refresh - send offline status
    window.addEventListener('beforeunload', () => {
        if (websocketManager.isConnected()) {
            websocketManager.updateStatus('offline');
            // Small delay to allow message to send
            setTimeout(() => {
                websocketManager.disconnect();
            }, 100);
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

    // Handle focus/blur for better status tracking
    window.addEventListener('focus', () => {
        if (websocketManager.isConnected()) {
            websocketManager.updateStatus('online');
        }
    });
}