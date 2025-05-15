import { getLanguage } from '../script/language';
import { dropDownBar } from '../script/dropDownBar';
import { fillTopbar } from '../script/fillTopbar';
import { setupNavigation } from '../script/menuNavigation';
import { connectFunc, requestBody } from '../script/connections';
import { setupErrorPages } from './errorPages';
import { setupSnekMatchHistory } from '../pages/snekHistory';

export function  setupMatchHistory() {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", /*html*/`
		<link rel="stylesheet" href="src/styles/history.css"> <!-- Link to the CSS file -->
		<div class="overlay"></div>
		
		<dropdown-menu></dropdown-menu>
		
		<!-- Switching between games -->
		<button class="game-btn" id="SnekHistory">
			<span data-i18n="SwitchGame"></span> <img src="src/Pictures/game-snek.png">
		</button>
		<div class="imiddle">
			<div class="hcontainer">
				<h1 class="Pongheader" data-i18n="Pong"></h1>
				<h1 class="header" data-i18n="History"></h1>
				<p class="p1" data-i18n="History_P"></p>
				<p class="p1" id="historyAliasName"></p>
			
				<history-table></history-table>

			</div>
		</div>
		`);

		getLanguage();
		dropDownBar(["dropdown-btn", "language-btn", "language-content"]);
		fillTopbar();
		setupNavigation();

		document.getElementById('SnekHistory')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/snekHistory');
			setupSnekMatchHistory();
		});

		connectFunc(`/user`, requestBody("GET", null))
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
				setupErrorPages(userInfoResponse.status, userInfoResponse.statusText);
			}
		})
	}
}
