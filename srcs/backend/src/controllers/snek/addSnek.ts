import { FastifyReply, FastifyRequest } from 'fastify';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

import { snekTable } from '../../db/schema.ts';
import { createSnek, readSnek, toPublicSnek } from '../../models/snek.ts';

export const addSnekMatch = async (req: FastifyRequest<{ Body: createSnek}>, reply: FastifyReply) => {
    let sqlite = null;
    try {
        const p1_uuid = req.session.get('uuid') as string;
        const p1_alias = req.session.get('alias') as string;
        const matchData: createSnek = {
            p1_alias: p1_alias,
            p1_uuid: p1_uuid,
            p2_alias: req.body.p2_alias,
            p2_uuid: req.body.p2_uuid,
            winner_id: req.body.winner_id,
            p1_score: req.body.p1_score,
            p2_score: req.body.p2_score,
        };
        sqlite = new Database('./data/data.db', { verbose: console.log })
        const db = drizzle(sqlite);
        const match: readSnek[] = await db.insert(snekTable).values(matchData).returning();
        if (match.length === 0){
            return reply.code(400).send({ error: "bad match Data, couldn't insert" })
        }
        return reply.send(toPublicSnek(match[0]));
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'addSnekMatch Error';
        return reply.status(500).send({ error: errorMessage })
    }
    finally {
        if (sqlite) sqlite.close();
    }
}