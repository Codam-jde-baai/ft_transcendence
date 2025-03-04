// routes - users.ts

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
	getAllUsers,
	getUserById,
	getUserByAlias,
	getUserStats,
	getLeaderboard,
	AddUser
} from '../controllers/users.ts';
import envConfig from "../config/env.ts"


// security so swagger-ui knows what headers to include

const securitySchemes = {
	apiKey: {
		type: 'http',
		scheme: 'bearer'
	}
};

// Schema for user properties
const userProperties = {
	id: { type: 'number' },
	uuid: { type: 'string' },
	username: { type: 'string' },
	alias: { type: 'string' },
	profilePic: { type: ['string', 'null'] },
	wins: { type: 'number' },
	losses: { type: 'number' }
};

const addUserProperties = {
	username: { type: 'string', minLength: 3 },
	alias: { type: 'string', minLength: 3 },
	password: { type: 'string', minLength: 6 },
	profilePic: { type: ['string', 'null'] }
} as const;

// Schema for multiple users response
const getUsersOptions = {
	schema: {
		security: [{ apiKey: [] }],  // Add this line
		response: {
			200: {
				type: 'array',
				items: {
					type: 'object',
					properties: userProperties
				}
			}
		}
	}
};

// Schema for single user response
const getUserOptions = {
	schema: {
		security: [{ apiKey: [] }],
		response: {
			200: {
				type: 'object',
				properties: userProperties
			},
			404: {
				type: 'object',
				properties: {
					error: { type: 'string' }
				}
			}
		}
	}
};

// Schema for user stats response
const getUserStatsOptions = {
	schema: {
		security: [{ apiKey: [] }],
		response: {
			200: {
				type: 'object',
				properties: {
					...userProperties,
					totalGames: { type: 'number' },
					winRate: { type: 'string' }
				}
			},
			404: {
				type: 'object',
				properties: {
					error: { type: 'string' }
				}
			}
		}
	}
};

// Schema for leaderboard response
const getLeaderboardOptions = {
	schema: {
		security: [{ apiKey: [] }],
		response: {
			200: {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						alias: { type: 'string' },
						wins: { type: 'number' },
						losses: { type: 'number' },
						rank: { type: 'number' },
						totalGames: { type: 'number' },
						winRate: { type: 'string' }
					}
				}
			}
		}
	}
};



// POST

// Schema for single user response
const postUserOptions = {
	schema: {
		security: [{ apiKey: [] }],
		body: {
			type: 'object',
			required: ['username', 'alias', 'password'],
			properties: addUserProperties
		},
		response: {
			201: {
				type: 'object',
				properties: userProperties
			},
			400: {
				type: 'object',
				properties: {
					error: { type: 'string' }
				}
			}
		}
	}
};

// checks if there is an authentication header
// @todo replace with JWT validation
const authenticateAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
	// Get the auth token from headers
	const authHeader = request.headers.authorization;

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		reply.code(401).send({ error: 'Authentication required' });
		return;
	}

	const token = authHeader.split(' ')[1];


	const validToken = request.method === 'POST'
		? envConfig.post_api
		: envConfig.user_api;


	console.log('env key:', envConfig.user_api);
	console.log('Received token:', token);           // Add this for debugging
	console.log('Expected token:', validToken);      // Add this for debugging
	console.log('Request method:', request.method);
	// For your dummy data implementation, you could use a simple check
	if (token !== validToken) {
		reply.code(403).send({ error: 'Invalid authentication token' });
		return;
	}
};


function userRoutes(fastify: FastifyInstance, options: any, done: () => void) {
	fastify.addSchema({
		$id: 'security',
		security: securitySchemes
	})

	// User routes
	fastify.get('/users', {
		...getUsersOptions,
		preHandler: authenticateAdmin
	}, getAllUsers);

	fastify.get('/users/:id', {
		...getUserOptions,
		preHandler: authenticateAdmin
	}, getUserById);

	fastify.get('/users/alias/:alias', {
		...getUserOptions,
		preHandler: authenticateAdmin
	}, getUserByAlias);

	fastify.get('/users/:id/stats', {
		...getUserStatsOptions,
		preHandler: authenticateAdmin
	}, getUserStats);

	// Leaderboard route
	fastify.get('/leaderboard', getLeaderboardOptions, getLeaderboard);


	// user POST
	fastify.post('/users/new', {
		...postUserOptions,
		preHandler: authenticateAdmin
	}, AddUser);

	done();
}

export default userRoutes;