import { getLanguage } from '../script/language';
import { dropDownBar } from '../script/dropDownBar';
import { fillTopbar } from '../script/fillTopbar';
import { setupNavigation } from '../script/menuNavigation';
import { connectFunc, requestBody } from '../script/connections';
import { setupErrorPages } from './errorPages';
import { setupMatchHistory } from './history';
import DOMPurify from 'dompurify';

interface snekMatchHistory {
	id: string;
	p1_alias: string;
	p2_alias: string;
	winner_id: number;
	p1_score: number;
	p2_score: number;
	p2_isGuest: boolean;
}

export function setupSnekMatchHistory() {
	const root = document.getElementById('app');
	const storedAlias = localStorage.getItem('myAlias');
	if (!storedAlias) {
		console.error("Can't find user alias");
		fillTopbar(true);
		window.location.reload();
		return;
	}
	// Extract URL
	const urlParams = new URLSearchParams(window.location.search);
	const alias1 = urlParams.get('alias1');
	const alias2 = urlParams.get('alias2');
	const alias = urlParams.get('alias');
	let snekAPI: Promise<Response>;
	if (alias) {
		snekAPI = connectFunc(`/snekHistory/${alias}`, requestBody("GET", null));
	} else if (alias1 && alias2) {
		snekAPI = connectFunc(`/snekHistory/${alias1}/${alias2}`, requestBody("GET", null));
	} else if (alias1 && !alias2) {
		setupErrorPages(400, "Bad Request - Invalid parameters");
		return;
	} else {
		snekAPI = connectFunc(`/snekHistory/me`, requestBody("GET", null));
	}

	const displayedAlias = alias || (alias1 && alias2 ? `${alias1} versus ${alias2}` : storedAlias);
	snekAPI.then(response => {
		if (response.ok) {
			return response.json();
		}
		else {
			setupErrorPages(response.status, response.statusText);
		}
	})
		.then((snekMatchHistory: snekMatchHistory[]) => {
			let matches: number = snekMatchHistory.length;
			console.log(snekMatchHistory); // use this data in the table
			if (root) {
				root.innerHTML = "";
				root.insertAdjacentHTML("beforeend", /*html*/`
		<link rel="stylesheet" href="src/styles/history.css"> <!-- Link to the CSS file -->
		<div class="overlay"></div>
		<dropdown-menu></dropdown-menu>
		
			<!-- Switching between games -->
			<button class="game-btn-full" id="PongHistory">
				<span data-i18n="SwitchGame"></span> <img src="src/Pictures/game-pong.png">
			</button>
			
			<!-- My History Button -->
			<button class="my-history-btn" id="MyHistoryBtn">
				<span data-i18n="MyHistory">My History</span>
			</button>
			
			<!-- Search Section -->
			<div class="search-section">
				<div class="search-fields">
					<input type="text" id="alias1Input" class="alias-input" placeholder="Player 1 Alias">
					<input type="text" id="alias2Input" class="alias-input" placeholder="Player 2 Alias (optional)">
					<button class="find-btn" id="FindBtn">
						<span data-i18n="Find">Find</span>
					</button>
				</div>
			</div>
			
			<div class="imiddle">
				<div class="hcontainer">
					<h1 class="Pongheader" data-i18n="Snek"></h1>
					<h1 class="header" data-i18n="History"></h1>
					<!-- <p class="p1" data-i18n="History_P"></p> -->
					<p class="p1">${displayedAlias}</p>
					<p class="p1 text-red-600" ${matches === 0 ? '' : 'hidden'}>No matches found</p>
					<snek-table></snek-table>
					
				</div>
			</div>
		`);

				getLanguage();
				dropDownBar(["dropdown-btn", "language-btn", "language-content"]);
				fillTopbar();
				setupNavigation();
				setupSnekSearchFunctionality();

				document.getElementById('PongHistory')?.addEventListener('click', () => {
					window.history.pushState({}, '', '/history');
					setupMatchHistory();
				});

				document.getElementById('MyHistoryBtn')?.addEventListener('click', () => {
					window.location.href = '/snekHistory';
				});

				connectFunc(`/user`, requestBody("GET", null))
					.then((userInfoResponse) => {
						if (userInfoResponse.ok) {
							userInfoResponse.json().then((data) => {

								// Alias Name
								const aliasElem = document.getElementById("historyAliasName");
								if (aliasElem)
									aliasElem.textContent = data.alias;

							});
						} else {
							window.history.pushState({}, '', '/errorPages');
							setupErrorPages(userInfoResponse.status, userInfoResponse.statusText);
						}
					})
			}
		})
}

function setupSnekSearchFunctionality() {
	document.getElementById('FindBtn')?.addEventListener('click', () => {
		const alias1Input = document.getElementById('alias1Input') as HTMLInputElement;
		const alias2Input = document.getElementById('alias2Input') as HTMLInputElement;

		const alias1 = DOMPurify.sanitize(alias1Input.value.trim());
		const alias2 = DOMPurify.sanitize(alias2Input.value.trim());

		if (!alias1) {
			alert('Please enter at least one alias');
			return;
		}

		let url: string;
		if (alias2) {
			url = `/snekHistory?alias1=${encodeURIComponent(alias1)}&alias2=${encodeURIComponent(alias2)}`;
		} else {
			url = `/snekHistory?alias=${encodeURIComponent(alias1)}`;
		}

		window.location.href = url;
	});

	// Allow Enter key to trigger search
	const handleEnterKey = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			document.getElementById('FindBtn')?.click();
		}
	};

	document.getElementById('alias1Input')?.addEventListener('keypress', handleEnterKey);
	document.getElementById('alias2Input')?.addEventListener('keypress', handleEnterKey);
}