//modules
import { FastifyReply, FastifyRequest } from 'fastify';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { eq, or, and } from 'drizzle-orm';
import Database from 'better-sqlite3';
//files
import { friendsTable, friendStatus } from '../../db/schema.ts'
import { sendMessageToUser } from '../websocket/userStatus.ts';
import { createNotificationMessage } from '../websocket/messageTypes.ts';

export const AcceptFriendReq = async (request: FastifyRequest<{ Params: { friendId: string } }>, reply: FastifyReply) => {
	let sqlite = null;
	try {
		const { friendId } = request.params
		const id = Number(friendId)
		if (isNaN(id)) {
			return reply.status(400).send({ error: "id is not a number" })
		}
		const uuid = request.session.get('uuid') as string;
		const accepterAlias = request.session.get('alias') as string;
		sqlite = new Database('./data/data.db' )
		const db = drizzle(sqlite)

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
			.returning();
		if (result.length === 0) {
			return reply.status(400).send({ error: 'could not update friends table' })
		}
		sendMessageToUser(result[0].reqUUid, createNotificationMessage(accepterAlias, "accepted your friend request"));
		return reply.status(200).send()

	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'acceptFriendReq Error';
		return reply.status(500).send({ error: errorMessage })
	}
	finally {
		if (sqlite) sqlite.close();
	}
}

export const RemoveFriendRelation = async (request: FastifyRequest<{ Params: { friendId: string } }>, reply: FastifyReply) => {
	let sqlite = null;
	try {
		const { friendId } = request.params
		const id = Number(friendId)
		if (isNaN(id)) {
			return reply.status(400).send({ error: 'id is not a number' })
		}
		const uuid = request.session.get('uuid') as string;

		sqlite = new Database('./data/data.db' )
		const db = drizzle(sqlite)

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
		const errorMessage = error instanceof Error ? error.message : 'removeFriendRelation Error';
		return reply.status(500).send({ error: errorMessage })
	}
	finally {
		if (sqlite) sqlite.close();
	}
}

