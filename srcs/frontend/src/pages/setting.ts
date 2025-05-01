import { setupUserHome } from './home';
import { getLanguage } from '../script/language';
import { dropDownBar } from '../script/dropDownBar';
import { eyeIcon_Button } from '../script/buttonHandling';
import { passwordFields } from '../script/errorFunctions';
import { setupErrorPages } from './errorPages';
import { updateUserSettings } from '../script/doSettings';
import { fillTopbar } from '../script/fillTopbar';
// import { fillSetting } from '../script/doSettings';
import { setupNavigation } from '../script/menuNavigation';
import { connectFunc, requestBody } from '../script/connections';
import { renderPage } from './index';


export function setupSetting () {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", /*html*/`
		<link rel="stylesheet" href="src/styles/setting.css"> <!-- Link to the CSS file -->
		<div class="overlay"></div>
		<dropdown-menu></dropdown-menu>
		
		<div class="middle"></div>
			<!-- BODY CHANGE -->

		<div class="container">
			<h1 class="header" data-i18n="Setting_Header"></h1>
				
			<p class="p1" data-i18n="Setting_Avatar"></p>
			<button class="edit-picture" onclick="document.getElementById('avatar').click()">
				<img id="profilePic" src="src/Pictures/defaultPP.png">
			</button>
			<input type="file" id="avatar" accept="image/*" style="display: none;">

			<p class="p1" id="user-name" data-i18n="Setting_Name"></p>
			<input type="username" required minlength="3" maxlength= "17" id="name" class="input-field">

			<p class="p1" id="alias-name" data-i18n="Setting_Alias"></p>
			<input type="Alias_Name" required minlength="3" maxlength= "17" id="alias" class="input-field">

			<div class="box">
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

				<p class="p1" id="current-password" data-i18n="CurrentPassword"></p>
				<input type="password" required minlength="6" maxlength="117" id="current_password" class="input-field">
				<span id="show-current_password" class="field-icon">
					<img src="src/Pictures/eyeIcon.png" alt="Show Password" id="eye-icon_current">
				</span>
			</div>
				
			<div class="buttons">
				<button class="btn" id="Save" data-i18n="btn_Save"></button>
			</div>
			<p>
				<a id="delete_Account" style="color: rgb(209, 7, 128); margin-left: 0.5%; text-decoration: underline;" data-i18n="btn_Delete"></a>
				<span data-i18n="Delete_Account"></span>
			</p>
		</div>

			<!-- ^^^ -->
		<!-- </div> -->
		`);

		getLanguage();
		dropDownBar(["dropdown-btn", "language-btn", "language-content", "game-btn", "game-content"]);
		eyeIcon_Button(["show-password", "show-password_confirm", "show-current_password", "avatar"]);
		fillTopbar();
		// fillSetting();
		setupNavigation();
		
		document.getElementById('Save')?.addEventListener('click', async () => {
			const isValid = passwordFields(["alias", "password", "password_confirm", "current_password"]);
			if (!isValid)
				return; // Stop execution if validation fails

			if (await updateUserSettings(["user-name", "alias", "password", "avatar", "current_password"])) {
					window.history.pushState({}, '', '/home');
					setupUserHome();
			}
			else {
				// Network or server error
				window.history.pushState({}, '', '/errorPages');
				setupErrorPages(500, "Internal Server Error");
			}
		});

		// document.getElementById('delete_Account')?.addEventListener('click', () => {
		// 	// BE A CHECK
		// 	console.log("DELETE CHECK");

		// 	// if ("yes")
		// 	// {
		// 	// 	const response = connectFunc("/user/delete", requestBody("DELETE", null, "application/json"));
		// 	// 	response.then((response) => {
		// 	// 		if (response.ok) {
		// 	// 			window.history.pushState({}, '', '/index');
		// 	// 			renderPage();
		// 	// 		}
		// 	// 	});
		// 	// } else {
		// 	// 	window.history.pushState({}, '', '/setting');
		// 	// 	setupSetting();
		// 	// }
		// });
	}
}
