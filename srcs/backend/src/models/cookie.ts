import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { sessionIdTable } from '../db/schema.ts';

export type sessionId = InferSelectModel<typeof sessionIdTable>;
