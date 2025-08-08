import { FastifyReply, FastifyRequest } from 'fastify';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { eq, or, inArray } from 'drizzle-orm';

import { snekTable, usersTable } from '../../db/schema.ts';
import { PlayerStats, MatchData, calculatePlayerStats } from '../../models/snek.ts';


export const getTopStats = async (req: FastifyRequest, reply: FastifyReply) => {
    let sqlite = null;
    try {
        sqlite = new Database('./data/data.db');
        const db = drizzle(sqlite);

        // Get all match data
        const snek = await db.select({
            p1_uuid: snekTable.p1_uuid,
            p2_uuid: snekTable.p2_uuid,
            winner_id: snekTable.winner_id,
            p1_score: snekTable.p1_score,
            p2_score: snekTable.p2_score
        }).from(snekTable) as MatchData[];

        if (snek.length === 0) {
            return reply.code(404).send({ error: "nothing to see here" });
        }

        // Calculate top players (with UUIDs)
        const topPlayers: PlayerStats[] = calculatePlayerStats(snek);

        // Extract UUIDs to look up aliases
        const uuids = topPlayers.map(p => p.uuid);

        // Get aliases for these UUIDs
        const aliasRecords = await db.select({
            uuid: usersTable.uuid,
            alias: usersTable.alias
        }).from(usersTable)
          .where(inArray(usersTable.uuid, uuids));

        // Create a lookup map: { uuid: alias }
        const aliasMap = Object.fromEntries(
            aliasRecords.map(user => [user.uuid, user.alias])
        );

        // Replace UUIDs with aliases in the response
        const topPlayersWithAliases = topPlayers.map(player => ({
            ...player,
            alias: aliasMap[player.uuid] || "Unknown",
        }));

        return reply.send(topPlayersWithAliases);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'getTopStats Error';
        return reply.status(500).send({ error: errorMessage });
    }
    finally {
        if (sqlite) sqlite.close();
    }
};

export const getMyStats = async (req: FastifyRequest, reply: FastifyReply) => {
	let sqlite = null;
	try {
		const uuid = req.session.get('uuid') as string;
		const alias = req.session.get('alias') as string;
		sqlite = new Database('./data/data.db' )
		const db = drizzle(sqlite);
		const snek = await db.select({
            p1_uuid: snekTable.p1_uuid,
            p2_uuid: snekTable.p2_uuid,
            winner_id: snekTable.winner_id,
            p1_score: snekTable.p1_score,
            p2_score: snekTable.p2_score
		})
			.from(snekTable).where(or(
				eq(snekTable.p1_uuid, uuid),
				eq(snekTable.p2_uuid, uuid))) as MatchData[];
		if (snek.length === 0) {
			const emptyStats = {
				alias: null,
				matches: 0,
				wins: 0,
				losses: 0,
				winrate: 0,
				avg_score: 0,
				highest_score: 0
			}
			return reply.code(200).send(emptyStats);
		}
		const myStats: PlayerStats[] = calculatePlayerStats(snek);
		const returnStats = {
			alias: alias,
			matches: myStats[0].matches,
			wins: myStats[0].wins,
			losses: myStats[0].losses,
			winrate: myStats[0].winrate,
			avg_score: myStats[0].avg_score,
			highest_score: myStats[0].highest_score
		}
		return reply.send(returnStats);
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'getMyStats Error';
		return reply.status(500).send({ error: errorMessage })
	}
	finally {
		if (sqlite) sqlite.close();
	}
}

export const getStatsByAlias = async (req: FastifyRequest<{ Params: { alias: string } }>, reply: FastifyReply) => {
	let sqlite = null;
	try {
		const alias = req.params.alias;
		sqlite = new Database('./data/data.db' )
		const db = drizzle(sqlite);
		const snek = await db.select({
			p1_alias: snekTable.p1_alias,
			p2_alias: snekTable.p2_alias,
			winner_id: snekTable.winner_id,
			p1_score: snekTable.p1_score,
			p2_score: snekTable.p2_score
		})
		.from(snekTable).where(or(
			eq(snekTable.p1_alias, alias),
			eq(snekTable.p2_alias, alias))) as MatchData[];

		if (snek.length === 0) {
			const emptyStats: PlayerStats = {
				alias: alias,
				matches: 0,
				wins: 0,
				losses: 0,
				winrate: 0,
				avg_score: 0,
				highest_score: 0
			}
			return reply.code(200).send(emptyStats);
		}
		const playerStats: PlayerStats[] = calculatePlayerStats(snek);
		return reply.send(playerStats[0]);
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'getStatsByAlias Error';
		return reply.status(500).send({ error: errorMessage })
	}
	finally {
		if (sqlite) sqlite.close();
	}
}