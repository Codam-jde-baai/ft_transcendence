import { fillSnekHistoryTable } from '../script/fillTable';
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
				fillSnekHistoryTable(aliasName).then((entryData: { player1: string; player2: string; OpScore: string; MyScore: string }[] | null) => {
					if (entryData) {
						
						let rowsHtml = "";
						entryData.forEach((entry: any) => {

							rowsHtml += `
								<tr>
									<td>${entry.player1} vs ${entry.player2}</td>
									<td>${entry.OpScore}</td>
									<td>${entry.MyScore}</td>
								</tr>
							`;
						});

						this.innerHTML = "";
						this.insertAdjacentHTML("beforeend", /*html*/`
							<div class="table-wrapper">
								<table class="userTable">
								<thead>
									<tr>
										<th data-i18n="SPl-against"></th>
										<th data-i18n="Spl-score"></th>
										<th data-i18n="SMy-score"></th>
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
