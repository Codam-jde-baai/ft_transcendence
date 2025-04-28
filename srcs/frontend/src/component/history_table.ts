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
		// fillHistoryTable().then((userData: any[] | null) => {

		// 	if (userData) {
				
		// 		let rowsHtml = "";
		// 		userData.forEach((user: any) => {

		// 			rowsHtml += `
		// 				<tr>
		// 					<td>${user.username}</td>
		// 					<td>${user.alias}</td>
		// 					<td>
		// 						<button class="btn" id="Delete" data-i18n="btn_Remove"></button>
		// 						<button class="btn" id="AdminSet" data-i18n="Change_Password"></button>
		// 					</td>
		// 				</tr>
		// 			`;

		// 		});

		// 		this.innerHTML = "";
		// 		this.insertAdjacentHTML("beforeend", /*html*/`
		// 			<div class="table-wrapper">
		// 				<table class="userTable">
		// 					<thead>
		// 						<tr>
		// 							<th data-i18n="LogIn_Name"></th>
		// 							<th data-i18n="SignUp_Alias"></th>
		// 							<th data-i18n="Action"></th>
		// 						</tr>
		// 					</thead>
		// 					<tbody>
		// 						${rowsHtml}
		// 					</tbody>
		// 				</table>
		// 			</div>
		// 		`);


		// 		getLanguage();
		// 	}
		// });

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
							<tr>
								<td>01-03-2025</td>
								<td>coolalias vs NOTcoolalias</td>
								<td>coolalias</td>
								<td>11-7</td>
							</tr>
							<!-- REMOVE - only for testing -->
							<tr>
								<td>2025-03-01</td>
								<td>Player 1 vs Player 2</td>
								<td>Player 1</td>
								<td>11-7</td>
							</tr>
							<tr>
								<td>2025-03-01</td>
								<td>Player 1 vs Player 2</td>
								<td>Player 1</td>
								<td>11-7</td>
							</tr>
							<!--- ^^^^^^^^^^^^^^^^^^^^^^^^^ -->
						</tbody>
				</table>
					</div>
				`);


				getLanguage();
	}
}

customElements.define('history-table', HistoryTable);
