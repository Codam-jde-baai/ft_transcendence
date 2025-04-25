import { renderPage } from './index';
import { setupUserHome } from './home';
import { setupSetting } from './setting';
import { setupFriends } from './friends';
import { setupMatchHistory } from './history';
import { getLanguage } from '../script/language';
import { dropDownBar } from '../script/dropDownBar';
import { fillTopbar } from '../script/fillTopbar';
import { setupNavigation } from '../script/menuNavigation';

export function setupStartGame () {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", `
		<link rel="stylesheet" href="src/styles/startGame.css"> <!-- Link to the CSS file -->
		<div class="overlay"></div>
		<dropdown-menu></dropdown-menu>
		
		<div class="middle">
			<!-- BODY CHANGE -->

			<div class="container">
				<h1 class="header" data-i18n="Game_Header"></h1>
					
				<div class="buttons">
					<button class="btn" data-i18n="btn_Friend"></button>
				</div>
				<div class="buttons">
					<button class="btn" data-i18n="btn_Match"></button>
				</div>
				<div class="buttons">
					<button class="btn" data-i18n="btn_Solo"></button>
				</div>
			</div>
	
			<!-- ^^^ -->
		</div>
		`);

		getLanguage();
		fillTopbar();
		dropDownBar(["dropdown-btn", "language-btn", "language-content"]);
		setupNavigation();

		// document.getElementById('LogOut')?.addEventListener('click', () => {
		// 	window.history.pushState({}, '', '/index');
		// 	renderPage();
		// });

		// document.getElementById('Home')?.addEventListener('click', () => {
		// 	window.history.pushState({}, '', '/home');
		// 	setupUserHome();
		// });

		// document.getElementById('Settings')?.addEventListener('click', () => {
		// 	window.history.pushState({}, '', '/setting');
		// 	setupSetting();
		// });

		// document.getElementById('Friends')?.addEventListener('click', () => {
		// 	window.history.pushState({}, '', '/friends');
		// 	setupFriends();
		// });

		// document.getElementById('History')?.addEventListener('click', () => {
		// 	window.history.pushState({}, '', '/history');
		// 	setupMatchHistory();
		// });
	}
}
