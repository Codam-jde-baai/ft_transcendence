// controllers - matches.ts
import { FastifyReply, FastifyRequest } from 'fastify';
import Matches from '../models/matches.ts';
import Users from '../models/users.ts';

export const getUserMatches = (request: FastifyRequest, reply: FastifyReply) => {
	const { id } = request.params as { id: string };
	const userId = Number(id);
	const user = Users.find((user) => user.id === userId);

	if (!user) {
		reply.code(404).send({ error: 'User not found' });
		return;
	}

	// Find all matches where the user is player1 or player2
	const userMatches = Matches.filter(
		match => match.player1Id === userId || match.player2Id === userId
	);

	// Enhance match data with player info
	const enhancedMatches = userMatches.map(match => {
		const player1 = Users.find(user => user.id === match.player1Id);
		const player2 = Users.find(user => user.id === match.player2Id);
		const winner = match.winnerId ? Users.find(user => user.id === match.winnerId) : null;

		return {
			...match,
			player1Alias: player1?.alias || 'Unknown',
			player2Alias: player2?.alias || 'Unknown',
			winnerAlias: winner?.alias || null,
			isWinner: match.winnerId === userId
		};
	});

	reply.send(enhancedMatches);
};

export const getAllMatches = (request: FastifyRequest, reply: FastifyReply) => {
	// Enhance match data with player info
	const enhancedMatches = Matches.map(match => {
		const player1 = Users.find(user => user.id === match.player1Id);
		const player2 = Users.find(user => user.id === match.player2Id);
		const winner = match.winnerId ? Users.find(user => user.id === match.winnerId) : null;

		return {
			...match,
			player1Alias: player1?.alias || 'Unknown',
			player2Alias: player2?.alias || 'Unknown',
			winnerAlias: winner?.alias || null
		};
	});

	reply.send(enhancedMatches);
};

export const getMatchById = (request: FastifyRequest, reply: FastifyReply) => {
	const { id } = request.params as { id: string };
	const match = Matches.find((match) => match.id === Number(id));

	if (!match) {
		reply.code(404).send({ error: 'Match not found' });
		return;
	}

	const player1 = Users.find(user => user.id === match.player1Id);
	const player2 = Users.find(user => user.id === match.player2Id);
	const winner = match.winnerId ? Users.find(user => user.id === match.winnerId) : null;

	const enhancedMatch = {
		...match,
		player1Alias: player1?.alias || 'Unknown',
		player2Alias: player2?.alias || 'Unknown',
		winnerAlias: winner?.alias || null
	};

	reply.send(enhancedMatch);
};



