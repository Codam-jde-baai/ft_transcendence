import envConfig from './config/env.ts';
import Fastify from 'fastify';
import userRoutes from './routes/users.ts';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

console.log("reading from index.ts backend")

const fastify = Fastify({
	logger: true
}) // making the fastify instance out of the imported Fastify

await fastify.register(swagger, {
	swagger: {
		info: {
			title: 'Your API',
			description: 'API documentation',
			version: '1.0.0'
		},
		securityDefinitions: {
			apiKey: {
				type: 'apiKey',
				name: 'Authorization',
				in: 'header',
				description: 'Enter token with Bearer prefix, e.g., "Bearer your-token-here"'
			}
		}
	}
});

await fastify.register(swaggerUi, {
	routePrefix: '/docs',
	exposeRoute: true
})

fastify.register(userRoutes);


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



// // Run the server!
// fastify.listen({ port: 3000, host: '0.0.0.0' }, function (err, address) {
// 	if (err) {
// 		fastify.log.error(err)
// 		process.exit(1)
// 	}
// 	fastify.log.info(`server listening on ${address}`)
// })
