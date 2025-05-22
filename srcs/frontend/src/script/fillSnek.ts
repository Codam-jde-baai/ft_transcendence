import { connectFunc, requestBody } from './connections';
import { setupErrorPages } from '../pages/errorPages';

export function fillSnek() {
		connectFunc(`/snek/stats/me`, requestBody("GET", null))
		.then((userInfoResponse) => {
			if (userInfoResponse.ok) {
				userInfoResponse.json().then((data) => {

				// Hisest Score
				const highestScoreElem = document.getElementById("hScore");
				if (highestScoreElem)
					highestScoreElem.textContent = data.highest_score;

				// Win Rate
				const winRateElem = document.getElementById("winRate");
				if (winRateElem)
					winRateElem.textContent = data.winrate + '%';

				// Win
				const winElem = document.getElementById("win");
				if (winElem)
					winElem.textContent = data.wins;

				// losses
				const lossElem = document.getElementById("loss");
				if (lossElem)
					lossElem.textContent = data.losses;

			});
		} else {
			window.history.pushState({}, '', '/errorPages');
			setupErrorPages(userInfoResponse.status, userInfoResponse.statusText);
		}
	})

	// LeaderBoard
	const leaderboardResponse = connectFunc(`/snek/history/all`, requestBody("GET", null));	
	leaderboardResponse.then((leaderboardResponse) => {
		if (leaderboardResponse.ok) {
			leaderboardResponse.json().then((data) => {

				// find the 3 best users scores
				findBestSnekUsers(data);
			});
		} else {
			window.history.pushState({}, '', '/errorPages');
			setupErrorPages(leaderboardResponse.status, leaderboardResponse.statusText);
		}
	})
}



// Find the 3 best user scores (Leaderboard)
function findBestSnekUsers(data: any) {
	console.log("data", data); // ----------- RM ---------------

	// ----------- RM ---------------
	let dat = [
		{id:19, p1_alias:"test2", p1_score:4, p2_alias:"(guest) VroomVroom", p2_isGuest:true, p2_score:2},
		{id:18, p1_alias:"VroomVroom", p1_score:1, p2_alias:"(guest) test6", p2_isGuest:true, p2_score:3},
		{id:17, p1_alias:"test6", p1_score:1, p2_alias:"(guest) VroomVroom", p2_isGuest:true, p2_score:0},
		{id:16, p1_alias:"VroomVroom", p1_score:11, p2_alias:"(guest) test1", p2_isGuest:true, p2_score:12},
		{id:15, p1_alias:"VroomVroom", p1_score:10, p2_alias:"(guest) test8", p2_isGuest:true, p2_score:2}
	];

	// Store the highest score for each alias
	const aliasScores = new Map<string, number>();
	dat.forEach(match => {
		if (!aliasScores.has(match.p1_alias) || aliasScores.get(match.p1_alias)! < match.p1_score) {
			aliasScores.set(match.p1_alias, match.p1_score);
		}
		if (!aliasScores.has(match.p2_alias) || aliasScores.get(match.p2_alias)! < match.p2_score) {
			aliasScores.set(match.p2_alias, match.p2_score);
		}
	});
	const sortedAliases = Array.from(aliasScores.entries())
		.sort((a, b) => b[1] - a[1])
		.map(entry => entry[0]);

	// Get the top 3 unique aliases
	const topThreeAliases = sortedAliases.slice(0, 3).map(alias => alias.replace("(guest) ", ""));

	topThreeAliases.forEach((alias, index) => {
		console.log("alias", alias); // ----------- RM ---------------
		console.log("index", index); // ----------- RM ---------------
		const topResponse = connectFunc(`/snek/history/${alias}`, requestBody("GET", null));
		console.log("topResponse", topResponse); // ----------- RM ---------------
		
		// topResponse.then((topResponse) => {
		// 	if (topResponse.ok) {
		// 		topResponse.json().then((topData) => {
		// 			console.log("TOP3", topData);

		// 				// Alias-name
		// 				const aliasElem = document.getElementById(`aliasName${index + 1}`);
		// 				if (aliasElem) 
		// 					aliasElem.textContent = topData.alias;

		// 				// Hisest Score
		// 				const scoreElem = document.getElementById(`hScore${index + 1}`);
		// 				if (scoreElem) 
		// 					scoreElem.textContent = topData.highest_score?.toString() || "0";

		// 				// Win Rate
		// 				const winRateElem = document.getElementById(`WRate${index + 1}`);
		// 				if (winRateElem) 
		// 					winRateElem.textContent = topData.winrate?.toString() || "0";

		// 				// Win
		// 				const winElem = document.getElementById(`SWin${index + 1}`);
		// 				if (winElem) 
		// 					winElem.textContent = topData.wins?.toString() || "0";

		// 				// Losses
		// 				const lossElem = document.getElementById(`Sloss${index + 1}`);
		// 				if (lossElem) 
		// 					lossElem.textContent = topData.losses?.toString() || "0";
		// 		});
		// 	} else {
		// 		window.history.pushState({}, '', '/errorPages');
		// 		setupErrorPages(topResponse.status, topResponse.statusText);
		// 	}
		// })

	});


	// const topResponse = connectFunc(`/snek/history/${user}`, requestBody("GET", null));	
	// topResponse.then((topResponse) => {
	// 	if (topResponse.ok) {
	// 		topResponse.json().then((topData) => {

	// 			const sortedUsers = [...topData].sort((a, b) => b.highest_scorescore - a.highest_scorescore);
	// 			const topThree = sortedUsers.slice(0, 3);
	// 			console.log("TOP3", topThree);

	// 			// Update UI
	// 			topThree.forEach((user, index) => {

	// 				// Alias-name
	// 				const aliasElem = document.getElementById(`aliasName${index + 1}`);
	// 				if (aliasElem) 
	// 					aliasElem.textContent = user.alias;

	// 				// Hisest Score
	// 				const scoreElem = document.getElementById(`hScore${index + 1}`);
	// 				if (scoreElem) 
	// 					scoreElem.textContent = user.highest_score?.toString() || "0";

	// 				// Win Rate
	// 				const winRateElem = document.getElementById(`WRate${index + 1}`);
	// 				if (winRateElem) 
	// 					winRateElem.textContent = user.winrate?.toString() || "0";

	// 				// Win
	// 				const winElem = document.getElementById(`SWin${index + 1}`);
	// 				if (winElem) 
	// 					winElem.textContent = user.wins?.toString() || "0";

	// 				// Losses
	// 				const lossElem = document.getElementById(`Sloss${index + 1}`);
	// 				if (lossElem) 
	// 					lossElem.textContent = user.losses?.toString() || "0";
	// 			});
	// 		});
	// 	} else {
	// 		window.history.pushState({}, '', '/errorPages');
	// 		setupErrorPages(topResponse.status, topResponse.statusText);
	// 	}
	// })

}
