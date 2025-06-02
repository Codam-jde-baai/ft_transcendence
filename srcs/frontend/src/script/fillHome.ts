import { connectFunc, requestBody } from './connections';
import { setupErrorPages } from '../pages/errorPages';

export function fillHome() {
		connectFunc(`/user`, requestBody("GET", null))
		.then((userInfoResponse) => {
			if (userInfoResponse.ok) {
				userInfoResponse.json().then((data) => {
	
				// Win
				const winElem = document.getElementById("win") as HTMLElement;
				if (winElem)
					winElem.textContent = data.win;

				// losses
				const lossElem = document.getElementById("loss") as HTMLElement;
				if (lossElem)
					lossElem.textContent = data.loss;
				// Winrate
				const winRateElem = document.getElementById("best-score") as HTMLElement;
				if (winRateElem && winElem.textContent !== "0"){
					winRateElem.textContent = data.win_rate.toFixed(2) + "%";
				}
				else
					winRateElem.textContent = "0.00%"

				// Save the data in localStorage
				localStorage.setItem('SettingsUser', JSON.stringify(data.username));

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
	const topThree = [...data].sort((a, b) => {
		if (b.win_rate !== a.win_rate)
			return b.win_rate - a.win_rate;
		else
			return b.win - a.win;
	}).slice(0, 3);
	// Update UI
	topThree.forEach((user, index) => {

		// Alias-name
		const aliasElem = document.getElementById(`aliasName${index + 1}`);
		if (aliasElem) 
			aliasElem.textContent = user.alias;

		// Win
		const winElem = document.getElementById(`win${index + 1}`);
		if (winElem) 
			winElem.textContent = user.win.toString() || "0";

		// Loss
		const lossElem = document.getElementById(`loss${index + 1}`);
		if (lossElem) 
			lossElem.textContent = user.loss.toString() || "0";

		// Score
		const scoreElem = document.getElementById(`score${index + 1}`);
		if (scoreElem) 
			scoreElem.textContent = user.win_rate.toFixed(2) + "%" || "0.00%";
	});
}
