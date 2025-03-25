import { userStatus, eLanguage } from '../db/schema.ts';

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

const publicUserProperties = {
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
		params: {
			type: 'object',
			required: ['uuid'],
			properties: {
				uuid: { type: 'string' }
			}
		},
		response: {
			200: {
				type: 'object',
				properties: profilePicProperties
			},
			404: {
				type: 'object',
				properties: {
					error: {
						type: 'string',
						description: 'Error message if image not found'
					}
				}
			}
		}
	}
};

// Schema for GET user response
export const getUserOptions = {
	schema: {
		security: [{ apiKey: [] }],
		summary: 'Get user by UUID',
		tags: ['users'],
		params: {
			type: 'object',
			required: ['uuid'],
			properties: {
				uuid: { type: 'string' }
			}
		},
		response: {
			200: {
				type: 'object',
				properties: userProperties
			},
			403: {
				type: 'object',
				properties: {
					error: { type: 'string' }
				}
			},
			404: {
				type: 'object',
				properties: {
					error: { type: 'string' }
				}
			}
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
			403: {
				type: 'object',
				properties: {
					error: { type: 'string' }
				}
			},
			404: {
				type: 'object',
				properties: {
					error: { type: 'string' }
				}
			}
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
			403: {
				type: 'object',
				properties: {
					error: { type: 'string' }
				}
			},
			404: {
				type: 'object',
				properties: {
					error: { type: 'string' }
				}
			}
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
			400: {
				type: 'object',
				properties: {
					error: { type: 'string' }
				}
			}
		}
	}
};

// Schema for updating profile picture (multipart/form-data)
export const updateProfilePicOptions = {
	schema: {
		security: [{ apiKey: [] }],
		tags: ['users'],
		summary: 'Upload user profile picture',
		consumes: ['multipart/form-data'],
		params: {
			type: 'object',
			required: ['uuid'],
			properties: {
				uuid: { type: 'string' }
			}
		}
	},
	response: {
		200: {
			type: 'object',
			properties: userProperties
		},
		400: {
			type: 'object',
			properties: {
				error: { type: 'string' }
			}
		},
		404: {
			type: 'object',
			properties: {
				error: { type: 'string' }
			}
		}
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
			400: {
				type: 'object',
				properties: {
					error: { type: 'string' }
				}
			},
			401: {
				type: 'object',
				properties: {
					error: { type: 'string' }
				}
			},
			500: {
				type: 'object',
				properties: {
					error: { type: 'string' }
				}
			}
		}
	}
};

export const updatePasswordProperties = {
	schema: {
		security: [{ apiKey: [] }],
		summary: 'Updates the user password',
		tags: ['users'],
		consumes: ['application/json'],
		body: {
			type: 'object',
			required: ['username', 'password', 'newPassword'],
			properties: {
				...loginProperties,
				newPassword: { type: 'string', minLength: 6 }
			}
		},
		response: {
			200: {},
			400: {
				type: 'object',
				properties: {
					error: { type: 'string' }
				}
			},
			401: {
				type: 'object',
				properties: {
					error: { type: 'string' }
				}
			},
			500: {
				type: 'object',
				properties: {
					error: { type: 'string' }
				}
			}
		}
	}
};

export const deleteUserOptions = {
	schema: {
		security: [{ apiKey: [] }],
		summary: 'deletes a user',
		tags: ['users'],
		response: {
			204: {},
			500: {
				type: 'object',
				properties: {
					error: { type: 'string' }
				}
			}
		}
	}
};

