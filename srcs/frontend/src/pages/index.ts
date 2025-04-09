import { setupLogIn } from './logIn';
import { setupSignUp } from './signUp';
import { setupUserHome } from './home';
import { setupSetting } from './setting';
import { setupFriends } from './friends';
import { setupMatchHistory } from './history';
import { setupStartGame } from './startGame';
import { setupAdmin } from './admin';
import { setupAdminSetting } from './adminSetting';
import { setupError404 } from './error404';
import { getLanguage } from '../script/language';
import '../component/topbar'
import '../component/languageMenu'

document.addEventListener('DOMContentLoaded', () => {
	renderPage();	
});

export function renderPage() {
	const root = document.getElementById('app');
	const routes: { [key: string]: () => void } = {
		'/': setupUserHome,
		'/home': setupUserHome,
		'/logIn': setupLogIn,
		'/signUp': setupSignUp,
		'/startGame': setupStartGame,
		'/setting': setupSetting,
		'/history': setupMatchHistory,
		'/friends': setupFriends,
		'/error404': setupError404,
		'/admin': setupAdmin,
		'/adminSetting': setupAdminSetting
	};
	if (root) {
		const funct = routes[window.location.pathname]
		if (funct) {
			funct();
		}	else {
			root.innerHTML = "";
			root.insertAdjacentHTML("beforeend", `
			<link rel="stylesheet" href="src/styles/index.css"> <!-- Link to the CSS file -->
			<div class="overlay"></div>
			<language-menu></language-menu>
			<div class="container">
				<h1 class="header" data-i18n="Index_Header"></h1>
				<p data-i18n="Index_P"></p>
				<div class="buttons">
					<button class="btn" id="LogIn" data-i18n="btn_LogIn"></button>
					<button class="btn" id="SignUp" data-i18n="btn_SignUp"></button>
					<!-- <button class="btn" id="Connect" data-i18n="Connect"> ConneCt </button> -->
				</div>
			</div>
			`);

			getLanguage();
			document.getElementById('LogIn')?.addEventListener('click', () => {
				window.history.pushState({}, '', '/logIn');
				renderPage();
			});

			document.getElementById('SignUp')?.addEventListener('click', () => {
				window.history.pushState({}, '', '/signUp');
				renderPage();
			});
		}
	} else {
		// If invalid route -> 404 page
		window.history.pushState({}, '', '/error404');
		setupError404();
	}
}

window.addEventListener('popstate', renderPage);
