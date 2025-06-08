import { getLanguage } from '../script/language';
import { dropDownBar } from '../script/dropDownBar';
import { fillTopbar } from '../script/fillTopbar';
import { setupNavigation } from '../script/menuNavigation';

export function setupStartGame() {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", /*html*/`
		<link rel="stylesheet" href="src/styles/contentPages.css"> 
		<div class="overlay"></div>
		<dropdown-menu></dropdown-menu>
		<div class="middle">
			<div class="flex flex-row space-x-6">
				<img src="src/Pictures/game-pong.png" style="width: 100px; height: 100px;">
				<img src="src/Pictures/game-snek.png" style="width: 100px; height: 100px;">
			</div>
			<label class="toggleSwitch">
				<input type="checkbox">
				<span class="toggle-option" data-i18n="btn_PlayPong"></span>
				<span class="toggle-option" data-i18n="btn_PlaySnek"></span>
			</label>
			<div class="contentArea">
				<h2 class="h2" data-i18n="Game_Header"></h2>
				<div class="buttons">
					<button class="btn" data-i18n="QuickPlay"></button>
				</div>
				<div class="buttons">
					<button class="btn" data-i18n="Tournament"></button>
				</div>
				<div class="buttons">
					<button class="btn" data-i18n="MatchMaking"></button>
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

