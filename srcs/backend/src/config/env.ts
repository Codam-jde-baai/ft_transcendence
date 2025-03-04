import path from "node:path";
import { fileURLToPath } from "url";
import envSchema from "env-schema";

// variables set to be used in .js files, can be imported
const schema = {
	type: "object",
	required: ["PORT", "LOG_LEVEL", "API_USER_KEY", "API_POST_KEY"],
	properties: {
		PORT: {
			type: "number",
			default: process.env.PORT,
		},
		LOG_LEVEL: {
			type: "string",
			default: process.env.LOG_LEVEL,
		}, // can add DB file
		NODE_ENV: {
			type: "string",
			default: "development",
			enum: ["development", "testing", "production", "staging"],
		},
		USER_API: {
			type: "string",
			default: process.env.API_USER_KEY
		},
		POST_API: {
			type: "string",
			default: process.env.API_POST_KEY
		}
	},
};

// points to the .env file set from the host system by docker-compose
const config = envSchema({
	schema: schema,
	dotenv: {
		path: path.join(path.dirname(fileURLToPath(import.meta.url)), "../../.env"),
	},
});

const envConfig = {
	port: Number(config.PORT),
	logLevel: config.LOG_LEVEL,
	nodeEnv: config.NODE_ENV,
	user_api: config.USER_API,
	post_api: config.POST_API

	// can add DB_file
};

export default envConfig;