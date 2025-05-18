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
					winRateElem.textContent = data.winrate;

				// Win
				const winElem = document.getElementById("win");
				if (winElem)
					winElem.textContent = data.win;

				// losses
				const lossElem = document.getElementById("loss");
				if (lossElem)
					lossElem.textContent = data.loss;

			});
		} else {
			window.history.pushState({}, '', '/errorPages');
			setupErrorPages(userInfoResponse.status, userInfoResponse.statusText);
		}
	})

	// LeaderBoard
	const leaderboardResponse = connectFunc(`/public/users`, requestBody("GET", null));	
	leaderboardResponse.then((leaderboardResponse) => {
		if (leaderboardResponse.ok) {
			leaderboardResponse.json().then((data) => {

				// find the 3 best users scores
				findBestUsers(data);
			});
		} else {
			window.history.pushState({}, '', '/errorPages');
			setupErrorPages(leaderboardResponse.status, leaderboardResponse.statusText);
		}
	})
}

// Find the 3 best user scores (Leaderboard)
function findBestUsers(data: any) {
	
	const sortedUsers = [...data].sort((a, b) => b.score - a.score);
	const topThree = sortedUsers.slice(0, 3);

	// Update UI
	topThree.forEach((user, index) => {

		// Alias-name
		const aliasElem = document.getElementById(`aliasName${index + 1}`);
		if (aliasElem) 
			aliasElem.textContent = user.alias;

		// Win
		const winElem = document.getElementById(`win${index + 1}`);
		if (winElem) 
			winElem.textContent = user.wins?.toString() || "0";

		// Loss
		const lossElem = document.getElementById(`loss${index + 1}`);
		if (lossElem) 
			lossElem.textContent = user.losses?.toString() || "0";
	});
}
