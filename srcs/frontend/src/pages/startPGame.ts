import { getLanguage } from '../script/language';
import { dropDownBar } from '../script/dropDownBar';
import { fillTopbar } from '../script/fillTopbar';
import { setupNavigation } from '../script/menuNavigation';
import { Pong } from './babylon.ts';
import { inputToContent } from '../script/connections.ts';

export function setupStartGame() {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", /*html*/`
		<link rel="stylesheet" href="src/styles/startGame.css"> <!-- Link to the CSS file -->
		<div class="overlay"></div>
		<dropdown-menu></dropdown-menu>
		
		<div class="middle" id="middle">
			<div class="container">
				<h1 class="header" data-i18n="Game_Header"></h1>
					
				<div class="buttons">
					<button class="btn" id ="btn_1v1" data-i18n="btn_1v1"></button>
				</div>
				<div class="buttons">
					<button class="btn" data-i18n="btn_Tournament"></button>
				</div>
			</div>
		</div>
		`);

		getLanguage();
		fillTopbar();
		dropDownBar(["dropdown-btn", "language-btn", "language-content"]);
		setupNavigation();

// Add event listener to launch Pong game
const Btn1v1 = document.getElementById("btn_1v1");
Btn1v1?.addEventListener("click", () => {
const middle = document.getElementById("middle");
if (middle)
	middle.innerHTML = `<canvas id="renderCanvas" style="position:relative; width: 100vw; top:140px; left:220px; height: 100vh; display: block;"></canvas>`;

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
if (canvas) {
// const options:scene = []
// const game = new Pong(canvas, options);
const game = new Pong(canvas);
game.run();
}
});
	}
}


