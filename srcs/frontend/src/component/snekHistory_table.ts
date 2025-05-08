import { fillHistoryTable } from '../script/fillTable';
import { connectFunc, requestBody } from '../script/connections';
import { getLanguage } from '../script/language';

class SnekHistoryTable extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.render();
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
				// fillSnekHistoryTable(aliasName).then((entryData: { date: string; player1: string; player2: string; winner: string; score: string }[] | null) => {
				fillHistoryTable(aliasName).then((entryData: { date: string; player1: string; player2: string; winner: string; score: string }[] | null) => {
					if (entryData) {
						
						let rowsHtml = "";
						entryData.forEach((entry: any) => {

							rowsHtml += `
								<tr>
									<td>${entry.date}</td>
									<td>${entry.player1} vs ${entry.player2}</td>
									<td>${entry.winner}</td>
									<td>${entry.score}</td>
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
										<th data-i18n="Score"></th>
									</tr>
								</thead>
								<tbody>
									${rowsHtml}
								</tbody>
						</table>
							</div>
						`);

						getLanguage();
					}
				});
			}
		});
	}
}

// Define the custom element
customElements.define('snek-history-table', SnekHistoryTable);
