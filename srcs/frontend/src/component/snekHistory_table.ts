import { fillSnekHistoryTable } from '../script/fillTable';
import { connectFunc, requestBody } from '../script/connections';
import { getLanguage } from '../script/language';

class SnekTable extends HTMLElement {
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
				fillSnekHistoryTable(aliasName).then((SnekEntryData: { player1: string; player2: string; OpScore: string; MyScore: string }[] | null) => {
					if (SnekEntryData) {
						
						let rowsSHtml = "";
						SnekEntryData.forEach((SnekEntry: any) => {

							rowsSHtml += `
								<tr>
									<td>${SnekEntry.player1} vs ${SnekEntry.player2}</td>
									<td>${SnekEntry.OpScore}</td>
									<td>${SnekEntry.MyScore}</td>
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
									${rowsSHtml}
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
customElements.define('snek-table', SnekTable);
