import envConfig from '../config/env';
class WebSocketManager {
    private socket: WebSocket | null = null;
    private reconnectAttempts = 0;
    private readonly maxReconnectAttempts = 5;
    private reconnectDelay = 1000;
    private isManuallyDisconnected = false;
    private messageHandlers = new Map<string, (data: any) => void>();
    private connectionPromise: Promise<WebSocket> | null = null;
    private lastServerMessage = Date.now();

    async connect(): Promise<WebSocket> {
        // Return existing connection if available
        if (this.socket?.readyState === WebSocket.OPEN) {
            return this.socket;
        }

        // Return existing connection promise if in progress
        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        this.connectionPromise = new Promise((resolve, reject) => {
            this.isManuallyDisconnected = false;
            
            // Clean up existing socket
            if (this.socket) {
                this.socket.close();
                this.socket = null;
            }

            // Ensure we have the correct WebSocket URL format
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${envConfig.backendURL}/ws/connect?apiKey=${envConfig.privateKey}`;
            console.log('Attempting WebSocket connection to:', wsUrl);
            
            try {
                this.socket = new WebSocket(wsUrl);
            } catch (error) {
                console.error('Failed to create WebSocket:', error);
                this.connectionPromise = null;
                reject(error);
                return;
            }

            const timeout = setTimeout(() => {
                if (this.socket?.readyState === WebSocket.CONNECTING) {
                    console.log('WebSocket connection timeout');
                    this.socket.close();
                    this.connectionPromise = null;
                    reject(new Error('Connection timeout'));
                }
            }, 10000);

            this.socket.onopen = () => {
                clearTimeout(timeout);
                console.log('WebSocket connected successfully');
                this.reconnectAttempts = 0;
                this.reconnectDelay = 1000;
                this.lastServerMessage = Date.now();
                this.connectionPromise = null;
                resolve(this.socket!);
            };

            this.socket.onmessage = (event) => {
                this.lastServerMessage = Date.now();
                try {
                    const data = JSON.parse(event.data);
                    console.log('WebSocket message received:', data);
                    
                    // Handle ping from server with pong response
                    if (data.type === 'ping') {
                        this.send({ type: 'pong', timestamp: Date.now() });
                        return;
                    }

                    // Handle connection established message
                    if (data.type === 'connection_established') {
                        console.log('Connection established:', data);
                        const handler = this.messageHandlers.get('connection_established');
                        handler?.(data);
                        return;
                    }

                    // Handle notification format (alias + message)
                    if (data.alias && data.message && !data.type) {
                        this.showNotification(data.alias, data.message);
                        return;
                    }

                    // Handle typed messages
                    const handler = this.messageHandlers.get(data.type);
                    if (handler) {
                        handler(data);
                    } else {
                        console.log('No handler for message type:', data.type);
                    }
                    
                } catch (error) {
                    console.error('Message parse error:', error);
                }
            };

            this.socket.onclose = (event) => {
                console.log('WebSocket disconnected', event.code, event.reason);
                clearTimeout(timeout);
                this.socket = null;
                this.connectionPromise = null;
                
                // Only reconnect if not manually disconnected and we haven't exceeded attempts
                if (!this.isManuallyDisconnected && this.reconnectAttempts < this.maxReconnectAttempts) {
                    // Don't reconnect immediately for certain error codes
                    if (event.code === 1008) { // Policy Violation (auth errors)
                        console.error('Authentication error, not attempting reconnect');
                        return;
                    }
                    
                    setTimeout(() => this.reconnect(), this.reconnectDelay);
                } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                    console.warn('Max reconnection attempts reached');
                }
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                clearTimeout(timeout);
                this.connectionPromise = null;
                reject(error);
            };
        });

        return this.connectionPromise;
    }

    private async reconnect() {
        this.reconnectAttempts++;
        console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        try {
            await this.connect();
            console.log('Reconnection successful');
        } catch (error) {
            console.error('Reconnection failed:', error);
            this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
        }
    }

    send(message: any): boolean {
        if (this.socket?.readyState === WebSocket.OPEN) {
            try {
                this.socket.send(JSON.stringify(message));
                return true;
            } catch (error) {
                console.error('Send error:', error);
            }
        } else {
            console.warn('WebSocket not connected, message not sent:', message);
        }
        return false;
    }

    // Convenience methods
    updateStatus(status: 'online' | 'offline') {
        return this.send({ type: 'status_update', status });
    }

    // Message handler management
    on(type: string, handler: (data: any) => void) {
        this.messageHandlers.set(type, handler);
    }

    off(type: string) {
        this.messageHandlers.delete(type);
    }

    private showNotification(alias: string, message: string) {
        const aliasEl = document.getElementById('notification-alias');
        const messageEl = document.getElementById('notification-message');
        
        if (aliasEl && messageEl) {
            aliasEl.textContent = alias.substring(0, 12);
            messageEl.textContent = message.substring(0, 30);
            
            setTimeout(() => {
                aliasEl.textContent = '';
                messageEl.textContent = '';
            }, 5000);
        }
    }

    disconnect() {
        console.log('Manually disconnecting WebSocket');
        this.isManuallyDisconnected = true;
        this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
        
        if (this.socket) {
            this.socket.close(1000, 'Manual disconnect');
            this.socket = null;
        }
        
        this.connectionPromise = null;
    }

    isConnected(): boolean {
        return this.socket?.readyState === WebSocket.OPEN;
    }

    getLastServerMessage(): number {
        return this.lastServerMessage;
    }
}

export const websocketManager = new WebSocketManager();

// Set up connection established handler
websocketManager.on('connection_established', (data) => {
    console.log('WebSocket connection established:', data);
});

// Auto-ping every 30 seconds - but only send if we haven't heard from server recently
setInterval(() => {
    if (websocketManager.isConnected()) {
        // Only send ping if we haven't received a server message recently
        const timeSinceLastMessage = Date.now() - websocketManager.getLastServerMessage();
        if (timeSinceLastMessage > 25000) { // 25 seconds
            websocketManager.send({ type: 'ping', timestamp: Date.now() });
        }
    }
}, 30000);