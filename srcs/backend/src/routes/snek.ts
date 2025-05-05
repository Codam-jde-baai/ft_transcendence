import { FastifyInstance } from 'fastify';
import { authenticatePrivateToken } from './authentication.ts';
import { createSnek } from '../models/snek.ts';
import { addSnekMatch } from '../controllers/snek/addSnek.ts';
import { errorResponseSchema } from './userdocs.ts';

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
        tags: ['matches'],
        body: {
            type: 'object',
            properties: {
                required: ['p2_alias', 'p2_uuid', 'winner_id', 'p1_score', 'p2_score', 'p2_isGuest'],
                p2_alias: { type: 'string', minLength: 3 },
                p2_uuid: { type: 'string' },
                winner_id: { type: 'number' },
                p1_score: { type: 'number' },
                p2_score: { type: 'number' },
                p2_isGuest: { type: 'boolean' }
            }
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

function matchesRoutes(fastify: FastifyInstance, options: any, done: () => void) {
    // get match history
    fastify.get('/snek/history/all', { preHandler: [authenticatePrivateToken], ...getAllSnekOpts}, getAllSnek);
    fastify.get('/snek/history/me', { preHandler: [authenticatePrivateToken], ...getUserSnekOpts}, getSnekByUser);
    fastify.get<{ Params: { alias: string } }>
        ('/snek/history/:alias', { preHandler: [authenticatePrivateToken], ...getSnekAliasOpts}, getSnekByAlias);
    fastify.get<{ Params: { p1_alias: string, p2_alias: string } }>
        ('/snek/history/:p1_alias/:p2_alias', { preHandler: [authenticatePrivateToken], ...getSnekPairOpts}, getSnekByPair);
    
    // get stats
    fastify.get('/snek/stats/all', { preHandler: [authenticatePrivateToken], ...getAllSnekStatsOpts}, getAllSnekStats);
    fastify.get('/snek/stats/me', { preHandler: [authenticatePrivateToken], ...getUserSnekStatsOpts}, getSnekStatsByUser);
    fastify.get<{ Params: { alias: string } }>
        ('/snek/stats/:alias', { preHandler: [authenticatePrivateToken], ...getSnekStatsAliasOpts}, getSnekStatsByAlias);
    // create new snek match
    fastify.post <{ Body: createSnek}>
    ('/snek/new', { preHandler: [authenticatePrivateToken], ...addSnekMatchOpts}, addSnekMatch);

    done();
}

export default matchesRoutes;
