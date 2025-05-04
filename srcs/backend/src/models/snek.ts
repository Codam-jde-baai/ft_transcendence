import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { snekTable } from '../db/schema.ts';

// InferSelect for reading operations
export type readSnek = InferSelectModel<typeof snekTable>;

export type snekMatchPublic = Omit<readSnek, 'p1_uuid' | 'p2_uuid'> & {
    p2_isGuest: boolean;
}

export function toPublicSnek(snek: readSnek): snekMatchPublic {
    return {
        ...snek,
        p2_isGuest: snek.p2_uuid === null ? true : false
    };
}

// InferInsert for writing operations
export type createSnek = InferInsertModel<typeof snekTable>;