import { fillUserTable } from '../script/fillTable';
import { getLanguage } from '../script/language';
import { setupAdminUserSetting } from '../pages/adminUserSetting';
import { connectFunc, requestBody } from "../script/connections";
import { setupErrorPages } from '../pages/errorPages';
import { setupAdmin } from '../pages/admin';

class UserTable extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
    }

	render() {
		fillUserTable().then((userData: { username: string; alias: string; }[] | null) => {

			if (userData) {
				
				let rowsHtml = "";
				userData.forEach((user: any) => {

					rowsHtml += `
						<tr>
							<td>${user.username}</td>
							<td>${user.alias}</td>
							<td>
								<button class="btn remove-btn" data-username="${user.username}" data-i18n="btn_Remove"></button>
								<button class="btn admin-btn" data-alias="${user.alias}" data-i18n="Change_Password"></button>
							</td>
						</tr>
					`;

				});

				this.innerHTML = "";
				this.insertAdjacentHTML("beforeend", /*html*/`
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
				
				this.querySelector("table")?.addEventListener("click", (event) => {
					const target = event.target as HTMLElement;

					if (target.classList.contains("admin-btn")) {
						const alias = target.getAttribute('data-alias');


						connectFunc(`/useralias/${alias}`, requestBody("GET", null))
							.then((userData) => {
								if (userData.ok) {
									userData.json().then((data) => {

										// Save the data in localStorage before navigating
										localStorage.setItem('adminUserData', JSON.stringify(data));
										
										// Change users Password
										window.history.pushState({}, '', '/adminUserSetting');
										setupAdminUserSetting();
									});
								} else {
									window.history.pushState({}, '', '/errorPages');
									setupErrorPages(userData.status, userData.statusText);
								}
							})
					}

					if (target.classList.contains("remove-btn")) {
						const username = target.getAttribute('data-username');
						if (username) {
							const confirmed = window.confirm(`Are you sure you want to delete ${username} account? This action cannot be undone.`);

							if (confirmed) {;
								const content: string = JSON.stringify({["username"]: username});
								connectFunc("/admin/deleteUser", requestBody("DELETE", content, "application/json"))
									.then((response) => {
										if (response.ok) {
											window.history.pushState({}, '', '/admin');
											setupAdmin();
										} else {
											alert("Failed to delete the account. Please try again.");
										}
									});
							}
						}
					}
				});
			}
		});
	}
}

customElements.define('user-table', UserTable);
