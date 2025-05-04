import { FastifyReply, FastifyRequest } from 'fastify';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { or, eq, and } from 'drizzle-orm';
import Database from 'better-sqlite3';

