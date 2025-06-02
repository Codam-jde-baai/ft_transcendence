import { FastifyInstance } from 'fastify';

import { securitySchemes } from './userdocs.ts';
import { authAPI } from './authentication.ts';

import { newUserConnection } from '../controllers/websocket/userStatus.ts';

function socketRoutes(fastify: FastifyInstance, options: any, done: () => void) {
    fastify.addSchema({
        $id: 'security',
        security: securitySchemes
    });

    // connect ws
    fastify.get('/ws/connect', { websocket: true , preHandler: [authAPI] }, newUserConnection);
    done();
}

export default socketRoutes;