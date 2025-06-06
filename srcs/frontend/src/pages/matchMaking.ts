//import { getLanguage } from '../script/language';
import { dropDownBar } from '../script/dropDownBar';
import { fillTopbar } from '../script/fillTopbar';
import { setupNavigation } from '../script/menuNavigation';
import { connectFunc } from '../script/connections';


export function setupMatchMaking() {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", /*html*/`
		<link rel="stylesheet" href="src/styles/contentPages.css"> <!-- Link to the CSS file -->
			<dropdown-menu></dropdown-menu>
			<div class="middle">
			<button class="game-btn-full" id="SnekHistory">
				<span data-i18n="SwitchGame"></span> <img src="src/Pictures/game-snek.png">
			</button>
				<p> hello </p>
				<div class="contentArea">
					<p> inside the content Area </p>
				</div>
			</div>
		</div>
		`);

		fillTopbar();
		dropDownBar(["dropdown-btn", "language-btn", "language-content"]);
		setupNavigation();
		//getLanguage();
	}
}
