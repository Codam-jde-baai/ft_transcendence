import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticatePrivateToken } from "./users.ts";
import { securitySchemes } from './userdocs.ts';
import { verifySessionID } from '../controllers/cookie.ts';

function cookieRoutes(fastify: FastifyInstance, options: any, done: () => void) {
	fastify.addSchema({
		$id: 'security',
		security: securitySchemes
	});

// fastify.get('/cookie-login', { preHandler: [authenticatePrivateToken], ...getSessionIdOptions}, verifySessionID);
fastify.get('/cookie-login', { preHandler: [authenticatePrivateToken]}, verifySessionID);

fastify.post('/cookie-create', (request, reply) => {
	// request.session.set('data', request.body)
  
	// or when using a custom sessionName:
	// request.customSessionName.set('data', request.body)
  
	reply.send('hello world')
})

done();
}

export default cookieRoutes