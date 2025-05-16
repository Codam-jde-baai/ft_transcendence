import { FastifyRequest, FastifyReply } from 'fastify';
import envConfig from "../config/env.ts";

/**
 * @abstract checks private key and updates session
 */
export const authenticatePrivateToken = async (request: FastifyRequest, reply: FastifyReply) => {
  authAPI(request, reply);
  authSession(request, reply);
};

export const authAPI = async (request: FastifyRequest, reply: FastifyReply) => {
  const apiKey = request.headers['x-api-key'] as string;
  if (!apiKey) {
    reply.code(403).send({ error: 'Authentication required' });
    return;
  }
  if (apiKey !== envConfig.private_key) {
    reply.code(403).send({ error: 'Invalid API key' });
    return;
  }
}

export const authSession = async (request: FastifyRequest, reply: FastifyReply) => {
	const uuid = request.session.get('uuid');
	const alias = request.session.get('alias');
	if (!uuid || !alias) {
    return reply.code(402).send({ error: 'Please Sign Up Or Login' });
	}
	request.session.touch()
}
