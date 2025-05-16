import { setupLogIn } from '../pages/logIn'

export function setupErrorPages(errorCode: number, errorMessage: string) {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", /*html*/`
		<link rel="stylesheet" href="src/styles/errorPage.css"> <!-- Link to the CSS file -->
		<div class="overlay">
			<div class="eecontainer">
				<div class="eerror-code">${errorCode}</div>
				<h1 class="errorH">${errorMessage}</h1>
			</div>
		</div>
		`);
	}

	if (errorCode === 402) {
		window.history.pushState({}, '', '/logIn');
		setupLogIn(); // Redirect to logIn
	}
}
