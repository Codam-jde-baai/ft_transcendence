import { getLanguage } from '../script/language';
import { dropDownBar } from '../script/dropDownBar';
import { fillTopbar } from '../script/fillTopbar';
import { setupNavigation } from '../script/menuNavigation';

export function setupStartGame () {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", /*html*/`
		<link rel="stylesheet" href="src/styles/startGame.css"> <!-- Link to the CSS file -->
		<div class="overlay"></div>
		<dropdown-menu></dropdown-menu>
		
		<div class="middle">
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
		</div>
		`);

		getLanguage();
		fillTopbar();
		dropDownBar(["dropdown-btn", "language-btn", "language-content"]);
		setupNavigation();
	}
}
