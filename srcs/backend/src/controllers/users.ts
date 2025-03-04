// controllers - users.ts
import { FastifyReply, FastifyRequest } from 'fastify';
import { Users, addUserBody } from '../models/users.ts';

export const getAllUsers = (request: FastifyRequest, reply: FastifyReply) => {
	reply.send(Users);
};

export const getUserById = (request: FastifyRequest, reply: FastifyReply) => {
	const { id } = request.params as { id: string };
	const user = Users.find((user) => user.id === Number(id));

	if (!user) {
		reply.code(404).send({ error: 'User not found' });
		return;
	}

	reply.send(user);
};

export const getUserByAlias = (request: FastifyRequest, reply: FastifyReply) => {
	const { alias } = request.params as { alias: string };
	const user = Users.find((user) => user.alias.toLowerCase() === alias.toLowerCase());

	if (!user) {
		reply.code(404).send({ error: 'User not found' });
		return;
	}

	reply.send(user);
};

export const getUserStats = (request: FastifyRequest, reply: FastifyReply) => {
	const { id } = request.params as { id: string };
	const user = Users.find((user) => user.id === Number(id));

	if (!user) {
		reply.code(404).send({ error: 'User not found' });
		return;
	}

	const winRate = user.wins + user.losses > 0 ? (user.wins / (user.wins + user.losses) * 100).toFixed(1) : '0.0';

	reply.send({
		...user,
		totalGames: user.wins + user.losses,
		winRate: `${winRate}%`
	});
};

export const getLeaderboard = (request: FastifyRequest, reply: FastifyReply) => {
	// Create leaderboard based on win ratio
	const leaderboard = Users.map(user => {
		const totalGames = user.wins + user.losses;
		const winRate = totalGames > 0 ? (user.wins / totalGames) : 0;

		return {
			alias: user.alias,
			wins: user.wins,
			losses: user.losses,
			totalGames,
			winRate
		};
	})
		.sort((a, b) => {
			if (b.winRate !== a.winRate) {
				return b.winRate - a.winRate;
			}
			return b.totalGames - a.totalGames;
		})
		.map((entry, index) => ({
			...entry,
			rank: index + 1,
			winRate: `${(entry.winRate * 100).toFixed(1)}%`
		}));

	reply.send(leaderboard);
};

// POSTS
export const AddUser = (request: FastifyRequest, reply: FastifyReply) => {
	const body = request.body as addUserBody;

	// Check if alias is already taken
	const existingUser = Users.find(user =>
		user.alias.toLowerCase() === body.alias.toLowerCase() ||
		user.username.toLowerCase() === body.username.toLowerCase()
	);

	if (existingUser) {
		reply.code(400).send({
			error: 'Username or alias already taken'
		});
		return;
	}

	// Hash the password
	// const saltRounds = 10;
	// const hashedPassword = await bcrypt.hash(body.password, saltRounds);

	// Create new user
	const newUser = {
		id: Users.length + 1,
		uuid: `user-uuid-${Users.length + 1}`, // In production, use proper UUID generation
		username: body.username,
		alias: body.alias,
		password: body.password,
		profilePic: body.profilePic || null,
		wins: 0,
		losses: 0
	};

	Users.push(newUser);

	// Return user data without password
	const { password, ...userWithoutPassword } = newUser;
	reply.code(201).send(userWithoutPassword);
};