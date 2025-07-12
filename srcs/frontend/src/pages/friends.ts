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
let searchTimeout: number | null = null;

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
				root.insertAdjacentHTML("beforeend", /*html*/`
			<link rel="stylesheet" href="src/styles/friends.css">
			<link rel="stylesheet" href="src/styles/history.css">
			<link rel="stylesheet" href="src/styles/contentPages.css"> 
			<div class="overlay"></div>
			<dropdown-menu></dropdown-menu>
			
			<div class="middle">
				<div class="contentArea">
					<!-- NEW FLOATING SEARCH BAR -->
					<div class="search-overlay" id="searchOverlay"></div>
					<div class="search-container">
						<div class="search-input-wrapper">
							<input 
								type="text" 
								id="friendSearch" 
								class="userSearch" 
								data-i18n-placeholder="Friends_placeholder1"
								placeholder="Search for friends..."
								autocomplete="off"
								spellcheck="false"
							>
							<div class="search-actions">
								<button type="button" id="refreshButton" class="search-btn" title="Refresh">
									<img class="searchIcon" src="src/Pictures/refresh.png" alt="Refresh"/>
								</button>
								<button type="button" id="clearSearch" class="search-btn" title="Clear" style="display: none;">
									<svg class="searchIcon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
									</svg>
								</button>
							</div>
						</div>
						<div class="search-results" id="searchResults"></div>
					</div>

					<h1 class="header" data-i18n="Friends_Header">Friends</h1>
					<div class="your-friends-list-wrapper">
						<div class="friends-list" id="friends-container">
							${friendRelations.friends.map((element: friendSchema) => `
                                <public-user type="friend" alias=${element.friend.alias} friendid=${element.friendid} profilePicData=${element.friend.profile_pic.data} profilePicMimeType=${element.friend.profile_pic.mimeType} status="${element.friend.status}"></public-user>
                                `).join('')}
						</div>
					</div>

					<h1 class="header" data-i18n="Request_Header">Friend Requests</h1>
					<div class="friends-list-wrapper">
						<div class="friends-list" id="requests-container">
							${friendRelations.receivedRequests.map((element: friendSchema) => `
							<public-user type="friend-request" alias=${element.friend.alias} friendid=${element.friendid} profilePicData=${element.friend.profile_pic.data} profilePicMimeType=${element.friend.profile_pic.mimeType}></public-user>
							`).join('')}
						</div>
					</div>

					<h1 class="header" data-i18n="Pending_Requests_Header">Pending Requests</h1>
					<div class="friends-list-wrapper">
						<div class="friends-list" id="pending-container">
							${friendRelations.sentRequests.map((element: friendSchema) => `
							<public-user type="pendingRequests" alias=${element.friend.alias} friendid=${element.friendid} profilePicData=${element.friend.profile_pic.data} profilePicMimeType=${element.friend.profile_pic.mimeType}></public-user>
							`).join('')}
						</div>
					</div>
				</div>
			</div>
			`);
				getLanguage();
				dropDownBar(["dropdown-btn", "language-btn", "language-content"]);
				fillTopbar();
				setupNavigation();
				setupFloatingSearch();
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

function setupFloatingSearch() {
	const searchInput = document.getElementById('friendSearch') as HTMLInputElement;
	const searchResults = document.getElementById('searchResults') as HTMLElement;
	const searchOverlay = document.getElementById('searchOverlay') as HTMLElement;
	const clearButton = document.getElementById('clearSearch') as HTMLButtonElement;
	
	if (!searchInput || !searchResults || !searchOverlay) return;

	// Show/hide clear button based on input
	searchInput.addEventListener('input', () => {
		const hasValue = searchInput.value.trim().length > 0;
		clearButton.style.display = hasValue ? 'block' : 'none';
		
		if (hasValue) {
			performDelayedSearch();
		} else {
			hideSearchResults();
		}
	});

	// Clear search functionality
	clearButton.addEventListener('click', () => {
		searchInput.value = '';
		clearButton.style.display = 'none';
		hideSearchResults();
		searchInput.focus();
	});

	// Show results when input is focused and has content
	searchInput.addEventListener('focus', () => {
		if (searchInput.value.trim().length > 0) {
			showSearchResults();
		}
	});

	// Hide results when clicking outside
	searchOverlay.addEventListener('click', hideSearchResults);

	// Handle keyboard navigation
	searchInput.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') {
			hideSearchResults();
			searchInput.blur();
		} else if (e.key === 'Enter') {
			e.preventDefault();
			performSearch();
		}
	});

	function performDelayedSearch() {
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}
		searchTimeout = setTimeout(performSearch, 300);
	}

	function performSearch() {
		const query = DOMPurify.sanitize(searchInput.value.trim());
		
		if (!query) {
			hideSearchResults();
			return;
		}

		const matches = publicUsers.filter(user => 
			user.alias.toLowerCase().includes(query.toLowerCase())
		);

		displaySearchResults(matches);
		showSearchResults();
	}

	function displaySearchResults(matches: PubUserSchema[]) {
		if (matches.length === 0) {
			searchResults.innerHTML = '<div class="search-no-results">No users found</div>';
			return;
		}

		searchResults.innerHTML = matches.map(user => `
			<div class="search-result-item" data-alias="${user.alias}">
				<public-user 
					type="unfriend" 
					alias="${user.alias}" 
					profilePicData="${user.profile_pic.data}" 
					profilePicMimeType="${user.profile_pic.mimeType}">
				</public-user>
			</div>
		`).join('');

		// Add click handlers for search result items
		searchResults.querySelectorAll('.search-result-item').forEach(item => {
			item.addEventListener('click', (e) => {
				e.stopPropagation();
				// The public-user component will handle the actual action
				// We might want to close the search results after action
				setTimeout(() => {
					hideSearchResults();
					searchInput.value = '';
					clearButton.style.display = 'none';
				}, 100);
			});
		});

		getLanguage();
	}

	function showSearchResults() {
		searchResults.classList.add('show');
		searchOverlay.classList.add('active');
	}

	function hideSearchResults() {
		searchResults.classList.remove('show');
		searchOverlay.classList.remove('active');
	}
}

function refreshNonFriends() {
	connectFunc("/friends/nonfriends", requestBody("GET"))
		.then(response => {
			if (response.ok) {
				return response.json();
			} else {
				console.log({ msg: "error with /public/users call", status: response.status, message: response.body });
				return [];
			}
		})
		.then(data => {
			if (data)
				publicUsers = data;
			
			// Re-trigger search if there's an active search
			const searchInput = document.getElementById("friendSearch") as HTMLInputElement;
			if (searchInput?.value.trim()) {
				// Clear timeout and perform immediate search
				if (searchTimeout) {
					clearTimeout(searchTimeout);
				}
				setTimeout(() => {
					const event = new Event('input', { bubbles: true });
					searchInput.dispatchEvent(event);
				}, 100);
			}
		});
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
			console.error("Can't find user alias");
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
					console.log(`Request canceled`);
					refreshContainer('pending-container');
					refreshNonFriends();
				} else {
					console.error(`Failed to delete friend relation: ${response.status}`);
				}
			});
	}
}