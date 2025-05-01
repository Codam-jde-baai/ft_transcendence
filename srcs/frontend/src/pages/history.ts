import { getLanguage } from '../script/language';
import { dropDownBar } from '../script/dropDownBar';
import { fillTopbar } from '../script/fillTopbar';
import { setupNavigation } from '../script/menuNavigation';
import { connectFunc, requestBody } from '../script/connections';
import { setupErrorPages } from './errorPages';

export function  setupMatchHistory () {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", /*html*/`
		<link rel="stylesheet" href="src/styles/history.css"> <!-- Link to the CSS file -->
		<div class="overlay"></div>
		<dropdown-menu></dropdown-menu>
		
			<!-- BODY CHANGE -->
			<div class="middle">
				<div class="container">
					<h1 class="Pongheader" data-i18n="Pong"></h1>
					<h1 class="header" data-i18n="History"></h1>
					<p class="p1" data-i18n="History_P"></p>
					<p class="p1" id="historyAliasName"></p>
				
					<history-table></history-table>
					
				</div>
			<!-- ^^^ -->
			</div>
		`);

		getLanguage();
		dropDownBar(["dropdown-btn", "language-btn", "language-content", "game-btn", "game-content"]);
		fillTopbar();
		setupNavigation();

		// Retrieve user uuid
		const userID = localStorage.getItem('userID');
		if (userID) {
			connectFunc(`/user/`, requestBody("GET", null))
			.then((userInfoResponse) => {
				if (userInfoResponse.ok) {
					userInfoResponse.json().then((data) => {
	
						// Alias Name
						const aliasElem = document.getElementById("historyAliasName");
						if (aliasElem)
							aliasElem.textContent = data.alias;
	
					});
				} else {
					window.history.pushState({}, '', '/errorPages');
					setupErrorPages(404, "Page Not Found");
				}
			}).catch(() => {
				// Network or server error
				window.history.pushState({}, '', '/errorPages');
				setupErrorPages(500, "Internal Server Error");
			});
		} else {
			// Network or server error
			window.history.pushState({}, '', '/errorPages');
			setupErrorPages(404, "Page Not Found");
		}
	}
}
