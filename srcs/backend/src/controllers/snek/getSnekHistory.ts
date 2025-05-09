import { FastifyReply, FastifyRequest } from 'fastify';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { eq, or, and } from 'drizzle-orm';

import { snekTable } from '../../db/schema.ts';
import { toPublicSnek } from '../../models/snek.ts';

export const getAllHistory = async (req: FastifyRequest, reply: FastifyReply) => {
	let sqlite = null;
	try {
		sqlite = new Database('./data/data.db', { verbose: console.log })
		const db = drizzle(sqlite);
		const snek = await db.select().from(snekTable);
		if (snek.length === 0){
			return reply.code(404).send({ error: "nothing to see here" })
		}
		snek.sort((a, b) => b.id - a.id);
		return reply.send(snek.map(toPublicSnek));
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'getAllSnek Error';
		return reply.status(500).send({ error: errorMessage })
	}
	finally {
		if (sqlite) sqlite.close();
	}
}

export const getMyHistory = async (req: FastifyRequest, reply: FastifyReply) => {
	let sqlite = null;
	try {
		const uuid = req.session.get('uuid') as string;
		sqlite = new Database('./data/data.db', { verbose: console.log })
		const db = drizzle(sqlite);
		const snek = await db.select().from(snekTable).where(eq(snekTable.p1_uuid, uuid));
		if (snek.length === 0){
			return reply.code(404).send({ error: "nothing to see here" })
		}
		snek.sort((a, b) => b.id - a.id);
		return reply.send(snek.map(toPublicSnek));
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'getMyGames Error';
		return reply.status(500).send({ error: errorMessage })
	}
	finally {
		if (sqlite) sqlite.close();
	}
}

export const getHistoryByAlias = async (req: FastifyRequest<{ Params: { alias: string } }>, reply: FastifyReply) => {
	let sqlite = null;
	try {
		const alias = req.params.alias;
		sqlite = new Database('./data/data.db', { verbose: console.log })
		const db = drizzle(sqlite);
		const snek = await db.select().from(snekTable).where(or(
			eq(snekTable.p1_alias, alias),
			eq(snekTable.p2_alias, alias)
		));
		if (snek.length === 0){
			return reply.code(404).send({ error: "nothing to see here" })
		}
		snek.sort((a, b) => b.id - a.id);
		return reply.send(snek.map(toPublicSnek));
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'getMyGames Error';
		return reply.status(500).send({ error: errorMessage })
	}
	finally {
		if (sqlite) sqlite.close();
	}
}

export const getHistoryByPair = async (req: FastifyRequest<{ Params: { p1_alias: string, p2_alias: string } }>, reply: FastifyReply) => {
	let sqlite = null;
	try {
		const p1_alias = req.params.p1_alias;
		const p2_alias = req.params.p2_alias;
		sqlite = new Database('./data/data.db', { verbose: console.log })
		const db = drizzle(sqlite);
		const snek = await db.select().from(snekTable).where(or(
    		and(eq(snekTable.p1_alias, p1_alias), eq(snekTable.p2_alias, p2_alias)),
    		and(eq(snekTable.p1_alias, p2_alias), eq(snekTable.p2_alias, p1_alias))
		));
		if (snek.length === 0){
			return reply.code(404).send({ error: "nothing to see here" })
		}
		snek.sort((a, b) => b.id - a.id);
		return reply.send(snek.map(toPublicSnek));
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'getMyGames Error';
		return reply.status(500).send({ error: errorMessage })
	}
	finally {
		if (sqlite) sqlite.close();
	}
}