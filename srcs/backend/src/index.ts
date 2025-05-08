import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import multipart from '@fastify/multipart';
import fastifyCors from '@fastify/cors'
import secureSession from '@fastify/secure-session';
import userRoutes from './routes/users.ts';
import friendsRoutes from './routes/friends.ts';
import matchesRoutes from './routes/matches.ts';
import adminRoutes from './routes/admin.ts';
import envConfig from './config/env.ts';
import sessionKey from './config/session-key.ts';
import rateLimit from '@fastify/rate-limit';

const fastify = Fastify({
	logger: true,
	ajv: {
		customOptions: {
			removeAdditional: true,
			useDefaults: true,
			coerceTypes: true,
			allErrors: true
		}
	}
})

fastify.register(fastifyCors, {
	origin: 'http://localhost:5173',
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
			{ name: 'admin', description: 'Admin related endpoints' }
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


fastify.register(userRoutes);
fastify.register(friendsRoutes);
fastify.register(matchesRoutes);
fastify.register(adminRoutes);

const start = async () => {
	try {
		const address = fastify.listen({ port: envConfig.port, host: '0.0.0.0' }, function (err, address) {
			if (err) {
				fastify.log.error(err);
				process.exit(1);
			}
			fastify.log.info(`server listening on ${address}`);
		})
		fastify.log.info(`server listening on ${address}`);
	} catch (error) {
		fastify.log.error(error);
		process.exit(1);
	}
}

start()
