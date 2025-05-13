import { FastifyInstance } from 'fastify';
import websocket from '@fastify/websocket';
import { db } from '../db/connection';
import { usersTable, friendsTable, friendStatus } from '../db/schema';
import { eq, and, or } from 'drizzle-orm';
import { userStatusService, UserConnectionType } from './userStatusService';

// Track socket connections by user UUID
interface WebSocketConnection {
	socket: WebSocket;
	alias: string;
}

type connectionMap = Map<string, WebSocketConnection>;

class FriendStatusManager {
	private userConnections: connectionMap = new Map();

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
				reply.send('Friend status WebSocket endpoint');
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

				// Store the connection
				this.userConnections.set(uuid, {
					socket: connection.socket,
					alias: alias
				});

				// Track the user as online
				await userStatusService.addUserConnection(
					uuid,
					UserConnectionType.WEBSOCKET,
					request.headers['user-agent']
				);

				// Notify friends about status change
				await this.notifyFriendsAboutStatusChange(uuid, alias, true);

				// Send friend status list to the user
				await this.sendFriendStatusList(uuid);

				connection.socket.on('message', async (message) => {
					try {
						const parsedMessage = JSON.parse(message.toString());

						switch (parsedMessage.type) {
							case 'heartbeat':
								userStatusService.updateUserActivity(
									uuid,
									UserConnectionType.WEBSOCKET,
									request.headers['user-agent']
								);
								break;
							case 'request_friend_status':
								await this.sendFriendStatusList(uuid);
								break;
						}
					} catch (error) {
						console.error('WebSocket message error:', error);
					}
				});

				connection.socket.on('close', async () => {
					// Remove from connections
					this.userConnections.delete(uuid);

					// Track user as offline
					await userStatusService.removeUserConnection(
						uuid,
						UserConnectionType.WEBSOCKET,
						request.headers['user-agent']
					);

					// Notify friends about status change after a short delay
					setTimeout(async () => {
						// Only notify if user has no active connections
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

				// Get friend's WebSocket connection if they're online
				const friendConnection = this.userConnections.get(friendUuid);
				if (friendConnection?.socket?.readyState === WebSocket.OPEN) {
					friendConnection.socket.send(JSON.stringify({
						type: 'friend_status_update',
						uuid,
						alias,
						status: isOnline ? 'online' : 'offline'
					}));
				}
			}
		} catch (error) {
			console.error('Error notifying friends about status change:', error);
		}
	}

	/**
	 * Send friend status list to a user
	 */
	private async sendFriendStatusList(uuid: string) {
		try {
			const connection = this.userConnections.get(uuid);
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
					// Other columns from users table
					friendAlias: usersTable.alias,
					friendStatus: usersTable.status
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
				// Determine if friend is online based on WebSocket connection
				const isOnline = userStatusService.isUserActive(friend.friendUuid);

				return {
					uuid: friend.friendUuid,
					alias: friend.friendAlias,
					status: isOnline ? 'online' : 'offline'
				};
			});

			// Send friend status list to the user
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
			// Check each connection
			for (const [uuid, connection] of this.userConnections.entries()) {
				// If socket is closed or in error state, remove it
				if (
					connection.socket.readyState === WebSocket.CLOSED ||
					connection.socket.readyState === WebSocket.CLOSING
				) {
					this.userConnections.delete(uuid);
				}
			}
		}, 60000); // Clean up every minute
	}
}

export default FriendStatusManager;

// Usage in index.ts
export function setupFriendStatusTracking(fastify: FastifyInstance) {
	const friendStatusManager = new FriendStatusManager(fastify);
	return friendStatusManager;
}