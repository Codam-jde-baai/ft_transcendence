import DOMPurify from 'dompurify';
import { renderPage } from './index';
import { setupUserHome } from './home';
import { setupSetting } from './setting';
import { setupMatchHistory } from './history';
import { getLanguage } from '../script/language';
import { connectFunc, requestBody } from "../script/connections"

export type PubUserSchema = {
	alias: string;
	profile_pic: {
		data: string;
		mimeType: string;
	};
	win: number;
	loss: number;
};

export function setupFriends() {
	const root = document.getElementById('app');
	let publicUsers: PubUserSchema[] = [];
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
				<div class="container">
				<div class="search-container">
					<form id="searchForm">
						<button type="button" id="searchButton" class="search-btn">
							<img class="searchIcon" src="src/component/Pictures/searchIcon.png"/>
						</button>
						<input type="search" id="friendSearch" class="userSearch" data-i18n-placeholder="Friends_placeholder1">
					</form>
				</div>

				<div class="search-results" id="searchResults">
				</div>

					<h1 class="header" data-i18n="Friends_Header"></h1>
					<div class="friends-list">
					${friendRelations.friends.map((element: any) => `
						<public-user type="friend" alias=${element.friend.alias} profilePicData=${element.friend.profile_pic.data} profilePicMimeType=${element.friend.profile_pic.mimeType}></public-user>
					`).join('')}
					</div>

					<h1 class="header" data-i18n="Request_Header"></h1>
					<div class="friends-list">
					${friendRelations.receivedRequests.map((element: any) => `
    					<public-user type="friend-request" alias=${element.friend.alias} profilePicData=${element.friend.profile_pic.data} profilePicMimeType=${element.friend.profile_pic.mimeType}></public-user>
					`).join('')}
					</div>

					<h1 class="header" data-i18n="Blocked_Header"></h1>
					<div class="friends-list">
					${friendRelations.blocked.map((element: any) => `
						<public-user type="blocked" alias=${element.friend.alias} profilePicData=${element.friend.profile_pic.data} profilePicMimeType=${element.friend.profile_pic.mimeType}></public-user>
						`).join('')}
					</div>

					<h1 class="header" data-i18n="Pending_Requests_Header"></h1>
					<div class="friends-list">
					${friendRelations.sentRequests.map((element: any) => `
    					<public-user type="pendingRequests" alias=${element.friend.alias} profilePicData=${element.friend.profile_pic.data} profilePicMimeType=${element.friend.profile_pic.mimeType}></public-user>
					`).join('')}
					</div>


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
				function performSearch() {
					const searchElement = document.getElementById('friendSearch') as HTMLInputElement;
					const query = DOMPurify.sanitize(searchElement.value);
					const resultsContainer = document.getElementById('searchResults');
					if (resultsContainer) {
						resultsContainer.innerHTML = '';
					}
					if (!query)
						return;
					let matches: number = 0;
					for (const user of publicUsers) {
						if (user.alias.includes(query)) {
							matches += 1;
							let userElement = document.createElement('public-user');
							userElement.setAttribute('type', 'unfriend');
							userElement.setAttribute('alias', user.alias);
							userElement.setAttribute('profilePicData', user.profile_pic.data);
							userElement.setAttribute('profilePicMimeType', user.profile_pic.mimeType);
							resultsContainer?.appendChild(userElement);
						}
					}

					if (matches === 0) {
						let userElement = document.createElement('public-user');
						userElement.setAttribute('alias', 'no results');
						resultsContainer?.appendChild(userElement);
						console.log("no matches found");
					}
				}
				function delayFunc(func: Function, delay: number) {
					let timeoutId: number;
					return function (...args: any[]) {
						clearTimeout(timeoutId);
						timeoutId = setTimeout(() => func(...args), delay);
					};
				}
				const delaySearch = delayFunc(performSearch, 100);
				document.getElementById('friendSearch')?.addEventListener('input', () => {
					delaySearch();
				});

				document.getElementById('searchButton')?.addEventListener('click', () => {
					performSearch();
				});
			}
		})
		.catch((error) => {
			console.log("ERROR (SetupFriends): ", error)
		}
		)
}