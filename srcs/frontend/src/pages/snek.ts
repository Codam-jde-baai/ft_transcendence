import { fillTopbar } from '../script/fillTopbar';
import { dropDownBar } from '../script/dropDownBar';
import { setupErrorPages } from "./errorPages";
import { setupNavigation } from '../script/menuNavigation';
// import { setupGame } from '../game/snek/setupGame';
import { getLanguage } from '../script/language';

export function setupSnek() {
	console.log("Setting up Snek");
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", /*html*/ `
			<link rel="stylesheet" href="src/styles/userMain.css">
			<dropdown-menu></dropdown-menu>
			
			<div class="middle">
				<h1 style="color: white;">Snek: the most intense 1v1 game</h1>
			<div id=snekContainer> </div>
		</div>
			<div>
				`);
		dropDownBar(["dropdown-btn", "language-btn", "language-content", "game-btn", "game-content"]);
		getLanguage();
		fillTopbar();
		setupNavigation();

	}
	else {
		setupErrorPages(404, "Page Not Found");
	}
}
