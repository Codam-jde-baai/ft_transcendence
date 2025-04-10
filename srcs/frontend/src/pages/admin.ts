import { renderPage } from './index';
import { getLanguage } from '../script/language';
import { dropDownBar } from '../script/dropDownBar';
import { setupError404 } from './error404';
import { setupAdminUserSetting } from './adminUserSetting';
import { setupAdminSetting } from './adminSettings';
import { connectFunc, requestBody } from '../script/connections';

export function setupAdmin() {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", `
		<link rel="stylesheet" href="src/styles/admin.css"> <!-- Link to the CSS file -->
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
			<div class="container">
			<!-- BODY CHANGE -->

				<div class="search-container">
					<input type="text" class="userSearch" data-i18n-placeholder="Admin_placeholder1" onkeyup="searchUsers()">
					<button class="search-btn">
						<img class="searchIcon" src="src/Pictures/searchIcon.png"/>
					</button>
				</div>
				<table class="userTable">
					<thead>
						<tr>
							<th data-i18n="LogIn_Name"></th>
							<th data-i18n="SignUp_Alias"></th>
							<th data-i18n="Action"></th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>JohnDoe</td>
							<td>coolAlias</td>
							<td>
								<button class="btn" data-i18n="btn_Remove"></button>
								<button class="btn" id="AdminSet" data-i18n="Change_Password"></button>
							</td>
						</tr>

						<!--- REMOVE THIS ONE -> Just an example --- -->
						<tr>
							<td>JohnDoe</td>
							<td>coolAlias</td>
							<td>
								<button class="btn" >Remove</button>
								<button class="btn" >Change password</button>
							</td>
						</tr>
						<!-- --- ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ -->
					</tbody>
				</table>

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

		// Retrieve user uuid
		const userID = localStorage.getItem('userID');
		if (userID) {
			const response = connectFunc(`/user/${userID}`, requestBody("GET", null));
			response.then((response) => {
				if (response.ok) {
					response.json().then((data) => {
						console.log("FULL RESPONSE (admin)", data); // -> FOR TESTING
						console.log("FULL RESPONSE (admin)", data.username); // -> FOR TESTING
						// console.log("FULL RESPONSE (admin)", data.profile_pic.data); // -> FOR TESTING

						// console.log("User data fetched successfully:", data);
						// Use the fetched data (e.g., display user stats, leaderboard, etc.)
					});
				} else {
					console.error("Failed to fetch user data");
					// window.history.pushState({}, '', '/error404');
					// setupError404();
				}
			}).catch(() => {
				// Network or server error
				window.history.pushState({}, '', '/error404');
				setupError404();
			});
		} else {
			// Network or server error
			window.history.pushState({}, '', '/error404');
			setupError404();
		}
		
	}
}