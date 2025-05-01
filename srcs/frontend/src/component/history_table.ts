import { fillHistoryTable } from '../script/fillTable';
import { getLanguage } from '../script/language';

class HistoryTable extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		console.log("HistoryTable connected");
		this.render();
	}

	render() {
		fillHistoryTable().then((entryData: { date: string; player1: string; player2: string; winner: string; score: string }[] | null) => {

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
}

// Define the custom element
customElements.define('history-table', HistoryTable);
