import envConfig from './config/env.ts';
import Fastify from 'fastify';
import userRoutes from './routes/users.ts';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import multipart from '@fastify/multipart';
import friendsRoutes from './routes/friends.ts';
import fastifyCors from '@fastify/cors'

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
	methods: ['GET', 'POST', 'DELETE', 'PUT'],
	allowedHeaders: ['Content-Type', 'x-api-key'],
});
// 'Origin', 'X-Requested-With', 'Accept'

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
