// src/script/websocketManager.ts
import envConfig from '../config/env';

class WebSocketManager {
    private socket: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectInterval = 1000; // 1 sec
    private isIntentionallyClosed = false;
    private messageHandlers: Map<string, (data: any) => void> = new Map();
    private connectionPromise: Promise<WebSocket> | null = null;

    connect(): Promise<WebSocket> {
        if (this.connectionPromise) {
            return this.connectionPromise;
        }
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            return Promise.resolve(this.socket);
        }

        this.connectionPromise = new Promise((resolve, reject) => {
            this.isIntentionallyClosed = false;
            
            if (this.socket && this.socket.readyState !== WebSocket.OPEN) {
                this.socket.close();
                this.socket = null;
            }

            const wsUrl = `ws://${envConfig.backendURL}/ws/connect?apiKey=${envConfig.privateKey}`;
            console.log('Attempting WebSocket connection to:', wsUrl);
            
            this.socket = new WebSocket(wsUrl);

            this.socket.onopen = () => {
                console.log("WebSocket connection established");
                this.reconnectAttempts = 0;
                this.reconnectInterval = 1000;
                this.connectionPromise = null;
                resolve(this.socket!);
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('WebSocket message received:', data);
                    
                    // Handle notification messages (alias + message format)
                    if (data.alias && data.message && !data.type) {
                        this.handleNotificationMessage(data);
                    }
                    
                    // Handle specific message types
                    const handler = this.messageHandlers.get(data.type);
                    if (handler) {
                        handler(data);
                    }
                    
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            this.socket.onclose = (event) => {
                console.log('WebSocket connection closed:', event.code, event.reason);
                this.socket = null;
                this.connectionPromise = null; // Clear the promise
                
                // Only attempt reconnect if not intentionally closed and connection was previously established
                if (!this.isIntentionallyClosed && this.reconnectAttempts < this.maxReconnectAttempts) {
                    // Add delay before reconnection attempt
                    setTimeout(() => {
                        this.attemptReconnect();
                    }, this.reconnectInterval);
                }
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.connectionPromise = null; // Clear the promise
                reject(error);
            };

            // Add timeout for connection attempt
            setTimeout(() => {
                if (this.socket && this.socket.readyState === WebSocket.CONNECTING) {
                    console.log('WebSocket connection timeout');
                    this.socket.close();
                    this.connectionPromise = null;
                    reject(new Error('WebSocket connection timeout'));
                }
            }, 10000); // 10 second timeout
        });

        return this.connectionPromise;
    }

    private attemptReconnect() {
        this.reconnectAttempts++;
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        this.connect().catch((error) => {
            console.error('Reconnection failed:', error);
            // Exponential backoff
            this.reconnectInterval = Math.min(this.reconnectInterval * 2, 30000);
        });
    }

    sendMessage(message: any): boolean {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            try {
                this.socket.send(JSON.stringify(message));
                return true;
            } catch (error) {
                console.error('Error sending WebSocket message:', error);
                return false;
            }
        }
        console.warn('WebSocket is not connected. Message not sent:', message);
        return false;
    }

    // Send ping to keep connection alive
    sendPing() {
        return this.sendMessage({ type: 'ping' });
    }

    // Update user status
    updateStatus(status: 'online' | 'offline') {
        return this.sendMessage({ 
            type: 'status_update', 
            status: status 
        });
    }

    // Register message handlers for specific message types
    onMessage(type: string, handler: (data: any) => void) {
        this.messageHandlers.set(type, handler);
    }

    // Remove message handler
    offMessage(type: string) {
        this.messageHandlers.delete(type);
    }

    // Handle notification messages from backend
    private handleNotificationMessage(data: any) {
        if (data.alias && data.message) {
            this.displayNotificationInTopbar(data.alias, data.message);
        }
    }

    // Display notification in topbar
    private displayNotificationInTopbar(alias: string, message: string) {
        const aliasField = document.getElementById('notification-alias');
        const messageField = document.getElementById('notification-message');
        
        if (aliasField && messageField) {
            aliasField.textContent = alias.substring(0, 12); // Limit to 12 characters
            messageField.textContent = message.substring(0, 30); // Limit to 30 characters
            
            // Clear notification after 5 seconds
            setTimeout(() => {
                aliasField.textContent = '';
                messageField.textContent = '';
            }, 5000);
        }
    }

    disconnect() {
        this.isIntentionallyClosed = true;
        this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
        
        if (this.socket) {
            this.socket.close(1000, 'User initiated disconnect');
            this.socket = null;
        }
        
        this.connectionPromise = null;
    }

    isConnected(): boolean {
        return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
    }

    getConnectionState(): number | null {
        return this.socket ? this.socket.readyState : null;
    }
}

export const websocketManager = new WebSocketManager();

// Setup keepalive ping every 30 seconds
setInterval(() => {
    if (websocketManager.isConnected()) {
        websocketManager.sendPing();
    }
}, 30000);