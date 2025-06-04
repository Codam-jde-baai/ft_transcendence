import envConfig from '../../config/env';
import { ClientReceiveMessage, ClientSendMessage, isClientReceiveMessage } from './messageTypes.ts';

class WebSocketManager {
    private socket: WebSocket | null = null;
    private reconnectAttempts = 0;
    private readonly maxReconnectAttempts = 5;
    private reconnectDelay = 1000;
    private isManuallyDisconnected = false;
    private messageHandlers = new Map<string, (data: ClientReceiveMessage) => void>();
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
                    const rawData = JSON.parse(event.data);
                    console.log('WebSocket message received:', rawData);

                    // Type-safe message handling
                    if (!isClientReceiveMessage(rawData)) {
                        console.warn('Received message with unknown format:', rawData);
                        return;
                    }

                    const data = rawData as ClientReceiveMessage;

                    // Handle ping from server with pong response
                    if (data.type === 'ping') {
                        this.sendTypedMessage({ type: 'pong', timestamp: Date.now() });
                        return;
                    }

                    // Handle system messages
                    if (data.type === 'system') {
                        console.log('System message:', data.message);
                        const handler = this.messageHandlers.get('system');
                        handler?.(data);
                        return;
                    }

                    // Handle notifications - show to user
                    if (data.type === 'notification') {
                        this.showNotification(data.alias, data.message);
                        const handler = this.messageHandlers.get('notification');
                        handler?.(data);
                        return;
                    }

                    // Handle other message types
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

    // Type-safe message sending
    private sendTypedMessage(message: ClientSendMessage): boolean {
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

    // Legacy send method for backwards compatibility
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
    updateStatus(status: 'online' | 'offline'): boolean {
        return this.sendTypedMessage({ type: 'status_update', status });
    }

    sendPing(): boolean {
        return this.sendTypedMessage({ type: 'ping', timestamp: Date.now() });
    }

    // Message handler management
    on(type: string, handler: (data: ClientReceiveMessage) => void) {
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

        // Also log to console for debugging
        console.log(`Notification: ${alias} ${message}`);
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

// Set up system message handler
websocketManager.on('system', (data) => {
    if (data.type === 'system') {
        console.log('System message received:', data.message);
    }
});

// Set up notification handler
websocketManager.on('notification', (data) => {
    if (data.type === 'notification') {
        console.log(`Friend notification: ${data.alias} ${data.message}`);
    }
});

// Auto-ping every 30 seconds - but only send if we haven't heard from server recently
setInterval(() => {
    if (websocketManager.isConnected()) {
        // Only send ping if we haven't received a server message recently
        const timeSinceLastMessage = Date.now() - websocketManager.getLastServerMessage();
        if (timeSinceLastMessage > 25000) { // 25 seconds
            websocketManager.sendPing();
        }
    }
}, 30000);