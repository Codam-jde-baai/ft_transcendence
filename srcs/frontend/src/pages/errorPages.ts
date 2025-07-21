import { renderPage } from '../pages/index'

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
				<p class="errorP">Go back to <a id="Index" href="#" style="color: blue; text-decoration: underline;">Home</a>
				</p>
			</div>
		</div>
		`);
	}

	if (errorCode === 402) {
		window.history.pushState({}, '', '/logIn');
		renderPage();
	}
	document.getElementById('Index')?.addEventListener('click', (e) => {
		e.preventDefault(); // Prevent default <a> behavior
		window.history.pushState({}, '', '/index');
		renderPage();
	});
}
