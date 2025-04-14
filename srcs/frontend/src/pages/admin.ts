import { renderPage } from './index';
import { getLanguage } from '../script/language';
import { dropDownBar } from '../script/dropDownBar';
import { setupError404 } from './error404';
import { setupAdminUserSetting } from './adminUserSetting';
import { setupAdminSetting } from './adminSettings';
import { connectFunc, requestBody } from '../script/connections';
import { fillTopbar } from '../script/fillTopbar';

export function setupAdmin() {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", `
		<link rel="stylesheet" href="src/styles/admin.css"> <!-- Link to the CSS file -->
		<link rel="stylesheet" href="src/styles/adminSet.css"> <!-- Link to the CSS file -->
		<div class="overlay"></div>
		
		<admin-topbar></admin-topbar>
		
		<div class="middle">
			<div class="container">

				<div class="search-container">
					<input type="text" class="userSearch" data-i18n-placeholder="Admin_placeholder1" onkeyup="searchUsers()">
					<button class="search-btn">
						<img class="searchIcon" src="src/Pictures/searchIcon.png"/>
					</button>
				</div>
				<user-table></user-table>
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

		// Retrieve user uuid
		const userID = localStorage.getItem('userID');
		if (userID) {
			connectFunc(`/user/${userID}`, requestBody("GET", null))
			.then((userInfoResponse) => {
				if (userInfoResponse.ok) {
					userInfoResponse.json().then((data) => {

						// Profile-pic
						const pictureElem = document.getElementById("profile-picture") as HTMLImageElement;
						if (pictureElem && data.profile_pic && data.profile_pic.data) {
							pictureElem.src = `data:${data.profile_pic.mimeType};base64,${data.profile_pic.data}`;
						}
					});
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