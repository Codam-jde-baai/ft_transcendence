import { FastifyRequest, FastifyReply } from 'fastify';
import envConfig from "../config/env.ts";

// Auth middleware
/**
 * @abstract allows both the private key and public key
 */
export const authenticatePublicToken = async (request: FastifyRequest, reply: FastifyReply) => {
	const authHeader = request.headers.authorization;

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		reply.code(401).send({ error: 'Authentication required' });
		return;
	}

	const token = authHeader.split(' ')[1];

	if (token !== envConfig.public_key && token !== envConfig.private_key) {
		reply.code(403).send({ error: 'Invalid authentication token' });
		return;
	}
};

/**
 * @abstract allows only the private key
 */
export const authenticatePrivateToken = async (request: FastifyRequest, reply: FastifyReply) => {
	const authHeader = request.headers.authorization;

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		reply.code(401).send({ error: 'Authentication required' });
		return;
	}

	const token = authHeader.split(' ')[1];

	if (token !== envConfig.private_key) {
		reply.code(403).send({ error: 'Invalid authentication token' });
		return;
	}
};