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
		const errorMessage = error instanceof Error ? error.message : 'getUsers errorr';
		return reply.status(500).send({ error: errorMessage })
	} finally {
		if (sqlite) sqlite.close();
	}
};


export const getUser = async (
	request: FastifyRequest<{ Params: { uuid: string } }>,
	reply: FastifyReply) => {
	let sqlite = null;
	try {
		const uuid = request.params.uuid;

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
		const errorMessage = error instanceof Error ? error.message : 'getUser errorr';
		return reply.status(500).send({ error: errorMessage })
	} finally {
		if (sqlite) sqlite.close();
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
		const errorMessage = error instanceof Error ? error.message : 'getUserAlias errorr';
		return reply.status(500).send({ error: errorMessage })
	} finally {
		if (sqlite) sqlite.close();
	}
}

// test

// Function to get user image
export const getUserImage = async (
	request: FastifyRequest<{ Params: { uuid: string } }>,
	reply: FastifyReply) => {
	let sqlite = null;
	try {
		const uuid = request.params.uuid;

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
		request.log.error('getAllUsers failed:', error);
		reply.code(500).send({ error: 'Failed to retrieve users' });
	} finally {
		if (sqlite) sqlite.close();
	}
}