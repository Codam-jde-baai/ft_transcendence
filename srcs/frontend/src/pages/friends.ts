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

export type friendSchema = {
	friendid: number;
	friend: {
		alias: string;
		profile_pic: {
			data: string;
			mimeType: string;
		};
		win: number;
		loss: number;
	}
}

type FriendRelations = {
	friends: friendSchema[];
	receivedRequests: friendSchema[];
	sentRequests: friendSchema[];
};

let publicUsers: PubUserSchema[] = [];

export function setupFriends() {
	const root = document.getElementById('app');
	let friendRelations: FriendRelations = {
		friends: [],
		receivedRequests: [],
		sentRequests: [],
	};

	Promise.all([
		// request friend relations -> friendslists
		connectFunc(`/friends/me`, requestBody("GET"))
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
		connectFunc("/friends/nonfriends", requestBody("GET"))
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
					<div class="friends-list" id="friends-container">
						${friendRelations.friends.map((element: friendSchema) => `
						<public-user type="friend" alias=${element.friend.alias} friendid=${element.friendid} profilePicData=${element.friend.profile_pic.data} profilePicMimeType=${element.friend.profile_pic.mimeType}></public-user>
						`).join('')}
					</div>

					<h1 class="header" data-i18n="Request_Header"></h1>
					<div class="friends-list" id="requests-container">
						${friendRelations.receivedRequests.map((element: friendSchema) => `
    					<public-user type="friend-request" alias=${element.friend.alias} friendid=${element.friendid} profilePicData=${element.friend.profile_pic.data} profilePicMimeType=${element.friend.profile_pic.mimeType}></public-user>
						`).join('')}
					</div>
						<h1 class="header" data-i18n="Pending_Requests_Header"></h1>
						<div class="friends-list" id="pending-container">
						${friendRelations.sentRequests.map((element: friendSchema) => `
    					<public-user type="pendingRequests" alias=${element.friend.alias} friendid=${element.friendid} profilePicData=${element.friend.profile_pic.data} profilePicMimeType=${element.friend.profile_pic.mimeType}></public-user>
						`).join('')}
					</div>
				</div>
			</div>
			`);
				getLanguage();
				setupNavigation();
				setupSearchFunctionality(publicUsers);
				setupUserActionListeners();
			}
		})
		.catch((error) => {
			console.log("ERROR (SetupFriends): ", error)
		})
}

function setupNavigation() {
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
}

function setupSearchFunctionality(publicUsers: PubUserSchema[]) {
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
		getLanguage();
	});
}

// Function to refresh a specific container with fresh data from the server
function refreshContainer(containerId: string) {
	connectFunc(`/friends/me`, requestBody("GET"))
		.then(response => {
			if (response.ok) {
				return response.json();
			} else {
				console.log(`Error fetching friend data: ${response.status}`);
				return { friends: [], receivedRequests: [], sentRequests: [] };
			}
		})
		.then(data => {
			const container = document.getElementById(containerId);
			if (!container) return;

			let containerItems: friendSchema[] = [];
			let itemType = "";

			if (containerId === 'friends-container') {
				containerItems = data.friends;
				itemType = "friend";
			} else if (containerId === 'requests-container') {
				containerItems = data.receivedRequests;
				itemType = "friend-request";
			} else if (containerId === 'pending-container') {
				containerItems = data.sentRequests;
				itemType = "pendingRequests";
			}

			// Update container content
			container.innerHTML = containerItems.map((element: friendSchema) => `
                <public-user 
                    type="${itemType}" 
                    alias=${element.friend.alias} 
                    friendid=${element.friendid} 
                    profilePicData=${element.friend.profile_pic.data} 
                    profilePicMimeType=${element.friend.profile_pic.mimeType}>
                </public-user>
            `).join('');

			getLanguage();
		});
}

function setupUserActionListeners() {
	// Handle all user actions with a single event listener
	document.addEventListener('user-action', (e: Event) => {
		const customEvent = e as CustomEvent<{
			action: string;
			alias: string;
			friendid: number;
		}>;

		const { action, alias, friendid } = customEvent.detail;

		switch (action) {
			case 'btn_Accept':
				acceptFriendRequest(friendid);
				break;
			case 'btn_Decline':
				declineFriendRequest(friendid);
				break;
			case 'History':
				viewUserHistory(alias);
				break;
			case 'btn_Remove_Friend':
				removeFriend(friendid);
				break;
			case 'btn_Add_Friend':
				addFriend(alias);
				break;
			case 'btn_Cancel':
				cancelRequest(friendid);
				break;
		}
	});

	// Action handler functions
	function acceptFriendRequest(friendid: number) {
		console.log("acceptFriendRequest button, friend: ", friendid);
		connectFunc(`/friends/${friendid}/accept`, requestBody("PUT"))
			.then(response => {
				if (response.ok) {
					console.log(`Accepted friend request from user`);
					refreshContainer('requests-container');
					refreshContainer('friends-container');
				} else {
					console.error(`Failed to accept friend request: ${response.status}`);
				}
			});
	}

	function declineFriendRequest(friendid: number) {
		console.log("declineFriendRequest button, friend: ", friendid);
		connectFunc(`/friends/${friendid}/delete`, requestBody("DELETE"))
			.then(response => {
				if (response.ok) {
					console.log(`Declined friend request`);
					refreshContainer('requests-container');
				} else {
					console.error(`Failed to delete friend relation: ${response.status}`);
				}
			});
	}

	function viewUserHistory(alias: string) {
		window.history.pushState({ userData: alias }, '', `/history?user=${alias}`);
		setupMatchHistory();
		console.log("viewUserHistory button, alias: ", alias);
	}

	function removeFriend(friendid: number) {
		console.log("removeFriend button, friend: ", friendid);
		connectFunc(`/friends/${friendid}/delete`, requestBody("DELETE"))
			.then(response => {
				if (response.ok) {
					console.log(`Friend removed`);
					refreshContainer('friends-container');
				} else {
					console.error(`Failed to delete friend relation: ${response.status}`);
				}
			});
	}

	function addFriend(alias: string) {
		console.log("addFriend button, to become friend: ", alias);
		connectFunc(`/friends/new`, requestBody("POST", JSON.stringify({ alias: alias }), "application/json"))
			.then(response => {
				if (response.ok) {
					console.log(`Friend request sent`);
					refreshContainer('pending-container');
				} else {
					console.error(`Failed to add friend: ${response.status}`);
				}
			});
	}

	function cancelRequest(friendid: number) {
		console.log("cancelRequest button, friend: ", friendid);
		connectFunc(`/friends/${friendid}/delete`, requestBody("DELETE"))
			.then(response => {
				if (response.ok) {
					console.log(`Request canceled`);
					refreshContainer('pending-container');
				} else {
					console.error(`Failed to delete friend relation: ${response.status}`);
				}
			});
	}
}