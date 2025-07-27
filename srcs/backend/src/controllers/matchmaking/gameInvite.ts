import { FastifyReply, FastifyRequest } from 'fastify';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import Database from 'better-sqlite3';
import { usersTable } from '../../db/schema.ts';
import { createNotificationMessage } from '../websocket/messageTypes.ts';
import { sendMessageToUser } from '../websocket/userStatus.ts';

export const sendGamePoke = async (
    request: FastifyRequest<{ Body: { alias: string; gameType: 'pong' | 'snake' } }>, 
    reply: FastifyReply
) => {
    let sqlite = null;
    try {
        const { alias, gameType } = request.body;
        const senderUuid = request.session.get('uuid') as string;

        // Validate game type
        if (!['pong', 'snake'].includes(gameType)) {
            return reply.code(400).send({ error: 'Invalid game type. Must be "pong" or "snake"' });
        }

        sqlite = new Database('./data/data.db', { verbose: console.log });
        const db = drizzle(sqlite);

        // Get sender user information
        const senderUser = await db.select().from(usersTable).where(eq(usersTable.uuid, senderUuid)).limit(1);
        if (senderUser.length === 0) {
            return reply.code(400).send({ error: 'Sender user does not exist' });
        }

        // Check if target user exists
        const targetUser = await db.select().from(usersTable).where(eq(usersTable.alias, alias)).limit(1);
        if (targetUser.length === 0) {
            return reply.code(404).send({ error: 'Target user does not exist' });
        }

        // Prevent self-poke
        if (senderUser[0].alias === alias) {
            return reply.code(400).send({ error: 'Cannot send game poke to yourself' });
        }

        // Send notification via WebSocket to target user
        const notificationMessage = createNotificationMessage(
            senderUser[0].alias,
            `${senderUser[0].alias} wants to play ${gameType} with you!`
        );


        sendMessageToUser(targetUser[0].uuid, createNotificationMessage(senderUser[0].alias, "poked to play"));
        console.log(`Sending game poke from ${senderUser[0].alias} to ${alias} for ${gameType}`);
        return reply.code(200).send({
            success: true,
            message: `Game poke sent to ${alias} for ${gameType}`
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'sendGamePoke Error';
        return reply.status(500).send({ error: errorMessage });
    } finally {
        if (sqlite) sqlite.close();
    }
};