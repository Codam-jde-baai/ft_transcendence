// types/websocket.ts

// Messages sent FROM server TO client
export type SendMessage =
	| { type: 'system'; message: string; uuid: string; alias: string }
	| { type: 'notification'; alias: string; message: string }
	| { type: 'error'; message: string }
	| { type: 'pong'; timestamp: number }
	| { type: 'echo'; originalMessage: any }
	| { type: 'connection_established'; uuid: string; alias: string; message: string }
	| { type: 'ping'; timestamp: number }; // Add ping from server

// Messages sent FROM client TO server
export type ReceiveMessage =
	| { type: 'status_update'; status: 'online' | 'offline' }
	| { type: 'ping'; timestamp?: number }
	| { type: 'pong'; timestamp: number }; // Add pong from client

// Client-side types (what client receives from server)
export type ClientReceiveMessage = SendMessage;

// Client-side types (what client sends to server)
export type ClientSendMessage = ReceiveMessage;

// Helper type for parsing received messages safely
export interface WebSocketMessageHandler {
	(message: ReceiveMessage): void | Promise<void>;
}

// Type guard functions for runtime type checking
export function isSendMessage(obj: any): obj is SendMessage {
	return obj && typeof obj === 'object' && 'type' in obj &&
		['system', 'notification', 'error', 'pong', 'echo', 'connection_established', 'ping'].includes(obj.type);
}

export function isReceiveMessage(obj: any): obj is ReceiveMessage {
	return obj && typeof obj === 'object' && 'type' in obj &&
		['status_update', 'ping', 'pong'].includes(obj.type);
}

// Client-side type guards
export function isClientReceiveMessage(obj: any): obj is ClientReceiveMessage {
	return isSendMessage(obj);
}

export function isClientSendMessage(obj: any): obj is ClientSendMessage {
	return isReceiveMessage(obj);
}

// Utility function for safe message sending
export function createSystemMessage(message: string, uuid: string, alias: string): SendMessage {
	return { type: 'system', message, uuid, alias };
}

export function createNotificationMessage(alias: string, message: string): SendMessage {
	return { type: 'notification', alias, message };
}

export function createErrorMessage(message: string): SendMessage {
	return { type: 'error', message };
}

export function createPongMessage(timestamp: number): SendMessage {
	return { type: 'pong', timestamp };
}

export function createPingMessage(timestamp: number): SendMessage {
	return { type: 'ping', timestamp };
}