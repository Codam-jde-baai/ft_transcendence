import { FastifyReply, FastifyRequest } from 'fastify';
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { eq } from 'drizzle-orm'
import { usersTable } from '../../db/schema.ts';

export const deleteUser = async (
	request: FastifyRequest<{ Params: { uuid: string } }>,
	reply: FastifyReply) => {
	let sqlite = null;
	try {
		const { uuid } = request.params;
		sqlite = new Database('./data/data.db', { verbose: console.log });
		const db = drizzle(sqlite);
		await db.delete(usersTable).where(eq(usersTable.uuid, uuid));

		return reply.code(204).send();
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'delete user error';
		request.log.error('User deletion failed: ', errorMessage)
		return reply.code(500).send({ error: errorMessage })
	}
	finally {
		if (sqlite) sqlite.close();
	}

};