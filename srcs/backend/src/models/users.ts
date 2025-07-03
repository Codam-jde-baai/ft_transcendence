// models/users.ts

import { InferSelectModel } from 'drizzle-orm';
import { usersTable, userStatus, eLanguage } from '../db/schema.ts';
import { hash, verify } from 'argon2';

/* types */

// Base user type with common fields
type BaseUser = {
	username: string;
	alias: string;
	profile_pic?: Buffer;
	language?: eLanguage;
	status?: userStatus;
};

// User interface for reading operations
export type User = InferSelectModel<typeof usersTable>;

// Type for creating a User (without profile pic)
export type CreateUser = BaseUser & {
	uuid: string;
	password: string;
};

// Type for user creation request (JSON)
export type CreateUserRequest = Omit<BaseUser, 'profile_pic'> & {
	password: string;
};

// Type for public user data (omit sensitive fields)
export type PublicUser = Omit<User, 'password'> & {
	profile_pic?: {
		data: string | null;
		mimeType: string | null;
	};
};

// Type to update the user
export type UpdateUser = Partial<Omit<User, 'id' | 'uuid'>>;

/**
 * Converts a User object to a PublicUser object, removing sensitive information
 * @param user - The user object to convert
 * @returns A PublicUser object without sensitive information
 * @throws Error if the user parameter is null or undefined
 */
export function toPublicUser(user: User | null | undefined): PublicUser {
	if (!user)
		throw ("user could not be transformed to publicUser")
	return {
		id: user.id,
		uuid: user.uuid,
		username: user.username,
		alias: user.alias,
		profile_pic: {
			data: user.profile_pic instanceof Buffer ? blobToPicture(user.profile_pic) : null,
			mimeType: user.profile_pic instanceof Buffer ? getMimeType(user.profile_pic) : null
		},
		status: user.status,
		language: user.language,
	};
}

/* validation */

// Validation constraints
const USER_VALIDATION = {
	MIN_USERNAME_LENGTH: 3,
	MIN_ALIAS_LENGTH: 3,
	MIN_PASSWORD_LENGTH: 6
};

export const maxFileSize = 5 * 1024 * 1024

const PROFILE_PIC_VALIDATION = {
	MAX_SIZE: maxFileSize // 5MB in bytes
};

/**
 * Validates user data according to defined constraints
 * @param user - Partial user data to validate
 * @throws Error if any validation constraints are violated
 */
export function validateUser(user: Partial<CreateUser>): void {
	const errors: string[] = [];

	if (user.username && user.username.length < USER_VALIDATION.MIN_USERNAME_LENGTH) {
		errors.push(`Username must be at least ${USER_VALIDATION.MIN_USERNAME_LENGTH} characters`);
	}

	if (user.alias && user.alias.length < USER_VALIDATION.MIN_ALIAS_LENGTH) {
		errors.push(`Alias must be at least ${USER_VALIDATION.MIN_ALIAS_LENGTH} characters`);
	}

	if (user.password && user.password.length < USER_VALIDATION.MIN_PASSWORD_LENGTH) {
		errors.push(`Password must be at least ${USER_VALIDATION.MIN_PASSWORD_LENGTH} characters`);
	}

	if (user.language !== undefined && !Object.values(eLanguage).includes(user.language)) {
		errors.push(`Invalid language. Must be one of: ${Object.values(eLanguage).join(', ')}`);
	}

	if (user.status !== undefined && !Object.values(userStatus).includes(user.status)) {
		errors.push(`Invalid status. Must be one of: ${Object.values(userStatus).join(', ')}`);
	}

	if (errors.length > 0) {
		throw new Error(`Validation failed: ${errors.join(', ')}`);
	}
}

/**
 * Validates that a profile picture meets size requirements
 * @param profilePic - Buffer containing the profile picture data
 * @throws Error if the profile picture exceeds the maximum allowed size
 */
export function validateProfilePic(profilePic: Buffer): void {
	if (profilePic.length > PROFILE_PIC_VALIDATION.MAX_SIZE) {
		throw new Error(`Profile picture must be less than ${PROFILE_PIC_VALIDATION.MAX_SIZE / (1024 * 1024)}MB`);
	}
}

/**
 * Determines the MIME type of an image buffer based on its magic numbers
 * @param buffer - Buffer containing the image data
 * @returns The detected MIME type string, defaults to 'image/png' if type cannot be determined
 */
export function getMimeType(buffer: Buffer): string {
	// Simple MIME type detection based on magic numbers
	if (buffer.length < 4) return 'image/png';

	if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
		return 'image/jpeg';
	}
	if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
		return 'image/png';
	}
	if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
		return 'image/gif';
	}

	return 'image/png'; // Default
}

/**
 * Converts a Buffer to a base64 string for use in data URLs
 * @param buffer - Buffer containing the image data
 * @returns Base64 encoded string or null if the buffer is null
 */
function blobToPicture(buffer: Buffer | null): string | null {
	return buffer ? buffer.toString('base64') : null;
}

/* password hashing */

/**
 * Hashes a password using the Argon2 algorithm
 * @param password - The plain text password to hash
 * @returns Promise resolving to the hashed password string
 */
export async function hashPassword(password: string): Promise<string> {
	return await hash(password);
}

/**
 * Verifies if a plain text password matches a stored hash
 * @param password - The plain text password to verify
 * @param storedHash - The previously hashed password to compare against
 * @returns Promise resolving to true if the password matches, false otherwise
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
	return await verify(storedHash, password);
}