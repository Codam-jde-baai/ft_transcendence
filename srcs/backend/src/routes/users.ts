import { FastifyInstance } from 'fastify';
import { getAllUsers, getUser, getUserAlias, getUserImage, getUserImageByAlias } from '../controllers/user/getUsers.ts';
import { addUser, updateUserProfilePic } from '../controllers/user/setUsers.ts';
import { loginUser, logoutUser, loginUserGame } from '../controllers/user/login.ts'
import { deleteUser, deleteProfilePic } from '../controllers/user/deleteUser.ts'
import { updateUser, setOffline, setOnline } from '../controllers/user/updateUser.ts'
import { userStatus, eLanguage } from '../db/schema.ts';
import { authenticatePrivateToken, authAPI } from './authentication.ts';
import {
	securitySchemes,
	imageOptions,
	getUserOptions,
	getUserAliasOptions,
	getUsersOptions,
	getPublicUsersOptions,
	createUserOptions,
	updateProfilePicOptions,
	loginUserOptions,
	logoutUserOptions,
	loginGameUserOptions,
	updateUserStatusOptions,
	updateUserProperties,
	deleteProfilePicOptions,
	deleteUserOptions,
	imageOptionsByAlias
} from './userdocs.ts';

function userRoutes(fastify: FastifyInstance, options: any, done: () => void) {
	fastify.addSchema({
		$id: 'security',
		security: securitySchemes
	});

	// User Routes
	fastify.get('/user/profile-pic', { preHandler: [authenticatePrivateToken], ...imageOptions }, getUserImage);
	fastify.get<{ Params: { alias: string } }>
		('/user/:alias/profile-pic', { preHandler: [authenticatePrivateToken], ...imageOptionsByAlias }, getUserImageByAlias);
	fastify.get('/users', { preHandler: [authAPI], ...getUsersOptions }, getAllUsers);
	fastify.get('/user', { preHandler: [authenticatePrivateToken], ...getUserOptions }, getUser);
	fastify.get<{ Params: { alias: string } }>('/useralias/:alias', { preHandler: [authenticatePrivateToken], ...getUserAliasOptions }, getUserAlias);
	// Public Data
	fastify.get('/public/users', { preHandler: [authAPI], ...getPublicUsersOptions }, getAllUsers);
	// Create user with JSON data
	fastify.post<{
		Body: {
			username: string;
			password: string;
			alias: string;
			language?: eLanguage;
			status?: userStatus;
		}
	}>('/user/new', { preHandler: [authAPI], ...createUserOptions}, addUser);

	// Update profile picture with multipart/form-data
	fastify.post('/user/profile-pic', { preHandler: [authenticatePrivateToken], ...updateProfilePicOptions }, updateUserProfilePic);

	// Log in/out
	fastify.post('/user/login', { preHandler: [authAPI], ...loginUserOptions }, loginUser);
	fastify.get('/user/logout', { preHandler: [authenticatePrivateToken], ...logoutUserOptions }, logoutUser);

	fastify.post('/user/game/login', { preHandler: [authAPI], ...loginGameUserOptions }, loginUserGame);
	// update data
	fastify.put<{
		Body: {
			current_password: string;
			password?: string;
			username?: string;
			alias?: string;
			language?: eLanguage;
		}
	}>('/user/data', { preHandler: [authenticatePrivateToken], ...updateUserProperties }, updateUser);
	//update status
	fastify.put<{ Params: { uuid: string } }>('/user/:uuid/setOnline', { preHandler: [authenticatePrivateToken], ...updateUserStatusOptions }, setOnline);
	fastify.put<{ Params: { uuid: string } }>('/user/:uuid/setOffline', { preHandler: [authenticatePrivateToken], ...updateUserStatusOptions }, setOffline);

	fastify.delete('/user/profile-pic', { preHandler: [authenticatePrivateToken], ...deleteProfilePicOptions }, deleteProfilePic);
	fastify.delete<{ Body: { current_password: string; }}>('/user/delete', { preHandler: [authenticatePrivateToken], ...deleteUserOptions }, deleteUser);
	done();
}

export default userRoutes;