import { setupError404 } from "./error404";

export function setupSnek() {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", /*html*/ `
			<link rel="stylesheet" href="src/styles/userMain.css">
			<dropdown-menu></dropdown-menu>
			
			<div class="middle">
			<div class="loader">
				<progress value="0" max"100"></progress>
			</div>
			<canvas tabindex="0" id="canvas" width="1920" height"1080"></canvas>
			</div>
			<div>
			`)
	}
	else {
		setupError404();
	}
}