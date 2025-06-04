import { FastifyRequest } from 'fastify';
import { WebSocket } from 'ws';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { eq, or } from 'drizzle-orm';
import { usersTable, userStatus, friendsTable, friendStatus } from '../../db/schema.ts';
import envConfig from '../../config/env.ts';
import {
    SendMessage,
    ReceiveMessage,
    isReceiveMessage,
    createSystemMessage,
    createNotificationMessage,
    createErrorMessage,
    createPongMessage
} from './messageTypes.ts';

interface UserConnection {
    uuid: string;
    alias: string;
    socket: WebSocket;
    isAlive: boolean;
}

const connectedUsers = new Map<string, UserConnection>();

const HEARTBEAT_INTERVAL = 30000;
const heartbeatIntervals = new Map<string, NodeJS.Timeout>();

function connectAuthentication(socket: WebSocket, req: FastifyRequest): { uuid: string; alias: string } | null {
    const apiKey = (req.query as { apiKey: string }).apiKey;
    if (apiKey !== envConfig.private_key) {
        socket.close(1008, 'Invalid API key');
        return null;
    }
    let uuid: string | undefined;
    let alias: string | undefined;
    try {
        uuid = req.session.get('uuid');
        alias = req.session.get('alias');
        console.log('Session data retrieved:', {
            uuid: uuid ? 'present' : 'missing',
            alias: alias ? 'present' : 'missing'
        });
    } catch (error) {
        socket.close(1008, 'Session access error');
        return null;
    }
    if (!uuid || !alias) {
        socket.close(1008, 'User not authenticated');
        return null;
    }
    return { uuid, alias };
}

export const newUserConnection = async (socket: WebSocket, req: FastifyRequest) => {
    const authResult = connectAuthentication(socket, req);
    if (!authResult) {
        console.error('Authentication failed for WebSocket connection');
        return;
    }
    const { uuid, alias } = authResult;

    // close existing connection if it exists for user
    const existingConnection = connectedUsers.get(uuid);
    if (existingConnection) {
        const existingHeartbeat = heartbeatIntervals.get(uuid);
        if (existingHeartbeat) {
            clearInterval(existingHeartbeat);
            heartbeatIntervals.delete(uuid);
        }
        try {
            if (existingConnection.socket.readyState === WebSocket.OPEN) {
                existingConnection.socket.close(1000, 'New connection established');
            }
        } catch (error) {
            console.error('Error closing existing connection:', error);
        }
    }

    connectedUsers.set(uuid, {
        uuid,
        alias,
        socket: socket,
        isAlive: true, // Initialize as alive
    });

    const heartbeat = setInterval(() => {
        const userConn = connectedUsers.get(uuid);
        if (!userConn) {
            clearInterval(heartbeat);
            heartbeatIntervals.delete(uuid);
            return;
        }
        if (userConn.isAlive === false) {
            console.log(`No heartbeat from ${alias} (${uuid}), terminating connection.`);
            socket.terminate();
            handleDisconnection(uuid, alias);
            return;
        }
        userConn.isAlive = false;
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.ping();
        }
    }, HEARTBEAT_INTERVAL);
    heartbeatIntervals.set(uuid, heartbeat);

    await updateUserStatusInDB(uuid, userStatus.ONLINE);
    sendMessageToSocket(socket, createSystemMessage('Connected successfully', uuid, alias));
    await broadcastToFriends(uuid, alias, 'came online');

    socket.on('pong', () => {
        const userConn = connectedUsers.get(uuid);
        if (userConn) userConn.isAlive = true;
        console.log(`Heartbeat received from ${alias} (${uuid})`);
    });
    socket.on('message', async (message: Buffer) => {
        try {
            const rawData = JSON.parse(message.toString());
            console.log(`Received message from ${alias} (${uuid}):`, rawData);
            if (!isReceiveMessage(rawData)) {
                console.log(`Invalid message format from ${alias}:`, rawData);
                sendMessageToSocket(socket, createErrorMessage('Invalid message format'));
                return;
            }
            const data = rawData as ReceiveMessage;
            switch (data.type) {
                case 'ping':
                    sendMessageToSocket(socket, createPongMessage(Date.now()));
                    break;
                case 'status_update':
                    await handleStatusUpdate(uuid, alias, data.status);
                    break;
                case 'pong':
                    break;
                default:
                    const _exhaustive: never = data;
                    console.log(`Unhandled message type:`, data);
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
            sendMessageToSocket(socket, createErrorMessage('Invalid message format'));
        }
    });
    socket.on('close', async (code: number, reason: Buffer) => {
        console.log(`User ${alias} (${uuid}) disconnected with code ${code}: ${reason.toString()}`);
        await handleDisconnection(uuid, alias);
    });
    socket.on('error', async (error: Error) => {
        console.error(`WebSocket error for user ${alias} (${uuid}):`, error);
        await handleDisconnection(uuid, alias);
    });
};

async function handleDisconnection(uuid: string, alias: string) {
    console.log(`Handling disconnection for ${alias} (${uuid})`);
    const heartbeat = heartbeatIntervals.get(uuid);
    if (heartbeat) {
        clearInterval(heartbeat);
        heartbeatIntervals.delete(uuid);
    }
    connectedUsers.delete(uuid);
    await updateUserStatusInDB(uuid, userStatus.OFFLINE);
    await broadcastToFriends(uuid, alias, 'went offline');
}

// Clean up function for server shutdown
export function cleanupConnections() {
    console.log('Cleaning up all WebSocket connections');
    heartbeatIntervals.forEach((interval) => {
        clearInterval(interval);
    });
    heartbeatIntervals.clear();
    closeAllConnections();
}

async function updateUserStatusInDB(uuid: string, status: typeof userStatus[keyof typeof userStatus]) {
    let sqlite = null;
    try {
        sqlite = new Database('./data/data.db');
        const db = drizzle(sqlite);
        await db.update(usersTable)
            .set({ status: status })
            .where(eq(usersTable.uuid, uuid));
        console.log(`Updated user ${uuid} status to ${status} in database`);
    } catch (error) {
        console.error('Failed to update user status in database:', error);
    } finally {
        if (sqlite) sqlite.close();
    }
}

async function getUserFriends(uuid: string): Promise<string[]> {
    let sqlite = null;
    try {
        sqlite = new Database('./data/data.db');
        const db = drizzle(sqlite);
        const friendships = await db.select()
            .from(friendsTable)
            .where(
                or(
                    eq(friendsTable.reqUUid, uuid),
                    eq(friendsTable.recUUid, uuid)
                )
            );

        const friendUuids = friendships
            .filter(friendship => friendship.status === friendStatus.ACCEPTED)
            .map(friendship => {
                // Return the UUID that's not the current user's UUID
                return friendship.reqUUid === uuid ? friendship.recUUid : friendship.reqUUid;
            });
        return friendUuids;
    } catch (error) {
        console.error('Failed to get user friends:', error);
        return [];
    } finally {
        if (sqlite) sqlite.close();
    }
}

// Broadcast any messsage to all friends of user
async function broadcastToFriends(uuid: string, alias: string, message: string) {
    try {
        const friendUuids = await getUserFriends(uuid);
        if (friendUuids.length === 0) {
            return;
        }
        const notification = createNotificationMessage(alias, message);
        friendUuids.forEach(friendUuid => {
            const friendConnection = connectedUsers.get(friendUuid);
            if (friendConnection && friendConnection.socket.readyState === WebSocket.OPEN) {
                try {
                    sendMessageToSocket(friendConnection.socket, notification);
                } catch (error) {
                    console.error(`Failed to send status update to friend ${friendUuid}:`, error);
                    connectedUsers.delete(friendUuid);
                }
            }
        });
    } catch (error) {
        console.error('Failed to broadcast to friends:', error);
    }
}

// Helper function to handle status updates
async function handleStatusUpdate(uuid: string, alias: string, status: 'online' | 'offline') {
    let dbStatus;
    let msg: string;
    switch (status.toLowerCase()) {
        case 'online':
            dbStatus = userStatus.ONLINE;
            msg = 'came online';
            break;
        case 'offline':
            dbStatus = userStatus.OFFLINE;
            msg = 'went offline';
            break;
        default:
            console.log(`Invalid status: ${status}`);
            return;
    }
    await updateUserStatusInDB(uuid, dbStatus);
    await broadcastToFriends(uuid, alias, msg);
}

export function getConnectedUsers(): Array<{ uuid: string, alias: string }> {
    return Array.from(connectedUsers.values()).map(conn => ({
        uuid: conn.uuid,
        alias: conn.alias,
    }));
}

export function isUserConnected(uuid: string): boolean {
    return connectedUsers.has(uuid);
}

export function getUserConnectionCount(): number {
    return connectedUsers.size;
}

export function sendMessageToUser(uuid: string, message: SendMessage): boolean {
    const userConnection = connectedUsers.get(uuid);
    if (userConnection && userConnection.socket.readyState === WebSocket.OPEN) {
        try {
            sendMessageToSocket(userConnection.socket, message);
            return true;
        } catch (error) {
            console.error(`Failed to send message to user ${uuid}:`, error);
            connectedUsers.delete(uuid);
            return false;
        }
    }
    return false;
}

// Helper function for sending typed messages to WebSocket
function sendMessageToSocket(socket: WebSocket, message: SendMessage): void {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
    }
}

export function closeAllConnections() {
    connectedUsers.forEach((userConnection) => {
        try {
            if (userConnection.socket.readyState === WebSocket.OPEN) {
                userConnection.socket.close(1001, 'Server shutting down');
            }
        } catch (error) {
            console.error('Error closing WebSocket connection:', error);
        }
    });
    connectedUsers.clear();
}