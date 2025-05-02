import { renderPage } from './index';
import { getLanguage } from '../script/language';
import { dropDownBar } from '../script/dropDownBar';
import { setupErrorPages } from './errorPages';
import { connectFunc, requestBody } from '../script/connections';
import { fillTopbar } from '../script/fillTopbar';
import { fillUserTable } from '../script/fillTable';

export function setupAdmin() {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", /*html*/`
		<link rel="stylesheet" href="src/styles/admin.css"> <!-- Link to the CSS file -->
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
		fillUserTable();
		
		document.getElementById('LogOut')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/index');
			renderPage();
		});

		connectFunc(`/user/`, requestBody("GET", null))
		.then((userInfoResponse) => {
			if (userInfoResponse.ok) {
				userInfoResponse.json().then((data) => {

					// Profile-pic
					const pictureElem = document.getElementById("profile-picture") as HTMLImageElement;
					if (pictureElem && data.profile_pic && data.profile_pic.data) {
						pictureElem.src = `data:${data.profile_pic.mimeType};base64,${data.profile_pic.data}`;
					} else {
						// Network or server error
						window.history.pushState({}, '', '/errorPages');
						setupErrorPages(userInfoResponse.status, userInfoResponse.statusText);
					}
				});
			}
		})
	}
}