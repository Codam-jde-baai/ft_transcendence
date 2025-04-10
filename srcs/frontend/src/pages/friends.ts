import { renderPage } from './index';
import { setupUserHome } from './home';
import { setupSetting } from './setting';
import { setupMatchHistory } from './history';
import { getLanguage } from '../script/language';
import { searchBar } from '../script/searchFriends';
import { connectFunc, requestBody } from "../script/connections"

export function setupFriends() {
	const root = document.getElementById('app');
	let publicUsers: any = [];
	let friendRelations: any = {
		friends: [],
		receivedRequests: [],
		sentRequests: [],
		deniedRequests: [],
		blocked: []
	};
	// const uuid = ""
	const uuid = "fedc3ec8-8392-4c63-ae8c-6c94ab836b60" // get uuID from session-cookie
	// using promise instead of multiple .thens()
	// promse.all() method can take multiple promises as input ( connectfunc returns a promse) and promise.all() continues once all promises conclude
	Promise.all([
		// request friend relations -> friendslists
		connectFunc(`/friends/${uuid}`, requestBody("GET"))
			.then(response => {
				if (response.ok) {
					return response.json();
				} else {
					if (response.status === 400) {
						console.log("User not found");
					} else if (response.status === 404) {
						console.log("No friends found for this user");
					} else {
						console.log(`Unexpected error: ${response.status}`);
					}
					return friendRelations;
				}
			}),
		// request public users -> for search bar
		connectFunc("/public/users", requestBody("GET"))
			.then(response => {
				if (response.ok) {
					return response.json();
				} else {
					console.log({ msg: "error with /public/users call", status: response.status, message: response.body });
					return [];
				}
			})
	])
		.then(([friendData, publicData]) => {
			friendRelations = friendData;
			publicUsers = publicData;
			if (root) {
				root.innerHTML = "";
				root.insertAdjacentHTML("beforeend", `
			<link rel="stylesheet" href="src/styles/userMain.css">
			<link rel="stylesheet" href="src/styles/friends.css">
			<div class="overlay"></div>
			<dropdown-menu></dropdown-menu>
			
			<div class="middle">
				<!-- BODY CHANGE -->

				<div class="container">
					<div class="search-container">
						<input type="text" class="userSearch" data-i18n-placeholder="Friends_placeholder1">
						<button class="search-btn">
							<img class="searchIcon" src="src/component/Pictures/searchIcon.png"/>
						</button>
						<div class="dropdown">
							<div id="search-results" class="dropdown-content">
								<input type="text" placeholder="Search.." id="myInput" onkeyup="filterFunction()">
							</div>
							button class="btn" data-i18n="btn_Add_Friend"></button>
						</div>
					</div>
					
					
					<!-- Should Be A DROPDOWN
					^^^^^^^^^^^^^^^^^^^ -->
					
					<div class="search-results">
					  ${publicUsers.map((element: any) => `
    					<public-user type="unfriend" alias=${element.alias} profilePicData=${element.profile_pic.data} profilePicMimeType=${element.profile_pic.mimeType}></public-user>
					`).join('')}
						<public-user type="unfriend" alias="Potential Friend X"> </public-user>
					</div>

					<h1 class="header" data-i18n="Request_Header"></h1>
					<div class="friend-requests">
					${friendRelations.receivedRequests.map((element: any) => `
    					<public-user type="friend-request" alias=${element.friend.alias} profilePicData=${element.friend.profile_pic.data} profilePicMimeType=${element.friend.profile_pic.mimeType}></public-user>
					`).join('')}
					<public-user type="friend-request" alias="Wannabe Friend X"> </public-user>
					</div>

					<h1 class="header" data-i18n="Friends_Header"></h1>
					<div class="friends-list">
					${friendRelations.friends.map((element: any) => `
    					<public-user type="friend" alias=${element.friend.alias} profilePicData=${element.friend.profile_pic.data} profilePicMimeType=${element.friend.profile_pic.mimeType}></public-user>
					`).join('')}
					<public-user type="friend" alias="Friend X"> </public-user>
					</div>

					<h1 class="header" data-il8n="Blocked_Header"></h1>


				</div>
				<!-- ^^^ -->
			</div>
			`);
				getLanguage();
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
				document.querySelector('.userSearch')?.addEventListener('keyup', () => {
					searchBar();
				});
			}
		})
		.catch((error) => {
			console.log("ERROR (SetupFriends): ", error)
		}
		)
}


