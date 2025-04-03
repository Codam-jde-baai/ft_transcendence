import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';


// export const createLoginCookie = async (request: FastifyRequest, reply: FastifyReply) => {


// 	const { uuid, token } = request.body as { uuid:string; token:string}
// 	const maxAge:string = "3600"
// 	const SameSitePolicy:string = "Lax"
// 	const path = "/"
// 	const secure = "true"
	
// 	document.cookie = `${uuid}=${token}; max-age=${maxAge}; path=${path}; SameSite=${SameSitePolicy}; Secure=${secure}; HttpOnly;`
	
// // 	const cookie = document.cookie
// // 	console.log(cookie)
// }

export const verifySessionID = async (request: FastifyRequest, reply: FastifyReply) => {
	reply.code(200).send("Test Complete");
	// reply.code(200).send(request.session.get('user', pubUser));
}
