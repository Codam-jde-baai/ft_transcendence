import { renderPage } from './index';
import { getLanguage } from '../script/language';
import { dropDownBar } from '../script/dropDownBar';
import { setupAdmin } from './admin';
import { setupAdminSetting } from './adminSettings';
import { fillTopbar } from '../script/fillTopbar';

export function setupAdminUserSetting() {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", `
		<link rel="stylesheet" href="src/styles/admin.css"> <!-- Link to the CSS file -->
		<link rel="stylesheet" href="src/styles/adminSet.css"> <!-- Link to the CSS file -->
		<div class="overlay"></div>

		<admin-topbar></admin-topbar>
		
		<div class="middle">
			<div class="ucontainer">
			<!-- BODY CHANGE -->
				<h1 class="admin_header" data-i18n="Admin_Header"></h1>
				<p class="p2" data-i18n="Admin_P"></p>
				<p class="p2">$USERNAME</p>
					
				<button class="user-picture">
					<img src="src/Pictures/defaultPP.png">
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
			fillTopbar();
			
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