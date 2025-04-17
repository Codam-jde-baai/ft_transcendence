import { setupError404 } from "./error404";

export function setupSnek() {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", `
			<link rel="stylesheet" href="src/styles/userMain.css">
			<div class="overlay"></div>
					<dropdown-menu></dropdown-menu>
			
			<div class="middle">
			</div>
			`)
	}
	else {
		setupError404();
	}
}