import { renderPage } from './index';
import { setupUserHome } from './home';
import { setupSetting } from './setting';
import { setupFriends } from './friends';
import { getLanguage } from '../script/language';
import { dropDownBar } from '../script/dropDownBar';
import { fillTopbar } from '../script/fillTopbar';

export function  setupMatchHistory () {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", `
		<link rel="stylesheet" href="src/styles/userMain.css"> <!-- Link to the CSS file -->
		<link rel="stylesheet" href="src/styles/history.css"> <!-- Link to the CSS file -->
		<div class="overlay"></div>
		<dropdown-menu></dropdown-menu>
		
		<div class="middle">
			<!-- BODY CHANGE -->

			<div class="container">
				<h class="header" data-i18n="History"></h>
				<p class="p1" data-i18n="History_P"></p>
				<p class="p1"> --$ALIASNAME-- </p>
				
				<table class="userTable">
					<thead>
						<tr>
							<th data-i18n="Date"></th>
							<th data-i18n="1v1_Game"></th>
							<th data-i18n="Winner"</th>
							<th data-i18n="Score"></th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>01-03-2025</td>
							<td>coolalias vs NOTcoolalias</td>
							<td>coolalias</td>
							<td>11-7</td>
						</tr>
						<!-- REMOVE - only for testing -->
						<tr>
							<td>2025-03-01</td>
							<td>Player 1 vs Player 2</td>
							<td>Player 1</td>
							<td>11-7</td>
						</tr>
						<tr>
							<td>2025-03-01</td>
							<td>Player 1 vs Player 2</td>
							<td>Player 1</td>
							<td>11-7</td>
						</tr>
						<!--- ^^^^^^^^^^^^^^^^^^^^^^^^^ -->
					</tbody>
				</table>
				
			</div>
			<!-- ^^^ -->
		</div>
		`);

		getLanguage();
		dropDownBar(["dropdown-btn", "language-btn", "language-content"]);
		fillTopbar();

		document.getElementById('LogOut')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/index');
			renderPage();
		});

		document.getElementById('Home')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/home');
			setupUserHome();
		});

		document.getElementById('Settings')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/setting');
			setupSetting();
		});

		document.getElementById('Friends')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/friends');
			setupFriends();
		});

		document.getElementById('History')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/history');
			setupMatchHistory();
		});

	}
}


