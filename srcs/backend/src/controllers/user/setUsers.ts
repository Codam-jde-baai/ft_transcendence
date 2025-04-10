// controllers/setUsers.ts
import { FastifyReply, FastifyRequest } from 'fastify';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import Database from 'better-sqlite3';
// files
import {
	CreateUser,
	hashPassword,
	validateUser,
	validateProfilePic,
	toPublicUser
} from '../../models/users.ts';
import { usersTable, userStatus, eLanguage } from '../../db/schema.ts';

// Create a user with JSON data (no profile pic)
export const addUser = async (request: FastifyRequest<{
	Body: {
		username: string;
		password: string;
		alias: string;
		language?: eLanguage;
		status?: userStatus;
	}
}>,
	reply: FastifyReply) => {
	let sqlite = null;
	try {
		const body = request.body;
		const hashedPassword = await hashPassword(body.password);
		const userData: CreateUser = {
			uuid: crypto.randomUUID(),
			username: body.username,
			alias: body.alias,
			password: hashedPassword,
			language: body.language,
			status: body.status
		};

		validateUser(userData);

		// Add to database
		sqlite = new Database('./data/data.db', { verbose: console.log });
		const db = drizzle(sqlite);
		const createdUser = await db.insert(usersTable).values(userData).returning();

		// Use the helper function to create the public user object
		return reply.code(201).send(toPublicUser(createdUser[0]));
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'addUser error';
		if (error instanceof Error && error.message.startsWith("Validation failed:"))
			reply.status(400).send({ error: errorMessage })
		return reply.status(500).send({ error: errorMessage });
	}
	finally {
		if (sqlite) sqlite.close();
	}
};

// Update profile picture for an existing user
export const updateUserProfilePic = async (
	request: FastifyRequest<{ Params: { uuid: string } }>,
	reply: FastifyReply) => {
	let sqlite = null;
	try {
		//get file and uu id
		const { uuid } = request.params;
		const file = await request.file();
		if (!file) {
			reply.code(400).send({ error: 'No file uploaded' });
			return;
		}

		// validate fill
		const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
		if (!allowedTypes.includes(file.mimetype)) {
			reply.code(400).send({ error: 'File must be a JPEG, PNG, or GIF image' });
			return;
		}
		const profilePic = await file.toBuffer();
		validateProfilePic(profilePic);

		// Update database
		sqlite = new Database('./data/data.db', { verbose: console.log });
		const db = drizzle(sqlite);
		const existingUser = await db.select().from(usersTable).where(eq(usersTable.uuid, uuid));

		// Update the profile picture
		const updatedUser = await db.update(usersTable)
			.set({ profile_pic: profilePic })
			.where(eq(usersTable.uuid, uuid))
			.returning();
		if (updatedUser.length === 0) {
			reply.code(404).send({ error: 'User not found' });
			return;
		}

		return reply.code(200).send(toPublicUser(updatedUser[0]));
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Update profile picture error';
		request.log.error('Profile picture update failed:', error);
		return reply.status(500).send({ error: errorMessage });
	}
	finally {
		if (sqlite) sqlite.close();
	}
};