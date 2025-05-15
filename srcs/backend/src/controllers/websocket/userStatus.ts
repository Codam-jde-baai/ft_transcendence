import crypto from 'crypto';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import Database from 'better-sqlite3';
import { usersTable } from '../../db/schema.ts'
import { eq, sql } from 'drizzle-orm';


interface UserConnection {
	originId: string;
	lastActive: number;
	clientInfo?: {
		userAgent?: string;
		platform?: string;
		type?: string;
	};
}

/**
 * first string: UUID of the user
 * second string: Unique identifier for the connection
 * third string: UserConnection object
 */
type connectionMap = Map<string, Map<string, UserConnection>>


class UserStatusService {
	// Map of user UUID to their active connections
	private activeConnections: connectionMap = new Map();

	/**
	 * Add or update a user connection
	 * @param uuid User unique identifier
	 * @param originId Unique identifier for the connection
	 * @param userAgent User agent string for device identification
	 */
	async addUserConnection(
		uuid: string,
		originId: string,
		userAgent?: string
	): Promise<void> {
		// Parse user agent to determine device type
		const clientInfo = this.parseUserAgent(userAgent);

		// Get or create user's connection map
		if (!this.activeConnections.has(uuid)) {
			this.activeConnections.set(uuid, new Map());
		}

		const userConnections = this.activeConnections.get(uuid)!;

		// Add or update connection
		userConnections.set(originId, {
			originId,
			lastActive: Date.now(),
			clientInfo
		});

		// Update database status if this is the first connection
		if (userConnections.size === 1) {
			await this.updateDatabaseStatus(uuid, true);
		}
	}

	/**
	 * Remove a user connection
	 * @param uuid User unique identifier
	 * @param originId Connection identifier
	 */
	async removeUserConnection(uuid: string, originId: string): Promise<void> {
		const userConnections = this.activeConnections.get(uuid);
		if (!userConnections) return;

		// Remove specific connection
		userConnections.delete(originId);

		// Update database status if no more connections
		if (userConnections.size === 0) {
			this.activeConnections.delete(uuid);
			await this.updateDatabaseStatus(uuid, false);
		}
	}

	/**
	 * Check if a user is currently active
	 * @param uuid User unique identifier
	 * @param timeoutMs Inactivity timeout in milliseconds (default: 30 seconds)
	 */
	isUserActive(uuid: string, timeoutMs: number = 30000): boolean {
		const userConnections = this.activeConnections.get(uuid);
		if (!userConnections || userConnections.size === 0) return false;

		const now = Date.now();

		// User is active if any connection is active
		for (const connection of userConnections.values()) {
			if (now - connection.lastActive < timeoutMs) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Update a user's last activity timestamp
	 * @param uuid User unique identifier
	 * @param originId Connection identifier
	 */
	updateUserActivity(uuid: string, originId: string): void {
		const userConnections = this.activeConnections.get(uuid);
		if (!userConnections) return;

		const connection = userConnections.get(originId);
		if (connection) {
			connection.lastActive = Date.now();
			userConnections.set(originId, connection);
		}
	}

	/**
	 * Get detailed user connection status
	 * @param uuid User unique identifier
	 */
	getUserConnectionStatus(uuid: string) {
		const userConnections = this.activeConnections.get(uuid);

		return {
			isActive: this.isUserActive(uuid),
			connections: userConnections
				? Array.from(userConnections.values()).map(conn => ({
					originId: conn.originId,
					lastActive: conn.lastActive,
					clientInfo: conn.clientInfo
				}))
				: []
		};
	}

	/**
	 * Get all active user UUIDs
	 */
	getAllActiveUsers(): string[] {
		const activeUsers: string[] = [];

		for (const [uuid, connections] of this.activeConnections.entries()) {
			if (this.isUserActive(uuid)) {
				activeUsers.push(uuid);
			}
		}

		return activeUsers;
	}

	/**
	 * Parse user agent string to get device information
	 * @param userAgent User agent string
	 */
	private parseUserAgent(userAgent?: string): UserConnection['clientInfo'] {
		if (!userAgent) return { type: 'unknown' };

		const clientInfo: UserConnection['clientInfo'] = {
			userAgent: userAgent,
			type: 'browser' // Default type
		};

		// Detect platform
		if (userAgent.includes('Android') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
			clientInfo.platform = 'mobile';
			clientInfo.type = 'mobile';
		} else if (userAgent.includes('Windows') || userAgent.includes('Mac') || userAgent.includes('Linux')) {
			clientInfo.platform = userAgent.includes('Windows') ? 'windows' :
				userAgent.includes('Mac') ? 'mac' : 'linux';
		}

		// For specific native app detection, you'd add custom headers in your app
		if (userAgent.includes('YourDesktopAppIdentifier')) {
			clientInfo.type = 'desktop';
		}

		return clientInfo;
	}

	/**
	 * Generate a cryptographically secure origin ID from user agent and additional info
	 * @param userAgent User agent string
	 * @param additionalInfo Additional identifying information
	 */
	generateOriginId(userAgent: string, additionalInfo?: string): string {
		// Combine user agent with additional info
		const baseString = `${userAgent}|${additionalInfo || ''}|${Date.now()}`;

		// Generate SHA-256 hash
		const hash = crypto.createHash('sha256')
			.update(baseString)
			.digest('hex');

		// Return first 16 chars of hash + timestamp for uniqueness
		// This ensures uniqueness even with the same device/browser
		return `${hash.substring(0, 16)}_${Date.now()}`;
	}

	/**
	 * Update database status
	 * @param uuid User unique identifier
	 * @param isOnline Whether the user is online
	 */
	private async updateDatabaseStatus(uuid: string, isOnline: boolean): Promise<void> {
		try {
			await db
				.update(usersTable)
				.set({
					status: isOnline ? 1 : 0,
					last_seen: sql`(current_timestamp)`
				})
				.where(eq(usersTable.uuid, uuid));
		} catch (error) {
			console.error('Error updating user status:', error);
		}
	}

	/**
	 * Start periodic cleanup of inactive connections
	 */
	startConnectionCleanup(
		checkInterval: number = 60000, // 1 minute
		inactivityTimeout: number = 30000 // 30 seconds
	): NodeJS.Timeout {
		return setInterval(() => {
			const now = Date.now();

			for (const [uuid, connections] of this.activeConnections.entries()) {
				let hasActiveConnections = false;

				// Check each connection for this user
				for (const [originId, connection] of connections.entries()) {
					if (now - connection.lastActive >= inactivityTimeout) {
						// Remove inactive connection
						connections.delete(originId);
					} else {
						hasActiveConnections = true;
					}
				}

				// If no active connections remain, update user status
				if (!hasActiveConnections || connections.size === 0) {
					this.activeConnections.delete(uuid);
					this.updateDatabaseStatus(uuid, false);
				}
			}
		}, checkInterval);
	}
}

// Export as singleton
export const userStatusService = new UserStatusService();

// Example usage in WebSocket handler
export function setupUserStatusWebsocket(fastify: FastifyInstance) {
	fastify.route({
		method: 'GET',
		url: '/ws/user-status',
		handler: (request, reply) => {
			reply.status(200).send('User status WebSocket endpoint');
		},
		wsHandler: async (connection, request) => {
			const uuid = request.session.get('uuid');
			if (!uuid) {
				connection.socket.send(JSON.stringify({
					type: 'error',
					message: 'Unauthorized'
				}));
				connection.socket.close();
				return;
			}

			const originId = userStatusService.generateOriginId(
				request.headers['user-agent'] || '',
				Array.isArray(request.headers['x-forwarded-for'])
					? request.headers['x-forwarded-for'].join(',')
					: request.headers['x-forwarded-for'] || request.ip
			);

			// Register connection
			await userStatusService.addUserConnection(
				uuid,
				originId,
				request.headers['user-agent']
			);

			// Handle heartbeats and disconnection
			connection.socket.on('message', async (message) => {
				try {
					const parsedMessage = JSON.parse(message.toString());

					if (parsedMessage.type === 'heartbeat') {
						userStatusService.updateUserActivity(uuid, originId);

						// Send back active status
						connection.socket.send(JSON.stringify({
							type: 'status_update',
							active: true,
							connections: userStatusService.getUserConnectionStatus(uuid).connections.length
						}));
					}
				} catch (error) {
					console.error('WebSocket message error:', error);
				}
			});

			connection.socket.on('close', async () => {
				await userStatusService.removeUserConnection(uuid, originId);
			});
		}
	});
}