import { connectFunc, requestBody } from './connections';
import { setupErrorPages } from '../pages/errorPages';

export function fillHome() {
		connectFunc(`/user`, requestBody("GET", null))
		.then((userInfoResponse) => {
			if (userInfoResponse.ok) {
				userInfoResponse.json().then((data) => {
	
				// Win
				const winElem = document.getElementById("win");
				if (winElem)
					winElem.textContent = data.win;

				// losses
				const lossElem = document.getElementById("loss");
				if (lossElem)
					lossElem.textContent = data.loss;

				// Save the data in localStorage
				localStorage.setItem('SettingsUser', JSON.stringify(data.username));

			});
		} else {
			window.history.pushState({}, '', '/errorPages');
			setupErrorPages(userInfoResponse.status, userInfoResponse.statusText);
		}
	})
	connectFunc(`/matches/score`, requestBody("GET", null))
		.then((userInfoResponse) => {
			if (userInfoResponse.ok) {
				userInfoResponse.json().then((data) => {

					// Best Score
					const bestScoreElem = document.getElementById("best-score");
					if (bestScoreElem)
						bestScoreElem.textContent = data.score;

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

		// Score
		const scoreElem = document.getElementById(`score${index + 1}`);
		if (scoreElem) 
			scoreElem.textContent = user.score?.toString() || "0";
	});
}
