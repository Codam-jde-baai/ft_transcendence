import { connectFunc, requestBody } from './connections';
import { setupErrorPages } from '../pages/errorPages';

// Fill in for the Admin User Table
export async function fillUserTable(): Promise<any[] | null> {

	const table = document.querySelector('#userTable');

	const response = await connectFunc(`/users`, requestBody("GET", null, "application/json"));
	const data = await response.json();
	
	if (data.error === "No users in database") {
		if (table) {
			table.innerHTML = ``;
		}
		return null;
	} else if (response.ok) {
				
		const formattedData = data.map((entry: { username: string; alias: string }) => ({
			username: entry.username,
			alias: entry.alias,
		}));
		// Sort the formattedData alphabetically by username
		formattedData.sort((a: { username: string }, b: { username: string }) => a.username.localeCompare(b.username));
		return formattedData;
	} else {
		window.history.pushState({}, '', '/errorPages');;
		setupErrorPages(response.status, response.statusText);
		return null;
	}
}

// Fill in for the Match History (PONG)
export async function fillHistoryTable(aliasName: string): Promise<{ date: string; player1: string; player2: string; winner: string; score: string }[] | null> {

	const table = document.querySelector('#userTable');

	const response = await connectFunc(`/matches/${aliasName}`, requestBody("GET", null, "application/json"));
	const data = await response.json();

	if (data.error === "No Matches In The Database For This User") {
		if (table) {
			table.innerHTML = ``;
		}
		return null;
	} else if (response.ok) {
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
		setupErrorPages(response.status, response.statusText);
		return null;
	}
}

// Fill in for the Match History (SNEK)
export async function fillSnekHistoryTable(aliasName: string): Promise<{ player1: string; player2: string; OpScore: string; MyScore: string }[] | null> {

	const table = document.querySelector('#userTable');

	const response = await connectFunc(`/matches/${aliasName}`, requestBody("GET", null, "application/json"));
	const data = await response.json();

	console.log("data", data);

	if (data.error === "No Matches In The Database For This User") {
		if (table) {
			table.innerHTML = ``;
		}
		return null;
	} else if (response.ok) {
		const formattedData = data.map((entry: any) => ({
			player1: entry.p1_alias,
			player2: entry.p2_alias,
			OpScore: entry.p2_score,
			MyScore: entry.p1_score,
		}));
		return formattedData;
	} else {
		window.history.pushState({}, '', '/errorPages');
		setupErrorPages(response.status, response.statusText);
		return null;
	}
}

// // Fill in for the Match History (SNEK)
// export async function fillSnekHistoryTable(aliasName: string): Promise<{ player1: string; player2: string; OpScore: string; MyScore: string }[] | null> {

// 	// const table = document.querySelector('#userTable');

// 	// const Response = await connectFunc(`/snek/history/${aliasName}`, requestBody("GET", null, "application/json"));
// 	// const data = await Response.json();

// 	// console.log("data", data);

// 	// if (data.error === "No Matches In The Database For This User") {
// 	// 	if (table) {
// 	// 		table.innerHTML = ``;
// 	// 	}
// 	// 	return null;
// 	// } else if (Response.ok) {
// 		// console.log("data", data);

// 	const data = [
// 		{ aliasName: aliasName, p1_alias: "Player1", p2_alias: "Player2", p2_score: 10, p1_score: 5 },
// 		{ aliasName: aliasName, p1_alias: "Player3", p2_alias: "Player4", p2_score: 15, p1_score: 20 },
// 		{ aliasName: aliasName, p1_alias: "Player5", p2_alias: "Player6", p2_score: 8, p1_score: 12 },
// 		{ aliasName: aliasName, p1_alias: "Player7", p2_alias: "Player8", p2_score: 6, p1_score: 9 },
// 		{ aliasName: aliasName, p1_alias: "Player9", p2_alias: "Player10", p2_score: 4, p1_score: 7 },
// 		{ aliasName: aliasName, p1_alias: "Player11", p2_alias: "Player12", p2_score: 11, p1_score: 14 },
// 		{ aliasName: aliasName, p1_alias: "Player13", p2_alias: "Player14", p2_score: 3, p1_score: 5 },
// 		{ aliasName: aliasName, p1_alias: "Player15", p2_alias: "Player16", p2_score: 9, p1_score: 11 },
// 		{ aliasName: aliasName, p1_alias: "Player17", p2_alias: "Player18", p2_score: 2, p1_score: 4 },
// 		{ aliasName: aliasName, p1_alias: "Player19", p2_alias: "Player20", p2_score: 7, p1_score: 10 },
// 		{ aliasName: aliasName, p1_alias: "Player21", p2_alias: "Player22", p2_score: 1, p1_score: 3 },
// 		{ aliasName: aliasName, p1_alias: "Player23", p2_alias: "Player24", p2_score: 5, p1_score: 8 },
// 		{ aliasName: aliasName, p1_alias: "Player25", p2_alias: "Player26", p2_score: 0, p1_score: 2 },
// 		{ aliasName: aliasName, p1_alias: "Player27", p2_alias: "Player28", p2_score: 13, p1_score: 16 },
// 		{ aliasName: aliasName, p1_alias: "Player29", p2_alias: "Player30", p2_score: 12, p1_score: 15 },
// 	];

// 	const formattedData = data.map((entry: any) => ({
// 		player1: entry.p1_alias,
// 		player2: entry.p2_alias,
// 		OpScore: entry.p2_score,
// 		MyScore: entry.p1_score,
// 	}));
// 	return formattedData;
// 	// } else {
// 	// 	window.history.pushState({}, '', '/errorPages');
// 	// 	setupErrorPages(Response.status, Response.statusText);
// 	// 	return null;
// 	// }
// }