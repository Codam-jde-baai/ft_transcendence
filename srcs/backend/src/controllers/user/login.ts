// packages
import { FastifyReply, FastifyRequest } from 'fastify';
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { eq } from 'drizzle-orm'

// files
import { usersTable, userStatus } from '../../db/schema.ts';
import { toPublicUser, verifyPassword } from '../../models/users.ts';


export const loginUser = async (request: FastifyRequest, reply: FastifyReply) => {
	let sqlite = null;
	try {
		const { username, password } = request.body as { username?: string; password?: string };
		if (!username || !password) {
			reply.code(400).send({ error: 'Username and password are required' });
			return;
		}
		// for time consistency 
		let userFound = false;
		let user = null;
		let storedHash = '$argon2id$v=19$m=65536,t=3,p=4$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';


		sqlite = new Database('./data/data.db' );
		const db = drizzle(sqlite);
		const userArray = await db.select().from(usersTable).where(eq(usersTable.username, username));

		if (userArray.length > 0) {
			userFound = true;
			user = userArray[0];
			storedHash = user.password
		}
		const samePassword = await verifyPassword(password, storedHash);

		if (!userFound || !samePassword) {
			reply.code(401).send({ error: 'username and password combination do not match database entry' });
			return;
		}
		const pubUser = toPublicUser(userArray[0]);
		request.session.set('uuid', userArray[0].uuid);
		request.session.set('alias', userArray[0].alias);
		return reply.code(200).send(pubUser);
	} catch (error) {
		request.log.error('loginUser failed:', error);
		return reply.code(500).send({ error: 'Failed to retrieve users' });
	} finally {
		if (sqlite) sqlite.close();
	}
}

export const loginUserGame = async (request: FastifyRequest, reply: FastifyReply) => {
	let sqlite = null;
	try {
		const { username, password } = request.body as { username?: string; password?: string };
		if (!username || !password) {
			reply.code(400).send({ error: 'Username and password are required' });
			return;
		}
		// for time consistency 
		let userFound = false;
		let user = null;
		let storedHash = '$argon2id$v=19$m=65536,t=3,p=4$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
		sqlite = new Database('./data/data.db' );
		const db = drizzle(sqlite);
		const userArray = await db.select().from(usersTable).where(eq(usersTable.username, username));
		if (userArray.length > 0) {
			userFound = true;
			user = userArray[0];
			storedHash = user.password
		}
		const samePassword = await verifyPassword(password, storedHash);
		if (!userFound || !samePassword) {
			reply.code(401).send({ error: 'username and password combination do not match database entry' });
			return;
		}
		const pubUser = toPublicUser(userArray[0]);
		const gameUser = {
			alias: pubUser.alias,
			uuid: pubUser.uuid,
		}
		return reply.code(200).send(gameUser);
	} catch (error) {
		request.log.error('loginUser failed:', error);
		return reply.code(500).send({ error: 'Failed to retrieve users' });
	} finally {
		if (sqlite) sqlite.close();
	}
}

export const logoutUser = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
			request.session.delete()
			return reply.code(200).send();
	} catch (error) {
		request.log.error('logoutUser failed:', error);
		return reply.code(500).send({ error: 'Failed to logout User' });
	}
}
