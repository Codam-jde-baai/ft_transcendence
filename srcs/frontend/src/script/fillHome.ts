import { connectFunc, requestBody } from './connections';
import { setupErrorPages } from '../pages/errorPages';
import { PlayerStats } from '../pages/startPGame';

export function fillHome() {
	Promise.all([
		connectFunc(`/user`, requestBody("GET", null)),
		connectFunc("/matches/record/", requestBody("GET", null))
	]).then(([userInfoResponse, recordResponse]) => {
		if (userInfoResponse.ok && recordResponse.ok) {
			Promise.all([
				userInfoResponse.json(),
				recordResponse.json()
			]).then(([userData, playerStats]) => {
				const winElem = document.getElementById("win") as HTMLElement;
				if (winElem)
					winElem.textContent = playerStats.wins;
				const lossElem = document.getElementById("loss") as HTMLElement;
				if (lossElem)
					lossElem.textContent = playerStats.losses;
				const winRateElem = document.getElementById("best-score") as HTMLElement;
				if (winRateElem && winElem.textContent !== "0"){
					winRateElem.textContent = playerStats.win_rate.toFixed(2) + "%";
				}
				else
					winRateElem.textContent = "0.00%"
				// Save the data in localStorage
				localStorage.setItem('SettingsUser', JSON.stringify(userData.username));
			});
		} else {
			window.history.pushState({}, '', '/errorPages');
			setupErrorPages(userInfoResponse.status, userInfoResponse.statusText);
		}
	})

	// LeaderBoard
	const leaderboardResponse = connectFunc(`/matches/records`, requestBody("GET", null));	
	leaderboardResponse.then((leaderboardResponse) => {
		if (leaderboardResponse.ok) {
			leaderboardResponse.json().then((data:PlayerStats) => {
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
			return b.wins - a.wins;
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
			winElem.textContent = user.wins.toString() || "0";

		// Loss
		const lossElem = document.getElementById(`loss${index + 1}`);
		if (lossElem) 
			lossElem.textContent = user.losses.toString() || "0";

		// Score
		const scoreElem = document.getElementById(`score${index + 1}`);
		if (scoreElem) 
			scoreElem.textContent = user.win_rate.toFixed(2) + "%" || "0.00%";
	});
}
