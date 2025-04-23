//modules
import { FastifyReply, FastifyRequest } from 'fastify';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { or, eq, and } from 'drizzle-orm';
import Database from 'better-sqlite3';
//files
import { friendsTable, usersTable } from '../../db/schema.ts'
import { createRelation, toPublicRelation } from '../../models/friends.ts'

export const addFriend = async (request: FastifyRequest<{
	Body: {
		alias: string
	}
}>, reply: FastifyReply) => {
	let sqlite = null;
	try {
		const { alias } = request.body
		if (!alias)
			reply.code(400).send({ error: "recepient alias should have a value" });
		const reqUUid = request.session.get('data');
		if (!reqUUid) {
			return reply.status(401).send({ error: 'user is not logged in' })
		}

		sqlite = new Database('./data/data.db', { verbose: console.log })
		const db = drizzle(sqlite)
		const receiverArray = await db.select().from(usersTable).where(eq(usersTable.alias, alias));

		if (receiverArray.length == 0) {
			reply.code(404).send({ error: "alias odes not exist in database" })
		}
		const receiver = receiverArray[0];

		// check if they already have a relation in friends database
		const existingRelationArray = await db.select().from(friendsTable).where(
			or(
				and(
					eq(friendsTable.reqUUid, reqUUid),
					eq(friendsTable.recUUid, receiver.uuid)
				),
				and(
					eq(friendsTable.reqUUid, receiver.uuid),
					eq(friendsTable.recUUid, reqUUid)
				)
			)
		).limit(1);
		if (existingRelationArray.length > 0) {
			return (reply.code(409).send({ error: "users already have relation", relation: toPublicRelation(existingRelationArray[0]) }))
		}

		const relation = createRelation(reqUUid, receiver.uuid)
		const result = await db.insert(friendsTable).values(relation).returning()
		return reply.code(201).send({ msg: "created relation", relation: toPublicRelation(result[0]) })
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'addFriend errorr';
		if (errorMessage.includes("FOREIGN KEY constraint failed"))
			return reply.code(404).send({ error: "requester or recepient do not exist in db" });
		return reply.status(500).send({ error: errorMessage })
	}
	finally {
		if (sqlite) sqlite.close();
	}
}

