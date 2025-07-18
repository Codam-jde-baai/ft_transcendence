import { connectFunc, requestBody } from '../script/connections';
import { getLanguage } from '../script/language';

interface MatchHistory {
	p1_alias: string;
	p2_alias: string;
	winner_alias: string;
	date: string;
}

class HistoryTable extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.render();
	}

	private getMatchResult(match: MatchHistory): {
		date: string,
		player1: string,
		player2: string,
		winner: string,
	} {
		let date = match.date;
		let player1 = match.p1_alias;
		let player2 = match.p2_alias;
		let winner = match.winner_alias;

		return { date, player1, player2, winner };
	}

	render() {
		let aliasName: string | null = null;

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

				let pongAPI: Promise<Response>;
				if (alias) {
					pongAPI = connectFunc(`/matches/${alias}`, requestBody("GET", null));
				} else if (alias1 && alias2) {
					pongAPI = connectFunc(`/matches/${alias1}/${alias2}`, requestBody("GET", null));
				} else {
					pongAPI = connectFunc(`/matches`, requestBody("GET", null));
				}
				
				return pongAPI.then(response => {
					if (response.ok) {
						return response.json();
					}
					throw new Error('Failed to fetch match history');	
				}).then((MatchHistory: MatchHistory[]) => {
						let rowsHtml = "";

						MatchHistory.forEach((match: MatchHistory) => {
							const entry = this.getMatchResult(match);

							rowsHtml += `
								<tr>
									<td>${entry.date}</td>
									<td>${entry.player1} vs ${entry.player2}</td>
									<td>${entry.winner}</td>
								</tr>
							`;
						});

						this.innerHTML = "";
						this.insertAdjacentHTML("beforeend", /*html*/`
							<div class="table-wrapper">
								<table class="userTable">
								<thead>
									<tr>
										<th data-i18n="Date"></th>
										<th data-i18n="1v1_Game"></th>
										<th data-i18n="Winner"></th>
									</tr>
								</thead>
								<tbody>
									${rowsHtml}
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
customElements.define('history-table', HistoryTable);
