import { FastifyRequest, FastifyReply } from 'fastify';
import envConfig from "../config/env.ts";

// Auth middleware
/**
 * @abstract allows both the private key and public key
 */
export const authenticatePublicToken = async (request: FastifyRequest, reply: FastifyReply) => {
  const apiKey = request.headers['x-api-key'] as string;

  if (!apiKey) {
    reply.code(401).send({ error: 'Authentication required' });
    return;
  }

  if (apiKey !== envConfig.public_key && apiKey !== envConfig.private_key) {
    reply.code(403).send({ error: 'Invalid API key' });
    return;
  }
};

/**
 * @abstract allows only the private key
 */
export const authenticatePrivateToken = async (request: FastifyRequest, reply: FastifyReply) => {
  const apiKey = request.headers['x-api-key'] as string;

  if (!apiKey) {
    reply.code(401).send({ error: 'Authentication required' });
    return;
  }

  if (apiKey !== envConfig.private_key) {
    reply.code(403).send({ error: 'Invalid API key' });
    return;
  }
};