import { uuid } from "drizzle-orm/gel-core";

export const errorResponseSchema = {
	type: 'object',
	properties: {
		error: { type: 'string' }
	}
};

// Security schema for swagger
export const securitySchemes = {
	apiKey: {
		type: 'http',
		scheme: 'bearer'
	}
};

const loginProperties = {
	username: { type: 'string', minLength: 3 },
	password: { type: 'string', minLength: 6 }
};

const profilePicProperties = {
	data: { type: ['string', 'null'] },
	mimeType: { type: ['string', 'null'] }
};

const userProperties = {
	id: { type: 'number' },
	uuid: { type: 'string' },
	username: { type: 'string' },
	alias: { type: 'string' },
	profile_pic: {
		type: 'object',
		properties: profilePicProperties
	},
	status: { type: 'number' },
	language: { type: 'string' },
	win: { type: 'number' },
	loss: { type: 'number' }
};

export const publicUserProperties = {
	alias: { type: 'string' },
	profile_pic: {
		type: 'object',
		properties: profilePicProperties
	},
	win: { type: 'number' },
	loss: { type: 'number' }
};

export const imageOptions = {
	schema: {
		security: [{ apiKey: [] }],
		summary: 'Get user profile picture by UUID',
		tags: ['users'],
		response: {
			200: {
				type: 'object',
				properties: profilePicProperties
			},
			402: errorResponseSchema,
			403: errorResponseSchema,
			404: {
				type: 'object',
				properties: {
					error: {
						type: 'string',
						description: 'Error message if image not found'
					}
				}
			},
			500: errorResponseSchema
		}
	}
};

export const imageOptionsByAlias = {
	schema: {
		security: [{ apiKey: [] }],
		summary: 'Get user profile picture by alias',
		tags: ['users'],
		params: {
			type: 'object',
			required: ['alias'],
			properties: {
				alias: { type: 'string' }
			}
		},
		response: {
			200: {
				type: 'object',
				properties: profilePicProperties
			},
			402: errorResponseSchema,
			403: errorResponseSchema,
			404: {
				type: 'object',
				properties: {
					error: {
						type: 'string',
						description: 'Error message if image not found'
					}
				}
			},
			500: errorResponseSchema
		}
	}
};

// Schema for GET user response
export const getUserOptions = {
	schema: {
		security: [{ apiKey: [] }],
		summary: 'Get user by UUID',
		tags: ['users'],
		response: {
			200: {
				type: 'object',
				properties: userProperties
			},
			402: errorResponseSchema,
			403: errorResponseSchema,
			404: errorResponseSchema,
			500: errorResponseSchema
		}
	}
};

export const getUserAliasOptions = {
	schema: {
		security: [{ apiKey: [] }],
		summary: 'Get user by alias',
		tags: ['users'],
		params: {
			type: 'object',
			required: ['alias'],
			properties: {
				alias: { type: 'string' }
			}
		},
		response: {
			200: {
				type: 'object',
				properties: userProperties
			},
			402: errorResponseSchema,
			403: errorResponseSchema,
			404: errorResponseSchema,
			500: errorResponseSchema
		}
	}
};

export const getUsersOptions = {
	schema: {
		security: [{ apiKey: [] }],
		summary: 'Get all users',
		tags: ['users'],
		response: {
			200: {
				type: 'array',
				items: {
					type: 'object',
					properties: userProperties
				}
			},
			402: errorResponseSchema,
			403: errorResponseSchema,
			404: errorResponseSchema,
			500: errorResponseSchema
		}
	}
};

export const getPublicUsersOptions = {
	schema: {
		security: [{ apiKey: [] }],
		summary: 'Gets all users, data limited for public use',
		tags: ['users'],
		response: {
			200: {
				type: 'array',
				items: {
					type: 'object',
					properties: publicUserProperties
				}
			},
			402: errorResponseSchema,
			403: errorResponseSchema,
			404: errorResponseSchema,
			500: errorResponseSchema
		}
	}
};

// Schema for creating a new user (JSON)
export const createUserOptions = {
	schema: {
		security: [{ apiKey: [] }],
		summary: 'Creates a new user in the database',
		tags: ['users'],
		consumes: ['application/json'],
		body: {
			type: 'object',
			required: ['username', 'alias', 'password'],
			properties: {
				...loginProperties,
				alias: { type: 'string', minLength: 3 },
				language: { type: 'string' },
				status: { type: 'number' }
			}
		},
		response: {
			201: {
				type: 'object',
				properties: userProperties
			},
			400: errorResponseSchema,
			402: errorResponseSchema,
			403: errorResponseSchema,
			500: errorResponseSchema
		}
	}
};

// Schema for updating profile picture (multipart/form-data)
export const updateProfilePicOptions = {
	schema: {
		security: [{ apiKey: [] }],
		tags: ['users'],
		summary: 'Upload user profile picture',
		consumes: ['multipart/form-data']
	},
	response: {
		200: {
			type: 'object',
			properties: userProperties
		},
		400: errorResponseSchema,
		402: errorResponseSchema,
		403: errorResponseSchema,
		404: errorResponseSchema,
		500: errorResponseSchema
	}
};

export const loginUserOptions = {
	schema: {
		security: [{ apiKey: [] }],
		summary: 'Logs a user in',
		tags: ['users'],
		consumes: ['application/json'],
		body: {
			type: 'object',
			required: ['username', 'password'],
			properties: loginProperties
		},
		response: {
			200: {
				type: 'object',
				properties: userProperties
			},
			400: errorResponseSchema,
			401: errorResponseSchema,
			402: errorResponseSchema,
			403: errorResponseSchema,
			500: errorResponseSchema
		}
	}
};

export const logoutUserOptions = {
	schema: {
		security: [{ apiKey: [] }],
		summary: 'Logs a user out',
		tags: ['users'],
		consumes: ['application/json'],
		response: {
			200: {},
			402: errorResponseSchema,
			403: errorResponseSchema,
			500: errorResponseSchema
		}
	}
};

export const loginGameUserOptions = {
	schema: {
		security: [{ apiKey: [] }],
		summary: 'Logs a user in',
		tags: ['users'],
		consumes: ['application/json'],
		body: {
			type: 'object',
			required: ['username', 'password'],
			properties: loginProperties
		},
		response: {
			200: {
				type: 'object',
				properties: {
					alias: { type: 'string' },
					uuid: { type: 'string' }
				}
			},
			400: errorResponseSchema,
			401: errorResponseSchema,
			402: errorResponseSchema,
			403: errorResponseSchema,
			500: errorResponseSchema
		}
	}
};

export const updateUserStatusOptions = {
	schema: {
		security: [{ apiKey: [] }],
		summary: 'Updates the user status',
		tags: ['users'],
		params: {
			type: 'object',
			properties: {
				uuid: {
					type: 'string',
					description: 'user uuid'
				}
			}
		},
		response: {
			200: {},
			402: errorResponseSchema,
			403: errorResponseSchema,
			404: errorResponseSchema,
			500: errorResponseSchema
		}
	}
};

export const updateUserProperties = {
	schema: {
		security: [{ apiKey: [] }],
		summary: 'Updates only the user data that is sent',
		tags: ['users'],
		consumes: ['application/json'],
		body: {
			type: 'object',
			required: ['current_password'],
			properties: {
				currrent_password: { type: 'string', minLength: 6 },
				password: { type: 'string', minLength: 6 },
				username: { type: 'string', minLength: 3 },
				alias: { type: 'string', minLength: 3 },
				language: { type: 'string' }
			}
		},
		response: {
			200: userProperties,
			400: errorResponseSchema,
			401: errorResponseSchema,
			402: errorResponseSchema,
			403: errorResponseSchema,
			404: errorResponseSchema,
			500: errorResponseSchema
		}
	}
};

export const deleteUserOptions = {
	schema: {
		security: [{ apiKey: [] }],
		summary: 'deletes a user',
		tags: ['users'],
		consumes: ['application/json'],
		body: {
			type: 'object',
			required: ['current_password'],
			properties: {
				current_password: { type: 'string', minLength: 6 }
			}
		}, response: {
			204: {
				type: 'null',
				description: 'User successfully deleted'
			},
			401: errorResponseSchema,
			402: errorResponseSchema,
			403: errorResponseSchema,
			404: errorResponseSchema,
			500: errorResponseSchema
		}
	}
};

export const deleteProfilePicOptions = {
	schema: {
		security: [{ apiKey: [] }],
		summary: 'set profilePic to NULL in database',
		tags: ['users'],
		response: {
			204: {
				type: 'null',
				description: 'Profile picture successfully deleted'
			},
			402: errorResponseSchema,
			403: errorResponseSchema,
			404: errorResponseSchema,
			500: errorResponseSchema
		}
	}
};

