import { renderPage } from './index';
import { setupUserHome } from './home';
import { setupSetting } from './setting';
import { setupFriends } from './friends';
import { getLanguage } from '../script/language';

export function  setupMatchHistory () {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", `
		<link rel="stylesheet" href="src/styles/userMain.css"> <!-- Link to the CSS file -->
		<link rel="stylesheet" href="src/styles/history.css"> <!-- Link to the CSS file -->
		<div class="overlay"></div>
		<div class="leftBar">
			<div class="dropdown">
				<button class="dropdown-btn">
					<img class="settingIcon" src="src/component/Pictures/setting-btn.png"/></img>
				</button>
				<div class="dropdown-content">
					
					<button class="language-btn">
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
		</div>

		<div class="topBar">
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
				<h class="header">Pong Match History</h>
				
				<table>
					<thead>			<p style="color: white; font-size: 20px; font-family: Arial, sans-serif;">HIstory</p>
						<tr>
							<th><p>Date</p></th>
							<th><p>1v1 Game</p></th>
							<th><p>Winner</p></th>
							<th><p>Score</p></th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td><p class="p1">2025-03-01</p></td>
							<td><p class="p1">Player 1 vs Player 2</p></td>
							<td><p class="p1">Player 1</p></td>
							<td><p class="p1">11-7</p></td>
						</tr>
						<tr>
							<td><p class="p1">2025-03-03</p></td>
							<td><p class="p1">Player 1 vs Player 2</p></td>
							<td><p class="p1">Player 2</p></td>
							<td><p class="p1">11-9</p></td>
						</tr>
						<tr>
						<<td><p class="p1">2025-03-05</p></td>
							<td><p class="p1">Player 1 vs Player 3</p></td>
							<td><p class="p1">Player 1</p></td>
							<td><p class="p1">11-5</p></td>
						</tr>
					</tbody>
				</table>

			</div>
			<!-- ^^^ -->
		</div>
		`);

		getLanguage();
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


