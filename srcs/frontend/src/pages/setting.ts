import { renderPage } from './index';
import { setupUserHome } from './home';
import { setupFriends } from './friends';
import { setupMatchHistory } from './history';
import { getLanguage } from '../script/language';
import { dropDownBar } from '../script/dropDownBar';
import { eyeIcon_Button } from '../script/buttonHandling';
import { passwordFields } from '../script/errorFunctions';
import { setupError404 } from './error404';
import { connectFunc, requestBody, inputToContent } from '../script/connections';

export function setupSetting () {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", `
		<link rel="stylesheet" href="src/styles/userMain.css"> <!-- Link to the CSS file -->
		<link rel="stylesheet" href="src/styles/setting.css"> <!-- Link to the CSS file -->
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
				<h1 class="header" data-i18n="Setting_Header"></h1>
					
				<p class="p1" data-i18n="Setting_Avatar"></p>
				<button class="edit-picture" onclick="document.getElementById('avatar').click()">
					<img id="profilePic" src="src/component/Pictures/defaultPP.avif">
				</button>
				<input type="file" id="avatar" accept="image/*" style="display: none;">
	
				<p class="p1" data-i18n="Setting_Name"></p>
				<div class="input-field display-only">Display USER LogIn Name</div>
	
				<p class="p1" id="alias-name" data-i18n="Setting_Alias"></p>
				<input type="Alias_Name" required minlength="3" maxlength= "17" id="alias" class="input-field">
	
				<p class="p1" id="userPass" data-i18n="Change_Password"></p>
				<input type="password" required minlength="6" maxlength="117" id="password" class="input-field">
				<span id="show-password" class="field-icon">
					<img src="src/component/Pictures/eyeIcon.png" alt="Show Password" id="eye-icon">
				</span>
	
				<p class="p1" id="password-match" data-i18n="ConfirmPassword"></p>
				<input type="password" required minlength="6" maxlength="117" id="password_confirm" class="input-field">
				<span id="show-password_confirm" class="field-icon">
					<img src="src/component/Pictures/eyeIcon.png" alt="Show Password" id="eye-icon_confirm">
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
		
		document.getElementById('Save')?.addEventListener('click', () => {
			const isValid = passwordFields(["alias", "password", "password_confirm"]);
			if (!isValid)
				return; // Stop execution if validation fails

			const content: string = inputToContent(["alias", "password", "profilePic"])
			const body = requestBody("POST", content) 
			const response = connectFunc("?", body); // ????????????
			response.then((response) => {
				if (response.ok) {
					console.log("YES, it SAVED!!!");
					// window.history.pushState({}, '', '/home');
					// setupUserHome();

				} else {
					console.log("Something went wrong with the SAVE");
				}
			}).catch(() => {
				// Server/ Network error
				window.history.pushState({}, '', '/error404');
				setupError404();
			});
		});

		document.getElementById('Friends')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/friends');
			setupFriends();
		});

		document.getElementById('Settings')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/setting');
			setupSetting();
		});

		document.getElementById('LogOut')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/index');
			renderPage();
		});

		document.getElementById('History')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/history');
			setupMatchHistory();
		});

		document.getElementById('Home')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/home');
			setupUserHome();
		});
	}
}


