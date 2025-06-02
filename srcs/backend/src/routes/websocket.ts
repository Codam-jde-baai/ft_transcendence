import { FastifyInstance } from 'fastify';
import { authSession } from './authentication.ts';

import { newUserConnection } from '../controllers/websocket/userStatus.ts';

const wsConnectSchema = {
    querystring: {
        type: 'object',
        properties: {
            apiKey: { type: 'string' }
        },
        required: ['apiKey']
    }
};

function socketRoutes(fastify: FastifyInstance, options: any, done: () => void) {
    fastify.get('/ws/connect', { 
        websocket: true, 
        preHandler: [authSession],
        schema: wsConnectSchema
    }, newUserConnection);
    
    done();
}

export default socketRoutes;