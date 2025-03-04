// models - matches.ts
export interface Match {
	id: number;
	uuid: string;
	player1Id: number;
	player2Id: number;
	status: 'completed' | 'interrupted';
	winnerId: number | null;
	startTime: string; // ISO date string
	endTime: string | null; // ISO date string
	duration: number | null; // in seconds
}

export const Matches: Match[] = [
	{
		id: 1,
		uuid: 'match-uuid-1',
		player1Id: 1,
		player2Id: 2,
		status: 'completed',
		winnerId: 1,
		startTime: '2025-03-01T10:00:00Z',
		endTime: '2025-03-01T10:15:00Z',
		duration: 900 // 15 minutes in seconds
	},
	{
		id: 2,
		uuid: 'match-uuid-2',
		player1Id: 3,
		player2Id: 4,
		status: 'completed',
		winnerId: 3,
		startTime: '2025-03-02T14:30:00Z',
		endTime: '2025-03-02T14:45:00Z',
		duration: 900
	},
	{
		id: 3,
		uuid: 'match-uuid-3',
		player1Id: 5,
		player2Id: 6,
		status: 'completed',
		winnerId: 6,
		startTime: '2025-03-02T16:00:00Z',
		endTime: '2025-03-02T16:10:00Z',
		duration: 600
	},
	{
		id: 4,
		uuid: 'match-uuid-4',
		player1Id: 1,
		player2Id: 4,
		status: 'interrupted',
		winnerId: null,
		startTime: '2025-03-03T09:00:00Z',
		endTime: null,
		duration: null
	},
	{
		id: 5,
		uuid: 'match-uuid-5',
		player1Id: 2,
		player2Id: 3,
		status: 'completed',
		winnerId: 3,
		startTime: '2025-03-03T11:00:00Z',
		endTime: '2025-03-03T11:20:00Z',
		duration: 1200
	}
];

export default Matches