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
});

export enum matchStatus {
	INTERRUPTED = 0,
	P1_WINNER = 1,
	P2_WINNER = 2,
}

export enum eWinner {
	NOWINNER = 0,
	PLAYER1 = 1,
	PLAYER2 = 2
}

export const matchesTable = sqliteTable("matches", {
	id: int("id").primaryKey({ autoIncrement: true }),
	p1_uuid: text("p1_uuid", { length: 264 }).references(() => usersTable.uuid, { onDelete: "set null" }),
	p2_uuid: text("p2_uuid", { length: 264 }).references(() => usersTable.uuid, { onDelete: "set null" }),
	p1_alias: text("p1_alias", { length: 264 }).notNull(),
	p2_alias: text("p2_alias", { length: 264 }).notNull(),
	winner_alias: text("winner_alias", { length: 264 }),
	status: int("status").$type<matchStatus>().notNull(),
	date: text("date", { length: 264 }).default(sql`(date('now'))`)
});

export enum friendStatus {
	PENDING = 0,
	ACCEPTED = 1
}

export const friendsTable = sqliteTable("friends", {
	id: int("id").primaryKey({ autoIncrement: true }),
	reqUUid: text("requester", { length: 264 }).references(() => usersTable.uuid, { onDelete: "cascade" }).notNull(),
	recUUid: text("recipient", { length: 264 }).references(() => usersTable.uuid, { onDelete: "cascade" }).notNull(),
	status: int("status").$type<friendStatus>().default(friendStatus.PENDING).notNull()
});

export const snekTable = sqliteTable("snek", {
	id: int("id").primaryKey({ autoIncrement: true }),
	p1_alias: text("p1_alias", { length: 264 }).notNull(),
	p2_alias: text("p2_alias", { length: 264 }).notNull(),
	p1_uuid: text("p1_uuid", { length: 264 }).references(() => usersTable.uuid, { onDelete: "set null" }),
	p2_uuid: text("p2_uuid", { length: 264 }).references(() => usersTable.uuid, { onDelete: "set null" }),
	winner_id: int("winner").$type<eWinner>().default(eWinner.NOWINNER),
	p1_score: int("p1_score").default(0),
	p2_score: int("p2_score").default(0)
});
