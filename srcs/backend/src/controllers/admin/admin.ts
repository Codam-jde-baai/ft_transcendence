//modules
import { FastifyReply, FastifyRequest } from 'fastify';
import envConfig from '../../config/env.ts';
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { eq } from 'drizzle-orm'
import { usersTable } from '../../db/schema.ts';
import {
	CreateUser,
	hashPassword,
	validateUser,
	validateProfilePic,
	toPublicUser
} from '../../models/users.ts';

export const loginAdmin = async (request: FastifyRequest<{
	Body: {
		admin: string
		password: string
	}}>, reply: FastifyReply) => {
	try {
		const { admin, password } = request.body
		if (admin !== envConfig.admin || password !== envConfig.password) {
			reply.code(471).send({ error: 'admin and password combination is not valid' });
			return;
		}
		request.session.set('uuid', 'Valid');
		return reply.code(200).send();
	} catch (error) {
		request.log.error('loginAdmin failed:', error);
		return reply.code(500).send({ error: 'Failed to login Admin' });
	}
}

export const adminDeleteUser = async (request: FastifyRequest<{
	Body: {
		username:string
	}}>, reply: FastifyReply) => {
	let sqlite = null;
	try {
		const username = request.body.username
		sqlite = new Database('./data/data.db', { verbose: console.log });
		const db = drizzle(sqlite);
		const result = await db.delete(usersTable).where(eq(usersTable.username, username));
		if (result.changes === 0) {
			reply.code(404).send({ error: "username did not match database, no changes made" })
			return
		}
		return reply.code(204).send();
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'adminDeleteUser error';
		request.log.error('adminDeleteUser failed: ', errorMessage)
		return reply.code(500).send({ error: errorMessage })
	}
	finally {
		if (sqlite) sqlite.close();
	}
}

export const adminUpdateUserPassword = async (request: FastifyRequest<{
	Body: {
		username:string
		newPassword:string
	}}>, reply: FastifyReply) => {
	let sqlite = null;
	try {
		const { username, newPassword } = request.body
		sqlite = new Database('./data/data.db', { verbose: console.log });
		const db = drizzle(sqlite);
		const User = await db.select().from(usersTable).where(eq(usersTable.username, username));
		if (User.length === 0) {
			reply.code(404).send({ error: "username did not match database, no changes made" })
			return
		}
		const hashedPassword = await hashPassword(newPassword);
		await db.update(usersTable)
			.set({ password: hashedPassword })
			.where(eq(usersTable.username, username));
		return reply.code(201).send();
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'adminDeleteUser error';
		request.log.error('adminDeleteUser failed: ', errorMessage)
		return reply.code(500).send({ error: errorMessage })
	}
	finally {
		if (sqlite) sqlite.close();
	}
}
