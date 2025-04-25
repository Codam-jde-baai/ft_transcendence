import { renderPage } from './index';
import { setupUserHome } from './home';
import { setupFriends } from './friends';
import { setupMatchHistory } from './history';
import { getLanguage } from '../script/language';
import { dropDownBar } from '../script/dropDownBar';
import { eyeIcon_Button } from '../script/buttonHandling';
import { passwordFields } from '../script/errorFunctions';
import { setupErrorPages } from './errorPages';
import { updateUserSettings } from '../script/doSettings';
import { fillTopbar } from '../script/fillTopbar';
import { fillSetting } from '../script/doSettings';
import { setupNavigation } from '../script/menuNavigation';

export function setupSetting () {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", /*html*/`
		<link rel="stylesheet" href="src/styles/setting.css"> <!-- Link to the CSS file -->
		<div class="overlay"></div>
		<dropdown-menu></dropdown-menu>
		
		<div class="middle">
			<!-- BODY CHANGE -->

			<div class="container">
				<h1 class="header" data-i18n="Setting_Header"></h1>
					
				<p class="p1" data-i18n="Setting_Avatar"></p>
				<button class="edit-picture" onclick="document.getElementById('avatar').click()">
					<img id="profilePic" src="src/Pictures/defaultPP.png">
				</button>
				<input type="file" id="avatar" accept="image/*" style="display: none;">
	
				<p class="p1" data-i18n="Setting_Name"></p>
				<div class="input-field display-only" id="name"></div>
	
				<p class="p1" id="alias-name" data-i18n="Setting_Alias"></p>
				<input type="Alias_Name" required minlength="3" maxlength= "17" id="alias" class="input-field">
	
				<p class="p1" id="userPass" data-i18n="Change_Password"></p>
				<input type="password" required minlength="6" maxlength="117" id="password" class="input-field">
				<span id="show-password" class="field-icon">
					<img src="src/Pictures/eyeIcon.png" alt="Show Password" id="eye-icon">
				</span>
	
				<p class="p1" id="password-match" data-i18n="ConfirmPassword"></p>
				<input type="password" required minlength="6" maxlength="117" id="password_confirm" class="input-field">
				<span id="show-password_confirm" class="field-icon">
					<img src="src/Pictures/eyeIcon.png" alt="Show Password" id="eye-icon_confirm">
				</span>	
					
				<div class="buttons">
					<button class="btn" id="Save" data-i18n="btn_Save"></button>
				</div>
			</div>
	
			<!-- ^^^ -->
		</div>
		`);

		getLanguage();
		dropDownBar(["dropdown-btn", "language-btn", "language-content"]);
		eyeIcon_Button(["show-password", "show-password_confirm", "avatar"]);
		fillTopbar();
		fillSetting();
		setupNavigation();
		
		document.getElementById('Save')?.addEventListener('click', async () => {
			const isValid = passwordFields(["alias", "password", "password_confirm"]);
			if (!isValid)
				return; // Stop execution if validation fails

			if (await updateUserSettings(["alias", "password", "avatar"])) {
					window.history.pushState({}, '', '/home');
					setupUserHome();
			}
			else {
				// Network or server error
				window.history.pushState({}, '', '/errorPages');
				setupErrorPages(500, "Internal Server Error");
			}
		});

		// document.getElementById('Friends')?.addEventListener('click', () => {
		// 	window.history.pushState({}, '', '/friends');
		// 	setupFriends();
		// });

		// document.getElementById('Settings')?.addEventListener('click', () => {
		// 	window.history.pushState({}, '', '/setting');
		// 	setupSetting();
		// });

		// document.getElementById('LogOut')?.addEventListener('click', () => {
		// 	window.history.pushState({}, '', '/index');
		// 	renderPage();
		// });

		// document.getElementById('History')?.addEventListener('click', () => {
		// 	window.history.pushState({}, '', '/history');
		// 	setupMatchHistory();
		// });

		// document.getElementById('Home')?.addEventListener('click', () => {
		// 	window.history.pushState({}, '', '/home');
		// 	setupUserHome();
		// });
	}
}


