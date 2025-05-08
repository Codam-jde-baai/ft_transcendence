import { setupLogIn } from '../pages/logIn'

export function setupErrorPages(errorCode: number, errorMessage: string) {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", /*html*/`
		<link rel="stylesheet" href="src/styles/errorPage.css"> <!-- Link to the CSS file -->
		<div class="overlay"></div>
		<div class="container">
			<div class="error-code">${errorCode}</div>
			<h1>${errorMessage}</h1>
		</div>
		`);
	}

	if (errorCode === 401) {
		window.history.pushState({}, '', '/logIn');
		setupLogIn(); // Redirect to logIn
	}
}
