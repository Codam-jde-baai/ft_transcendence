import { connectFunc, requestBody } from './connections';
import { setupErrorPages } from '../pages/errorPages';

export function fillHome() {
	// Retrieve user uuid
	const userID = localStorage.getItem('userID');
	if (userID) {
		connectFunc(`/user/${userID}`, requestBody("GET", null))
		.then((userInfoResponse) => {
			if (userInfoResponse.ok) {
				userInfoResponse.json().then((data) => {

					// // Best Score
					// const bestScoreElem = document.getElementById("best-score");
					// if (bestScoreElem)
					// 	bestScoreElem.textContent = data.score;
					// // ^^^^^ NOT WORKING YET (NO data.Score) ^^^^^^^^^^^^^^^^

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
				setupErrorPages(404, "Page Not Found");
			}
		}).catch(() => {
			// Network or server error
			window.history.pushState({}, '', '/errorPages');
			setupErrorPages(500, "Internal Server Error");
		});
	} else {
		// Network or server error
		window.history.pushState({}, '', '/errorPages');
		setupErrorPages(404, "Page Not Found");
	}

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
			setupErrorPages(404, "Page Not Found");
		}
	}).catch(() => {
		// Network or server error
		window.history.pushState({}, '', '/errorPages');
		setupErrorPages(500, "Internal Server Error");
	});
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
