import { int, sqliteTable, text, blob, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";


export enum userStatus {
	OFFLINE = 0,
	ONLINE = 1
}

export enum eLanguage {
	ENGLISH = 'en',
	GERMAN = 'de',
	DUTCH = 'nl',
}

// table with all users
export const usersTable = sqliteTable("users_table", {
	id: int("id").primaryKey({ autoIncrement: true }),
	uuid: text("uuid", { length: 264 }).notNull().unique(),
	username: text("username", { length: 264 }).notNull().unique(),
	password: text("password", { length: 264 }).notNull(),
	alias: text("alias", { length: 264 }).notNull().unique(),
	profile_pic: blob("profile_pic"),
	language: text("language", { length: 264 }).$type<eLanguage>().default(eLanguage.ENGLISH),
	status: int("status").$type<userStatus>().default(0),
	win: int("wins").default(0),
	loss: int("loss").default(0)
});

export enum matchStatus {
	COMPLETED = 0,
	INTERRUPTED = 1
}

export enum eWinner {
	NOWINNER = 0,
	PLAYER1 = 1,
	PLAYER2 = 2
}

// table with all matches
export const matchesTable = sqliteTable("matches", {
	id: int("id").primaryKey({ autoIncrement: true }),
	uuid: text("uuid", { length: 264 }).notNull().unique(),
	p1Alias: text("p1Alias", { length: 264 }).notNull(),
	p2Alias: text("p2Alias", { length: 264 }).notNull(),
	p1_id: text("p1_id", { length: 264 }).references(() => usersTable.uuid),
	p2_id: text("p2_id", { length: 264 }).references(() => usersTable.uuid),
	status: int("status").$type<matchStatus>().notNull(),
	winner_id: int("winner").$type<eWinner>().default(eWinner.NOWINNER),
	start_time: text("start_time", { length: 264 }).default(sql`(current_timestamp)`),
	end_time: text("end_time", { length: 264 }).default(sql`(current_timestamp)`),
	duration: int("duration").default(0)
});

export enum friendStatus {
	PENDING = 0,
	ACCEPTED = 1
}

// friends-relations table
export const friendsTable = sqliteTable("friends", {
	id: int("id").primaryKey({ autoIncrement: true }),
	reqUUid: text("requester", { length: 264 }).references(() => usersTable.uuid).notNull(),
	recUUid: text("recipient", { length: 264 }).references(() => usersTable.uuid).notNull(),
	status: int("status").$type<friendStatus>().default(friendStatus.PENDING).notNull()
});

// optional blocked users table 
/**
if a new relation gets blocked -> relation gets removed from friends table
if a blocked user sends a friendRequest, the friendRequest exists but is filtered out for the blockStarter/blockker

 */