import '../styles/index.css';
import { setupLogIn } from './logIn';
import { setupSignUp } from './signUp';
import { setupUserHome } from './home';
import { setupSetting } from './setting';
import { setupFriends } from './friends';
import { setupMatchHistory } from './history';
import { setupStartGame } from './startPGame';
import { setupSnekMatchHistory } from './snekHistory';
import { setupSnek } from './snek';
import { setupAdmin } from './admin';
import { setupAdminUserSetting } from './adminUserSetting';
import { setupErrorPages } from './errorPages';
import { getLanguage } from '../script/language';
import { dropDownBar } from '../script/dropDownBar';
import { setupStartSGame } from './startSGame';
import { setupAdminLogIn } from './adminLogin';
import { setupViewData } from './viewData';
import { connectFunc, requestBody } from '../script/connections';
import '../component/topbar'
import '../component/languageMenu'
import '../component/friendsRows'
import '../component/adminTopbar'
import '../component/admin_userTable'
import '../component/history_table'
import '../component/snekHistory_table'

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
		'/startPGame': setupStartGame,
		'/setting': setupSetting,
		'/history': setupMatchHistory,
		'/friends': setupFriends,
		'/snek': setupSnek,
		'/snekHistory': setupSnekMatchHistory,
		'/errorPages': () => setupErrorPages(404, "Not Found"),
		'/admin': setupAdmin,
		'/adminUserSetting': () => setupAdminUserSetting(),
		'/startSGame': setupStartSGame,
		'/adminLogin': setupAdminLogIn,
		'/viewData': setupViewData,
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

			<div class="middle">
				<div class="container">
					<h1 class="header" data-i18n="Index_Header"></h1>
					<p data-i18n="Index_P"></p>

					<div class="buttons">
						<button class="btn" id="LogIn" data-i18n="btn_LogIn"></button>
						<button class="btn" id="SignUp" data-i18n="btn_SignUp"></button>
					</div>
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
	}
}

window.addEventListener('popstate', renderPage);

export function setupLogOut() {

	connectFunc("/user/logout", requestBody("GET"))
		.then((response) => {
			if (response.ok) {
				renderPage()
			}
			else {
				window.history.pushState({}, '', '/errorPages');
				setupErrorPages(response.status, response.statusText);
			}
		})
}
