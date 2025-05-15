import { FastifyInstance } from 'fastify';
import websocket from '@fastify/websocket';
import Database from 'better-sqlite3';

import { usersTable, friendsTable, friendStatus } from '../db/schema';
import { eq, and, or } from 'drizzle-orm';

// WebSocket connection with user info
interface UserWebSocket {
  socket: WebSocket;
  alias: string;
  originId: string;
}

class FriendStatusManager {
  // Map of userUuid -> Map of originId -> UserWebSocket
  private userConnections: Map<string, Map<string, UserWebSocket>> = new Map();

  constructor(private fastify: FastifyInstance) {
    this.setupWebSocketRoutes();
    this.startCleanupTask();
  }

  private setupWebSocketRoutes() {
    this.fastify.register(websocket);

    this.fastify.route({
      method: 'GET',
      url: '/ws/friend-status',
      handler: (request, reply) => {
        reply.status(200).send('Friend status WebSocket endpoint');
      },
      wsHandler: async (connection, request) => {
        const uuid = request.session.get('uuid');
        const alias = request.session.get('alias');

        if (!uuid || !alias) {
          connection.socket.send(JSON.stringify({
            type: 'error',
            message: 'Unauthorized'
          }));
          connection.socket.close();
          return;
        }

        // Generate a consistent origin ID
        const originId = userStatusService.generateOriginId(
          request.headers['user-agent'] || '',
          request.headers['x-forwarded-for'] || request.ip
        );

        // Store user connection with origin ID
        if (!this.userConnections.has(uuid)) {
          this.userConnections.set(uuid, new Map());
        }
        
        const userSockets = this.userConnections.get(uuid)!;
        userSockets.set(originId, {
          socket: connection.socket,
          alias,
          originId
        });

        // Register with user status service
        await userStatusService.addUserConnection(
          uuid,
          originId,
          request.headers['user-agent']
        );

        // Notify friends about status change
        await this.notifyFriendsAboutStatusChange(uuid, alias, true);

        // Send friend status list to the user
        await this.sendFriendStatusList(uuid, originId);

        connection.socket.on('message', async (message) => {
          try {
            const parsedMessage = JSON.parse(message.toString());

            switch (parsedMessage.type) {
              case 'heartbeat':
                userStatusService.updateUserActivity(uuid, originId);
                break;
              case 'request_friend_status':
                await this.sendFriendStatusList(uuid, originId);
                break;
            }
          } catch (error) {
            console.error('WebSocket message error:', error);
          }
        });

        connection.socket.on('close', async () => {
          // Remove specific connection by origin ID
          const userSockets = this.userConnections.get(uuid);
          if (userSockets) {
            userSockets.delete(originId);
            
            // If no more connections for this user, remove the user entry
            if (userSockets.size === 0) {
              this.userConnections.delete(uuid);
            }
          }

          // Update user status service
          await userStatusService.removeUserConnection(uuid, originId);

          // Notify friends about status change after a short delay
          // Only if user has no active connections
          setTimeout(async () => {
            if (!userStatusService.isUserActive(uuid)) {
              await this.notifyFriendsAboutStatusChange(uuid, alias, false);
            }
          }, 5000); // 5 second grace period for reconnection
        });
      }
    });
  }

  /**
   * Notify all friends about a user's status change
   */
  private async notifyFriendsAboutStatusChange(
    uuid: string,
    alias: string,
    isOnline: boolean
  ) {
    try {
      // Get all accepted friends
      const friends = await db
        .select({
          friendUuid: or(
            // When user is requester, get recipient UUID
            friendsTable.recUUid,
            // When user is recipient, get requester UUID
            friendsTable.reqUUid
          )
        })
        .from(friendsTable)
        .where(
          and(
            // User is either requester or recipient
            or(
              eq(friendsTable.reqUUid, uuid),
              eq(friendsTable.recUUid, uuid)
            ),
            // Friend request is accepted
            eq(friendsTable.status, friendStatus.ACCEPTED)
          )
        );

      // Notify each friend
      for (const friend of friends) {
        const friendUuid = friend.friendUuid;

        // Skip if friend UUID is the same as user UUID (should not happen)
        if (friendUuid === uuid) continue;

        // Get all friend's WebSocket connections
        const friendSockets = this.userConnections.get(friendUuid);
        if (!friendSockets) continue;

        // Send status update to all of friend's active connections
        for (const [_, connection] of friendSockets.entries()) {
          if (connection.socket.readyState === WebSocket.OPEN) {
            connection.socket.send(JSON.stringify({
              type: 'friend_status_update',
              uuid,
              alias,
              status: isOnline ? 'online' : 'offline'
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error notifying friends about status change:', error);
    }
  }

  /**
   * Send friend status list to a specific user connection
   */
  private async sendFriendStatusList(uuid: string, originId: string) {
    try {
      const userSockets = this.userConnections.get(uuid);
      if (!userSockets) return;
      
      const connection = userSockets.get(originId);
      if (!connection || connection.socket.readyState !== WebSocket.OPEN) {
        return;
      }

      // Get all accepted friends
      const friends = await db
        .select({
          friendUuid: or(
            friendsTable.recUUid,
            friendsTable.reqUUid
          ),
          friendAlias: usersTable.alias
        })
        .from(friendsTable)
        .leftJoin(
          usersTable,
          or(
            eq(usersTable.uuid, friendsTable.recUUid),
            eq(usersTable.uuid, friendsTable.reqUUid)
          )
        )
        .where(
          and(
            or(
              eq(friendsTable.reqUUid, uuid),
              eq(friendsTable.recUUid, uuid)
            ),
            eq(friendsTable.status, friendStatus.ACCEPTED),
            // Exclude the user themselves
            or(
              and(
                eq(friendsTable.reqUUid, uuid),
                eq(usersTable.uuid, friendsTable.recUUid)
              ),
              and(
                eq(friendsTable.recUUid, uuid),
                eq(usersTable.uuid, friendsTable.reqUUid)
              )
            )
          )
        );

      // Create friend status list
      const friendStatusList = friends.map(friend => {
        // Determine if friend is online based on user status service
        const isOnline = userStatusService.isUserActive(friend.friendUuid);

        return {
          uuid: friend.friendUuid,
          alias: friend.friendAlias,
          status: isOnline ? 'online' : 'offline'
        };
      });

      // Send friend status list to the user's specific connection
      connection.socket.send(JSON.stringify({
        type: 'friend_status_list',
        friends: friendStatusList
      }));
    } catch (error) {
      console.error('Error sending friend status list:', error);
    }
  }

  /**
   * Start periodic cleanup of connections
   */
  private startCleanupTask() {
    setInterval(() => {
      // Check each user's connections
      for (const [uuid, connections] of this.userConnections.entries()) {
        // Filter out closed or closing sockets
        const activeConnections = new Map();
        
        for (const [originId, connection] of connections.entries()) {
          if (
            connection.socket.readyState !== WebSocket.CLOSED &&
            connection.socket.readyState !== WebSocket.CLOSING
          ) {
            activeConnections.set(originId, connection);
          }
        }
        
        // Update or remove user entry
        if (activeConnections.size > 0) {
          this.userConnections.set(uuid, activeConnections);
        } else {
          this.userConnections.delete(uuid);
        }
      }
    }, 60000); // Clean up every minute
  }
  
  /**
   * Check if a user has any active WebSocket connections
   */
  hasActiveConnections(uuid: string): boolean {
    const connections = this.userConnections.get(uuid);
    if (!connections || connections.size === 0) return false;
    
    // Check for any open connections
    for (const [_, connection] of connections.entries()) {
      if (connection.socket.readyState === WebSocket.OPEN) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Get count of active connections for a user
   */
  getConnectionCount(uuid: string): number {
    const connections = this.userConnections.get(uuid);
    if (!connections) return 0;
    
    // Count only open connections
    let count = 0;
    for (const [_, connection] of connections.entries()) {
      if (connection.socket.readyState === WebSocket.OPEN) {
        count++;
      }
    }
    
    return count;
  }
}

// Usage in index.ts
export function setupFriendStatusTracking(fastify: FastifyInstance) {
  const friendStatusManager = new FriendStatusManager(fastify);
  return friendStatusManager;
}