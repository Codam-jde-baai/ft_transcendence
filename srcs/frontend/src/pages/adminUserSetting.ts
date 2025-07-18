import { getLanguage, getTranslation } from '../script/language';
import { setupAdmin } from './admin';
import { adminPasswordFields } from '../script/errorFunctions';
import { eyeIcon_Button } from '../script/buttonHandling';
import { connectFunc, requestBody } from '../script/connections';

export function setupAdminUserSetting() {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		// Retrieve the data in setupAdminUserSetting
		const savedData = localStorage.getItem('adminUserData');
		const data = savedData ? JSON.parse(savedData) : null;

		root.insertAdjacentHTML("beforeend", /*html*/`
		<link rel="stylesheet" href="src/styles/adminSet.css"> <!-- Link to the CSS file -->
		
		<admin-topbar></admin-topbar>
		
		<div class="admin-popup-overlay">
			<div class="asmiddle">
				<div class="ucontainer">
					<button id="close-popup" class="close-popup">&times;</button>
					<h1 class="admin_header" data-i18n="Admin_Header"></h1>
					<p class="p2" data-i18n="Admin_P"></p>
					<p class="p2">${data.username}</p>
					
					<button class="upicture">
						<img id="upicture" src="data:${data.profile_pic.mimeType};base64,${data.profile_pic.data}" alt="Profile Picture">
					</button>

					<p class="p1" data-i18n="LogIn_Name"></p>
					<div class="input-field display-only">${data.username}</div>

					<p class="p1" data-i18n="SignUp_Alias"></p>
					<div class="input-field display-only">${data.alias}</div>

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
					
					<div id="settings-error" class="error-message hidden"></div>

					<div class="ubuttons">
						<button id="Save" class="ubtn" data-i18n="btn_Admin"></button>
					</div>
				</div>
			</div>
		</div>
		`);

		getLanguage();
		eyeIcon_Button(["show-password", "show-password_confirm"]);

		// Add event listener for closing
		document.getElementById("close-popup")?.addEventListener('click', () => {
			window.history.pushState({}, '', '/admin');
			setupAdmin();
		});

		document.getElementById('Save')?.addEventListener('click', () => {
			const isValid = adminPasswordFields(["password", "password_confirm"]);
			if (!isValid)
				return; // Stop execution if validation fails

			const inputElement = document.getElementById("password") as HTMLInputElement;
			if (inputElement.value !== "" && inputElement.value !== null) {

				const body = requestBody("PUT", JSON.stringify({["username"]: data.username, ["newPassword"]: inputElement.value}), "application/json");
				const response = connectFunc("/admin/updateUserPassword", body);
				response.then((response) => {
					if (response.ok) {
						window.history.pushState({}, '', '/admin');
						setupAdmin();
					} else {
						const errorBox = document.getElementById("settings-error");
						if (errorBox) {
							errorBox.textContent = getTranslation("Settings_Error");
							errorBox.classList.remove("hidden");
						}
					}
				});
			}
		});
	}

}
