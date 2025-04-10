import { FastifyReply, FastifyRequest } from 'fastify';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { or, inArray, eq } from 'drizzle-orm';
import Database from 'better-sqlite3';
//files
import { friendsTable, usersTable, friendStatus } from '../../db/schema.ts'
import { User, toPublicUser } from '../../models/users.ts'

export const getFriends = async (request: FastifyRequest<{ Params: { uuid: string } }>, reply: FastifyReply) => {
	let sqlite = null;
	try {
		const { uuid } = request.params;

		sqlite = new Database('./data/data.db', { verbose: console.log })
		const db = drizzle(sqlite);

		const userExist = await db.select().from(usersTable).where(eq(usersTable.uuid, uuid)).limit(1);
		if (userExist.length === 0) {
			return reply.code(400).send({ error: 'user does not exist' });
		}

		const RelationArray = await db.select().from(friendsTable).where(
			or(
				eq(friendsTable.reqUUid, uuid),
				eq(friendsTable.recUUid, uuid)
			)
		);
		if (RelationArray.length == 0) {
			return reply.code(404).send("nothing to see here")
		}
		const reqRelation = RelationArray.filter(relation => relation.reqUUid === uuid);
		const recRelation = RelationArray.filter(relation => relation.recUUid === uuid);

		const friends: { id: number, uuid: string }[] = [];
		const denied: { id: number, uuid: string }[] = [];
		const sentRequests: { id: number, uuid: string }[] = [];
		const receivedRequests: { id: number, uuid: string }[] = [];
		const blockedUsers: { id: number, uuid: string }[] = [];

		// where the user is the requester
		for (const relation of reqRelation) {
			if (relation.status == friendStatus.ACCEPTED) {
				friends.push({ id: relation.id, uuid: relation.recUUid });
			}
			if (relation.status == friendStatus.DENIED) {
				denied.push({ id: relation.id, uuid: relation.recUUid });
			}
			if (relation.status == friendStatus.PENDING) {
				sentRequests.push({ id: relation.id, uuid: relation.recUUid });
			}
			if (relation.status == friendStatus.BLOCKED) {
				blockedUsers.push({ id: relation.id, uuid: relation.recUUid });
			}
		}
		// where the user is the receiver
		for (const relation of recRelation) {
			if (relation.status == friendStatus.ACCEPTED) {
				friends.push({ id: relation.id, uuid: relation.reqUUid });
			}
			if (relation.status == friendStatus.PENDING) {
				receivedRequests.push({ id: relation.id, uuid: relation.reqUUid });
			}
		}
		// combine all userIDs to make a single DB query
		const allUserIds = [
			...friends.map(f => f.uuid),
			...sentRequests.map(f => f.uuid),
			...receivedRequests.map(f => f.uuid),
			...denied.map(f => f.uuid),
			...blockedUsers.map(f => f.uuid)
		].filter((value, index, self) => self.indexOf(value) === index);

		// Add this line to get the userArray
		const userArray = await db.select().from(usersTable).where(inArray(usersTable.uuid, allUserIds));

		// map the UserData retrieved from DB
		const userMap: Record<string, User> = {};
		userArray.forEach(user => {
			userMap[user.uuid] = user;
		});
		// assign the data to different fields
		const friendsData = friends.map(friend => ({
			friendid: friend.id,
			friend: toPublicUser(userMap[friend.uuid])
		}));
		const sentRequestData = sentRequests.map(friend => ({
			friendid: friend.id,
			friend: toPublicUser(userMap[friend.uuid])
		}));
		const receivedRequestData = receivedRequests.map(friend => ({
			friendid: friend.id,
			friend: toPublicUser(userMap[friend.uuid])
		}));
		const deniedRequestData = denied.map(friend => ({
			friendid: friend.id,
			friend: toPublicUser(userMap[friend.uuid])
		}));
		const blockedUserData = blockedUsers.map(friend => ({
			friendid: friend.id,
			friend: toPublicUser(userMap[friend.uuid])
		}));
		return reply.code(200).send({
			friends: friendsData,
			sentRequests: sentRequestData,
			receivedRequests: receivedRequestData,
			deniedRequests: deniedRequestData,
			blocked: blockedUserData
		})

	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'getFriends errorr';
		return reply.status(500).send({ error: errorMessage })
	}
	finally {
		if (sqlite) sqlite.close();
	}
}

/*

	add function to accept friend request, function to block user


*/

