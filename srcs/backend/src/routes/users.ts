import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getAllUsers, getUser, getUserAlias, getUserImage } from '../controllers/user/getUsers.ts';
import { addUser, updateUserProfilePic } from '../controllers/user/setUsers.ts';
import { loginUser } from '../controllers/user/login.ts'
import { deleteUser, deleteProfilePic } from '../controllers/user/deleteUser.ts'
import { updatePassword, updateUser, setOffline, setOnline } from '../controllers/user/updateUser.ts'
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
	updatePasswordProperties,
	updateUserStatusOptions,
	updateUserProperties,
	deleteProfilePicOptions,
	deleteUserOptions
} from './userdocs.ts';

const addCorsHeaders = (request: FastifyRequest, reply: FastifyReply, done: () => void) => {
	reply.header('Access-Control-Allow-Origin', 'http://localhost:5173');
	reply.header('Access-Control-Allow-Credentials', 'true');
	done();
  };

function userRoutes(fastify: FastifyInstance, options: any, done: () => void) {
	fastify.addSchema({
		$id: 'security',
		security: securitySchemes
	});

	fastify.addHook('preHandler', addCorsHeaders);
	// User routes
	// for testing:
	fastify.get<{ Params: { uuid: string } }>
		('/user/:uuid/profile-pic', { preHandler: [authenticatePrivateToken], ...imageOptions }, getUserImage);

	fastify.get('/users', { preHandler: [authAPI], ...getUsersOptions }, getAllUsers);
	fastify.get<{ Params: { uuid: string } }>('/user/:uuid', { preHandler: [authenticatePrivateToken], ...getUserOptions }, getUser);
	fastify.get<{ Params: { alias: string } }>('/useralias/:alias/', { preHandler: [authenticatePrivateToken], ...getUserAliasOptions }, getUserAlias);

	//public data
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
	}>('/users/new', { preHandler: [authAPI], ...createUserOptions}, addUser);

	// Update profile picture with multipart/form-data
	fastify.post<{ Params: { uuid: string } }>
		('/users/:uuid/profile-pic', { preHandler: [authenticatePrivateToken], ...updateProfilePicOptions }, updateUserProfilePic);

	// Log in
	fastify.post('/user/login', { preHandler: [authAPI], ...loginUserOptions }, loginUser);

	// update password
	fastify.put<{
		Body: {
			uuid: string;
			password: string;
			newPassword: string;
		}
	}>('/user/updatepw', { preHandler: [authenticatePrivateToken], ...updatePasswordProperties }, updatePassword);
	// update data
	fastify.put<{
		Body: {
			uuid: string
			username?: string;
			alias?: string;
			language?: eLanguage;
		}
	}>('/user/data', { preHandler: [authenticatePrivateToken], ...updateUserProperties }, updateUser);
	//update status
	fastify.put<{ Params: { uuid: string } }>('/user/:uuid/setOnline', { preHandler: [authenticatePrivateToken], ...updateUserStatusOptions }, setOnline);
	fastify.put<{ Params: { uuid: string } }>('/user/:uuid/setOffline', { preHandler: [authenticatePrivateToken], ...updateUserStatusOptions }, setOffline);

	fastify.delete<{ Params: { uuid: string } }>('/user/:uuid/profile-pic', { preHandler: [authenticatePrivateToken], ...deleteProfilePicOptions }, deleteProfilePic);
	done();
	fastify.delete<{ Params: { uuid: string } }>('/user/:uuid/delete', { preHandler: [authenticatePrivateToken], ...deleteUserOptions }, deleteUser);
	done();
}

export default userRoutes;