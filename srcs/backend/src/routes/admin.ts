import { FastifyInstance } from 'fastify';
import { authenticatePrivateToken, authAPI } from './authentication.ts';
import {
	loginAdmin,
	// getAdmin,
	adminDeleteUser,
	adminUpdateUserPassword,
} from '../controllers/admin/admin.ts';
import { errorResponseSchema } from './userdocs.ts';

const loginAdminOptions = {
	schema: {
		security: [{ apiKey: [] }],
		tags: ['admin'],
		consumes: ['application/json'],
		body: {
			type: 'object',
			required: ['admin', 'password'],
			properties: {
				admin: { type: 'string' },
				password: { type: 'string'}
			}
		},
		response: {
			200: {},
			471: errorResponseSchema,
			500: errorResponseSchema
		}
	}
};

const adminDeleteOptions = {
	schema: {
		security: [{ apiKey: [] }],
		tags: ['admin'],
		consumes: ['application/json'],
		body: {
			type: 'object',
			required: ['username'],
			properties: {
				username: { type: 'string' },
			}
		},
		response: {
			204: {},
			404: errorResponseSchema,
			500: errorResponseSchema
		}
	}
};

const adminUpdateOptions = {
	schema: {
		security: [{ apiKey: [] }],
		tags: ['admin'],
		consumes: ['application/json'],
		body: {
			type: 'object',
			required: ['username', 'newPassword'],
			properties: {
				username: { type: 'string' },
				newPassword: { type: 'string' },
			}
		},
		response: {
			201: {},
			404: errorResponseSchema,
			500: errorResponseSchema
		}
	}
};

function adminRoutes(fastify: FastifyInstance, options: any, done: () => void) {
	fastify.post<{ Body: {
					admin: string;
					password: string;
	}}>('/admin/login', { preHandler: [authAPI], ...loginAdminOptions}, loginAdmin);	
	fastify.delete<{ Body: {
		username: string;
	}}>('/admin/deleteUser', { preHandler: [authenticatePrivateToken], ...adminDeleteOptions}, adminDeleteUser);	
	fastify.put<{ Body: {
		username: string;
		newPassword:string;
	}}>('/admin/updateUserPassword', { preHandler: [authenticatePrivateToken], ...adminUpdateOptions}, adminUpdateUserPassword);	

	done();
}

export default adminRoutes;
