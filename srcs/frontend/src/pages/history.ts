import { renderPage } from './index';
import { setupUserHome } from './home';
import { setupSetting } from './setting';
import { setupFriends } from './friends';
import { getLanguage } from '../script/language';
import { dropDownBar } from '../script/dropDownBar';

export function  setupMatchHistory () {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", `
		<link rel="stylesheet" href="src/styles/userMain.css"> <!-- Link to the CSS file -->
		<link rel="stylesheet" href="src/styles/history.css"> <!-- Link to the CSS file -->
		<div class="overlay"></div>
		<div class="topBar">
			<div class="dropdown">
				<button class="dropdown-btn" id="dropdown-btn">
					<img class="settingIcon" src="src/component/Pictures/setting-btn.png"/></img>
				</button>
				<div class="dropdown-content" id="language-btn">
					
					<button class="language-btn" id="language-content">
						<span data-i18n="Language"></span> <img id="selected-flag" src="src/component/Pictures/flagIcon-en.png">
					</button>
					<div class="language-content">
							<div class="language-option" id="gb">
								<img src="src/component/Pictures/flagIcon-en.png"> <span data-i18n="English"></span>
							</div>
							<div class="language-option" id="de">
								<img src="src/component/Pictures/flagIcon-de.png"> <span data-i18n="German"></span>
							</div>
							<div class="language-option" id="nl">
								<img src="src/component/Pictures/flagIcon-nl.png"> <span data-i18n="Dutch"></span>
							</div>
					</div>
					<div class="dropdown-item" id="Home" data-i18n="Home"></div>
					<div class="dropdown-item" id="Settings" data-i18n="Settings"></div>
					<div class="dropdown-item" id="Friends" data-i18n="Friends"></div>
					<div class="dropdown-item" id="History" data-i18n="History"></div>
					<div class="dropdown-item" id="LogOut" data-i18n="LogOut"></div>
				</div>
			</div>
			<div class="topBarFrame">
				<div class="aliasName">cool alias</div>
				<div class="profile-picture">
					<img src="src/component/Pictures/defaultPP.avif" alt="Profile Picture">
				</div>
			</div>
		</div>
		
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


