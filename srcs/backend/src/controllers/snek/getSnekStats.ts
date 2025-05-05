import { FastifyReply, FastifyRequest } from 'fastify';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { eq, or, and } from 'drizzle-orm';

import { snekTable } from '../../db/schema.ts';
import { PlayerStats, MatchData, calculatePlayerStats } from '../../models/snek.ts';

export const getTopStats = async (req: FastifyRequest, reply: FastifyReply) => {
	let sqlite = null;
	try {
		sqlite = new Database('./data/data.db', { verbose: console.log })
		const db = drizzle(sqlite);
		const snek = await db.select({
			p1_alias: snekTable.p1_alias,
			p2_alias: snekTable.p2_alias,
			winner_id: snekTable.winner_id,
			p1_score: snekTable.p1_score,
			p2_score: snekTable.p2_score})
		.from(snekTable) as MatchData[];
		if (snek.length === 0){
			return reply.code(404).send({ error: "nothing to see here" })
		}
		const topPlayers: PlayerStats[] = calculatePlayerStats(snek);
		return reply.send(topPlayers);
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'getTopStats Error';
		return reply.status(500).send({ error: errorMessage })
	}
	finally {
		if (sqlite) sqlite.close();
	}

}

export const getMyStats = async (req: FastifyRequest, reply: FastifyReply) => {
}

export const getStatsByAlias = async (req: FastifyRequest<{ Params: { alias: string } }>, reply: FastifyReply) => { 
}