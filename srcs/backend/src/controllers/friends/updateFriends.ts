//modules
import { FastifyReply, FastifyRequest } from 'fastify';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import Database from 'better-sqlite3';
//files
import { friendsTable, friendStatus } from '../../db/schema.ts'



export const AcceptFriendReq = async (request: FastifyRequest<{ Params: { friendId: string } }>, reply: FastifyReply) => {
	let sqlite = null;
	try {
		const { friendId } = request.params
		const id = Number(friendId)
		if (isNaN(id)) {
			return reply.status(400).send({ error: 'id is not a number' })
		}
		sqlite = new Database('./data/data.db', { verbose: console.log })
		const db = drizzle(sqlite)

		const result = await db.update(friendsTable)
			.set({ status: friendStatus.ACCEPTED })
			.where(eq(friendsTable.id, id))
			.execute();
		if (result.changes === 0) {
			return reply.status(400).send({ error: 'could not update friends table' })
		}
		return reply.status(200).send()

	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'getFriends errorr';
		return reply.status(500).send({ error: errorMessage })
	}
	finally {
		if (sqlite) sqlite.close();
	}
}

export const BlockFriend = async (request: FastifyRequest<{ Params: { friendId: string } }>, reply: FastifyReply) => {
	let sqlite = null;
	try {
		const { friendId } = request.params
		const id = Number(friendId)
		if (isNaN(id)) {
			return reply.status(400).send({ error: 'id is not a number' })
		}
		sqlite = new Database('./data/data.db', { verbose: console.log })
		const db = drizzle(sqlite)

		const result = await db.update(friendsTable)
			.set({ status: friendStatus.BLOCKED })
			.where(eq(friendsTable.id, id))
			.execute();
		if (result.changes === 0) {
			return reply.status(400).send({ error: 'could not update friends table' })
		}
		return reply.status(200).send()

	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'getFriends errorr';
		return reply.status(500).send({ error: errorMessage })
	}
	finally {
		if (sqlite) sqlite.close();
	}
}