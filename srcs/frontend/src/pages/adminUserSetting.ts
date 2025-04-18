import { renderPage } from './index';
import { getLanguage } from '../script/language';
import { dropDownBar } from '../script/dropDownBar';
import { setupAdmin } from './admin';
import { setupAdminSetting } from './adminSettings';
// import { setupError404 } from './error404';
// import { connectFunc, requestBody, inputToContent } from '../script/connections';

export function setupAdminUserSetting() {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", `
		<link rel="stylesheet" href="src/styles/admin.css"> <!-- Link to the CSS file -->
		<link rel="stylesheet" href="src/styles/adminSet.css"> <!-- Link to the CSS file -->
		<div class="overlay"></div>
		<div class="topBar">
			<div class="dropdown">
				<button class="dropdown-btn" id="dropdown-btn">
					<img class="settingIcon" src="src/Pictures/setting-btn.png"/></img>
				</button>
				<div class="dropdown-content">
					
					<button class="language-btn" id="language-btn">
						<span data-i18n="Language"></span> <img id="selected-flag" src="src/Pictures/flagIcon-en.png">
					</button>
					<div class="language-content" id="language-content">
							<div class="language-option" id="gb">
								<img src="src/Pictures/flagIcon-en.png"> <span data-i18n="English"></span>
							</div>
							<div class="language-option" id="de">
								<img src="src/Pictures/flagIcon-de.png"> <span data-i18n="German"></span>
							</div>
							<div class="language-option" id="nl">
								<img src="src/Pictures/flagIcon-nl.png"> <span data-i18n="Dutch"></span>
							</div>
					</div>
					<div class="dropdown-item" id="Home" data-i18n="Home"></div>
					<div class="dropdown-item" id="Setting" data-i18n="Settings"></div>
					<div class="dropdown-item" id="LogOut" data-i18n="LogOut"></div>
				</div>
			</div>
			<div class="topBarFrame">
				<div class="adminName" data-i18n="Admin"></div>
				<div class="profile-picture">
					<img src="src/Pictures/defaultPP.avif" alt="Profile Picture">
				</div>
			</div>
		</div>
		
		<div class="middle">
			<div class="ucontainer">
			<!-- BODY CHANGE -->
				<h1 class="admin_header" data-i18n="Admin_Header"></h1>
				<p class="p2" data-i18n="Admin_P"></p>
				<p class="p2">$USERNAME</p>
					
				<button class="user-picture">
					<img src="src/Pictures/defaultPP.avif">
				</button>
	
				<p class="p1" data-i18n="LogIn_Name"></p>
				<div class="input-field display-only">Display USER LogIn Name</div>
	
				<p class="p1" data-i18n="SignUp_Alias"></p>
				<div class="input-field display-only">Display USER Alias Name</div>
	
				<p class="p1" data-i18n="Change_Password"></p>
				<input type="Password" class="input-field">
	
				<p class="p1" data-i18n="ConfirmPassword"></p>
				<input type="Confirm_Password" class="input-field">
					
				<div class="ubuttons">
					<button class="ubtn" data-i18n="btn_Admin"></button>
				</div>
				
				<!-- ^^^ -->
			</div>
		</div>
		`);

			getLanguage();
			dropDownBar(["dropdown-btn", "language-btn", "language-content"]);
			
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
			document.getElementById('AdminSet')?.addEventListener('click', () => {
				window.history.pushState({}, '', '/adminUserSetting');
				setupAdminUserSetting();
			});
		
	}
}