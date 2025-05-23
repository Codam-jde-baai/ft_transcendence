import { setupUserHome } from './home';
import DOMPurify from 'dompurify'; 
import { getLanguage } from '../script/language';
import { dropDownBar } from '../script/dropDownBar';
import { eyeIcon_Button } from '../script/buttonHandling';
import { passwordFields } from '../script/errorFunctions';
import { updateUserSettings } from '../script/doSettings';
import { fillTopbar } from '../script/fillTopbar';
import { setupNavigation } from '../script/menuNavigation';
import { connectFunc, inputToContent, requestBody } from '../script/connections';
import { renderPage } from './index';
import { errorDisplay } from '../script/errorFunctions';


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
			<!-- Popup PW check -->
			<div id="PWPopup" class="PWpopup hidden">
				<div class="PWpopup-content">
					<span class="close">&times;</span>
					<h2 class="text-[20px] mt-3" data-i18n="UserPW_Header"></h2>
					<form>
						<p class="text-black text-left" data-i18n="Password"></p>
						<input type="text" id="PWpassword"></div>
						<div class="buttons">
							<button class="btn" id="PWSave" data-i18n="btn_Save"></button>
						</div>
					</form>
				</div>
			</div>
			<!-- Popup for viewing user data -->
			<!-- <div id="settingsPopup" class="popup hidden">
				<div class="popup-content">
					<span class="close">&times;</span>
					<h2 class="text-[20px] mt-3" data-i18n="UserP_Header"></h2>
					<p class="text-[13px] mt-[-10px] mb-3 text-black text-left" data-i18n="Pop_setting_P"></p>
					<form>
						<p class="text-black text-left" data-i18n="LogIn_Name"></p>
						<div type="text" id="Susername"></div>
						
						<p class="text-black text-left" data-i18n="SignUp_Alias"></p>
						<div type="text" id="Salias"></div>
					</form>
				</div>
			</div> -->
				
			<p class="p1" data-i18n="Setting_Avatar"></p>
			<button class="edit-picture" onclick="document.getElementById('avatar').click()">
				<img id="profilePic" src="src/Pictures/defaultPP.png">
			</button>
			<input type="file" id="avatar" accept="image/*" style="display: none;">

			<p class="p1" id="current-password" data-i18n="CurrentPassword"></p>
			<input type="password" required minlength="6" maxlength="117" id="current_password" class="input-field" data-i18n-placeholder="CurrentP_placeholder1">
			<span id="show-current_password" class="field-icon">
				<img src="src/Pictures/eyeIcon.png" alt="Show Password" id="eye-icon_current">
			</span>

			<p class="p1" id="user-name" data-i18n="Setting_Name"></p>
			<input type="username" required minlength="3" maxlength= "17" id="username" class="input-field">

			<p class="p1" id="alias-name" data-i18n="Setting_Alias"></p>
			<input type="Alias_Name" required minlength="3" maxlength= "17" id="alias" class="input-field">

			<div class="box">
				<p class="p1" id="userPass" data-i18n="Change_Password"></p>
				<input type="password" required minlength="6" maxlength="117" id="password" class="input-field">
				<span id="show-password" class="field-iconn">
					<img src="src/Pictures/eyeIcon.png" alt="Show Password" id="eye-icon">
				</span>

				<p class="p1" id="password-match" data-i18n="ConfirmPassword"></p>
				<input type="password" required minlength="6" maxlength="117" id="password_confirm" class="input-field">
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
					setupUserHome();
			}
			else {
				const errorBox = document.getElementById("settings-error");
				if (errorBox) {
					errorBox.textContent = "Failed to update settings. Please try again later.";
					errorBox.classList.remove("hidden");
				}
			}
		});
		
		document.getElementById('viewData')?.addEventListener('click', async () => {
			const PWPopup = document.getElementById('PWPopup');

			// Retrieve the data from localStorage
			// const SettingsUserData = localStorage.getItem('SettingsUser');	
			// const SettingsUser = SettingsUserData ? JSON.parse(SettingsUserData) : null;
			if (PWPopup) {
				PWPopup.classList.remove('hidden');
			// 	document.getElementById('PWSave')?.addEventListener('click', async () => {
			// 		const PWElement = document.getElementById("password") as HTMLInputElement;
			// 		const rawInput = PWElement.value;
			// 		const sanitizedInput = DOMPurify.sanitize(rawInput); // Removes unsafe HTML
			// 		const alphanumericInput = sanitizedInput.replace(/[^a-zA-Z0-9]/g, ''); // Keeps only alphanumeric
					
			// 		if (SettingsUser) {
			// 			console.log("JAS",JSON.stringify({["username"]: SettingsUser , ["password"]: alphanumericInput}));
			// 			connectFunc("/user/login", requestBody("POST", JSON.stringify({["username"]: SettingsUser , ["password"]: alphanumericInput}), "application/json"))
			// 			.then(async (response) => {
			// 				if (response.ok) {
								// const settingsPopup = document.getElementById('settingsPopup');
								// // Retrieve the data from localStorage
								// const SettingsAliasData = localStorage.getItem('SettingsAlias');	
								// const SettingsAlias = SettingsAliasData ? JSON.parse(SettingsAliasData) : null;
								// if (settingsPopup) {
								// 	settingsPopup.classList.remove('hidden');
								// 	if (SettingsAlias) {
								// 		connectFunc(`/useralias/${SettingsAlias}`, requestBody("GET", null, "application/json"))
								// 		.then(async (response) => {
								// 			if (response.ok) {
								// 				response.json().then((data) => {
								// 					const usernameElem = document.getElementById('Susername');
								// 					const aliasElem = document.getElementById('Salias');
								// 					if (usernameElem && aliasElem) {
								// 						usernameElem.textContent = data.username;
								// 						aliasElem.textContent = data.alias;
								// 					}
								// 				});
								// 			} else {
								// 				window.history.pushState({}, '', '/setting');
								// 				setupSetting();
								// 			}
								// 		});
								// 	} else {
								// 		window.history.pushState({}, '', '/setting');
								// 		setupSetting();
								// 	}
								// }
			// 				} else {
			// 					/// EROR MESSAGE
			// 					console.error("SettingsUser not found in localStorage");
			// 				}
			// 			});
			// 		}
			// 	});
			} else {
				window.history.pushState({}, '', '/setting');
				setupSetting();
			}
				
		});
		const closeButton = document.querySelector('.close');
		if (closeButton) {
			closeButton.addEventListener('click', () => {
				const settingsPopup = document.getElementById('settingsPopup');
				if (settingsPopup) {
					settingsPopup.classList.add('hidden');
				}
				const PWPopup = document.getElementById('PWPopup');
				if (PWPopup) {
					PWPopup.classList.add('hidden');
				}
			});
		}

		document.getElementById('delete_Account')?.addEventListener('click', () => {

			if ((document.getElementById("current_password") as HTMLInputElement).value === "")
			{
				const elem = document.getElementById("current_password") as HTMLInputElement
				const errorMsg = document.getElementById("current-password") as HTMLParagraphElement;
				errorDisplay(elem, errorMsg, "CurrentPass_error1");
				return ;
			} else {
				const confirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");

				if (confirmed)
				{
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
