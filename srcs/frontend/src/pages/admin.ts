import { renderPage } from './index';
import { getLanguage } from '../script/language';
import { dropDownBar } from '../script/dropDownBar';
import { fillUserTable } from '../script/fillTable';
import { connectFunc, requestBody } from '../script/connections';
import { setupErrorPages } from './errorPages';


export function setupAdmin() {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", /*html*/`
		<link rel="stylesheet" href="src/styles/admin.css"> <!-- Link to the CSS file -->
		<div class="overlay"></div>
		
		<admin-topbar></admin-topbar>
		
		<div class="amiddle">
			<div class="acontainer">
				<user-table></user-table>
			</div>
		</div>
		`);

		getLanguage();
		dropDownBar(["dropdown-btn", "language-btn", "language-content"]);
		fillUserTable();
		
		document.getElementById('LogOut')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/index');
			connectFunc("/admin/logout", requestBody("GET"))
			.then((response) => {
				if (response.ok) {
					renderPage()
				} else {
					window.history.pushState({}, '', '/errorPages');
					setupErrorPages(response.status, response.statusText);
				}
			})
		});
	}
}

