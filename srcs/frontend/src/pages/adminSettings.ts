import { renderPage } from './index';
import { getLanguage } from '../script/language';
import { dropDownBar } from '../script/dropDownBar';
import { setupAdmin } from './admin';
import { eyeIcon_Button } from '../script/buttonHandling';
import { adminPasswordFields } from '../script/errorFunctions';
import { fillTopbar } from '../script/fillTopbar';
// import { fillSetting } from '../script/doSettings';
import { setupErrorPages } from './errorPages';
import { updateUserSettings } from '../script/doSettings';

export function setupAdminSetting() {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", /*html*/`
		<link rel="stylesheet" href="src/styles/admin.css"> <!-- Link to the CSS file -->
		<link rel="stylesheet" href="src/styles/adminSet.css"> <!-- Link to the CSS file -->
		<div class="overlay"></div>
		
		<admin-topbar></admin-topbar>
				
		<div class="middle">
			<div class="ucontainer">
			<!-- BODY CHANGE -->
				<h1 class="admin_header" data-i18n="Settings"></h1>
					
				<p class="p1" data-i18n="Setting_Avatar"></p>
				<button class="user-picture" onclick="document.getElementById('avatar').click()">
					<img id="profilePic" src="src/Pictures/defaultPP.png">
				</button>
				<input type="file" id="avatar" accept="image/*" style="display: none;">
	
				<p class="p1" data-i18n="LogIn_Name"></p>
				<div class="input-field display-only" id="name"></div>
		
				<p class="p1" id="adminPass" data-i18n="Change_Password"></p>
				<input type="password" required minlength="6" maxlength="117" id="password" class="input-field">
				<span id="show-password" class="field-icon">
					<img src="src/Pictures/eyeIcon.png" alt="Show Password" id="eye-icon">
				</span>
	
				<p class="p1" id="admin_password-match" data-i18n="ConfirmPassword"></p>
				<input type="password" required minlength="6" maxlength="117" id="password_confirm" class="input-field">
				<span id="show-password_confirm" class="field-icon">
					<img src="src/Pictures/eyeIcon.png" alt="Show Password" id="eye-icon_confirm">
				</span>	
				
				<div class="ubuttons">
					<button class="ubtn" id="Save" data-i18n="btn_Admin"></button>
				</div>
				
				<!-- ^^^ -->
			</div>
		</div>
		`);

				getLanguage();
				dropDownBar(["dropdown-btn", "language-btn", "language-content"]);
				eyeIcon_Button(["show-password", "show-password_confirm", "avatar"]);
				fillTopbar();
				// fillSetting();
				
				document.getElementById('Save')?.addEventListener('click', async () => {
					const isValid = adminPasswordFields(["password", "password_confirm"]);
					if (!isValid)
						return; // Stop execution if validation fails

					if (await updateUserSettings(["password", "avatar"])) {
						window.history.pushState({}, '', '/admin');
						setupAdmin();
					}
					else {
						// Network or server error
						window.history.pushState({}, '', '/errorPages');
						setupErrorPages(404, "Not Found");
					}

				});
				
				document.getElementById('Home')?.addEventListener('click', () => {
					window.history.pushState({}, '', '/admin');
					setupAdmin();
				});
				document.getElementById('Setting')?.addEventListener('click', () => {
					window.history.pushState({}, '', '/adminSettings');
					setupAdminSetting();
				});
				document.getElementById('LogOut')?.addEventListener('click', () => {
					window.history.pushState({}, '', '/index');
					renderPage();
				});		
	}
}