import { FastifyReply, FastifyRequest } from 'fastify';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { or, eq, and, ne, desc } from 'drizzle-orm';
import Database from 'better-sqlite3';
import { friendsTable, usersTable, matchesTable, snekTable, friendStatus, matchStatus, eWinner } from '../../db/schema.ts';
import { createMatchmakingUser, MatchmakingTable, MatchmakingUser } from '../../models/matchMaking.ts';

export const getMatchmakingData = async (request: FastifyRequest, reply: FastifyReply) => {
	let sqlite = null;
	try {
		const userUuid = request.session.get('uuid') as string;

		sqlite = new Database('./data/data.db', { verbose: console.log });
		const db = drizzle(sqlite);

		// Get current user
		const currentUser = await db.select().from(usersTable).where(eq(usersTable.uuid, userUuid)).limit(1);
		if (currentUser.length === 0) {
			return reply.code(400).send({ error: 'User does not exist' });
		}

		const currentUserAlias = currentUser[0].alias;

		// Get user's friends
		const friendRelations = await db.select().from(friendsTable).where(
			and(
				or(
					eq(friendsTable.reqUUid, userUuid),
					eq(friendsTable.recUUid, userUuid)
				),
				eq(friendsTable.status, friendStatus.ACCEPTED)
			)
		);

		const friendUuids = friendRelations.map(relation =>
			relation.reqUUid === userUuid ? relation.recUUid : relation.reqUUid
		);

		// Get all users except current user
		const allUsers = await db.select().from(usersTable).where(ne(usersTable.uuid, userUuid));

		// Calculate game statistics for each user
		const usersWithStats: MatchmakingUser[] = [];

		for (const user of allUsers) {
			const isFriend = friendUuids.includes(user.uuid);

			// Get Pong stats
			const pongMatches = await db.select().from(matchesTable).where(
				and(
					or(
						eq(matchesTable.p1_uuid, user.uuid),
						eq(matchesTable.p2_uuid, user.uuid)
					),
					ne(matchesTable.status, matchStatus.INTERRUPTED)
				)
			);

			// Get Snake stats
			const snakeMatches = await db.select().from(snekTable).where(
				and(
					or(
						eq(snekTable.p1_uuid, user.uuid),
						eq(snekTable.p2_uuid, user.uuid)
					),
					ne(snekTable.winner_id, eWinner.NOWINNER)
				)
			);

			// Calculate Pong statistics
			const pongWins = pongMatches.filter(match =>
				(match.p1_uuid === user.uuid && match.status === matchStatus.P1_WINNER) ||
				(match.p2_uuid === user.uuid && match.status === matchStatus.P2_WINNER)
			).length;
			const pongLosses = pongMatches.length - pongWins;

			// Get last Pong match against current user
			const lastPongMatch = await db.select().from(matchesTable).where(
				and(
					or(
						and(eq(matchesTable.p1_uuid, userUuid), eq(matchesTable.p2_uuid, user.uuid)),
						and(eq(matchesTable.p1_uuid, user.uuid), eq(matchesTable.p2_uuid, userUuid))
					),
					ne(matchesTable.status, matchStatus.INTERRUPTED)
				)
			).orderBy(desc(matchesTable.id)).limit(1);

			let pongLastScore = { self: 0, opponent: 0 };
			if (lastPongMatch.length > 0) {
				const match = lastPongMatch[0];
				// FIXED: Calculate score from current user's perspective
				if (match.p1_uuid === userUuid) {
					// Current user was player 1, other user was player 2
					pongLastScore = {
						self: match.status === matchStatus.P1_WINNER ? 1 : 0,
						opponent: match.status === matchStatus.P2_WINNER ? 1 : 0
					};
				} else {
					// Current user was player 2, other user was player 1
					pongLastScore = {
						self: match.status === matchStatus.P2_WINNER ? 1 : 0,
						opponent: match.status === matchStatus.P1_WINNER ? 1 : 0
					};
				}
			}

			// Calculate Snake statistics
			const snakeWins = snakeMatches.filter(match =>
				(match.p1_uuid === user.uuid && match.winner_id === eWinner.PLAYER1) ||
				(match.p2_uuid === user.uuid && match.winner_id === eWinner.PLAYER2)
			).length;
			const snakeLosses = snakeMatches.length - snakeWins;

			// Get last Snake match against current user
			const lastSnakeMatch = await db.select().from(snekTable).where(
				and(
					or(
						and(eq(snekTable.p1_uuid, userUuid), eq(snekTable.p2_uuid, user.uuid)),
						and(eq(snekTable.p1_uuid, user.uuid), eq(snekTable.p2_uuid, userUuid))
					),
					ne(snekTable.winner_id, eWinner.NOWINNER)
				)
			).orderBy(desc(snekTable.id)).limit(1);

			let snakeLastScore = { self: 0, opponent: 0 };
			if (lastSnakeMatch.length > 0) {
				const match = lastSnakeMatch[0];
				if (match.p1_uuid === userUuid) {
					snakeLastScore = {
						self: match.p1_score || 0,
						opponent: match.p2_score || 0
					};
				} else {
					snakeLastScore = {
						self: match.p2_score || 0,
						opponent: match.p1_score || 0
					};
				}
			}

			// Create user objects for both games
			const pongUser = createMatchmakingUser(user, isFriend, {
				wins: pongWins,
				losses: pongLosses,
				totalGames: pongMatches.length,
				lastScore: pongLastScore
			});

			const snakeUser = createMatchmakingUser(user, isFriend, {
				wins: snakeWins,
				losses: snakeLosses,
				totalGames: snakeMatches.length,
				lastScore: snakeLastScore
			});

			usersWithStats.push(pongUser, snakeUser);
		}

		// Separate users by game type
		const pongUsers = usersWithStats.filter((_, index) => index % 2 === 0);
		const snakeUsers = usersWithStats.filter((_, index) => index % 2 === 1);

		// Get current user's game statistics for comparison
		const currentUserPongMatches = await db.select().from(matchesTable).where(
			and(
				or(
					eq(matchesTable.p1_uuid, userUuid),
					eq(matchesTable.p2_uuid, userUuid)
				),
				ne(matchesTable.status, matchStatus.INTERRUPTED)
			)
		);
		const currentUserSnakeMatches = await db.select().from(snekTable).where(
			and(
				or(
					eq(snekTable.p1_uuid, userUuid),
					eq(snekTable.p2_uuid, userUuid)
				),
				ne(snekTable.winner_id, eWinner.NOWINNER)
			)
		);

		const currentUserPongWins = currentUserPongMatches.filter(match =>
			(match.p1_uuid === userUuid && match.status === matchStatus.P1_WINNER) ||
			(match.p2_uuid === userUuid && match.status === matchStatus.P2_WINNER)
		).length;

		const currentUserSnakeWins = currentUserSnakeMatches.filter(match =>
			(match.p1_uuid === userUuid && match.winner_id === eWinner.PLAYER1) ||
			(match.p2_uuid === userUuid && match.winner_id === eWinner.PLAYER2)
		).length;

		const currentUserStats = {
			pongWins: currentUserPongWins,
			pongLosses: currentUserPongMatches.length - currentUserPongWins,
			snakeWins: currentUserSnakeWins,
			snakeLosses: currentUserSnakeMatches.length - currentUserSnakeWins
		};

		// Helper function to categorize users
		const categorizeUsers = (users: MatchmakingUser[], currentUserStats: { pongWins: number, pongLosses: number, snakeWins: number, snakeLosses: number }, gameType: 'pong' | 'snake') => {
			const recentLoss: MatchmakingUser[] = [];
			const equalSkill: MatchmakingUser[] = [];
			const equalGameAmount: MatchmakingUser[] = [];

			// Calculate current user's winrate for the specific game
			let currentUserWinrate = 0;
			let currentUserTotalGames = 0;

			if (gameType === 'pong') {
				currentUserTotalGames = currentUserStats.pongWins + currentUserStats.pongLosses;
				currentUserWinrate = currentUserTotalGames > 0 ? currentUserStats.pongWins / currentUserTotalGames : 0;
			} else {
				currentUserTotalGames = currentUserStats.snakeWins + currentUserStats.snakeLosses;
				currentUserWinrate = currentUserTotalGames > 0 ? currentUserStats.snakeWins / currentUserTotalGames : 0;
			}

			users.forEach(user => {
				// FIXED: Check if CURRENT USER has recent losses against this user
				// (meaning current user scored less than the opponent)
				if (user.last_score.self < user.last_score.opponent) {
					recentLoss.push(user);
				}
				// Check for similar skill level (within 20% winrate difference)
				else if (Math.abs(user.winrate - currentUserWinrate) <= 0.2) {
					equalSkill.push(user);
				}
				// Check for similar game experience (within 5 games difference)
				else if (Math.abs(user.total_games - currentUserTotalGames) <= 5) {
					equalGameAmount.push(user);
				}
				// Default to equalGameAmount if no other category fits
				else {
					equalGameAmount.push(user);
				}
			});

			return { recentLoss, equalSkill, equalGameAmount };
		};

		// Categorize users for both games
		const pongCategories = categorizeUsers(pongUsers, currentUserStats, 'pong');
		const snakeCategories = categorizeUsers(snakeUsers, currentUserStats, 'snake');

		const response: MatchmakingTable = {
			pong: pongCategories,
			snake: snakeCategories
		};

		return reply.code(200).send(response);

	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'getMatchmakingData Error';
		return reply.status(500).send({ error: errorMessage });
	} finally {
		if (sqlite) sqlite.close();
	}
};