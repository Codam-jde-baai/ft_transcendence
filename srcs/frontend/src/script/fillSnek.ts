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

// Match interface
interface Match {
	id: number;
	p1_alias: string;
	p1_score: number;
	p2_alias: string;
	p2_isGuest: boolean;
	p2_score: number;
}

function findBestSnekUsers(data: Match[]) {

	// Store the highest score for each alias
	const aliasScores = new Map<string, number>();
	data.forEach(match => {
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
		const topResponse = connectFunc(`/snek/stats/${alias}`, requestBody("GET", null));
		
		topResponse.then((topResponse) => {
			if (topResponse.ok) {
				topResponse.json().then((topData) => {

						// Alias-name
						const aliasElem = document.getElementById(`aliasName${index + 1}`);
						if (aliasElem) 
							aliasElem.textContent = topData.alias;

						// Highest Score
						const scoreElem = document.getElementById(`hScore${index + 1}`);
						if (scoreElem) 
							scoreElem.textContent = topData.highest_score?.toString() || "0";

						// Win Rate
						const winRateElem = document.getElementById(`WRate${index + 1}`);
						if (winRateElem) 
							winRateElem.textContent = topData.winrate?.toString() + "%" || "0";

						// Win
						const winElem = document.getElementById(`SWin${index + 1}`);
						if (winElem) 
							winElem.textContent = topData.wins?.toString() || "0";

						// Losses
						const lossElem = document.getElementById(`Sloss${index + 1}`);
						if (lossElem) 
							lossElem.textContent = topData.losses?.toString() || "0";
				});
			} else {
				window.history.pushState({}, '', '/errorPages');
				setupErrorPages(topResponse.status, topResponse.statusText);
			}
		})

	});
}
