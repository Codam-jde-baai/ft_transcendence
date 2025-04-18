import { fillUserTable } from '../script/fillUsertabe_admin';
import { getLanguage } from '../script/language';
import { setupAdminUserSetting } from '../pages/adminUserSetting';

class UserTable extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
		console.log("UserTable connected");
        this.render();
    }

	render() {
		fillUserTable().then((userData: any[] | null) => {

			if (userData) {
				
				let rowsHtml = "";
				userData.forEach((user: any) => {

					rowsHtml += `
						<tr>
							<td>${user.username}</td>
							<td>${user.alias}</td>
							<td>
								<button class="btn" id="Delete" data-i18n="btn_Remove"></button>
								<button class="btn" id="AdminSet" data-i18n="Change_Password"></button>
							</td>
						</tr>
					`;

				});

				this.innerHTML = "";
				this.insertAdjacentHTML("beforeend", `
					<div class="table-wrapper">
						<table class="userTable">
							<thead>
								<tr>
									<th data-i18n="LogIn_Name"></th>
									<th data-i18n="SignUp_Alias"></th>
									<th data-i18n="Action"></th>
								</tr>
							</thead>
							<tbody>
								${rowsHtml}
							</tbody>
						</table>
					</div>
				`);


				getLanguage();
				document.getElementById('AdminSet')?.addEventListener('click', () => {
					window.history.pushState({}, '', '/adminUserSetting');
					setupAdminUserSetting();
				});
				document.getElementById('Delete')?.addEventListener('click', () => {
					// remove user from database;
					console.log("remove user");
				});
			}
		});
	}
}

customElements.define('user-table', UserTable);
