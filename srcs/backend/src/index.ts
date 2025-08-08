import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import multipart from '@fastify/multipart';
import fastifyCors from '@fastify/cors'
import secureSession from '@fastify/secure-session';
import rateLimit from '@fastify/rate-limit';
import websocketPlugin from '@fastify/websocket';
import userRoutes from './routes/users.ts';
import friendsRoutes from './routes/friends.ts';
import matchesRoutes from './routes/matches.ts';
import adminRoutes from './routes/admin.ts';
import snekRoutes from './routes/snek.ts';
import socketRoutes from './routes/websocket.ts';
import sessionKey from './config/session-key.ts';
import { cleanupConnections } from './controllers/websocket/userStatus.ts';
import fs from 'fs';
import matchmakingRoutes from './routes/matchMaking.ts';

const fastify = Fastify({
	logger: true,
	ajv: {
		customOptions: {
			removeAdditional: true,
			useDefaults: true,
			coerceTypes: true,
			allErrors: true
		}
	},
	https: {
		key: fs.readFileSync('/app/certs/localhost-key.pem'),
		cert: fs.readFileSync('/app/certs/localhost.pem'),
	},
})

fastify.register(fastifyCors, {
	origin: 'https://localhost:5173',
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	credentials: true,
	allowedHeaders: ['Content-Type', 'x-api-key', 'Origin'],
	exposedHeaders: ['Access-Control-Allow-Origin'],
	optionsSuccessStatus: 204
});

fastify.register(secureSession, {
	key: sessionKey,
	expiry: 24 * 60 * 60,
	cookie: {
		httpOnly: true,
		path: '/',
		maxAge: 60 * 60,
		secure: "auto",
		sameSite: 'strict',
	}

})

declare module '@fastify/secure-session' {
	interface SessionData {
		uuid: string;
		alias: string;
	}
}

fastify.register(rateLimit, {
	max: 128,
	timeWindow: '1 minute'
})

fastify.register(swagger, {
	openapi: {
		info: {
			title: 'Your API',
			description: 'API documentation',
			version: '1.0.0'
		},
		components: {
			securitySchemes: {
				apiKey: {
					type: 'apiKey',
					name: 'x-api-key',
					in: 'header',
					description: 'API key for authentication(replacement of bearer)'
				}
			}
		},
		tags: [
			{ name: 'users', description: 'User related endpoints' },
			{ name: 'matches', description: 'Match related endpoints' },
			{ name: 'friends', description: 'Friend related endpoints' },
			{ name: 'admin', description: 'Admin related endpoints' },
			{ name: 'snek', description: 'Snek related endpoints' }
		]
	}
});

fastify.register(multipart, {
	limits: {
		fileSize: 5 * 1024 * 1024,
		files: 1
	},
	attachFieldsToBody: false,
	throwFileSizeLimit: true
});


fastify.register(swaggerUi, {
	routePrefix: '/docs'
});

fastify.register(websocketPlugin, {
	options: {
		maxPayload: 1048576
	}
});

fastify.register(userRoutes);
fastify.register(friendsRoutes);
fastify.register(matchesRoutes);
fastify.register(adminRoutes);
fastify.register(snekRoutes);
fastify.register(socketRoutes);
fastify.register(matchmakingRoutes);

const start = async () => {
	try {
		await fastify.listen({ port: 3000, host: '0.0.0.0' });
		fastify.log.info(`Server running at https://localhost:3000`);
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start()

process.on('SIGTERM', async () => {
	cleanupConnections();
	await fastify.close();
	process.exit(0);
});

process.on('SIGINT', async () => {
	cleanupConnections();
	await fastify.close();
	process.exit(0);
});
