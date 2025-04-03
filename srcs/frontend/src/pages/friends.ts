import { renderPage } from './index';
import { setupUserHome } from './home';
import { setupSetting } from './setting';
import { setupMatchHistory } from './history';
import { getLanguage } from '../script/language';
import { dropDownBar } from '../script/dropDownBar';

export function setupFriends () {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", `
		<link rel="stylesheet" href="src/styles/userMain.css"> <!-- Link to the CSS file -->
		<link rel="stylesheet" href="src/styles/friends.css"> <!-- Link to the CSS file -->
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
				<div class="search-container">
					<input type="text" class="userSearch" data-i18n-placeholder="Friends_placeholder1" onkeyup="searchBar()">
					<button class="search-btn">
						<img class="searchIcon" src="src/component/Pictures/searchIcon.png"/>
					</button>
				</div>
				
				<!-- Should Be A DROPDOWN -->
				<div class="search-results">
					<div class="friend">
						<img src="src/component/Pictures/defaultPP.avif" alt="Profile Picture">
						<p> >$MaybeFriend< </p>
						<button class="btn" data-i18n="btn_Add_Friend"></button>
						<button class="btn" id="UserHistory" data-i18n="History"></button>
					</div>
				</div>
				<!-- ^^^^^^^^^^^^^^^^^^^ -->

				<h1 class="header" data-i18n="Request_Header"></h1>
				<div class="friend-requests">
					<div class="friend">
						<img src="src/component/Pictures/defaultPP.avif" alt="Profile Picture">
						<p> >$Someone wants to be your friend< </p>
						<button class="btn accept" data-i18n="btn_Accept"></button>
						<button class="btn decline" data-i18n="btn_Decline"></button>
						<button class="btn block" data-i18n="btn_Block"></button>
					</div>
				</div>

				<h1 class="header" data-i18n="Friends_Header"></h1>
				<div class="friends-list">
					<div class="friend">
						<img src="src/component/Pictures/defaultPP.avif" alt="Profile Picture">
						<p> >$Friend 1< </p>
						<button class="btn" id="FriendsHistory" data-i18n="History"></button>
					</div>

					<!-- REMOVE - ONly for testing -->
					<div class="friend">
						<img src="src/component/Pictures/defaultPP.avif" alt="Profile Picture">
						<p> >$Friend 2< </p>
						<button class="btn">Match History</button>
					</div>
					<div class="friend">
						<img src="src/component/Pictures/defaultPP.avif" alt="Profile Picture">
						<p> >$Friend 3< </p>
						<button class="btn">Match History</button>
					</div>
					<!-- ^^^^^^^^^^^^^^^^^^^^^^^^ -->

				</div>

			</div>
			<!-- ^^^ -->
		</div>
		`);

		getLanguage();
		dropDownBar(["dropdown-btn", "language-btn", "language-content"]);

		document.getElementById('LogOut')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/index');
			renderPage();
		});

		document.getElementById('Home')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/home');
			setupUserHome();
		});

		document.getElementById('Settings')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/setting');
			setupSetting();
		});

		document.getElementById('Friends')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/friends');
			setupFriends();
		});

		document.getElementById('History')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/history');
			setupMatchHistory();
		});
		document.getElementById('UserHistory')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/history');
			setupMatchHistory();
		});
		document.getElementById('FriendsHistory')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/history');
			setupMatchHistory();
		});

	}
}


