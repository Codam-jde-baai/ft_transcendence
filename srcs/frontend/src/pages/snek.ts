import { fillTopbar } from '../script/fillTopbar';
import { dropDownBar } from '../script/dropDownBar';
import { setupError404 } from "./error404";
import { setupNavigation } from '../script/menuNavigation';
import * as PIXI from "pixi.js";

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
		//getLanguage();
		dropDownBar(["dropdown-btn", "language-btn", "language-content"]);
		fillTopbar();
		setupNavigation();
		buildGame();

	}
	else {
		setupError404();
	}
}

async function buildGame() {
	const app = new PIXI.Application();
	await app.init({ width: 640, height: 640 });
	const container = document.getElementById('snekContainer');
	if (container) {
		container.appendChild(app.view);
	}
	else {
		setupError404();
	}
}