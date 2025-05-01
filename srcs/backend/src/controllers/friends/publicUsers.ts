import { FastifyReply, FastifyRequest } from 'fastify';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { or, notInArray, eq } from 'drizzle-orm';
import Database from 'better-sqlite3';
//files
import { friendsTable, usersTable } from '../../db/schema.ts'
import { toPublicUser } from '../../models/users.ts'

export const getNonFriends = async (request: FastifyRequest, reply: FastifyReply) => {
	let sqlite = null;
	try {
		const uuid = request.session.get('uuid') as string;

		sqlite = new Database('./data/data.db', { verbose: console.log })
		const db = drizzle(sqlite);

		const friendUUid = await db.select({
			req: friendsTable.reqUUid,
			rec: friendsTable.recUUid
		}).from(friendsTable).where(or(
			eq(friendsTable.reqUUid, uuid), eq(friendsTable.recUUid, uuid)));

		const combinedUUids = [...friendUUid.map(r => r.req), ...friendUUid.map(r => r.rec)];
		const uniqueUUids = Array.from(new Set([...combinedUUids, uuid]));

		const userArray = await db.select().from(usersTable).where(notInArray(usersTable.uuid, uniqueUUids));
		const publicUsers = userArray.map(toPublicUser);
		return reply.status(200).send(publicUsers);
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'getNonFriends Error';
		return reply.status(500).send({ error: errorMessage })
	}
	finally {
		if (sqlite) sqlite.close();
	}
}