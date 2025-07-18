import { FastifyInstance } from 'fastify';
import { authenticatePrivateToken } from './authentication.ts';
import {
	addMatch,
	getAllMatches,
	getMatchesByUser,
	getMatchesByAlias,
	getMatchesByPair,
	getRecord,
	getAllRecords,
} from '../controllers/matches/matches.ts';
import { createMatch } from '../models/matches.ts';
import { errorResponseSchema } from './userdocs.ts';
import { PlayerStats } from '../models/matches.ts';

const statProperties = {
	uuid: { type: 'string' },
	alias: { type: 'string' },
	wins: { type: 'number' },
	losses: { type: 'number' },
	win_rate: { type: 'number' }
}

// Schema for match properties
const matchProperties = {
	p1_uuid: { type: ['string', 'null'] },
	p2_uuid: { type: ['string', 'null'] },
	status: { type: 'number' },
};

// Schema for enhanced match properties (includes aliases)
const enhancedMatchProperties = {
	...matchProperties,
	p1_alias: { type: 'string' },
	p2_alias: { type: 'string' },
	winner_alias: { type: ['string', 'null'] },
	date: { type: 'string' }
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
			402: errorResponseSchema,
			403: errorResponseSchema,
			404: errorResponseSchema,
			500: errorResponseSchema
		}
	}
};

const addMatchReqs = [
	'p1_alias',
	'p2_alias',
	'winner_alias',
	'p1_uuid',
	'p2_uuid',
	'status',
]

const addMatchOptions = {
	schema: {
		security: [{ apiKey: [] }],
		tags: ['matches'],
		body: {
			type: 'object',
			required: addMatchReqs,
			properties: enhancedMatchProperties
		},
		response: {
			201: {
				type: 'object',
				properties: enhancedMatchProperties
			},
			402: errorResponseSchema,
			403: errorResponseSchema,
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
			402: errorResponseSchema,
			403: errorResponseSchema,
			404: errorResponseSchema,
			500: errorResponseSchema
		}
	}
};

const getAllRecordsOptions = {
	schema: {
		security: [{ apiKey: [] }],
		tags: ['matches'],
		response: {
			200: {
				type: 'array',
				items: {
					type: 'object',
					properties: statProperties
				}
			},
			402: errorResponseSchema,
			403: errorResponseSchema,
			500: errorResponseSchema
		}
	}
};

const getRecordOptions = {
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
					type: 'object',
					properties: statProperties
			},
			402: errorResponseSchema,
			403: errorResponseSchema,
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
			402: errorResponseSchema,
			403: errorResponseSchema,
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
			402: errorResponseSchema,
			403: errorResponseSchema,
			404: errorResponseSchema,
			500: errorResponseSchema
		}
	}
};

function matchesRoutes(fastify: FastifyInstance, options: any, done: () => void) {
	fastify.get('/matches', { preHandler: [authenticatePrivateToken], ...getMatchesOptions}, getAllMatches);
	// fastify.get('/matches/score', { preHandler: [authenticatePrivateToken], ...getTotalScoreOptions}, getTotalScore);
	fastify.get('/matches/user', { preHandler: [authenticatePrivateToken], ...getUserMatchesOptions}, getMatchesByUser);
	fastify.get('/matches/records', { preHandler: [authenticatePrivateToken], ...getAllRecordsOptions}, getAllRecords);
	fastify.get<{ Params: { alias: string } }>
		('/matches/:alias', { preHandler: [authenticatePrivateToken], ...getAliasMatchesOptions}, getMatchesByAlias);
	fastify.get<{ Params: { alias: string } }>
		('/matches/record/:alias', { preHandler: [authenticatePrivateToken], ...getRecordOptions}, getRecord);
	fastify.get<{ Params: { p1_alias: string, p2_alias: string } }>
		('/matches/:p1_alias/:p2_alias', { preHandler: [authenticatePrivateToken], ...getPairMatchesOptions}, getMatchesByPair);

	fastify.post <{ Body: createMatch}>
	('/matches/new', { preHandler: [authenticatePrivateToken], ...addMatchOptions}, addMatch);

	done();
}

export default matchesRoutes;
