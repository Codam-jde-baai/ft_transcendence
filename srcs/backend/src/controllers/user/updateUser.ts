// packages
import { FastifyReply, FastifyRequest } from 'fastify';
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { eq } from 'drizzle-orm'
// files
import { usersTable, eLanguage, userStatus } from '../../db/schema.ts';
import { verifyPassword, hashPassword, toPublicUser } from '../../models/users.ts';

export const updateUser = async (request: FastifyRequest<{
	Body: {
		current_password: string;
		password?: string;
		username?: string;
		alias?: string;
		language?: eLanguage;
	}
}>, reply: FastifyReply) => {
	let sqlite = null;
	try {
		const uuid = request.session.get('uuid') as string;		
		const { username, alias, language } = request.body;
		const password = request.body.current_password;
		const newPassword = request.body.password;

		let userFound = false;
		let user = null;
		let storedHash = '$argon2id$v=19$m=65536,t=3,p=4$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

		sqlite = new Database('./data/data.db', { verbose: console.log });
		const db = drizzle(sqlite);
		const userArray = await db.select().from(usersTable).where(eq(usersTable.uuid, uuid));

		if (userArray.length > 0) {
			userFound = true;
			user = userArray[0];
			storedHash = user.password
		}
		const samePassword = await verifyPassword(password, storedHash);

		if (!userFound || !samePassword) {
			reply.code(401).send({ error: 'user and password combination do not match database entry' });
			return;
		}

		const updateData: { [key: string]: any } = {};
		if (newPassword !== undefined) updateData.password = await hashPassword(newPassword);
		if (username !== undefined) updateData.username = username;
		if (alias !== undefined) updateData.alias = alias;
		if (language !== undefined) updateData.language = language;
		if (Object.keys(updateData).length === 0) {
			return reply.code(400).send({ error: "no data provided to update" })
		}

		const updatedUser = await db.update(usersTable).set(updateData).where(eq(usersTable.uuid, uuid)).returning();
		request.session.set('alias', updatedUser[0].alias);
		return reply.code(200).send(toPublicUser(updatedUser[0]));
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'updateUser error';
		request.log.error('updateUser failed:', error);
		return reply.status(500).send({ error: errorMessage });
	} finally {
		if (sqlite) sqlite.close();
	}
}

export const setOnline = async (
	request: FastifyRequest<{ Params: { uuid: string } }>,
	reply: FastifyReply) => {
	let sqlite = null;
	try {
		const { uuid } = request.params;
		sqlite = new Database('./data/data.db', { verbose: console.log });
		const db = drizzle(sqlite);
		const userArray = await db.update(usersTable)
			.set({ status: userStatus.ONLINE })
			.where(eq(usersTable.uuid, uuid)).returning();
		if (userArray.length === 0) {
			return reply.code(404).send({ msg: "User not found" });
		}
		return reply.code(200).send();
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'setOnline error';
		return reply.status(500).send({ error: errorMessage });
	}
	finally {
		if (sqlite) sqlite.close();
	}
};

export const setOffline = async (
	request: FastifyRequest<{ Params: { uuid: string } }>,
	reply: FastifyReply) => {
	let sqlite = null;
	try {
		const { uuid } = request.params;
		sqlite = new Database('./data/data.db', { verbose: console.log });
		const db = drizzle(sqlite);
		const userArray = await db.update(usersTable)
			.set({ status: userStatus.OFFLINE })
			.where(eq(usersTable.uuid, uuid)).returning();
		if (userArray.length === 0) {
			return reply.code(404).send({ msg: "User not found" });
		}
		return reply.code(200).send();
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'setOffline error';
		request.log.error('setOffline failed:', error);
		return reply.status(500).send({ error: errorMessage });
	}
	finally {
		if (sqlite) sqlite.close();
	}
};
