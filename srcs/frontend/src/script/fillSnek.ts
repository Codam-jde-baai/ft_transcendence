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

	const leaderboardResponse = connectFunc(`/snek/stats/top`, requestBody("GET", null));
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

// Match interface
interface Match {
	alias: string,
	matches: number,
	wins: number,
	losses: number,
	winrate: number,
	avg_score: number,
	highest_score: number
}

function findBestSnekUsers(data: Match[]) {

	var index = 0;
	data.forEach((user) => {
		if (user) {
			// Alias-name
			const aliasElem = document.getElementById(`aliasName${index + 1}`);
			if (aliasElem)
				aliasElem.textContent = user.alias;

			// Highest Score
			const scoreElem = document.getElementById(`hScore${index + 1}`);
			if (scoreElem)
				scoreElem.textContent = user.highest_score?.toString() || "0";

			// Win Rate
			const winRateElem = document.getElementById(`WRate${index + 1}`);
			if (winRateElem)
				winRateElem.textContent = user.winrate?.toString() + "%" || "0";

			// Win
			const winElem = document.getElementById(`SWin${index + 1}`);
			if (winElem)
				winElem.textContent = user.wins?.toString() || "0";

			// Losses
			const lossElem = document.getElementById(`Sloss${index + 1}`);
			if (lossElem)
				lossElem.textContent = user.losses?.toString() || "0";

			index++;
		}
	});
}
