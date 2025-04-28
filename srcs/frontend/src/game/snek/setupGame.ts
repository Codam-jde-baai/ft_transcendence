import { setupErrorPages } from "../../pages/errorPages";
import { Application } from 'pixi.js';

export async function setupGame(containerId: string) {
	const app = new Application();
	await app.init({ width: 640, height: 640 });
	const container = document.getElementById(containerId);
	if (container) {
		container.appendChild(app.canvas);
	}
	else {
		setupErrorPages(response.status,  response.statusText);
	}
}