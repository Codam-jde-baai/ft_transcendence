// packages
import { FastifyReply, FastifyRequest } from 'fastify';
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { eq } from 'drizzle-orm'

// files
import { usersTable } from '../../db/schema.ts';
import { toPublicUser, getMimeType } from '../../models/users.ts';

// get all Users
export const getAllUsers = async (request: FastifyRequest, reply: FastifyReply) => {
	let sqlite = null;
	try {
		sqlite = new Database('./data/data.db', { verbose: console.log });
		const db = drizzle(sqlite);

		const userArray = await db.select().from(usersTable);

		if (userArray.length === 0) {
			reply.code(404).send({ error: 'No users in database' });
			return;
		}

		// Use the toPublicUser helper to map users to public format
		const publicUsers = userArray.map(toPublicUser);
		return reply.send(publicUsers);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'getAllUsers Error';
		return reply.status(500).send({ error: errorMessage })
	} finally {
		if (sqlite) sqlite.close();
	}
};


export const getUser = async (request: FastifyRequest, reply: FastifyReply) => {
	let sqlite = null;
	try {
		const uuid = request.session.get('uuid') as string;
		sqlite = new Database('./data/data.db', { verbose: console.log });
		const db = drizzle(sqlite);

		const userArray = await db.select().from(usersTable).where(eq(usersTable.uuid, uuid));

		if (userArray.length === 0) {
			reply.code(404).send({ error: 'User not found' });
			return;
		}

		const user = userArray[0];
		const publicUser = toPublicUser(user);
		reply.code(200).send(publicUser);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'getUser Error';
		return reply.status(500).send({ error: errorMessage })
	} finally {
		if (sqlite) sqlite.close();
	}
}

export const getUserStatus = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		reply.code(200).send();
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'getUserStatus Error';
		return reply.status(500).send({ error: errorMessage })
	}
}

export const getUserAlias = async (
	request: FastifyRequest<{ Params: { alias: string } }>,
	reply: FastifyReply) => {
	let sqlite = null;
	try {
		const alias = request.params.alias;

		sqlite = new Database('./data/data.db', { verbose: console.log });
		const db = drizzle(sqlite);

		const userArray = await db.select().from(usersTable).where(eq(usersTable.alias, alias));

		if (userArray.length === 0) {
			reply.code(404).send({ error: 'User not found' });
			return;
		}

		const user = userArray[0];
		const publicUser = toPublicUser(user);
		reply.code(200).send(publicUser);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'getUserAlias Error';
		return reply.status(500).send({ error: errorMessage })
	} finally {
		if (sqlite) sqlite.close();
	}
}

// test

// Function to get user image
export const getUserImage = async (request: FastifyRequest, reply: FastifyReply) => {
	let sqlite = null;
	try {
		const uuid = request.session.get('uuid') as string;
		sqlite = new Database('./data/data.db', { verbose: console.log });
		const db = drizzle(sqlite);

		const userArray = await db.select().from(usersTable).where(eq(usersTable.uuid, uuid));

		if (userArray.length === 0) {
			reply.code(404).send({ error: 'User not found' });
			return;
		}

		const user = userArray[0];

		const pic = user.profile_pic as Buffer | undefined;
		if (pic) {
			reply.type(getMimeType(pic)).send(pic);
		} else {
			reply.code(404).send({ error: 'Profile picture not found' });
		}
	} catch (error) {
		request.log.error('getUserImage failed:', error);
		reply.code(500).send({ error: 'Failed to retrieve users' });
	} finally {
		if (sqlite) sqlite.close();
	}
}

export const getUserImageByAlias = async (
	request: FastifyRequest<{ Params: { alias: string } }>,
	reply: FastifyReply) => {
	let sqlite = null;
	try {
		const alias = request.params.alias;

		sqlite = new Database('./data/data.db', { verbose: console.log });
		const db = drizzle(sqlite);

		const userArray = await db.select().from(usersTable).where(eq(usersTable.alias, alias));

		if (userArray.length === 0) {
			reply.code(404).send({ error: 'User not found' });
			return;
		}

		const user = userArray[0];

		const pic = user.profile_pic as Buffer | undefined;
		if (pic) {
			reply.type(getMimeType(pic)).send(pic);
		} else {
			reply.code(404).send({ error: 'Profile picture not found' });
		}
	} catch (error) {
		request.log.error('getUserImageByAlias failed:', error);
		reply.code(500).send({ error: 'Failed to retrieve users' });
	} finally {
		if (sqlite) sqlite.close();
	}
}