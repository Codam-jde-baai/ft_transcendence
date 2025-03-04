import { FastifyInstance } from 'fastify';
import {
	getAllMatches,
	getMatchById,
	getUserMatches
} from '../controllers/matches.ts';


// Schema for match properties
const matchProperties = {
	id: { type: 'number' },
	uuid: { type: 'string' },
	player1Id: { type: 'number' },
	player2Id: { type: 'number' },
	status: { type: 'string' },
	winnerId: { type: ['number', 'null'] },
	startTime: { type: 'string' },
	endTime: { type: ['string', 'null'] },
	duration: { type: ['number', 'null'] }
};

// Schema for enhanced match properties (includes aliases)
const enhancedMatchProperties = {
	...matchProperties,
	player1Alias: { type: 'string' },
	player2Alias: { type: 'string' },
	winnerAlias: { type: ['string', 'null'] }
};

// Schema for user matches response
const getUserMatchesOptions = {
	schema: {
		response: {
			200: {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						...enhancedMatchProperties,
						isWinner: { type: 'boolean' }
					}
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

// Schema for matches response
const getMatchesOptions = {
	schema: {
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

// Schema for single match response
const getMatchOptions = {
	schema: {
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

function Matchesroutes(fastify: FastifyInstance, options: any, done: () => void) {
	// Match routes
	fastify.get('/matches', getMatchesOptions, getAllMatches);
	fastify.get('/matches/:id', getMatchOptions, getMatchById);

	done();
}

export default Matchesroutes;