import { setupLogIn } from './logIn';
import { setupSignUp } from './signUp';
import { setupUserHome } from './home';
import { setupSetting } from './setting';
import { setupFriends } from './friends';
import { setupMatchHistory } from './history';
import { setupStartGame } from './startGame';
import { setupSnek } from './snek';
import { setupAdmin } from './admin';
import { setupTestGame } from './testGame';
import { setupAdminUserSetting } from './adminUserSetting';
import { setupAdminSetting } from './adminSettings';
import { setupErrorPages } from './errorPages';
import { getLanguage } from '../script/language';
import { dropDownBar } from '../script/dropDownBar';
import '../component/topbar'
import '../component/languageMenu'
import '../component/publicUser'
import '../component/adminTopbar'
import '../component/admin_userTable'

document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('app')?.hasChildNodes()) {
        renderPage();
    }
});

export function renderPage() {

	const root = document.getElementById('app');
	const routes: { [key: string]: () => void } = {
		'/home': setupUserHome,
		'/logIn': setupLogIn,
		'/signUp': setupSignUp,
		'/startGame': setupStartGame,
		'/setting': setupSetting,
		'/history': setupMatchHistory,
		'/friends': setupFriends,
		'/snek': setupSnek,
		'/errorPages': () => setupErrorPages(404, 'Page Not Found'),
		'/admin': setupAdmin,
		'/adminSettings': setupAdminSetting,
		'/adminUserSetting': setupAdminUserSetting,
		'/testgame': setupTestGame
	};
	if (root) {
		const funct = routes[window.location.pathname]
		if (funct) {
			funct();
		} else {
			root.innerHTML = "";
			root.insertAdjacentHTML("beforeend", /*html*/`
			<link rel="stylesheet" href="src/styles/index.css"> <!-- Link to the CSS file -->
			<div class="overlay"></div>
			<language-menu></language-menu>
			<div class="container">
				<h1 class="header" data-i18n="Index_Header"></h1>
				<p data-i18n="Index_P"></p>
				<div class="buttons">
					<button class="btn" id="LogIn" data-i18n="btn_LogIn"></button>
					<button class="btn" id="SignUp" data-i18n="btn_SignUp"></button>
				</div>
			</div>
				`);

			getLanguage();
			dropDownBar(["dropdown-btn", "language-btn", "language-content"]);

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
		window.history.pushState({}, '', '/errorPages');
		setupErrorPages(404, "Page Not Found");
	}
}

window.addEventListener('popstate', renderPage);
