// userStatus.ts
import { FastifyRequest } from 'fastify';
import { WebSocket } from '@fastify/websocket';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { eq, or } from 'drizzle-orm';
import { usersTable, userStatus, friendsTable, friendStatus } from '../../db/schema.ts';
import envConfig from '../../config/env.ts';

interface UserConnection {
    uuid: string;
    alias: string;
    socket: WebSocket;
}

const connectedUsers = new Map<string, UserConnection>();

const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const heartbeatIntervals = new Map<string, NodeJS.Timeout>();

function connectAuthentication(connection: { socket: WebSocket }, req: FastifyRequest): { uuid: string; alias: string } | null {
    const apiKey = (req.query as { apiKey: string }).apiKey;
    if (apiKey !== envConfig.private_key) {
        connection.socket.close(1008, 'Invalid API key');
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
        connection.socket.close(1008, 'Session access error');
        return null;
    }
    if (!uuid || !alias) {
        connection.socket.close(1008, 'User not authenticated');
        return null;
    }
    return { uuid, alias };
}

export const newUserConnection = async (connection: { socket: WebSocket }, req: FastifyRequest) => {
    console.log('New WebSocket connection attempt');
    
    const authResult = connectAuthentication(connection, req);
    if (!authResult)
    {
        console.error('Authentication failed for WebSocket connection');
        return;
    } 
    const { uuid, alias } = authResult;
    
    const existingConnection = connectedUsers.get(uuid);
    if (existingConnection) {
        console.log(`Closing existing connection for user ${alias} (${uuid})`);
        const existingHeartbeat = heartbeatIntervals.get(uuid);
        if (existingHeartbeat) {
            clearInterval(existingHeartbeat);
            heartbeatIntervals.delete(uuid);
        }
        try {
            if (existingConnection.socket.readyState === existingConnection.socket.OPEN) {
                existingConnection.socket.close(1000, 'New connection established');
            }
        } catch (error) {
            console.error('Error closing existing connection:', error);
        }
    }
    
    connectedUsers.set(uuid, {
        uuid,
        alias,
        socket: connection.socket,
    });


    console.log(`User ${alias} (${uuid}) connected successfully`);

    await updateUserStatusInDB(uuid, userStatus.ONLINE);

    const heartbeat = setInterval(() => {
        if (connection.socket && connection.socket.readyState === connection.socket.OPEN) {
            connection.socket.ping();
        } else {
            clearInterval(heartbeat);
            heartbeatIntervals.delete(uuid!);
            handleDisconnection(uuid!, alias!);
        }
    }, HEARTBEAT_INTERVAL);
    heartbeatIntervals.set(uuid, heartbeat);
    
    if (!connection.socket) {
        console.error('WebSocket connection is undefined');
        return;
    }

    // Ensure socket is valid before proceeding
    connection.socket.on('pong', () => {
        console.log(`Heartbeat received from ${alias} (${uuid})`);
    });

    // Send connection confirmation
    connection.socket.send(JSON.stringify({
        type: 'system',
        message: 'Connected successfully',
        uuid: uuid,
        alias: alias,
    }));

    await broadcastToFriends(uuid, alias, 'online');

    connection.socket.on('message', async (message: Buffer) => {
        try {
            const data = JSON.parse(message.toString());
            console.log(`Received message from ${alias} (${uuid}):`, data);
            
            switch (data.type) {
                case 'ping':
                    connection.socket.send(JSON.stringify({
                        type: 'pong',
                        timestamp: Date.now()
                    }));
                    break;
                case 'status_update':
                    await handleStatusUpdate(uuid!, alias!, data.status);
                    break;
                default:
                    console.log(`Unknown message type: ${data.type}`);
                    connection.socket.send(JSON.stringify({
                        type: 'echo',
                        originalMessage: data,
                    }));
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
            connection.socket.send(JSON.stringify({
                type: 'error',
                message: 'Invalid message format'
            }));
        }
    });

    connection.socket.on('close', async (code: number, reason: Buffer) => {
        console.log(`User ${alias} (${uuid}) disconnected with code ${code}: ${reason.toString()}`);
        await handleDisconnection(uuid!, alias!);
    });

    connection.socket.on('error', async (error: Error) => {
        console.error(`WebSocket error for user ${alias} (${uuid}):`, error);
        await handleDisconnection(uuid!, alias!);
    });
};

async function handleDisconnection(uuid: string, alias: string) {
    console.log(`Handling disconnection for ${alias} (${uuid})`);
    
    // Clear heartbeat
    const heartbeat = heartbeatIntervals.get(uuid);
    if (heartbeat) {
        clearInterval(heartbeat);
        heartbeatIntervals.delete(uuid);
    }
    
    // Remove from connected users
    connectedUsers.delete(uuid);
    
    // Update database status
    await updateUserStatusInDB(uuid, userStatus.OFFLINE);
    await broadcastToFriends(uuid, alias, 'offline');
    
    console.log(`User ${alias} (${uuid}) fully disconnected`);
}

// Clean up function for server shutdown
export function cleanupConnections() {
    console.log('Cleaning up all WebSocket connections');
    
    // Clear all heartbeat intervals
    heartbeatIntervals.forEach((interval) => {
        clearInterval(interval);
    });
    heartbeatIntervals.clear();
    
    // Close all connections
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

// Broadcast status changes only to online friends
async function broadcastToFriends(uuid: string, alias: string, status: 'online' | 'offline') {
    try {
        const friendUuids = await getUserFriends(uuid);
        if (friendUuids.length === 0) {
            return;
        }
        
        let text: string = '';
        if (status === 'online') {
            text = "came online";
        } else {
            text = "went offline";
        }
        
        const message = JSON.stringify({
            alias: alias,
            message: text,
        });
        
        let successCount = 0;
        friendUuids.forEach(friendUuid => {
            const friendConnection = connectedUsers.get(friendUuid);
            if (friendConnection && friendConnection.socket.readyState === friendConnection.socket.OPEN) {
                try {
                    friendConnection.socket.send(message);
                    successCount++;
                } catch (error) {
                    console.error(`Failed to send status update to friend ${friendUuid}:`, error);
                    connectedUsers.delete(friendUuid);
                }
            }
        });
        
        console.log(`Broadcasted ${status} status for ${alias} to ${successCount} online friends`);
    } catch (error) {
        console.error('Failed to broadcast to friends:', error);
    }
}

// Helper function to handle status updates
async function handleStatusUpdate(uuid: string, alias: string, status: 'online' | 'offline') {
    let dbStatus;
    switch (status.toLowerCase()) {
        case 'online':
            dbStatus = userStatus.ONLINE;
            break;
        case 'offline':
            dbStatus = userStatus.OFFLINE;
            break;
        default:
            console.log(`Invalid status: ${status}`);
            return;
    }
    await updateUserStatusInDB(uuid, dbStatus);
    await broadcastToFriends(uuid, alias, status);
}

export function getConnectedUsers(): Array<{uuid: string, alias: string}> {
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

export function sendMessageToUser(uuid: string, message: any): boolean {
    const userConnection = connectedUsers.get(uuid);
    if (userConnection && userConnection.socket.readyState === userConnection.socket.OPEN) {
        try {
            userConnection.socket.send(JSON.stringify(message));
            return true;
        } catch (error) {
            console.error(`Failed to send message to user ${uuid}:`, error);
            connectedUsers.delete(uuid);
            return false;
        }
    }
    return false;
}

export function closeAllConnections() {
    connectedUsers.forEach((userConnection) => {
        try {
            if (userConnection.socket.readyState === userConnection.socket.OPEN) {
                userConnection.socket.close(1001, 'Server shutting down');
            }
        } catch (error) {
            console.error('Error closing WebSocket connection:', error);
        }
    });
    connectedUsers.clear();
}