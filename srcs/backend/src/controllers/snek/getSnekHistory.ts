import { FastifyReply, FastifyRequest } from 'fastify';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { eq, or, and, inArray } from 'drizzle-orm';

import { snekTable, usersTable } from '../../db/schema.ts';
import { readSnek, toPublicSnek } from '../../models/snek.ts';
import { User } from '../../models/users.ts';

export const getAllHistory = async (req: FastifyRequest, reply: FastifyReply) => {
    let sqlite = null;
    try {
        sqlite = new Database('./data/data.db');
        const db = drizzle(sqlite);

        const matches: readSnek[] = await db.select().from(snekTable);

		const aliasRecords = await db.select({
			uuid: usersTable.uuid,
			alias: usersTable.alias
		}).from(usersTable);

		// Create a lookup map: { uuid: alias }
		const aliasMap = Object.fromEntries(
			aliasRecords.map(user => [user.uuid, user.alias])
		);
        const updatedMatches = matches.map(match => {
            const p1Alias = aliasMap[match.p1_uuid] || match.p1_alias;
			console.log("p1Alias: ", p1Alias);
			const p2Alias = aliasMap[match.p2_uuid] || match.p2_alias;
            return toPublicSnek({
                ...match,
                p1_alias: p1Alias,
                p2_alias: p2Alias
            });
        });

        updatedMatches.sort((a, b) => b.id - a.id);
        return reply.send(updatedMatches);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'getAllSnek Error';
        return reply.status(500).send({ error: errorMessage });
    } finally {
        if (sqlite) sqlite.close();
    }
};

export const getMyHistory = async (req: FastifyRequest, reply: FastifyReply) => {
	let sqlite = null;
	try {
		const uuid = req.session.get('uuid') as string;
		sqlite = new Database('./data/data.db' )
		const db = drizzle(sqlite);
		const matches = await db.select().from(snekTable).where(eq(snekTable.p1_uuid, uuid));
		if (matches.length === 0) {
			return reply.code(200).send(matches.map(toPublicSnek));
		}

		const aliasRecords = await db.select({
			uuid: usersTable.uuid,
			alias: usersTable.alias
		}).from(usersTable);

		// Create a lookup map: { uuid: alias }
		const aliasMap = Object.fromEntries(
			aliasRecords.map(user => [user.uuid, user.alias])
		);
        const updatedMatches = matches.map(match => {
            const p1Alias = aliasMap[match.p1_uuid] || match.p1_alias;
			console.log("p1Alias: ", p1Alias);
			const p2Alias = aliasMap[match.p2_uuid] || match.p2_alias;
            return toPublicSnek({
                ...match,
                p1_alias: p1Alias,
                p2_alias: p2Alias
            });
        });

		updatedMatches.sort((a, b) => b.id - a.id);
		return reply.send(updatedMatches.map(toPublicSnek));
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
		sqlite = new Database('./data/data.db' )
		const db = drizzle(sqlite);
		const snek = await db.select().from(snekTable).where(or(
			eq(snekTable.p1_alias, alias),
			eq(snekTable.p2_alias, alias)
		));
		if (snek.length === 0) {
			return reply.code(200).send(snek.map(toPublicSnek));
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
		sqlite = new Database('./data/data.db' )
		const db = drizzle(sqlite);
		const snek = await db.select().from(snekTable).where(or(
			and(eq(snekTable.p1_alias, p1_alias), eq(snekTable.p2_alias, p2_alias)),
			and(eq(snekTable.p1_alias, p2_alias), eq(snekTable.p2_alias, p1_alias))
		));
		if (snek.length === 0) {
			return reply.code(200).send(snek.map(toPublicSnek));
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