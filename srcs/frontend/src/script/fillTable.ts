import { connectFunc, requestBody } from './connections';
import { setupErrorPages } from '../pages/errorPages';

// Fill in for the Admin User Table
export function fillUserTable(): Promise<any[]> {

	return connectFunc(`/users`, requestBody("GET", null, "application/json"))
		.then((Response) => {
			if (Response.ok) {
				return Response.json().then((data) => {
					
					// --------------------
					// MAKE BETTER

					// Return all users/info
					return data;
					// ^^^^^^^^^^^^^^^^^^^^^^^^^^^
				});
			} else {
				window.history.pushState({}, '', '/errorPages');
				setupErrorPages(Response.status, Response.statusText);
				return null;
			}
		})
}

// Fill in for the Match History
export function fillHistoryTable(): Promise<{ date: string; player1: string; player2: string; winner: string; score: string }[] | null> {

	return connectFunc(`/users`, requestBody("GET", null, "application/json"))
		.then((Response) => {
			if (Response.ok) {
				return Response.json().then((data) => {
					
					const formattedData = data.map((entry: any) => ({
						date: entry.date,
						player1: entry.p1_alias,
						player2: entry.player2,
						winner: entry.winner,
						score: entry.score
					}));
					return formattedData;
				});
			} else {
				window.history.pushState({}, '', '/errorPages');
				setupErrorPages(Response.status, Response.statusText);
				return null;
			}
		})
}
