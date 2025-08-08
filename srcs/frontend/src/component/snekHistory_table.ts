import { connectFunc, requestBody } from '../script/connections';
import { getLanguage } from '../script/language';

interface SnekMatchHistory {
	id: string;
	p1_alias: string;
	p2_alias: string;
	winner_id: number;
	p1_score: number;
	p2_score: number;
	p2_isGuest: boolean;
}

class SnekTable extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.render();
	}

	private getMatchResult(match: SnekMatchHistory, currentUserAlias: string): {
		backgroundColor: string,
		player1Display: string,
		player2Display: string,
		myScore: number,
		opponentScore: number
	} {
		const isPlayer1 = match.p1_alias === currentUserAlias;
		const isPlayer2 = match.p2_alias === currentUserAlias;

		let backgroundColor = '';
		let player1Display = match.p1_alias;
		let player2Display = match.p2_alias;
		let myScore: number;
		let opponentScore: number;

		// Determine my score and opponent score
		if (isPlayer1) {
			myScore = match.p1_score;
			opponentScore = match.p2_score;
		} else if (isPlayer2) {
			myScore = match.p2_score;
			opponentScore = match.p1_score;
		} else {
			// Viewing someone else's history, show as is
			myScore = match.p1_score;
			opponentScore = match.p2_score;
		}

		// Add crown to winner
		if (match.winner_id === 1) {
			player1Display = `👑 ${match.p1_alias}`;
		} else if (match.winner_id === 2) {
			player2Display = `👑 ${match.p2_alias}`;
		}

		// Determine background color based on current user's result
		if (match.winner_id === 0) {
			// Draw
			backgroundColor = 'background-color: rgba(255, 255, 0, 0.2);'; // Soft yellow
		} else if ((isPlayer1 && match.winner_id === 1) || (isPlayer2 && match.winner_id === 2)) {
			// Current user won
			backgroundColor = 'background-color: rgba(0, 255, 0, 0.2);'; // Soft green
		} else if ((isPlayer1 && match.winner_id === 2) || (isPlayer2 && match.winner_id === 1)) {
			// Current user lost
			backgroundColor = 'background-color: rgba(255, 0, 0, 0.2);'; // Soft red
		}

		return { backgroundColor, player1Display, player2Display, myScore, opponentScore };
	}

	render() {
		let aliasName: string | null = null;

		// First get the current user's alias
		return connectFunc(`/user`, requestBody("GET", null, "application/json"))
			.then((Response) => {
				if (Response.ok) {
					return Response.json().then((data) => {
						aliasName = data.alias;
						return aliasName;
					});
				}
			}).then(() => {
				if (aliasName) {
					// Get the match history data
					const urlParams = new URLSearchParams(window.location.search);
					const alias1 = urlParams.get('alias1');
					const alias2 = urlParams.get('alias2');
					const alias = urlParams.get('alias');

					let snekAPI: Promise<Response>;
					if (alias) {
						snekAPI = connectFunc(`/snekHistory/${alias}`, requestBody("GET", null));
					} else if (alias1 && alias2) {
						snekAPI = connectFunc(`/snekHistory/${alias1}/${alias2}`, requestBody("GET", null));
					} else {
						snekAPI = connectFunc(`/snekHistory/me`, requestBody("GET", null));
					}

					return snekAPI.then(response => {
						if (response.ok) {
							return response.json();
						}
						throw new Error('Failed to fetch match history');
					}).then((snekMatchHistory: SnekMatchHistory[]) => {
						let rowsSHtml = "";


						snekMatchHistory.forEach((match: SnekMatchHistory) => {
							const result = this.getMatchResult(match, aliasName as string);

							rowsSHtml += `
							<tr style="${result.backgroundColor}">
								<td>${result.player1Display}</td>
								<td>${result.myScore}</td>
								<td>${result.player2Display}</td>
								<td>${result.opponentScore}</td>
							</tr>
						`;
						});

						this.innerHTML = "";
						this.insertAdjacentHTML("beforeend", /*html*/`
						<div class="table-wrapper">
							<table class="userTable">
							<thead>
								<tr>
									<th data-i18n="SPl1"></th>
									<th data-i18n="SMy-score"></th>
									<th data-i18n="SPl2"></th>
									<th data-i18n="SOpp-score"></th>
								</tr>
							</thead>
							<tbody>
								${rowsSHtml}
							</tbody>
							</table>
						</div>
					`);

						getLanguage();
					});
				}
			}).catch(() => {
				this.innerHTML = `<div class="error">Failed to load match history</div>`;
			});
	}
}

// Define the custom element
customElements.define('snek-table', SnekTable);