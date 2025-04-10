import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { friendsTable, friendStatus } from '../db/schema.ts';
import { User, PublicUser, toPublicUser } from './users.ts'

// For reading operations
export type friend = InferSelectModel<typeof friendsTable>;

// For creating new friend relationships
type baseRelation = InferInsertModel<typeof friendsTable>;

type publicRelation = Omit<friend, 'status'> & {
	status: string;
}

export function createRelation(requestUUid: string, recepientUUid: string): baseRelation {
	return {
		reqUUid: requestUUid,
		recUUid: recepientUUid
	}
}

export function toPublicRelation(databaseRelation: friend): publicRelation {
	return {
		...databaseRelation,
		status: (friendStatus[databaseRelation.status].toLowerCase())
	}
}

// type FriendUser = PublicUser & {
// 	friendId: number
// }

// export function toFriendUser(user: User | null | undefined, friendId: number): FriendUser {
// 	const publicUser = toPublicUser(user);
// 	return {
// 		...publicUser,
// 		friendId
// 	};
// }