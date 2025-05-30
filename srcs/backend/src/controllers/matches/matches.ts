// modules
import { FastifyReply, FastifyRequest } from 'fastify';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { or, eq, and } from 'drizzle-orm';
import Database from 'better-sqlite3';
// files
import { matchesTable } from '../../db/schema.ts'
import { match, createMatch } from '../../models/matches.ts'

export const getAllMatches = async (request: FastifyRequest, reply: FastifyReply) => {
	let sqlite = null;
	try {
		sqlite = new Database('./data/data.db', { verbose: console.log })
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

export const getTotalScore = async (request: FastifyRequest, reply: FastifyReply) => {
	let sqlite = null;
	try {
		sqlite = new Database('./data/data.db', { verbose: console.log })
		const db = drizzle(sqlite);
		const Scores = await db.select({ match_duration: matchesTable.match_duration }).from(matchesTable)
		if (Scores.length === 0) {
			return reply.status(200).send({ score: 0 })
		}
		const score: number = Scores.reduce((sum: number, current) => sum + current.match_duration!, 0)
		return reply.status(200).send({ score: score });
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'getTotalScore Error';
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
		sqlite = new Database('./data/data.db', { verbose: console.log })
		const db = drizzle(sqlite);
		const Matches = await db.select().from(matchesTable).where(or(eq(matchesTable.p1_uuid, uuid), eq(matchesTable.p2_uuid, uuid)))
		if (Matches.length === 0) {
			return reply.status(200).send(Matches);
		}
		return reply.status(200).send(Matches);
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'GetMatchesByUser Error';
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
		sqlite = new Database('./data/data.db', { verbose: console.log })
		const db = drizzle(sqlite);
		const Matches = await db.select().from(matchesTable).where(or(eq(matchesTable.p1_alias, alias), eq(matchesTable.p2_alias, alias)))
		if (Matches.length === 0) {
			return reply.status(200).send(Matches);
		}
		return reply.status(200).send(Matches);
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'GetMatchesByAlias Error';
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
		sqlite = new Database('./data/data.db', { verbose: console.log })
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
		const errorMessage = error instanceof Error ? error.message : 'GetMatchesByPair Error';
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
			winner_id: body.winner_id,
			start_time: body.start_time,
			end_time: body.end_time,
			match_duration: body.match_duration
		};
		sqlite = new Database('./data/data.db', { verbose: console.log });
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