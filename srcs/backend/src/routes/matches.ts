import { FastifyInstance } from 'fastify';
import { authenticatePrivateToken } from './authentication.ts';
import {
	addMatch,
	getAllMatches,
	getTotalScore,
	getMatchesByUser,
	getMatchesByAlias,
	getMatchesByPair,
} from '../controllers/matches/matches.ts';
import { createMatch } from '../models/matches.ts';
import { errorResponseSchema } from './userdocs.ts';


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
			},
			404: errorResponseSchema,
			500: errorResponseSchema
		}
	}
};

const getTotalScoreOptions = {
	schema: {
		security: [{ apiKey: [] }],
		tags: ['matches'],
		response: {
			200: {
				type: 'object',
				properties: {
					score: { type: 'number' }
				}
			},
			404: errorResponseSchema,
			500: errorResponseSchema
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
			404: errorResponseSchema,
			500: errorResponseSchema
		}
	}
};

const getUserMatchesOptions = {
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
			},
			404: errorResponseSchema,
			500: errorResponseSchema
		}
	}
};

const getAliasMatchesOptions = {
	schema: {
		security: [{ apiKey: [] }],
		tags: ['matches'],
		params: {
			type: 'object',
			required: ['alias'],
			properties: {
				alias: { type: 'string' }
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
			404: errorResponseSchema,
			500: errorResponseSchema
		}
	}
};

const getPairMatchesOptions = {
	schema: {
		security: [{ apiKey: [] }],
		tags: ['matches'],
		params: {
			type: 'object',
			required: ['p1_alias', 'p2_alias'],
			properties: {
				p1_alias: { type: 'string' },
				p2_alias: { type: 'string' }
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
			404: errorResponseSchema,
			500: errorResponseSchema
		}
	}
};

function matchesRoutes(fastify: FastifyInstance, options: any, done: () => void) {
	fastify.get('/matches', { preHandler: [authenticatePrivateToken], ...getMatchesOptions}, getAllMatches);
	fastify.get('/matches/score', { preHandler: [authenticatePrivateToken], ...getTotalScoreOptions}, getTotalScore);
	fastify.get('/matches/user', { preHandler: [authenticatePrivateToken], ...getUserMatchesOptions}, getMatchesByUser);
	fastify.get<{ Params: { alias: string } }>
		('/matches/:alias', { preHandler: [authenticatePrivateToken], ...getAliasMatchesOptions}, getMatchesByAlias);
	fastify.get<{ Params: { p1_alias: string, p2_alias: string } }>
		('/matches/:p1_alias/:p2_alias', { preHandler: [authenticatePrivateToken], ...getPairMatchesOptions}, getMatchesByPair);

	fastify.post <{ Body: createMatch}>
	('/matches/new', { preHandler: [authenticatePrivateToken], ...addMatchOptions}, addMatch);

	done();
}

export default matchesRoutes;
