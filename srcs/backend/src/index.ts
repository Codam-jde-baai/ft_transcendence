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
	origin: '*',
	methods: ['GET', 'POST', 'DELETE'],
	allowedHeaders: ['Content-Type', 'Authorization'],
});
// 'Origin', 'X-Requested-With', 'Accept'


// https://github.com/fastify/fastify-secure-session
fastify.register(secureSession, {
	key: [sessionKey],
	cookie: {
		httpOnly: true, // hides it from user
		secure: true, // only sends over https
		path: '/',                  // Restrict cookie to specific path
		maxAge: 7200,               // Session timeout in seconds (e.g., 2 hours)
		sameSite: 'strict',         // Restrict cross-site requests
		domain: 'yourdomain.com'    // Restrict cookie to your domain
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
					type: 'http',
					scheme: 'bearer',
					description: 'just input the token, Bearer is auto prefixed now'
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
		const address = await fastify.listen({ port: envConfig.port, host: '0.0.0.0' });
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



// Run the server!
fastify.listen({ port: 3000, host: '0.0.0.0' }, function (err, address) {
	if (err) {
		fastify.log.error(err)
		process.exit(1)
	}
	fastify.log.info(`server listening on ${address}`)
})
