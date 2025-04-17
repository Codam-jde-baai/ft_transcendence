//modules
import { FastifyReply, FastifyRequest } from 'fastify';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { eq, or, and } from 'drizzle-orm';
import Database from 'better-sqlite3';
//files
import { friendsTable, friendStatus } from '../../db/schema.ts'

// @todo:
// TO ALL OF THESE add verification that the accepter is in fact the one who sent the original request
// 


export const AcceptFriendReq = async (request: FastifyRequest<{ Params: { friendId: string } }>, reply: FastifyReply) => {
	let sqlite = null;
	try {
		const { friendId } = request.params
		const id = Number(friendId)
		if (isNaN(id)) {
			return reply.status(400).send({ error: "id is not a number" })
		}
		const uuid: string = "fedc3ec8-8392-4c63-ae8c-6c94ab836b60" // from cookie
		sqlite = new Database('./data/data.db', { verbose: console.log })
		const db = drizzle(sqlite)

		// check if accepter is in fact the receiver of this friendReq
		const friendRelationArray = await db.select({ recUUid: friendsTable.recUUid }).from(friendsTable).where(eq(friendsTable.id, id))

		if (friendRelationArray.length === 0) {
			return reply.status(404).send({ error: "friend relation doesn't exist" })
		}
		if (friendRelationArray[0].recUUid !== uuid) {
			return reply.status(403).send({ error: "receiver uuid does not match user uuid" })
		}

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

// @todo COOKIE
export const RemoveFriendRelation = async (request: FastifyRequest<{ Params: { friendId: string } }>, reply: FastifyReply) => {
	let sqlite = null;
	try {
		// ensure that uuid from cookie == receiver or requester uuid
		const { friendId } = request.params
		const id = Number(friendId)
		if (isNaN(id)) {
			return reply.status(400).send({ error: 'id is not a number' })
		}
		const uuid: string = "fedc3ec8-8392-4c63-ae8c-6c94ab836b60" // from cookie 

		sqlite = new Database('./data/data.db', { verbose: console.log })
		const db = drizzle(sqlite)

		// check if requester is part of the friendrelation
		const relation = await db.select().from(friendsTable).where(and(
			eq(friendsTable.id, id),
			or(eq(friendsTable.reqUUid, uuid), eq(friendsTable.recUUid, uuid))
		))
		if (relation.length === 0) {
			return reply.status(403).send({ error: "user is not part of friend relation or friend relation doesn't exist" })
		}
		const result = await db.delete(friendsTable).where(eq(friendsTable.id, id))
		if (result.changes === 0) {
			return reply.status(400).send({ error: 'could not delete friends relation' })
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

