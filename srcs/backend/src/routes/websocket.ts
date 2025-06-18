import { FastifyInstance } from 'fastify';

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
        schema: wsConnectSchema
    }, (connection, req) => {
        newUserConnection(connection, req);
    });

    done();
}

export default socketRoutes;