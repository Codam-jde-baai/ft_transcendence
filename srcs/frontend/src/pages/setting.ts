import { renderPage } from './index';
import { setupUserHome } from './home';
import { setupFriends } from './friends';
import { setupMatchHistory } from './history';
import { getLanguage } from '../script/language';

export function setupSetting () {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", `
		<link rel="stylesheet" href="src/styles/userMain.css"> <!-- Link to the CSS file -->
		<link rel="stylesheet" href="src/styles/setting.css"> <!-- Link to the CSS file -->
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
				<h1 class="header" data-i18n="Setting_Header"></h1>
					
				<p class="p1" data-i18n="Setting_Avatar"></p>
				<div class="profile-picture">
					<img src="src/component/Pictures/defaultPP.avif">
				</div>
	
				<p class="p1" data-i18n="Setting_Name"></p>
				<div class="input-field display-only">Display USER LogIn Name</div>
	
				<p class="p1" data-i18n="Setting_Alias"></p>
				<input type="Alias_Name" class="input-field">
	
				<p class="p1" data-i18n="Setting_Password"></p>
				<input type="Password" class="input-field">
	
				<p class="p1" data-i18n="ConfirmPassword"></p>
				<input type="Confirm_Password" class="input-field">
					
				<div class="buttons">
					<button class="btn" data-i18n="btn_Save"></button>
				</div>
			</div>
	
			<!-- ^^^ -->
		</div>
		`);

		getLanguage();
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


