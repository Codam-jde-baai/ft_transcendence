// modules
import { FastifyReply, FastifyRequest } from 'fastify';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { or, eq, and } from 'drizzle-orm';
import Database from 'better-sqlite3';
// files
import { matchesTable } from '../../db/schema.ts'
import { usersTable } from '../../db/schema.ts'
import { match, createMatch } from '../../models/matches.ts'
import { PlayerStats } from '../../models/matches.ts';

export const getAllMatches = async (request: FastifyRequest, reply: FastifyReply) => {
	let sqlite = null;
	try {
		sqlite = new Database('./data/data.db' )
		const db = drizzle(sqlite);
		const Matches = await db.select().from(matchesTable)
		return reply.status(200).send(Matches);
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'getAllMatches Error';
		return reply.status(500).send({ error: errorMessage })
	}
	finally {
		if (sqlite) sqlite.close();
	}
}

export const getAllRecords = async (request: FastifyRequest, reply: FastifyReply) => {
	let sqlite = null;
	try {
		sqlite = new Database('./data/data.db' )
		const db = drizzle(sqlite);
		const users = await db.select().from(usersTable)
		const records:PlayerStats[] = []
		
		for (const user of users) {
			const uuid = user.uuid
			const alias = user.alias
			const Matches = await db.select().from(matchesTable).where(or(eq(matchesTable.p1_uuid, uuid), eq(matchesTable.p2_uuid, uuid)))
			const wins = Matches.filter((match) => match.status === (uuid === match.p1_uuid ? 1 : 2)).length;
    		const losses = Matches.filter((match) => match.status === (uuid === match.p1_uuid ? 2 : 1)).length;
			let win_rate = 0;
			if (wins + losses > 0)
				win_rate = 100 * wins / (wins + losses);
			records.push({uuid, alias, wins, losses, win_rate})
		}
		return reply.status(200).send(records);
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'getAllRecords Error';
		return reply.status(500).send({ error: errorMessage })
	}
	finally {
		if (sqlite) sqlite.close();
	}
}

export const getRecord = async (request: FastifyRequest<{ Params: { alias?: string } }>, reply: FastifyReply) => {
	let sqlite = null;
	try {
		let alias:string;
		if (request.params.alias)	
			alias = request.params.alias
		else
			alias = request.session.alias!
		sqlite = new Database('./data/data.db' )
		const db = drizzle(sqlite);
		const user = await db.select().from(usersTable).where(eq(usersTable.alias, alias)).limit(1);
		if (user.length !== 1)
			return reply.status(404).send("getRecord Error: User Not Found");
		const uuid:string = user[0].uuid
		const stats:PlayerStats = {
			uuid: uuid,
			alias: alias,
			wins: 0,
			losses: 0,
			win_rate: 0
		}
		const Matches = await db.select().from(matchesTable).where(or(eq(matchesTable.p1_uuid, uuid), eq(matchesTable.p2_uuid, uuid)))
		if (Matches.length === 0) {
			return reply.status(200).send(stats);
		}
		stats.wins = Matches.filter((match) => match.status === (uuid === match.p1_uuid ? 1 : 2)).length;
    	stats.losses = Matches.filter((match) => match.status === (uuid === match.p1_uuid ? 2 : 1)).length;
		if (stats.wins + stats.losses > 0)
			stats.win_rate = 100 * stats.wins / (stats.wins + stats.losses);
		return reply.status(200).send(stats);
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'getRecord Error';
		return reply.status(500).send({ error: errorMessage })
	}
	finally {
		if (sqlite) sqlite.close();
	}
}

export const getMatchesByUser = async (request: FastifyRequest, reply: FastifyReply) => {
	let sqlite = null;
	try {
		const uuid = request.session.get('uuid') as string;
		sqlite = new Database('./data/data.db' )
		const db = drizzle(sqlite);
		const Matches = await db.select().from(matchesTable).where(or(eq(matchesTable.p1_uuid, uuid), eq(matchesTable.p2_uuid, uuid)))
		if (Matches.length === 0) {
			return reply.status(200).send(Matches);
		}
		return reply.status(200).send(Matches);
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'getMatchesByUser Error';
		return reply.status(500).send({ error: errorMessage })
	}
	finally {
		if (sqlite) sqlite.close();
	}
}

export const getMatchesByAlias = async (request: FastifyRequest<{ Params: { alias: string } }>, reply: FastifyReply) => {
	let sqlite = null;
	try {
		const alias = request.params.alias
		sqlite = new Database('./data/data.db' )
		const db = drizzle(sqlite);
		const Matches = await db.select().from(matchesTable).where(or(eq(matchesTable.p1_alias, alias), eq(matchesTable.p2_alias, alias)))
		if (Matches.length === 0) {
			return reply.status(200).send(Matches);
		}
		return reply.status(200).send(Matches);
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'getMatchesByAlias Error';
		return reply.status(500).send({ error: errorMessage })
	}
	finally {
		if (sqlite) sqlite.close();
	}
}

export const getMatchesByPair = async (request: FastifyRequest<{ Params: { p1_alias: string, p2_alias: string } }>, reply: FastifyReply) => {
	let sqlite = null;
	try {
		const { p1_alias, p2_alias } = request.params;
		sqlite = new Database('./data/data.db' )
		const db = drizzle(sqlite);
		const Matches = await db.select().from(matchesTable).where(or(
			and(eq(matchesTable.p1_alias, p1_alias), eq(matchesTable.p2_alias, p2_alias)),
			and(eq(matchesTable.p1_alias, p2_alias), eq(matchesTable.p2_alias, p1_alias))))
		if (Matches.length === 0) {
			reply.status(200).send(Matches);
		}
		return reply.status(200).send(Matches);
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'getMatchesByPair Error';
		return reply.status(500).send({ error: errorMessage })
	}
	finally {
		if (sqlite) sqlite.close();
	}
}

export const addMatch = async (request: FastifyRequest<{ Body: createMatch }>,
	reply: FastifyReply) => {
	let sqlite = null;
	try {
		const body = request.body;
		const matchData: createMatch = {
			p1_alias: body.p1_alias,
			p2_alias: body.p2_alias,
			winner_alias: body.winner_alias,
			p1_uuid: body.p1_uuid,
			p2_uuid: body.p2_uuid,
			status: body.status,
		};
		sqlite = new Database('./data/data.db' );
		const db = drizzle(sqlite);
		const createdMatch = await db.insert(matchesTable).values(matchData).returning();
		return reply.code(201).send(createdMatch[0]);
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'addMatch error';
		return reply.status(500).send({ error: errorMessage });
	}
	finally {
		if (sqlite) sqlite.close();
	}
};