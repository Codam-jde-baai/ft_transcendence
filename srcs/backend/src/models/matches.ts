import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { matchesTable } from '../db/schema.ts';

// InferSelect for reading operations
export type match = InferSelectModel<typeof matchesTable>;

// InferInsert for writing operations
export type createMatch = InferInsertModel<typeof matchesTable> & {
	p1_uuid: string | null;
	p2_uuid: string | null;
	p1_alias: string;
	p2_alias: string;
	winner_alias: string;
	status: number;
};

export interface PlayerStats {
	alias: string;
	wins: number;
	losses: number;
	win_rate: number;
}