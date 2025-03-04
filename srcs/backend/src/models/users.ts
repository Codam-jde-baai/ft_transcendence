// models - users.ts

export interface User {
	id: number;
	uuid: string;
	username: string;
	password: string;
	alias: string;
	profilePic: string | null; // URL or base64 string for demo
	wins: number;
	losses: number;
}

export interface addUserBody {
	username: string;
	alias: string;
	password: string;
	profilePic?: string | null;
}

// Dummy users data
export let Users: User[] = [
	{
		id: 1,
		uuid: 'user-uuid-1',
		username: 'jovi',
		password: 'supersecretpassword',
		alias: 'JoviMaster',
		profilePic: null,
		wins: 15,
		losses: 5
	},
	{
		id: 2,
		uuid: 'user-uuid-2',
		username: 'Acco',
		password: 'supersecretpassword',
		alias: 'AccoTheGreat',
		profilePic: null,
		wins: 12,
		losses: 8
	},
	{
		id: 3,
		uuid: 'user-uuid-3',
		username: 'Julius',
		password: 'supersecretpassword',
		alias: 'JuliusCaesar',
		profilePic: null,
		wins: 20,
		losses: 2
	},
	{
		id: 4,
		uuid: 'user-uuid-4',
		username: 'player',
		password: 'supersecretpassword',
		alias: 'PongKing',
		profilePic: null,
		wins: 10,
		losses: 10
	},
	{
		id: 5,
		uuid: 'user-uuid-5',
		username: 'failure',
		password: 'supersecretpassword',
		alias: 'NeverGiveUp',
		profilePic: null,
		wins: 0,
		losses: 15
	},
	{
		id: 6,
		uuid: 'user-uuid-6',
		username: 'person',
		password: 'supersecretpassword',
		alias: 'RandomPlayer',
		profilePic: null,
		wins: 5,
		losses: 5
	}
];

export default Users

/*
alternative export options 

export default jsut one. Or the file calling tihs one can directly call the export const instanecs

*/