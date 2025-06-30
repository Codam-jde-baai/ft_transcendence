import { setupUserHome } from './home';
import { getLanguage } from '../script/language';
import { dropDownBar } from '../script/dropDownBar';
import { eyeIcon_Button } from '../script/buttonHandling';
import { updateUserSettings } from '../script/doSettings';
import { fillTopbar } from '../script/fillTopbar';
import { setupNavigation } from '../script/menuNavigation';
import { connectFunc, inputToContent, requestBody } from '../script/connections';
import { renderPage } from './index';
import { errorDisplay, passwordFields } from '../script/errorFunctions';
import { setupViewData } from '../pages/viewData';


export function setupSetting() {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", /*html*/`
		<link rel="stylesheet" href="src/styles/setting.css"> <!-- Link to the CSS file -->
		<div class="overlay"></div>
		<dropdown-menu></dropdown-menu>
		
		<div class="smiddle"></div>
		<div class="scontainer">
			<h1 class="header" data-i18n="Setting_Header"></h1>
			
			<p class="text-left mt-2 mb-[-15px]">
				<a id="viewData" target="_blank" class="cursor-pointer text-pink-600 underline" data-i18n="btn_ViewData"></a>
			</p>
				
			<p class="p1" data-i18n="Setting_Avatar"></p>
			<button class="edit-picture" onclick="document.getElementById('avatar').click()">
				<img id="profilePic" src="src/Pictures/defaultPP.png">
			</button>
			<input type="file" id="avatar" accept="image/*" style="display: none;">

			<p class="p1" id="current-password" data-i18n="CurrentPassword"></p>
			<input type="password" required minlength="6" maxlength="117" id="current_password" class="input-field mb-[-15px]" data-i18n-placeholder="CurrentP_placeholder1">
			<span id="show-current_password" class="field-icon">
				<img src="src/Pictures/eyeIcon.png" alt="Show Password" id="eye-icon_current">
			</span>

			<p class="p1" id="user-name" data-i18n="Setting_Name"></p>
			<input type="username" required minlength="3" maxlength= "17" id="username" class="input-field">

			<p class="p1" id="alias-name" data-i18n="Setting_Alias"></p>
			<input type="Alias_Name" required minlength="3" maxlength= "17" id="alias" class="input-field">

			<div class="box">
				<p class="p1" id="userPass" data-i18n="Change_Password"></p>
				<input type="password" required minlength="6" maxlength="117" id="password" class="input-field mb-[-15px]">
				<span id="show-password" class="field-iconn">
					<img src="src/Pictures/eyeIcon.png" alt="Show Password" id="eye-icon">
				</span>

				<p class="p1" id="password-match" data-i18n="ConfirmPassword"></p>
				<input type="password" required minlength="6" maxlength="117" id="password_confirm" class="input-field mb-[-15px]">
				<span id="show-password_confirm" class="field-iconnn">
					<img src="src/Pictures/eyeIcon.png" alt="Show Password" id="eye-icon_confirm">
				</span>	
			</div>
				
			<div class="buttons">
				<button class="btn" id="Save" data-i18n="btn_Save"></button>
			</div>
			<div id="settings-error" class="error-message hidden"></div>

			<p>
				<a id="delete_Account" style="color: rgb(209, 7, 128); margin-left: 0.5%; text-decoration: underline;" data-i18n="btn_Delete"></a>
				<span data-i18n="Delete_Account"></span>
			</p>
		</div>
		`);

		getLanguage();
		dropDownBar(["dropdown-btn", "language-btn", "language-content"]);
		eyeIcon_Button(["show-password", "show-password_confirm", "show-current_password", "avatar"]);
		fillTopbar();
		setupNavigation();

		document.getElementById('Save')?.addEventListener('click', async () => {
			const isValid = passwordFields(["username", "alias", "password", "password_confirm", "current_password"]);
			if (!isValid)
				return; // Stop execution if validation fails

			if (await updateUserSettings(["username", "alias", "password", "avatar", "current_password"])) {
				window.history.pushState({}, '', '/home');
				setupUserHome(true);
			}
			else {
				const errorBox = document.getElementById("settings-error");
				if (errorBox) {
					errorBox.textContent = "Failed to update settings. Please try again later.";
					errorBox.classList.remove("hidden");
				}
			}
		});
		
		// View Data Button
		document.getElementById('viewData')?.addEventListener('click', async () => {
			window.history.pushState({}, '', '/viewData');
			setupViewData();	
		});

		document.getElementById('delete_Account')?.addEventListener('click', () => {

			if ((document.getElementById("current_password") as HTMLInputElement).value === "") {
				const elem = document.getElementById("current_password") as HTMLInputElement
				const errorMsg = document.getElementById("current-password") as HTMLParagraphElement;
				errorDisplay(elem, errorMsg, "CurrentPass_error1");
				return;
			} else {
				const confirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");

				if (confirmed) {
					const response = connectFunc("/user/delete", requestBody("DELETE", inputToContent(["current_password"]), "application/json"));
					response.then((response) => {
						if (response.ok) {
							window.history.pushState({}, '', '/index');
							renderPage();
						} else {
							alert("Failed to delete the account. Please try again.");
						}
					});
				} else {
					// User clicked "Cancel"
					window.history.pushState({}, '', '/setting');
					setupSetting();
				}
			}
		});
	}
}
