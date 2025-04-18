import { FastifyInstance } from 'fastify';
import { authenticatePrivateToken } from './authentication.ts';
import {
	addMatch,
	getAllMatches,
	getMatchesByUser,
	getMatchesByPair,
} from '../controllers/matches/matches.ts';
import { createMatch } from '../models/matches.ts';


// Schema for match properties
const matchProperties = {
	id: { type: 'number' },
	p1_uuid: { type: 'string' },
	p2_uuid: { type: 'string' },
	status: { type: 'number' },
	winner_id: { type: ['number', 'null'] },
	startTime: { type: 'string' },
	endTime: { type: ['string', 'null'] },
	duration: { type: ['number', 'null'] }
};

// Schema for enhanced match properties (includes aliases)
const enhancedMatchProperties = {
	...matchProperties,
	p1_alias: { type: 'string' },
	p2_alias: { type: 'string' },
	winner_alias: { type: ['string', 'null'] }
};

// Schema for matches response
const getMatchesOptions = {
	schema: {
		security: [{ apiKey: [] }],
		tags: ['matches'],
		response: {
			200: {
				type: 'array',
				items: {
					type: 'object',
					properties: enhancedMatchProperties
				}
			}
		}
	}
};

const addMatchReqs = [
	'p1_alias',
	'p2_alias',
	'p1_uuid',
	'p2_uuid',
	'status',
	'winner_id',
	'start_time?',
	'end_time',
	'duration?',
]

const addMatchOptions = {
	schema: {
		security: [{ apiKey: [] }],
		tags: ['matches'],
		body: {
			type: 'object',
			// required: addMatchReqs,
			properties: enhancedMatchProperties
		},
		response: {
			200: {
				type: 'object',
				properties: enhancedMatchProperties
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

const getUserMatchesOptions = {
	schema: {
		security: [{ apiKey: [] }],
		tags: ['matches'],
		params: {
			type: 'object',
			required: ['uuid'],
			properties: {
				uuid: { type: 'string' }
			}
		},
		response: {
			200: {
				type: 'array',
				items: {
					type: 'object',
					properties: enhancedMatchProperties
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

const getPairMatchesOptions = {
	schema: {
		security: [{ apiKey: [] }],
		tags: ['matches'],
		params: {
			type: 'object',
			required: ['p1_uuid', 'p2_uuid'],
			properties: {
				p1_uuid: { type: 'string' },
				p2_uuid: { type: 'string' }
			}
		},
		response: {
			200: {
				type: 'array',
				items: {
					type: 'object',
					properties: enhancedMatchProperties
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

function matchesRoutes(fastify: FastifyInstance, options: any, done: () => void) {
	// Match routes
	fastify.get('/matches', { preHandler: [authenticatePrivateToken], ...getMatchesOptions}, getAllMatches);
	fastify.get<{ Params: { uuid: string } }>
		('/matches/:uuid', { preHandler: [authenticatePrivateToken], ...getUserMatchesOptions}, getMatchesByUser);
	fastify.get<{ Params: { p1_uuid: string, p2_uuid: string } }>
		('/matches/:p1_uuid/:p2_uuid', { preHandler: [authenticatePrivateToken], ...getPairMatchesOptions}, getMatchesByPair);

	fastify.post <{ Body: createMatch}>
	('/matches/new', { preHandler: [authenticatePrivateToken], ...addMatchOptions}, addMatch);


	done();
}

export default matchesRoutes;


	// fastify.get<{ Params: { friendid: string } }>
	// 	('/matches/:friendid', { preHandler: [authenticatePrivateToken], ...getMatchOptions }, getMatchByFriendId);


// // Schema for user matches response
// const getUserMatchesOptions = {
// 	schema: {
// 		security: [{ apiKey: [] }],
// 		tags: ['matches'],
// 		response: {
// 			200: {
// 				type: 'array',
// 				items: {
// 					type: 'object',
// 					properties: {
// 						...enhancedMatchProperties,
// 						isWinner: { type: 'boolean' }
// 					}
// 				}
// 			},
// 			404: {
// 				type: 'object',
// 				properties: {
// 					error: { type: 'string' }
// 				}
// 			}
// 		}
// 	}
// };

// // Schema for single match response
// const getMatchOptions = {
// 	schema: {
// 		security: [{ apiKey: [] }],
// 		tags: ['matches'],
// 		response: {
// 			200: {
// 				type: 'object',
// 				properties: enhancedMatchProperties
// 			},
// 			404: {
// 				type: 'object',
// 				properties: {
// 					error: { type: 'string' }
// 				}
// 			}
// 		}
// 	}
// };
