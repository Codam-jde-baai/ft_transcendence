import { getLanguage } from '../script/language';
import { dropDownBar } from '../script/dropDownBar';
import { fillTopbar } from '../script/fillTopbar';
import { setupNavigation } from '../script/menuNavigation';
import { connectFunc, requestBody } from '../script/connections';
import { setupErrorPages } from './errorPages';
import { setupMatchHistory } from './history';

export function  setupSnekMatchHistory() {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", /*html*/`
		<link rel="stylesheet" href="src/styles/history.css"> <!-- Link to the CSS file -->
		<div class="overlay"></div>
		<dropdown-menu></dropdown-menu>
		
			<!-- Switching between games -->
			<button class="game-btn" id="PongHistory">
				<span data-i18n="SwitchGame"></span> <img src="src/Pictures/game-pong.png">
			</button>
			<div class="imiddle">
				<div class="hcontainer">
					<h1 class="Pongheader" data-i18n="Snek"></h1>
					<h1 class="header" data-i18n="History"></h1>
					<p class="p1" data-i18n="History_P"></p>
					<p class="p1" id="historyAliasName"></p>
				
					<!-- ______ Table does not exist YET _______ -->
					<!-- <snek-history-table></snek-history-table> -->
					
				</div>
			</div>
		`);

		getLanguage();
		dropDownBar(["dropdown-btn", "language-btn", "language-content"]);
		fillTopbar();
		setupNavigation();

		document.getElementById('PongHistory')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/history');
			setupMatchHistory();
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
