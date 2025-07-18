import "../styles/snek.css"

import { setupErrorPages } from './errorPages';
import { connectFunc, requestBody } from '../script/connections';
import { AuthState } from '../script/gameSetup'
import { FormToggleListener, updateStartGameButton, setupGuestAliasLocking, setupLoginValidation, lockAuthForm, unlockAuthForm } from '../script/gameSetup'
import { Pong, SceneOptions } from "./babylon.ts";
import { getLanguage, getTranslation } from '../script/language.ts';
import { dropDownBar } from '../script/dropDownBar.ts';
import { fillTopbar } from '../script/fillTopbar.ts';
import { setupNavigation } from '../script/menuNavigation.ts';

export interface PlayerStats {
	uuid: string,
	alias: string;
	wins: number;
	losses: number;
	win_rate: number;
}

interface GameEndPayload {
	p1_alias: string;
	p2_alias: string;
	winner_alias: string | null;
	p1_uuid: string | null;
	p2_uuid: string | null;
	status: number;
}

function createAuthState(): AuthState {
	return {
		isAuthenticated: false,
		isGuestLocked: false,
		guestAlias: "",
		userAlias: ""
	};
}

interface Round {
	playerStates: AuthState[]
	playerCount: number
	bracketSize: number
}

export function setupPong() {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", /*html*/`
		<link rel="stylesheet" href="src/styles/startGame.css"> <!-- Link to the CSS file -->
		<div class="overlay"></div>
		<dropdown-menu></dropdown-menu>
		
		<div class="middle" id="middle">
		</div>
		`);
		getLanguage();
		fillTopbar();
		dropDownBar(["dropdown-btn", "language-btn", "language-content"]);
		setupNavigation();
		setupQuickPong();
	}
}

export function setupQuickPong() {
	connectFunc("/matches/record/", requestBody("GET", null, "application/json"))
        .then(response => {
			if (!response.ok) {
				window.history.pushState({}, '', '/errorPages');
                setupErrorPages(response.status, response.statusText);
                return ;
            }
			response.json().then((playerStats: PlayerStats) => {
				const authStates: AuthState[] = []
				authStates[0] = createAuthState()
				authStates[0].isAuthenticated = true
				authStates[0].userAlias = playerStats.alias
				authStates[0].userUuid = playerStats.uuid
				const page = document.getElementById("middle");
				if (!page) {
				window.history.pushState({}, '', '/errorPages');
                setupErrorPages(500, "Could Not Load The Content Area Of QuickPong");
					return ;
				}
				page.innerHTML = "";
				page.style.position = "static";
				page.style.background = "transparent";
				page.style.border = "none";
				page.insertAdjacentHTML("beforeend", /*html*/ `
				<canvas id="renderCanvas" style="pointer-events:none; position:absolute; top:120px; left:220px; height: calc(100vh - 120px); width: calc(100vw - 220px); display: block; z-index: 42;"></canvas>
				<div class="fixed top-[120px] left-[220px] bg-black bg-opacity-75 py-10 px-8 rounded w-[500px] h-[100vh]">
					<div class="flex flex-col gap-4 items-center h-full overflow-y-auto w-full">
						<div class="flex flex-col w-full gap-10 bg-pink-500 text-white py-4 px-4 rounded justify-center">
							<div class="flex flex-col flex-1 gap-4 bg-red-500 py-2 px-4 rounded justify-items-center">
								<p><span data-i18n="SnekPlayer"></span>1</p>
								<p class="text-center">${playerStats.alias}</p>
								<div class="bg-red-600 p-2 rounded">
									<p><span data-i18n="SnekW"></span> <span id="p1-wins">0</span> |<span data-i18n="SnekL"></span> <span id="p1-losses">0</span></p>
									<p><span data-i18n="SnekWR"></span> <span id="p1-winrate">0.0</span><span>%</span></p>
								</div>
							</div>
							<div class="flex flex-col flex-1 gap-4 bg-green-500 py-2 px-4 rounded justify-items-center">
								<p><span data-i18n="SnekPlayer"></span>2</p>
								<div class="flex items-center gap-4">
									<label class="flex items-center cursor-pointer">
										<span class="mr-2"data-i18n="SnekG"></span>
											<div class="relative inline-block w-16 h-8">
												<input type="checkbox" id="p2-authToggle" class="absolute w-0 h-0 opacity-0">
												<div class="absolute inset-0 bg-gray-300 rounded-full transition-colors duration-300" id="p2-toggleBackground"></div>
												<div class="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300" id="p2-toggleCircle"></div>
											</div>
										<span class="ml-2" data-i18n="SnekLO"></span>
									</label>
								</div>
									<!-- Guest Form -->
								<form id="p2-GuestAliasform" class="flex flex-col gap-2 text-black">
									<input type="text" id="p2-guestAliasInput" class="p-2 rounded" data-i18n-placeholder="SnekPlaceholder1" required minlength="3" maxlength="117" />
									<div class="flex gap-2">
										<button id="p2-lockInGuest" type="button" class="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded" data-i18n="SnekLI"></button>
										<button id="p2-changeGuestAlias" type="button" class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded hidden" data-i18n="SnekC"></button>
									</div>
								</form>
									<!-- Login Form -->
								<form id="p2-LoginForm" class="form-fields text-black hidden flex-col">
									<input type="text" id="p2-loginUsername" class="form-input" data-i18n-placeholder="Username" />
									<input type="password" id="p2-loginPassword" class="form-input"data-i18n-placeholder="Password" />
									<div class="form-row flex">
										<button type="button" id="p2-loginButton" class="button-primary bg-purple-500 hover:bg-purple-700" data-i18n="SnekLI"></button>
										<button type="button" id="p2-logoutButton" class="button-primary bg-red-500 hover:bg-red-700 hidden" data-i18n="SnekLOut"></button>
									</div>
									<p id="p2-loginStatus" class="text-white text-center mt-2 hidden"></p>
								</form>
								<p class="text-center player2-info"></p>
								<!-- PlayerX Stats Container (initially hidden) -->
								<div id="p2-StatsContainer" class="bg-green-600 p-2 rounded hidden">
									<p><span data-i18n="SnekW"></span> <span id="p2-wins">0</span> | <span data-i18n="SnekL"></span> <span id="p2-losses">0</span></p>
									<p><span data-i18n="SnekWR"></span> <span id="p2-winrate">0.0</span><span>%</span></p>
								</div>
							</div>
						</div>
						<!-- Start Game Buttons -->
						<button class="button-main bg-gray-500 cursor-not-allowed opacity-50" id="startGame" disabled data-i18n="SnekSG"></button>
						<!-- Scroll Buffer -->
						<button class="button-main py-10 pointer-events-none opacity-0" ></button>
					</div>
				</div>
				`);
				initCanvas()
				getLanguage();
				try {
					updatePongPlayerStatsDisplay("p1", playerStats);
					authStates[1] = createAuthState()
					setupGuestAliasLocking(authStates[1]);
					FormToggleListener(authStates[1]);
					setupLoginValidation(authStates[1], "pong");
					updateStartGameButton(authStates[1]);
					startGameListeners(authStates, 1, 2);
				} catch (error:any) {
					console.error("Error setting up the game:", error);
					window.history.pushState({}, '', '/errorPages');
					setupErrorPages(500, error);
				};
			});
		})
		.catch(error => {
			console.error("Error fetching player stats:", error);
			window.history.pushState({}, '', '/errorPages');
			setupErrorPages(500, error);
			return ;
		});
}

function initCanvas() {
	try {
		const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
		if (!canvas) {
				throw new Error("Canvas Element With Id 'renderCanvas' Not Found.");
		}
		function resizeCanvas() {
			const width = window.innerWidth - 220;
			const height = window.innerHeight - 120;

			canvas.width = width;
			canvas.height = height;
		}
		window.addEventListener('resize', resizeCanvas);
		window.addEventListener('DOMContentLoaded', resizeCanvas);
	}
	catch (error:any) {
    	console.error("Error Initializing Canvas:", error);
		window.history.pushState({}, '', '/errorPages');
		setupErrorPages(500, error);
		return ;
	}
}

async function startGameListeners(authStates:AuthState[], player1Number:number, player2Number:number): Promise<void> {
    const startGameButton = document.getElementById('startGame') as HTMLButtonElement;
    if (!startGameButton) {
        console.error("startGameButton Not Found");
        return;
    }

	async function startGame() {
        startGameButton.disabled = true;
        startGameButton.classList.add('bg-gray-500', 'cursor-not-allowed', 'opacity-50');
        startGameButton.classList.remove('bg-blue-500', 'hover:bg-blue-700', 'text-white');
		try {
			const options:SceneOptions = {}
			options.p1_alias = authStates[player1Number -1].isAuthenticated ? authStates[player1Number -1].userAlias : authStates[player1Number -1].guestAlias
			options.p2_alias = authStates[player2Number -1].isAuthenticated ? authStates[player2Number -1].userAlias : authStates[player2Number -1].guestAlias
			let gamePayload:GameEndPayload = {
				p1_alias: options.p1_alias!,
				p2_alias: options.p2_alias!,
				winner_alias: null,
				p1_uuid: null,
				p2_uuid: null,
				status: 0
			}
			if (authStates[player1Number -1].isAuthenticated)
				gamePayload.p1_uuid = authStates[player1Number -1].userUuid!
			if (authStates[player2Number -1].isAuthenticated)
				gamePayload.p2_uuid = authStates[player2Number -1].userUuid!
			gamePayload = await startPong(gamePayload, options);
			// Record Game Results (Unless Played By 2 Guests Or Error Occurred)
			if (gamePayload.status !== -1 && (gamePayload.p1_uuid || gamePayload.p2_uuid)) {
				await recordGameResults(gamePayload);
				// If Player Is A User, Refresh Their Stats
				if (authStates[player1Number -1].isAuthenticated){	
					const updatedStats = await fetchPongPlayerStats(gamePayload.p1_alias);
					if (updatedStats) {
						updatePongPlayerStatsDisplay(`p${player1Number}`, updatedStats);
					}
				}
				if (authStates[player2Number -1].isAuthenticated) {
					const updatedStats = await fetchPongPlayerStats(authStates[player2Number -1].userAlias);
					if (updatedStats) {
						updatePongPlayerStatsDisplay(`p${player2Number}`, updatedStats);
					}
				}
			}
        } catch (error) {
            console.error("Error during game:", error);
        }
			startGameButton.disabled = false;
			startGameButton.classList.remove('bg-gray-500', 'cursor-not-allowed', 'opacity-50');
			startGameButton.classList.add('bg-blue-500', 'hover:bg-blue-700', 'text-white');
    };
    startGameButton.addEventListener('click', startGame)
}

export function setupTournamentPong(playerCount:number) {
    connectFunc("/matches/record/", requestBody("GET", null, "application/json"))
        .then(response => {
			if (!response.ok) {
				window.history.pushState({}, '', '/errorPages');
                setupErrorPages(response.status, response.statusText);
                return ;
            }
			response.json().then((playerStats: PlayerStats) => {
				const authStates: AuthState[] = []
				authStates[0] = createAuthState()
				authStates[0].isAuthenticated = true
				authStates[0].userAlias = playerStats.alias
				authStates[0].userUuid = playerStats.uuid
				const page = document.getElementById("middle");
				if (!page) {
				window.history.pushState({}, '', '/errorPages');
                setupErrorPages(500, "Could Not Load The Content Area Of Tournament Pong");
					return ;
				}
				page.innerHTML = "";
				page.style.position = "static";
				page.style.background = "transparent";
				page.style.border = "none";
				let html = /*html*/ `
				<canvas id="renderCanvas" style="pointer-events:none; position:absolute; top:120px; left:220px; height: calc(100vh - 120px); width: calc(100vw - 220px); display: block; z-index: 42;"></canvas>
				<div class="fixed top-[120px] left-[220px] bg-black bg-opacity-75 py-10 px-8 rounded w-[400px] h-[100vh]">
					<div class="flex flex-col gap-4 items-center h-full overflow-y-auto w-full overflow-x-hidden">
						<div class="flex flex-col w-full gap-10 bg-pink-500 text-white py-4 px-4 rounded justify-center">
							<div class="flex flex-col flex-1 gap-4 bg-red-500 py-2 px-4 rounded justify-items-center">
								<p><span data-i18n="SnekPlayer"></span>1<span id="p1-seed" class="px-3 text-sm"></span></p>
								<p class="text-center">${playerStats.alias}</p>
								<div class="bg-red-600 p-2 rounded">
									<p><span data-i18n="SnekW"></span> <span id="p1-wins">0</span> | <span data-i18n="SnekL"></span> <span id="p1-losses">0</span></p>
									<p><span data-i18n="SnekWR"> <span id="p1-winrate">0.0</span><span>%</span></p>
								</div>
							</div>
				`;
				for (let playerNum:number = 2; playerNum <= playerCount; playerNum++) {
					html += /*html*/ `
								<div class="flex flex-col flex-1 gap-4 bg-green-500 py-2 px-4 rounded justify-items-center">
									<p><span data-i18n="SnekPlayer"></span>${playerNum} <span id="p${playerNum}-seed" class="px-3 text-sm"></span></p>
									<div class="flex items-center gap-4">
										<label class="flex items-center cursor-pointer">
											<span class="mr-2"  data-i18n="SnekG"></span>
												<div class="relative inline-block w-16 h-8">
													<input type="checkbox" id="p${playerNum}-authToggle" class="absolute w-0 h-0 opacity-0">
													<div class="absolute inset-0 bg-gray-300 rounded-full transition-colors duration-300" id="p${playerNum}-toggleBackground"></div>
													<div class="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300" id="p${playerNum}-toggleCircle"></div>
												</div>
											<span class="ml-2" data-i18n="SnekLO"></span>
										</label>
									</div>
										<!-- Guest Form -->
									<form id="p${playerNum}-GuestAliasform" class="flex flex-col gap-2 text-black">
										<input type="text" id="p${playerNum}-guestAliasInput" class="p-2 rounded" data-i18n-placeholder="SnekPlaceholder1" required minlength="3" maxlength="117" />
										<div class="flex gap-2">
											<button id="p${playerNum}-lockInGuest" type="button" class="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded" data-i18n="SnekLI"></button>
											<button id="p${playerNum}-changeGuestAlias" type="button" class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded hidden" data-i18n="SnekC"></button>
										</div>
									</form>
										<!-- Login Form -->
									<form id="p${playerNum}-LoginForm" class="form-fields text-black hidden flex-col">
										<input type="text" id="p${playerNum}-loginUsername" class="form-input" placeholder="Username" />
										<input type="password" id="p${playerNum}-loginPassword" class="form-input" placeholder="Password" />
										<div class="form-row flex">
											<button type="button" id="p${playerNum}-loginButton" class="button-primary bg-purple-500 hover:bg-purple-700" data-i18n="SnekLI"></button>
											<button type="button" id="p${playerNum}-logoutButton" class="button-primary bg-red-500 hover:bg-red-700 hidden" data-i18n="SnekLOut"></button>
										</div>
										<p id="p${playerNum}-loginStatus" class="text-white text-center mt-2 hidden"></p>
									</form>
									<p class="text-center player2-info"></p>
									<!-- PlayerX Stats Container (initially hidden) -->
									<div id="p${playerNum}-StatsContainer" class="bg-green-600 p-2 rounded hidden">
										<p><span data-i18n="SnekW"></span> <span id="p${playerNum}-wins">0</span> | <span data-i18n="SnekL"></span> <span id="p${playerNum}-losses">0</span></p>
										<p><span data-i18n="SnekWR"></span> <span id="p${playerNum}-winrate">0.0</span><span>%</span></p>
									</div>
								</div>
					`;
				}
				html += /*html*/ `
						</div>
						<!-- Start/Post Game Buttons -->
						<button class="button-main bg-gray-500 cursor-not-allowed opacity-50" id="startTournament" disabled data-i18n="SnekST"></button>
						<button class="button-main bg-gray-500 cursor-not-allowed opacity-50 hidden" id="startGame" disabled data-i18n="SnekSG"></button>
						<!-- Scroll Buffer -->
						<button class="button-main py-10 pointer-events-none opacity-0" ></button>
					</div>
				</div>
				`;
				page.insertAdjacentHTML("beforeend", html);
				initCanvas();
				getLanguage();
				try {
					updatePongPlayerStatsDisplay("p1", playerStats);
					seedPlayerListener(authStates[0], "p1");
					for (let playerNum:number = 2; playerNum <= playerCount; playerNum++) {
						const playerId:string = `p${playerNum}`;
						authStates[playerNum -1] = createAuthState()
						setupGuestAliasLocking(authStates[playerNum -1], playerId);
						FormToggleListener(authStates[playerNum -1], playerId);
						setupLoginValidation(authStates[playerNum -1], "pong", playerId);
						isTournamentReadyListeners(authStates, playerId);
						seedPlayerListener(authStates[playerNum -1], playerId);
					}
					startTournamentListener(authStates);
				} catch (error:any) {
					console.error("Error setting up the game:", error);
					window.history.pushState({}, '', '/errorPages');
					setupErrorPages(500, error);
				};
			});
		})
		.catch(error => {
			console.error("Error fetching player stats:", error);
			window.history.pushState({}, '', '/errorPages');
			setupErrorPages(500, error);
			return ;
		});
}

async function seedPlayerListener(authState:AuthState, playerId:string) {
	const seed = document.getElementById(`${playerId}-seed`) as HTMLInputElement
	if (!seed) {
		return ;
	}; //some error
	seed.textContent = "(#" + playerId.slice(1) + " Seed)";
	seed.value = playerId.slice(1);
}

function isTournamentReadyListeners(authStates: AuthState[], playerID: string) {
	const loginButton = document.getElementById(`${playerID}-loginButton`) as HTMLButtonElement;
	const logoutButton = document.getElementById(`${playerID}-logoutButton`) as HTMLButtonElement;
	const lockInButton = document.getElementById(`${playerID}-lockInGuest`) as HTMLButtonElement;
	const changeButton = document.getElementById(`${playerID}-changeGuestAlias`) as HTMLButtonElement;

	if (loginButton && logoutButton && lockInButton && changeButton) {
		const update = () => updateStartTournamentButton(authStates);
		const delayedUpdate = () => {
			setTimeout(() => { updateStartTournamentButton(authStates) }, 500);
		}
		if (loginButton)
				loginButton.addEventListener('click', delayedUpdate);
		[logoutButton, lockInButton, changeButton].forEach(button => {
			if (button) {
				button.addEventListener('click', update);
			}
		});
	} else {
		console.error(`One or more buttons are missing for player: ${playerID}`);
	}
}

export function updateStartTournamentButton(authStates:AuthState[]) {
	const startTournamentButton = document.getElementById(`startTournament`) as HTMLButtonElement;

	if (!startTournamentButton) {
		console.error("startTournament Button Not Found");
		return;
	}
	const playerCount = authStates.length
	for (let playerNum:number = 1; playerNum < playerCount; playerNum++) {
		if (!(authStates[playerNum].isAuthenticated || authStates[playerNum].isGuestLocked)) {
			startTournamentButton.disabled = true;
			startTournamentButton.classList.add('bg-gray-500', 'cursor-not-allowed', 'opacity-50');
			startTournamentButton.classList.remove('bg-blue-500', 'hover:bg-blue-700', 'text-white');
			return ;
		}
	}
	startTournamentButton.disabled = false;
	startTournamentButton.classList.remove('bg-gray-500', 'cursor-not-allowed', 'opacity-50');
	startTournamentButton.classList.add('bg-blue-500', 'hover:bg-blue-700', 'text-white');
}

function startTournamentListener(authStates:AuthState[]) {
	const startTournamentButton = document.getElementById("startTournament") as HTMLButtonElement;
	if (startTournamentButton) {
		startTournamentButton.addEventListener("click", () => {
			const startGameButton = document.getElementById('startGame') as HTMLButtonElement;
			if (startGameButton)
				startGameButton.classList.remove('hidden')
			startTournamentButton.disabled = true;
			startTournamentButton.classList.add('bg-gray-500', 'cursor-not-allowed', 'opacity-50');
			startTournamentButton.classList.remove('bg-blue-500', 'hover:bg-blue-700', 'text-white');
			lockAuthForm(authStates.length);
			startTournament(authStates);
		});
	} else {
		console.error("startTournament Button Not Found");
	}
}

async function startTournament(authStates:AuthState[]) {
	try {
		tournamentHTML(authStates);
		const playerCount = authStates.length
		const rounds:Round[] = [];
		rounds[0] = {
			playerStates: authStates,
			playerCount: playerCount,
			bracketSize: playerCount
		}
		let totalNumberOfRounds:number = 1;
		for (let bracketSize:number = 2; bracketSize < playerCount; bracketSize *= 2) {
			rounds[0].bracketSize = bracketSize;
			totalNumberOfRounds++;
		}
		rounds[0].bracketSize *= 2
		for (let playerNum:number = 1; playerNum <= playerCount; playerNum++) {
			const seedInput = document.getElementById(`p${playerNum}-seed`) as HTMLInputElement;
			if (seedInput) {
				rounds[0].playerStates[playerNum -1].seed = Number(seedInput.value)
			} else {
				console.error("Error Seeding The Tournament")
				// Some Proper Handling
			}
		}
		authStates.sort((a:AuthState, b:AuthState) => a.seed! - b.seed!)
		const playerOrder = generateBracketMatchups(rounds[0].bracketSize)
		for (let position:number = 0; position < rounds[0].bracketSize ; position++) {
			if (playerOrder[position] <= playerCount)
				authStates[playerOrder[position]-1].position = position +1
		}
		for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
			initializeBracket(totalNumberOfRounds, authStates[playerIndex].isAuthenticated ? authStates[playerIndex].userAlias : authStates[playerIndex].guestAlias, authStates[playerIndex].position!)
		}
		let winnerStates:AuthState[]
		for (let i:number = 0; i < totalNumberOfRounds; i++) {
			winnerStates = await startTournamentRound(rounds[i], totalNumberOfRounds - i)
			if (winnerStates.length > 1) {			
				rounds[i+1] = {
					playerStates: winnerStates,
					playerCount: winnerStates.length,
					bracketSize: winnerStates.length
				}
			} else {
				const winnerAlias = winnerStates[0].isAuthenticated ? winnerStates[0].userAlias : winnerStates[0].guestAlias
				const message = getTranslation("Champion_Announcement");
				alert(`${playerCount}${message}${winnerAlias}`);
			}
		}
		const startGameButton = document.getElementById('startGame') as HTMLButtonElement;
		if (startGameButton)
			startGameButton.classList.add('hidden')
		const startTournamentButton = document.getElementById("startTournament") as HTMLButtonElement;
		if (startTournamentButton) {
			startTournamentButton.disabled = false;
			startTournamentButton.classList.remove('bg-gray-500', 'cursor-not-allowed', 'opacity-50');
			startTournamentButton.classList.add('bg-blue-500', 'hover:bg-blue-700', 'text-white');
		}
		unlockAuthForm(playerCount)
	} catch (error) {
		console.error("Error Setting Up The Tournament:", error);
			// Some Proper Handling

	}
}

function tournamentHTML(playerStates: AuthState[]) {
	const page = document.getElementById("middle");
	if (!page) {
		console.error("Could Not Load The Tournament Display");
		return ;
	}
	const tournament = document.getElementById("tournament");
	if (tournament)
		tournament.innerHTML = "";
	const playerCount = playerStates.length
	let totalNumberOfRounds:number = 1;
	let bracketSize:number;
	for (bracketSize = 2; bracketSize < playerCount; bracketSize *= 2) {
		totalNumberOfRounds++;
	}
	const boxWidth = 150;
	const boxSpacing = 30;
	const fullWidth = bracketSize * (boxWidth + boxSpacing);
	let html = /*html*/ `
	<div id="tournament">
		<div class="fixed top-[120px] left-[620px] right-0 bottom-0 overflow-x-auto overflow-y-auto flex justify-center items-start">
			<div class=" flex flex-col items-center space-y-10 mt-10" style="width:${fullWidth}px;">`;
		for (let round = 0; round <= totalNumberOfRounds; round++) {
			const playersInRound = Math.pow(2, round);
			const spacingUnit = fullWidth / playersInRound;
			html += /*html*/  `
				<div class="flex justify-center relative w-full h-[70px]">`;
			if (round === 0) {
				const leftOffset = (spacingUnit - boxWidth) / 2;
				html += /*html*/ `
				<div id="r0-b1" class="rounded-md px-4 py-2 text-center bg-white absolute" style="left:${leftOffset}px; width:${boxWidth}px;">
					<span data-i18n="Champion"></span>
				</div>`;
			} else 
			for (let playerBox = 1; playerBox <= playersInRound; playerBox++) {
				const label = round === totalNumberOfRounds ? "Bye" : "Awaiting_Winner";
				const leftOffset = spacingUnit * (playerBox - 1) + (spacingUnit - boxWidth) / 2;
				html += /*html*/ `
					<div id="r${round}-b${playerBox}" class="rounded-md px-4 py-2 text-center bg-white absolute" style="left:${leftOffset}px; width:${boxWidth}px;">
						<span  data-i18n="${label}"></span>
					</div>`;
			}
			html += /*html*/ `
				</div>`;
		}
		html += /*html*/ `
			</div>
		</div>
	</div>`;
	page.insertAdjacentHTML("beforeend", html);
	getLanguage();
}

function generateBracketMatchups(n: number): number[] {
	if (n === 2) return [1, 2];
	const prev = generateBracketMatchups(n / 2);
	const seedTotal = n + 1;
	const result:number[] = []
	for (const element of prev) {
		result.push(element);
		result.push(seedTotal - element);
	}
	return result;
}

async function startTournamentRound(round:Round, roundNumber:number) : Promise<AuthState[]> {
	try {
		const winnerStates:(AuthState)[] = [];
		const playerCount = round.playerCount;
		const bracketSize = round.bracketSize;
		let matchIndex:number = 0;
		for (const byeCount = bracketSize - playerCount; matchIndex < byeCount; matchIndex++) {
			winnerStates[matchIndex] = round.playerStates[matchIndex];
			const winnerAlias = winnerStates[matchIndex].isAuthenticated ? winnerStates[matchIndex].userAlias : winnerStates[matchIndex].guestAlias
			initializeBracket(roundNumber - 1, winnerAlias, winnerStates[matchIndex].position!)
			winnerStates[matchIndex].position! = (winnerStates[matchIndex].position! + 1) / 2
		}
		for (const winnersCount = bracketSize / 2; matchIndex !== winnersCount; matchIndex++) {
			winnerStates[matchIndex] = await startTournamentGameListeners(round.playerStates, matchIndex +1, bracketSize - matchIndex, roundNumber)
		}
		return (winnerStates)
	} catch (error) {
		console.error("Error Setting Up The Tournament:", error);
		// Some Proper Handling
		return [];
	}
}

async function startTournamentGameListeners(authStates:AuthState[], player1Number:number, player2Number:number, round:number): Promise<AuthState> {
    const startGameButton = document.getElementById('startGame') as HTMLButtonElement;
    if (!startGameButton) {
        console.error("startGameButton Not Found");
        throw new Error("startGameButton Not Found");
    }

	const options:SceneOptions = {}
	options.p1_alias = authStates[player1Number -1].isAuthenticated ? authStates[player1Number -1].userAlias : authStates[player1Number -1].guestAlias
	options.p2_alias = authStates[player2Number -1].isAuthenticated ? authStates[player2Number -1].userAlias : authStates[player2Number -1].guestAlias
	return new Promise((resolve, reject) => { async function startTournamentGame() {
    	startGameButton.removeEventListener('click', startTournamentGame);
		startGameButton.disabled = true;
        startGameButton.classList.add('bg-gray-500', 'cursor-not-allowed', 'opacity-50');
        startGameButton.classList.remove('bg-blue-500', 'hover:bg-blue-700', 'text-white');
		try {

			let gamePayload:GameEndPayload = {
				p1_alias: options.p1_alias!,
				p2_alias: options.p2_alias!,
				winner_alias: null,
				p1_uuid: null,
				p2_uuid: null,
				status: 0
			}
			if (authStates[player1Number -1].isAuthenticated)
				gamePayload.p1_uuid = authStates[player1Number -1].userUuid!
			if (authStates[player2Number -1].isAuthenticated)
				gamePayload.p2_uuid = authStates[player2Number -1].userUuid!
			gamePayload = await startPong(gamePayload, options);
			// Record Game Results (Unless Played By 2 Guests Or Error Occurred)
			if (gamePayload.status !== -1 && (gamePayload.p1_uuid || gamePayload.p2_uuid)) {
				await recordGameResults(gamePayload);
				// If Player Is A User, Refresh Their Stats
				if (authStates[player1Number -1].isAuthenticated){	
					const updatedStats = await fetchPongPlayerStats(gamePayload.p1_alias);
					if (updatedStats) {
						updatePongPlayerStatsDisplay(`p${player1Number}`, updatedStats);
					}
				}
				if (authStates[player2Number -1].isAuthenticated) {
					const updatedStats = await fetchPongPlayerStats(authStates[player2Number -1].userAlias);
					if (updatedStats) {
						updatePongPlayerStatsDisplay(`p${player2Number}`, updatedStats);
					}
				}
			}
			// Update The Array Of Winners And The Bracket
			if (gamePayload.status === 1 || gamePayload.status === 2) {
				const winnerState = gamePayload.status === 1 ? authStates[player1Number -1] : authStates[player2Number -1]
				const loserState = gamePayload.status === 2 ? authStates[player1Number -1] : authStates[player2Number -1]
				const doublePostion = authStates[player2Number -1].position!
				winnerState.position = doublePostion / 2
				const winnerAlias:string = winnerState.isAuthenticated ? winnerState.userAlias : winnerState.guestAlias
				const winnerBox:number = gamePayload.status === 2 ? doublePostion : doublePostion - 1;
				const loserAlias:string = loserState.isAuthenticated ? loserState.userAlias : loserState.guestAlias
				const loserBox:number = gamePayload.status === 1 ? doublePostion : doublePostion - 1;
				updateBracket(round, winnerAlias, winnerBox, loserAlias, loserBox)
				resolve(winnerState)
			}
			else {
				console.error("Error During The Tournament, No Winner")
				reject(new Error("Error During The Tournament, No Winner"))
			}
        } catch (error) {
            console.error("Error during game:", error);
			reject(error);
        } finally {
			startGameButton.disabled = false;
			startGameButton.classList.remove('bg-gray-500', 'cursor-not-allowed', 'opacity-50');
			startGameButton.classList.add('bg-blue-500', 'hover:bg-blue-700', 'text-white');
		}
	};
	const message = getTranslation("Upcoming_Match")
	setTimeout(() => { alert(`${message}\n${options.p1_alias} VS ${options.p2_alias}`) }, 100);
    startGameButton.addEventListener('click', startTournamentGame);
	})
}

function initializeBracket(round:number, alias:string, position:number) {
	const id:string = `r${round}-b${position}`;
	const box = document.getElementById(id) as HTMLElement;
	if (!box) {
		console.error("Could Not Initialize Tournament Bracket");
		return ;
	}
	box.textContent = alias;
}

function updateBracket(round:number, winnerAlias:string, boxWinner:number, loserAlias:string, boxLoser:number): void {
	const idWinner:string = `r${round}-b${boxWinner}`;
	const idLoser:string = `r${round}-b${boxLoser}`;
	const boxNextRound:number = (boxWinner > boxLoser ? boxWinner / 2 : boxLoser / 2)
	const idNextRound:string = `r${round-1}-b${boxNextRound}`;

	const winner = document.getElementById(idWinner) as HTMLElement;
	const loser = document.getElementById(idLoser) as HTMLElement;
	const nextRound = document.getElementById(idNextRound) as HTMLElement;

	if (!winner || !loser || !nextRound) {
		console.error("Could Not Update Tournament Bracket");
		return ;
	}
	winner.textContent = "W: '"+ winnerAlias + "'!";
	loser.textContent = "L: '" + loserAlias + "'..";
	if (round - 1 === 0) {
		nextRound.textContent += "'" + winnerAlias + "'";
	}
	else
		nextRound.textContent = winnerAlias;
}

async function startPong(gamePayload:GameEndPayload, options:SceneOptions): Promise<GameEndPayload> {
	const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
	try {
		if (!canvas)
			throw new Error("Canvas Element With Id 'renderCanvas' Not Found.");
		const game = new Pong(canvas, options);
		canvas.style.display = "block";
		const winner_id = await game.run();
		canvas.style.display = "none";
		gamePayload.status = winner_id
		gamePayload.winner_alias = winner_id === 1 ? gamePayload.p1_alias : gamePayload.p2_alias
	} catch (error) {
    	console.error("Error Starting Pong:", error);
		gamePayload.status = -1;
	}
	return (gamePayload);
}

export async function fetchPongPlayerStats(alias: string): Promise<PlayerStats | null> {
    try {
        const response = await connectFunc(
            `/matches/record/${encodeURIComponent(alias)}`,
            requestBody("GET", null, "application/json")
        );

        if (response.ok) {
            return await response.json();
        } else {
            console.error(`Failed to fetch stats for ${alias}: ${response.status}`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching stats for ${alias}:`, error);
        return null;
    }
}

export function updatePongPlayerStatsDisplay(display:string, stats: PlayerStats) {
    const wins = document.getElementById(`${display}-wins`);
    const losses = document.getElementById(`${display}-losses`);
    const winrate = document.getElementById(`${display}-winrate`);

    if (wins) wins.textContent = stats.wins.toString();
    if (losses) losses.textContent = stats.losses.toString();
    if (winrate) winrate.textContent = stats.win_rate.toFixed(2).toString();
}

async function recordGameResults(gamePayload: GameEndPayload): Promise<boolean> {
    try {
        const response = await connectFunc(
            "/matches/new",
            requestBody("POST", JSON.stringify(gamePayload), "application/json")
        );
        if (response.ok) {
            return true;
        } else {
            console.error(`Failed to record game results: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.error("Error recording game results:", error);
        return false;
    }
}