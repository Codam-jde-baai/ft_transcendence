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
    reply.code(401).send({ error: 'Authentication required' });
    return;
  }
  if (apiKey !== envConfig.private_key) {
    reply.code(403).send({ error: 'Invalid API key' });
    return;
  }
}

export const authSession = async (request: FastifyRequest, reply: FastifyReply) => {
	const data = request.session.get('uuid');
	if (!data){
    return reply.code(401).send({ error: 'Please Sign Up Or Login' });
	}
	request.session.touch()
}

export const authenticateAdminToken = async (request: FastifyRequest, reply: FastifyReply) => {
	authAPI(request, reply);
	authAdmin(request, reply);
  };

  export const authAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
	const data = request.session;
	if (!data){
    return reply.code(401).send({ error: 'Please Sign Up Or Login' });
	}
	request.session.touch()
}
