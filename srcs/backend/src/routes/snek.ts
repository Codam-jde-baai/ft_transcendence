import { FastifyInstance } from 'fastify';
import { authAPI } from './authentication.ts';
import { createSnek } from '../models/snek.ts';
import { errorResponseSchema } from './userdocs.ts';
import { addSnekMatch } from '../controllers/snek/addSnek.ts';
import {
    getAllHistory,
    getMyHistory,
    getHistoryByAlias,
    getHistoryByPair
} from '../controllers/snek/getSnekHistory.ts';
import { getTopStats, getMyStats, getStatsByAlias } from '../controllers/snek/getSnekStats.ts';

const snekHistoryProperties = {
    id: { type: 'number' },
    p1_alias: { type: 'string' },
    p2_alias: { type: 'string' },
    winner_id: { type: 'number' },
    p1_score: { type: 'number' },
    p2_score: { type: 'number' },
    p2_isGuest: { type: 'boolean' }
}

const snekStatsProperties = {
    alias: { type: 'string' },
    matches: { type: 'number' },
    wins: { type: 'number' },
    losses: { type: 'number' },
    winrate: { type: 'number' },
    avg_score: { type: 'number' },
    highest_score: { type: 'number' }
}

const addSnekMatchOpts = {
    schema: {
        security: [{ apiKey: [] }],
        tags: ['snek'],
        body: {
            type: 'object',
            properties: {
                p2_alias: { type: 'string', minLength: 3 },
                p2_uuid: { type: 'string' },
                winner_id: { type: 'number' },
                p1_score: { type: 'number' },
                p2_score: { type: 'number' },
                p2_isGuest: { type: 'boolean' }
            },
            required: ['p2_alias', 'p2_uuid', 'winner_id', 'p1_score', 'p2_score', 'p2_isGuest']
        },
        response: {
            200: {
                type: 'object',
                properties: snekHistoryProperties
            },
            400: errorResponseSchema,
            404: errorResponseSchema,
            500: errorResponseSchema
        }
    }
};

const getHistoryOpts = {
    schema: {
        security: [{ apiKey: [] }],
        tags: ['snek'],
        response: {
            200: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: snekHistoryProperties
                }
            },
            404: errorResponseSchema,
            500: errorResponseSchema
        }
    }
};

const getHistoryAliasOpts = {
    schema: {
        security: [{ apiKey: [] }],
        tags: ['snek'],
        params: {
            type: 'object',
            properties: {
                alias: { type: 'string', minLength: 3 }
            },
            required: ['alias']
        },
        response: {
            200: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: snekHistoryProperties
                }
            },
            404: errorResponseSchema,
            500: errorResponseSchema
        }
    }
};

const getHistoryPairOpts = {
    schema: {
        security: [{ apiKey: [] }],
        tags: ['snek'],
        params: {
            type: 'object',
            properties: {
                p1_alias: { type: 'string', minLength: 3 },
                p2_alias: { type: 'string', minLength: 3 }
            },
            required: ['p1_alias', 'p2_alias']
        },
        response: {
            200: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: snekHistoryProperties
                }
            },
            404: errorResponseSchema,
            500: errorResponseSchema
        }
    }
};

const getTopStatsOpts = {
    schema: {
        security: [{ apiKey: [] }],
        tags: ['snek'],
        response: {
            200: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: snekStatsProperties
                }
            },
            404: errorResponseSchema,
            500: errorResponseSchema
        }
    }
};

const getUserSnekStatsOpts = {
    schema: {
        security: [{ apiKey: [] }],
        tags: ['snek'],
        response: {
            200: {
                type: 'object',
                properties: snekStatsProperties
            },
            404: errorResponseSchema,
            500: errorResponseSchema
        }
    }
};

const getSnekStatsAliasOpts = {
    schema: {
        security: [{ apiKey: [] }],
        tags: ['snek'],
        params: {
            type: 'object',
            properties: {
                alias: { type: 'string', minLength: 3 }
            },
            required: ['alias']
        },
        response: {
            200: {
                type: 'object',
                properties: snekStatsProperties
            },
            404: errorResponseSchema,
            500: errorResponseSchema
        }
    }
};



function snekRoutes(fastify: FastifyInstance, options: any, done: () => void) {
    // get match history
    fastify.get('/snek/history/all', { preHandler: [authAPI], ...getHistoryOpts }, getAllHistory);
    fastify.get('/snek/history/me', { preHandler: [authAPI], ...getHistoryOpts }, getMyHistory);
    fastify.get<{ Params: { alias: string } }>
        ('/snek/history/:alias', { preHandler: [authAPI], ...getHistoryAliasOpts }, getHistoryByAlias);
    fastify.get<{ Params: { p1_alias: string, p2_alias: string } }>
        ('/snek/history/:p1_alias/:p2_alias', { preHandler: [authAPI], ...getHistoryPairOpts }, getHistoryByPair);

    // get stats
    fastify.get('/snek/stats/top', { preHandler: [authAPI], ...getTopStatsOpts }, getTopStats);
    fastify.get('/snek/stats/me', { preHandler: [authAPI], ...getUserSnekStatsOpts }, getMyStats);
    fastify.get<{ Params: { alias: string } }>
        ('/snek/stats/:alias', { preHandler: [authAPI], ...getSnekStatsAliasOpts }, getStatsByAlias);
    // create new snek match
    fastify.post<{ Body: createSnek }>
        ('/snek/new', { preHandler: [authAPI], ...addSnekMatchOpts }, addSnekMatch);

    done();
}

export default snekRoutes;
