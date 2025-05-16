import { connectFunc, requestBody } from './connections';
import { setupErrorPages } from '../pages/errorPages';

// Fill in for the Admin User Table
export async function fillUserTable(): Promise<any[] | null> {

	const table = document.querySelector('#userTable');

	const Response = await connectFunc(`/users`, requestBody("GET", null, "application/json"));
	const data = await Response.json();
	
	if (data.error === "No Matches In The Database For This User") {
		if (table) {
			table.innerHTML = ``;
		}
		return null;
	} else if (Response.ok) {
				
		const formattedData = data.map((entry: { username: string; alias: string }) => ({
			username: entry.username,
			alias: entry.alias,
		}));
		// Sort the formattedData alphabetically by username
		formattedData.sort((a: { username: string }, b: { username: string }) => a.username.localeCompare(b.username));
		return formattedData;
	} else {
		window.history.pushState({}, '', '/errorPages');
		setupErrorPages(Response.status, Response.statusText);
		return null;
	}
}

// Fill in for the Match History (PONG)
export async function fillHistoryTable(aliasName: string): Promise<{ date: string; player1: string; player2: string; winner: string; score: string }[] | null> {

	const table = document.querySelector('#userTable');

	const Response = await connectFunc(`/matches/${aliasName}`, requestBody("GET", null, "application/json"));
	const data = await Response.json();

	if (data.error === "No Matches In The Database For This User") {
		if (table) {
			table.innerHTML = ``;
		}
		return null;
	} else if (Response.ok) {
		const formattedData = data.map((entry: any) => ({
			date: entry.date,
			player1: entry.p1_alias,
			player2: entry.player2,
			winner: entry.winner,
			score: entry.score
		}));
		return formattedData;
	} else {
		window.history.pushState({}, '', '/errorPages');
		setupErrorPages(Response.status, Response.statusText);
		return null;
	}
}

// // Fill in for the Match History (SNEK)
// export async function fillSnekHistoryTable(aliasName: string): Promise<{ date: string; player1: string; player2: string; winner: string; score: string }[] | null> {

// 	const table = document.querySelector('#userTable');

// 	const Response = await connectFunc(`/matches/${aliasName}`, requestBody("GET", null, "application/json"));
// 	const data = await Response.json();

// 	if (data.error === "No Matches In The Database For This User") {
// 		if (table) {
// 			table.innerHTML = ``;
// 		}
// 		return null;
// 	} else if (Response.ok) {
// 		const formattedData = data.map((entry: any) => ({
// 			date: entry.date,
// 			player1: entry.p1_alias,
// 			player2: entry.player2,
// 			winner: entry.winner,
// 			score: entry.score
// 		}));
// 		return formattedData;
// 	} else {
// 		window.history.pushState({}, '', '/errorPages');
// 		setupErrorPages(Response.status, Response.statusText);
// 		return null;
// 	}
// }
