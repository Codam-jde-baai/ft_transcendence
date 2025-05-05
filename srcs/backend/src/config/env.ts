import { envSchema } from "env-schema";

// variables set to be used in .js files, can be imported
const schema = {
	type: "object",
	required: ["BACKEND_PORT", "LOG_LEVEL", "PUBLIC_KEY", "PRIVATE_KEY", "ADMIN", "PASSWORD"],
	properties: {
		PORT: {
			type: "number",
			default: process.env.BACKEND_PORT,
		},
		LOG_LEVEL: {
			type: "string",
			default: process.env.LOG_LEVEL,
		},
		PUBLIC_KEY: {
			type: "string",
			default: process.env.PUBLIC_KEY
		},
		PRIVATE_KEY: {
			type: "string",
			default: process.env.PRIVATE_KEY
		},
		ADMIN: {
			type: "string",
			default: process.env.ADMIN
		},
		PASSWORD: {
			type: "string",
			default: process.env.PASSWORD
		},
	}
};


const config = envSchema({
	schema: schema,
});

const envConfig = {
	port: Number(config.BACKEND_PORT || 3000),
	logLevel: config.LOG_LEVEL || 'info',
	public_key: config.PUBLIC_KEY || '',
	private_key: config.PRIVATE_KEY || '',
	admin: config.ADMIN || 'admin',
	password: config.PASSWORD || 'PASSWORD'
};

export default envConfig;