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
		
		<div class="middle">
			<div class="container">
				<h1 class="header" data-i18n="Game_Header"></h1>
					
				<div class="buttons">
					<button class="btn" data-i18n="btn_Tournament"></button>
				</div>
				<div class="buttons">
					<button class="btn" id ="btn_1v1" data-i18n="btn_1v1"></button>
				</div>
			</div>
		</div>
		`);

		getLanguage();
		fillTopbar();
		dropDownBar(["dropdown-btn", "language-btn", "language-content"]);
		setupNavigation();

// Add event listener to launch Pong game
const soloBtn = document.getElementById("btn_1v1");
soloBtn?.addEventListener("click", () => {
console.log("clicked SOLO");
root.innerHTML = `
<canvas id="renderCanvas" style="width: 100vw; height: 100vh; display: block;"></canvas>
`;

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
if (canvas) {
// const options:scene = []
// const game = new Pong(canvas, options);
const game = new Pong(canvas);
game.run(); // You can also pass options if needed
}
});
	}
}

// Needs A Bunch Of Modification

