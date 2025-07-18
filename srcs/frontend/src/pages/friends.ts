import DOMPurify from 'dompurify';
import { setupMatchHistory } from './history';
import { getLanguage } from '../script/language';
import { connectFunc, requestBody } from "../script/connections"
import { fillTopbar } from '../script/fillTopbar';
import { dropDownBar } from '../script/dropDownBar';
import { setupNavigation } from '../script/menuNavigation';

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
		status: number;
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
						console.error("User not found");
					} else if (response.status === 404) {
						console.error("No friends found for this user");
					} else {
						console.error(`Unexpected error: ${response.status}`);
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
					return [];
				}
			})
	])
		.then(([friendData, publicData]) => {
			friendRelations = friendData;
			publicUsers = publicData;
			if (root) {
				root.innerHTML = "";
				root.insertAdjacentHTML("beforeend", /*html*/`
			<link rel="stylesheet" href="src/styles/friends.css">
			<link rel="stylesheet" href="src/styles/history.css"> <!-- Link to the CSS file -->
			<div class="overlay"></div>
			<dropdown-menu></dropdown-menu>
			
			<div class="fmiddle">
				<div class="big-wrapper">
					<div class="container">
						<div class="search-container">
							<form id="searchForm">
								<button type="button" id="searchButton" class="search-btn">
									<img class="searchIcon" src="src/Pictures/searchIcon.png"/>
								</button>
								<input type="search" id="friendSearch" class="userSearch" data-i18n-placeholder="Friends_placeholder1">
							</form>
							<button type="button" id="refreshButton" class="search-btn">
								<img class="searchIcon" src="src/Pictures/refresh.png"/>
							</button>
						</div>

						<div class="search-results" id="searchResults"></div>

						<h1 class="header" style="margin-top: 130px;" data-i18n="Friends_Header"></h1>
						<div class="your-friends-list-wrapper">
							<div class="friends-list" id="friends-container">
								${friendRelations.friends.map((element: friendSchema) => `
                                <public-user type="friend" alias=${element.friend.alias} friendid=${element.friendid} profilePicData=${element.friend.profile_pic.data} profilePicMimeType=${element.friend.profile_pic.mimeType} status="${element.friend.status}"></public-user>
                                `).join('')}
							</div>
						</div>

						<h1 class="header" data-i18n="Request_Header"></h1>
						<div class="friends-list-wrapper">
							<div class="friends-list" id="requests-container">
								${friendRelations.receivedRequests.map((element: friendSchema) => `
								<public-user type="friend-request" alias=${element.friend.alias} friendid=${element.friendid} profilePicData=${element.friend.profile_pic.data} profilePicMimeType=${element.friend.profile_pic.mimeType}></public-user>
								`).join('')}
							</div>
						</div>

						<h1 class="header" data-i18n="Pending_Requests_Header"></h1>
						<div class="friends-list-wrapper">
							<div class="friends-list" id="pending-container">
								${friendRelations.sentRequests.map((element: friendSchema) => `
								<public-user type="pendingRequests" alias=${element.friend.alias} friendid=${element.friendid} profilePicData=${element.friend.profile_pic.data} profilePicMimeType=${element.friend.profile_pic.mimeType}></public-user>
								`).join('')}
							</div>
						</div>
					</div>
					<!-- Extra transparent boxes to enlarge the wrapper visually -->
					<div class="extra-boxes-wrapper" style="margin-top: 32px; justify-content: center;">
						<div class="extra-box" style="width: 120px; height: 50px; background: rgba(255,255,255,0.05); rgba(0,0,0,0.03);"></div>
					</div>
				</div>
			</div>
			`);
				getLanguage();
				dropDownBar(["dropdown-btn", "language-btn", "language-content"]);
				fillTopbar();
				setupNavigation();
				setupSearchFunctionality();
				setupUserActionListeners();

				// Add this block to refresh both friends and pending lists
				const refreshBtn = document.getElementById('refreshButton');
				if (refreshBtn) {
					refreshBtn.addEventListener('click', () => {
						refreshContainer('friends-container');
						refreshContainer('pending-container');
						refreshNonFriends();
					});
				}
			}
		})
}

function setupSearchFunctionality() {
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
		}
		getLanguage();
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

function refreshNonFriends() {
	connectFunc("/friends/nonfriends", requestBody("GET"))
		.then(response => {
			if (response.ok) {
				return response.json();
			} else {
				return [];
			}
		})
		.then(data => {
			if (data)
				publicUsers = data;
			const searchBar = document.getElementById("friendSearch") as HTMLInputElement;
			if (searchBar?.value) {
				searchBar.dispatchEvent(new Event("input")); // trigger search
			}
		}
		)
}

// Function to refresh a specific container with fresh data from the server
function refreshContainer(containerId: string) {
	connectFunc(`/friends/me`, requestBody("GET"))
		.then(response => {
			if (response.ok) {
				return response.json();
			} else {
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
                    profilePicMimeType=${element.friend.profile_pic.mimeType}
                    status="${element.friend.status || 0}">
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
			case 'OurHistory':
				viewOurHistory(alias);
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
		connectFunc(`/friends/${friendid}/accept`, requestBody("PUT"))
			.then(response => {
				if (response.ok) {
					refreshContainer('requests-container');
					refreshContainer('friends-container');
				} else {
					console.error(`Failed to accept friend request: ${response.status}`);
				}
			});
	}

	function declineFriendRequest(friendid: number) {
		connectFunc(`/friends/${friendid}/delete`, requestBody("DELETE"))
			.then(response => {
				if (response.ok) {
					refreshContainer('requests-container');
				} else {
					console.error(`Failed to delete friend relation: ${response.status}`);
				}
			});
	}

	function viewUserHistory(alias: string) {
		window.history.pushState({ userData: alias }, '', `/history?alias=${alias}`);
		setupMatchHistory();
	}

	function viewOurHistory(alias: string) {
		const storedAlias = localStorage.getItem('myAlias');
		if (!storedAlias) {
			fillTopbar(true);
			window.location.reload();
			return;
		}
		window.history.pushState({ userData: alias }, '', `/history?alias1=${storedAlias}&alias2=${alias}`);
		setupMatchHistory();
	}

	function removeFriend(friendid: number) {
		connectFunc(`/friends/${friendid}/delete`, requestBody("DELETE"))
			.then(response => {
				if (response.ok) {
					refreshContainer('friends-container');
				} else {
					console.error(`Failed to delete friend relation: ${response.status}`);
				}
			});
	}

	function addFriend(alias: string) {
		connectFunc(`/friends/new`, requestBody("POST", JSON.stringify({ alias: alias }), "application/json"))
			.then(response => {
				if (response.ok) {
					refreshContainer('pending-container');
					refreshNonFriends();
				} else {
					console.error(`Failed to add friend: ${response.status}`);
				}
			});
	}

	function cancelRequest(friendid: number) {
		connectFunc(`/friends/${friendid}/delete`, requestBody("DELETE"))
			.then(response => {
				if (response.ok) {
					refreshContainer('pending-container');
					refreshNonFriends();
				} else {
					console.error(`Failed to delete friend relation: ${response.status}`);
				}
			});
	}
}