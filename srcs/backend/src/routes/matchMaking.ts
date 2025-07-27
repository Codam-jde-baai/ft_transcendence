import { FastifyInstance } from 'fastify';
import { authenticatePrivateToken } from './authentication.ts';
import { securitySchemes, errorResponseSchema, publicUserProperties } from './userdocs.ts';
import { getMatchmakingData } from '../controllers/matchmaking/getMatchmaking.ts';
import { sendGamePoke } from '../controllers/matchmaking/gameInvite.ts';

const matchmakingUserProperties = {
    type: 'object',
    properties: {
        ...publicUserProperties,
        friends: { type: 'boolean' },
        status: { type: 'number' },
        win: { type: 'number' },
        loss: { type: 'number' },
        total_games: { type: 'number' },
        winrate: { type: 'number' },
        last_score: {
            type: 'object',
            properties: {
                self: { type: 'number' },
                opponent: { type: 'number' }
            }
        }
    }
};

const matchmakingCategoryProperties = {
    type: 'object',
    properties: {
        recentLoss: {
            type: 'array',
            items: matchmakingUserProperties
        },
        equalSkill: {
            type: 'array',
            items: matchmakingUserProperties
        },
        equalGameAmount: {
            type: 'array',
            items: matchmakingUserProperties
        }
    }
};

const matchmakingResponseProperties = {
    type: 'object',
    properties: {
        pong: matchmakingCategoryProperties,
        snake: matchmakingCategoryProperties
    }
};

const getMatchmakingOptions = {
    schema: {
        security: [{ apiKey: [] }],
        summary: 'Gets matchmaking data for all games',
        tags: ['matchmaking'],
        response: {
            200: matchmakingResponseProperties,
            402: errorResponseSchema,
            403: errorResponseSchema,
            500: errorResponseSchema
        }
    }
};

const gamePokeOptions = {
    schema: {
        security: [{ apiKey: [] }],
        summary: 'Send a game poke notification to another user',
        tags: ['matchmaking'],
        consumes: ['application/json'],
        body: {
            type: 'object',
            required: ['alias', 'gameType'],
            properties: {
                alias: { type: 'string' },
                gameType: { 
                    type: 'string',
                    enum: ['pong', 'snake']
                }
            }
        },
        response: {
            200: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' }
                }
            },
            400: errorResponseSchema,
            402: errorResponseSchema,
            403: errorResponseSchema,
            404: errorResponseSchema,
            500: errorResponseSchema
        }
    }
};

function matchmakingRoutes(fastify: FastifyInstance, options: any, done: () => void) {
    fastify.addSchema({
        $id: 'security',
        security: securitySchemes
    });

    // Get matchmaking data for all games
    fastify.get('/matchmaking', 
        { preHandler: [authenticatePrivateToken], ...getMatchmakingOptions }, 
        getMatchmakingData
    );

    // Send game poke notification
    fastify.post<{ Body: { alias: string; gameType: 'pong' | 'snake' } }>(
        '/game/invite', 
        { preHandler: [authenticatePrivateToken], ...gamePokeOptions }, 
        sendGamePoke
    );

    done();
}

export default matchmakingRoutes;