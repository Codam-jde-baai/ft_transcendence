// userStatus.ts
import { FastifyRequest } from 'fastify';
import { WebSocket } from '@fastify/websocket';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { eq, or } from 'drizzle-orm';
import { usersTable, userStatus, friendsTable, friendStatus } from '../../db/schema.ts';

// Simple in-memory store for connected users
interface UserConnection {
    uuid: string;
    alias: string;
    socket: WebSocket;
}

const connectedUsers = new Map<string, UserConnection>();

export const newUserConnection = async (connection: { socket: WebSocket }, req: FastifyRequest) => {
    const uuid = req.session.get('uuid');
    const alias = req.session.get('alias');
    
    if (!uuid || !alias) {
        connection.socket.close(1008, 'User not authenticated');
        return;
    }
    console.log(`User ${alias} (${uuid}) connected via WebSocket`);
    connectedUsers.set(uuid, {
        uuid,
        alias,
        socket: connection.socket,
    });

    // Update database - set user status to online
    await updateUserStatusInDB(uuid, userStatus.ONLINE);

    connection.socket.send(JSON.stringify({
        type: 'connection_established',
        message: 'Connected successfully',
        uuid: uuid,
        alias: alias,
    }));

    // Broadcast to online friends that this user came online
    await broadcastToFriends(uuid, alias, 'online');

    connection.socket.on('message', async (message: Buffer) => {
        try {
            const data = JSON.parse(message.toString());
            console.log(`Received message from ${alias} (${uuid}):`, data);
            switch (data.type) {
                case 'ping':
                    connection.socket.send(JSON.stringify({
                        type: 'pong',
                    }));
                    break;
                case 'status_update':
                    await handleStatusUpdate(uuid, alias, data.status);
                    break;
                default:
                    connection.socket.send(JSON.stringify({
                        type: 'echo',
                        originalMessage: data,
                        timestamp: new Date().toISOString()
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
    connection.socket.on('close', async () => {
        console.log(`User ${alias} (${uuid}) disconnected`);
        connectedUsers.delete(uuid);
        await updateUserStatusInDB(uuid, userStatus.OFFLINE);
        await broadcastToFriends(uuid, alias, 'offline');
    });

    connection.socket.on('error', (error: string) => {
        console.error(`WebSocket error for user ${alias} (${uuid}):`, error);
        connectedUsers.delete(uuid);
    });
};


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
        const message = JSON.stringify({
            type: 'friend_status_change',
            uuid: uuid,
            alias: alias,
            status: status,
        });
        friendUuids.forEach(friendUuid => {
            const friendConnection = connectedUsers.get(friendUuid);
            if (friendConnection) {
                try {
                    friendConnection.socket.send(message);
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
    if (userConnection) {
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
            userConnection.socket.close(1001, 'Server shutting down');
        } catch (error) {
            console.error('Error closing WebSocket connection:', error);
        }
    });
    connectedUsers.clear();
}