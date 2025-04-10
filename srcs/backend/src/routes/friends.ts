import { FastifyInstance, } from 'fastify';
import { authenticatePrivateToken } from './authentication.ts';
import { securitySchemes, errorResponseSchema, publicUserProperties } from './userdocs.ts';
import { addFriend } from '../controllers/friends/addFriends.ts';
import { getFriends } from '../controllers/friends/getFriends.ts';
import { AcceptFriendReq, BlockFriend } from '../controllers/friends/updateFriends.ts';

const relationProperties = {
	type: 'object',
	properties: {
		id: { type: 'number' },
		reqUUid: { type: 'string' },
		recUUid: { type: 'string' },
		status: { type: 'string' }
	}
}

const friendProperties = {
	type: 'object',
	properties: {
		friendid: { type: 'number' },
		friend: {
			type: 'object',
			properties: publicUserProperties
		}
	}
}

/*

	friends: [...]
	sentRequests: [...]
	receivedRequests: [...]
	deniedRequests: [...]
	blocked: [...]

 */
const friendListProperties = {
	type: 'object',
	properties: {
		friends: {
			type: 'array',
			items: friendProperties
		},
		sentRequests: {
			type: 'array',
			items: friendProperties
		},
		receivedRequests: {
			type: 'array',
			items: friendProperties
		},
		deniedRequests: {
			type: 'array',
			items: friendProperties
		},
		blocked: {
			type: 'array',
			items: friendProperties
		}
	}
}

const FriendListOptions = {
	schema: {
		security: [{ apiKey: [] }],
		summary: 'gets all relations of the user',
		tags: ['friends'],
		params: {
			type: 'object',
			required: ['uuid'],
			properties: {
				uuid: { type: 'string' }
			}
		},
		response: {
			200: friendListProperties,
			404: errorResponseSchema,
			500: errorResponseSchema
		}
	}
}

const createFriendOptions = {
	schema: {
		security: [{ apiKey: [] }],
		summary: 'adds a new friend relation',
		tags: ['friends'],
		consumes: ['application/json'],
		body: {
			type: 'object',
			required: ['reqUUid', 'recUUid'],
			properties: {
				reqUUid: { type: 'string' },
				recUUid: { type: 'string' }
			}
		},
		response: {
			201: {
				type: 'object',
				properties: {
					msg: { type: 'string' },
					relation: relationProperties
				}
			},
			400: errorResponseSchema,
			404: errorResponseSchema,
			409: {
				type: 'object',
				properties: {
					error: { type: 'string' },
					relation: relationProperties
				}
			},
			500: errorResponseSchema
		}
	}
};


const updateFriendStatusOptions = {
	schema: {
		security: [{ apiKey: [] }],
		summary: 'changes the status of a friend relation',
		tags: ['friends'],
		params: {
			type: 'object',
			required: ['friendId'],
			properties: {
				friendId: { type: 'string' }
			}
		},
		response: {
			200: {},
			400: errorResponseSchema,
			500: errorResponseSchema
		}
	}
}

function friendsRoutes(fastify: FastifyInstance, options: any, done: () => void) {
	fastify.addSchema({
		$id: 'security',
		security: securitySchemes
	});

	// addRelation
	fastify.post<{
		Body: {
			reqUUid: string;
			recUUid: string;
		}
	}>('/friends/new', { preHandler: [authenticatePrivateToken], ...createFriendOptions }, addFriend);

	// get all Relations
	fastify.get<{ Params: { uuid: string } }>
		('/friends/:uuid', { preHandler: [authenticatePrivateToken], ...FriendListOptions },
			getFriends)

	fastify.put<{ Params: { friendId: string } }>
		('/friends/:friendId/accept', { preHandler: [authenticatePrivateToken], ...updateFriendStatusOptions }, AcceptFriendReq)

	fastify.put<{ Params: { friendId: string } }>
		('/friends/:friendId/block', { preHandler: [authenticatePrivateToken], ...updateFriendStatusOptions }, BlockFriend)


	done();
}

export default friendsRoutes;