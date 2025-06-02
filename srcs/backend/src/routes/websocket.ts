import { FastifyInstance } from 'fastify';

import { securitySchemes } from './userdocs.ts';
import { authenticatePrivateToken } from './authentication.ts';

import { newUserConnection } from '../controllers/websocket/userStatus.ts';

function socketRoutes(fastify: FastifyInstance, options: any, done: () => void) {
    fastify.addSchema({
        $id: 'security',
        security: securitySchemes
    });

    fastify.get('/ws/connect', { 
        websocket: true, 
        preHandler: [authenticatePrivateToken] 
    }, newUserConnection);
    
    done();
}

export default socketRoutes;