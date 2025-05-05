import { connectFunc, requestBody } from './connections';
import { setupErrorPages } from '../pages/errorPages';

// Fill in for the Admin User Table
export function fillUserTable(): Promise<any[]> {

	return connectFunc(`/users`, requestBody("GET", null, "application/json"))
		.then((Response) => {
			if (Response.ok) {
				return Response.json().then((data) => {
					
					const formattedData = data.map((entry: any) => ({
						username: entry.username,
						alias: entry.alias,
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


// Fill in for the Match History
export function fillHistoryTable(aliasName: string): Promise<{ date: string; player1: string; player2: string; winner: string; score: string }[] | null> {

	return connectFunc(`/matches/${aliasName}`, requestBody("GET", null, "application/json"))
		.then((Response) => {
			if (Response.ok) {

				console.log("LOG", Response)
				console.log("DATA", Response.formData)
				return Response.json().then((data) => {
					
					console.log("dara", data);
					if (data.error === "No Matches In The Database For This User") {
						document.body.innerHTML = "Empty";
					} else {
						const formattedData = data.map((entry: any) => ({
							date: entry.date,
							player1: entry.p1_alias,
							player2: entry.player2,
							winner: entry.winner,
							score: entry.score
						}));
						return formattedData;
					}
				});
			} else {
				window.history.pushState({}, '', '/errorPages');
				setupErrorPages(Response.status, Response.statusText);
				return null;
			}
		})
}
