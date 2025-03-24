import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: './src/db/schema.ts',
	out: './drizzle',
	dialect: 'sqlite',
	// driver: 'better-sqlite3',
	dbCredentials: {
		url: './data/data.db'
	}
});