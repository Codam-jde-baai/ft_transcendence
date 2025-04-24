import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import multipart from '@fastify/multipart';
import fastifyCors from '@fastify/cors'
import secureSession from '@fastify/secure-session';
import userRoutes from './routes/users.ts';
import friendsRoutes from './routes/friends.ts';
import envConfig from './config/env.ts';
import sessionKey from './config/session-key.ts';

console.log("reading from index.ts backend");

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

// Setting Up The CORS Plugin First
fastify.register(fastifyCors, {
	origin: 'http://localhost:5173',
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	credentials: true,
	allowedHeaders: ['Content-Type', 'x-api-key', 'Origin'],
	exposedHeaders: ['Access-Control-Allow-Origin'],
	optionsSuccessStatus: 204
  });

// fastify.options('*', (request, reply) => {
// 	reply.header('Access-Control-Allow-Origin', 'http://localhost:5173');
// 	reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
// 	reply.header('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
// 	reply.header('Access-Control-Allow-Credentials', 'true');
// 	reply.send();
//   });

// https://github.com/fastify/fastify-secure-session
fastify.register(secureSession, {
	key: sessionKey,
	expiry: 24 * 60 * 60,
	cookie: {
		httpOnly: true,				// hides it from client
		path: '/',					// Restrict cookie to specific path
		maxAge: 60 * 60,			// Session timeout in seconds (e.g., 1 hour)
		secure: false,				// only sends over https
		sameSite: 'lax',			// Restrict cross-site requests
		// domain: 'yourdomain.com'    // Restrict cookie to your domain
		// cookie options: https://github.com/fastify/fastify-cookie
	}

})

await fastify.register(swagger, {
	openapi: {  // Change from 'swagger' to 'openapi'
		info: {
			title: 'Your API',
			description: 'API documentation',
			version: '1.0.0'
		},
		components: {  // Change from securityDefinitions to components
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
			{ name: 'friends', description: 'Friend related endpoints' }
		]
	}
});

// Update multipart configuration with more specific options
fastify.register(multipart, {
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB limit
		files: 1 // Allow only 1 file upload at a time
	},
	attachFieldsToBody: false,
	throwFileSizeLimit: true
});


await fastify.register(swaggerUi, {
	routePrefix: '/docs'
});


fastify.register(userRoutes);
fastify.register(friendsRoutes);

// defining a function in TS
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


//default route
fastify.get('/', function (request, reply) {
	reply.send("hello this is transendence world") //automatically generates text
})
