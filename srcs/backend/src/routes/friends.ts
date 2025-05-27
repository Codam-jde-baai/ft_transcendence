import { FastifyInstance, } from 'fastify';
import { authenticatePrivateToken } from './authentication.ts';
import { securitySchemes, errorResponseSchema, publicUserProperties } from './userdocs.ts';
import { addFriend } from '../controllers/friends/addFriends.ts';
import { getFriends, getMyFriends } from '../controllers/friends/getFriends.ts';
import { AcceptFriendReq, RemoveFriendRelation } from '../controllers/friends/updateFriends.ts';
import { getNonFriends } from '../controllers/friends/publicUsers.ts'
import { stat } from 'fs';

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
			properties: { ...publicUserProperties, status: { type: 'number' } }
		}
	}
}

const nonFriendProperties = {
	type: 'object',
	properties: {
		friendid: { type: 'number' },
		friend: {
			type: 'object',
			properties: publicUserProperties
		}
	}
}

const friendListProperties = {
	type: 'object',
	properties: {
		friends: {
			type: 'array',
			items: friendProperties
		},
		sentRequests: {
			type: 'array',
			items: nonFriendProperties
		},
		receivedRequests: {
			type: 'array',
			items: nonFriendProperties
		}
	}
}

const FriendListOptions = {
	schema: {
		security: [{ apiKey: [] }],
		summary: 'gets all relations of the user by alias',
		tags: ['friends'],
		params: {
			type: 'object',
			required: ['alias'],
			properties: {
				alias: { type: 'string' }
			}
		},
		response: {
			200: friendListProperties,
			402: errorResponseSchema,
			403: errorResponseSchema,
			404: errorResponseSchema,
			500: errorResponseSchema
		}
	}
}

const MyFriendListOptions = {
	schema: {
		security: [{ apiKey: [] }],
		summary: 'gets all relations of the user',
		tags: ['friends'],
		response: {
			200: friendListProperties,
			402: errorResponseSchema,
			403: errorResponseSchema,
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
			required: ['alias'],
			properties: {
				alias: { type: 'string' },
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
			402: errorResponseSchema,
			403: errorResponseSchema,
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
			402: errorResponseSchema,
			403: errorResponseSchema,
			404: errorResponseSchema,
			500: errorResponseSchema
		}
	}
}

const RemoveFriendOptions = {
	schema: {
		security: [{ apiKey: [] }],
		summary: 'deletes a friend relation',
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
			402: errorResponseSchema,
			403: errorResponseSchema,
			500: errorResponseSchema
		}
	}
}

export const PublicNonFriendOptions = {
	schema: {
		security: [{ apiKey: [] }],
		summary: 'Gets all friends that have no relation to the user requesting it',
		tags: ['friends'],
		response: {
			200: {
				type: 'array',
				items: {
					type: 'object',
					properties: publicUserProperties
				}
			},
			402: errorResponseSchema,
			403: errorResponseSchema,
			500: errorResponseSchema
		}
	}
};

function friendsRoutes(fastify: FastifyInstance, options: any, done: () => void) {
	fastify.addSchema({
		$id: 'security',
		security: securitySchemes
	});

	fastify.get('/friends/me', { preHandler: [authenticatePrivateToken], ...MyFriendListOptions },
		getMyFriends)

	// filtered to remove friends of user
	fastify.get('/friends/nonfriends', { preHandler: [authenticatePrivateToken], ...PublicNonFriendOptions }, getNonFriends);

	// addRelation
	fastify.post<{ Body: { alias: string } }>
		('/friends/new', { preHandler: [authenticatePrivateToken], ...createFriendOptions }, addFriend);

	// get all Relations By Alias
	fastify.get<{ Params: { alias: string } }>
		('/friends/:alias', { preHandler: [authenticatePrivateToken], ...FriendListOptions },
			getFriends)



	fastify.put<{ Params: { friendId: string } }>
		('/friends/:friendId/accept', { preHandler: [authenticatePrivateToken], ...updateFriendStatusOptions }, AcceptFriendReq)

	fastify.delete<{ Params: { friendId: string } }>
		('/friends/:friendId/delete', { preHandler: [authenticatePrivateToken], ...RemoveFriendOptions }, RemoveFriendRelation)


	done();
}

export default friendsRoutes;