import "../styles/snek.css"

import { setupErrorPages } from './errorPages';
import { connectFunc, requestBody } from '../script/connections';
import { AuthState } from '../script/gameSetup'
import { FormToggleListener, updateStartGameButton, setupGuestAliasLocking, setupLoginValidation } from '../script/gameSetup'
import { Pong, SceneOptions } from "./babylon.ts";
import { getLanguage } from '../script/language.ts';
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

export function setupPong() {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", /*html*/`
		<link rel="stylesheet" href="src/styles/startGame.css"> <!-- Link to the CSS file -->
		<div class="overlay"></div>
		<dropdown-menu></dropdown-menu>
		
		<div class="middle" id="middle">
			<div class="container">
				<h1 class="header" data-i18n="Game_Header"></h1>
					
				<div class="buttons">
					<button class="btn" id="btn_1v1" data-i18n="btn_1v1"></button>
				</div>
				<div class="buttons">
					<button class="btn" id="btn_Tournament" data-i18n="btn_Tournament"></button>
				</div>
			</div>
		</div>
		`);
		getLanguage();
		fillTopbar();
		dropDownBar(["dropdown-btn", "language-btn", "language-content"]);
		setupNavigation();
// Add event listener to launch Pong game
		const btn1v1 = document.getElementById("btn_1v1");
		btn1v1?.addEventListener("click", () => {
			PongGame(2);
			// Pong1v1();
		});
		const btnTournament = document.getElementById("btn_Tournament");
		btnTournament?.addEventListener("click", () => {
			PongGame(5); // To Be Modified With A UserInput Number
		});
	}
}

// export function Pong1v1() {
//     const userDataPromise = connectFunc("/matches/record/", requestBody("GET", null, "application/json"))
//         .then(response => {
//             if (response.ok) {
//                 return response.json();
//             } else {
//                 setupErrorPages(500, "Error fetching user data");
//                 throw new Error("Failed to fetch user data");
//             }
//         })
//         .catch(error => {
//             console.error("Error fetching player stats:", error);
//             // Return default stats object if fetch fails
//             window.history.pushState({}, '', '/errorPages');
//             setupErrorPages(500, "Error fetching player stats");
//             return;
//         });
//     userDataPromise.then((playerStats: PlayerStats) => {
// 		const page = document.getElementById("middle");
//         if (page) {
//             page.innerHTML = "";
//             page.insertAdjacentHTML("beforeend", /*html*/ `
// 			<canvas id="renderCanvas" style="pointer-events:none; position:absolute; width: 80vw; top:120px; left:220px; height: 80vh; display: block; z-index: 42;"></canvas> <!-- Edit Canvas -->
// 			<div class="fixed top-[120px] left-[220px] bg-black bg-opacity-75 py-10 px-8 rounded w-[500px] h-[100vh]">
// 				<div class="flex flex-col gap-4 items-center h-full overflow-y-auto w-full">
// 					<div class="flex flex-col w-full gap-10 bg-pink-500 text-white py-4 px-4 rounded justify-center">
// 						<div class="flex flex-col flex-1 gap-4 bg-red-500 py-2 px-4 rounded justify-items-center">
// 							<p>Player1</p>
// 							<p class="text-center">${playerStats.alias}</p>
// 							<div class="bg-red-600 p-2 rounded">
// 								<p>Wins: <span id="p1-wins">0</span> | Losses: <span id="p1-losses">0</span></p>
// 								<p>Win Rate: <span id="p1-winrate">0.0</span>%</p>
// 							</div>
// 						</div>
// 						<div class="flex flex-col flex-1 gap-4 bg-green-500 py-2 px-4 rounded justify-items-center">
// 							<p>Player2</p>
// 							<div class="flex items-center gap-4">
// 								<label class="flex items-center cursor-pointer">
// 									<span class="mr-2">Guest</span>
// 										<div class="relative inline-block w-16 h-8">
// 											<input type="checkbox" id="p2-authToggle" class="absolute w-0 h-0 opacity-0">
// 											<div class="absolute inset-0 bg-gray-300 rounded-full transition-colors duration-300" id="p2-toggleBackground"></div>
// 											<div class="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300" id="p2-toggleCircle"></div>
// 										</div>
// 									<span class="ml-2">Login</span>
// 								</label>
// 							</div>
// 								<!-- Guest Form -->
// 							<form id="p2-GuestAliasform" class="flex flex-col gap-2 text-black">
// 								<input type="text" id="p2-guestAliasInput" class="p-2 rounded" placeholder="Guest alias" required minlength="3" maxlength="117" />
// 								<div class="flex gap-2">
// 									<button id="p2-lockInGuest" type="button" class="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">Lock In</button>
// 									<button id="p2-changeGuestAlias" type="button" class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded hidden">Change</button>
// 								</div>
// 							</form>
// 								<!-- Login Form -->
// 							<form id="p2-LoginForm" class="form-fields text-black hidden flex flex-col">
// 								<input type="text" id="p2-loginUsername" class="form-input" placeholder="Username" />
// 								<input type="password" id="p2-loginPassword" class="form-input" placeholder="Password" />
// 								<div class="form-row flex">
// 									<button type="button" id="p2-loginButton" class="button-primary bg-purple-500 hover:bg-purple-700">Login</button>
// 									<button type="button" id="p2-logoutButton" class="button-primary bg-red-500 hover:bg-red-700 hidden">Logout</button>
// 								</div>
// 								<p id="p2-loginStatus" class="text-white text-center mt-2 hidden"></p>
// 							</form>
// 							<p class="text-center player2-info"></p>
// 							<!-- Player2 Stats Container (initially hidden) -->
// 							<div id="p2-StatsContainer" class="bg-green-600 p-2 rounded hidden">
// 								<p>Wins: <span id="p2-wins">0</span> | Losses: <span id="p2-losses">0</span></p>
// 								<p>Win Rate: <span id="p2-winrate">0.0</span>%</p>
// 							</div>
// 						</div>
// 					</div>
// 					<!-- Start/Post Game Buttons -->
// 					<button class="button-main bg-gray-500 cursor-not-allowed opacity-50" id="startGame" disabled>Start Game</button>
// 					<div class="hidden flex-row gap-4" id="replayButtons">
// 						<button class="button-primary bg-blue-500 hover:bg-blue-700" id="newGame">New Players</button>
// 						<button class="button-primary bg-pink-800 hover:bg-pink-600" id="restartGame">Rematch!</button>
// 					</div>
// 					<!-- Scroll Buffer -->
// 					<button class="button-main py-10 pointer-events-none opacity-0" ></button>
// 				</div>
// 			</div>
// 		`);
//         }
// 		try {
// 			const authState = createAuthState()
// 			updatePongPlayerStatsDisplay("p1", playerStats)
// 			setupGuestAliasLocking(authState);
// 			FormToggleListener(authState);
// 			setupLoginValidation(authState, "pong");
// 			updateStartGameButton(authState);
// 			newPlayersButton(authState);
// 			startGameListeners();
// 		} catch (error) {
// 			console.error("Error setting up the game:", error);
// 			window.history.pushState({}, '', '/errorPages');
// 			setupErrorPages(500, "Error launching game");
// 		};
//     });
// }

export function PongGame(playerCount:number) {
    const userDataPromise = connectFunc("/matches/record/", requestBody("GET", null, "application/json"))
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                setupErrorPages(500, "Error fetching user data");
                throw new Error("Failed to fetch user data");
            }
        })
        .catch(error => {
            console.error("Error fetching player stats:", error);
            // Return default stats object if fetch fails
            window.history.pushState({}, '', '/errorPages');
            setupErrorPages(500, "Error fetching player stats");
            return;
        });
    userDataPromise.then((playerStats: PlayerStats) => {
		const authStates: AuthState[] = []
		authStates[0] = createAuthState()
		authStates[0].isAuthenticated = true
		authStates[0].userAlias = playerStats.alias
		authStates[0].userUuid = playerStats.uuid
		const page = document.getElementById("middle");
        if (page) {
            page.innerHTML = "";
			let html = /*html*/ `
			<canvas id="renderCanvas" style="pointer-events:none; position:absolute; width: 80vw; top:120px; left:220px; height: 80vh; display: block; z-index: 42;"></canvas> <!-- Edit Canvas -->
			<div class="fixed top-[120px] left-[220px] bg-black bg-opacity-75 py-10 px-8 rounded w-[500px] h-[100vh]">
				<div class="flex flex-col gap-4 items-center h-full overflow-y-auto w-full">
					<div class="flex flex-col w-full gap-10 bg-pink-500 text-white py-4 px-4 rounded justify-center">
						<div class="flex flex-col flex-1 gap-4 bg-red-500 py-2 px-4 rounded justify-items-center">
							<p>Player1</p>
							<p class="text-center">${playerStats.alias}</p>
							<div class="bg-red-600 p-2 rounded">
								<p>Wins: <span id="p1-wins">0</span> | Losses: <span id="p1-losses">0</span></p>
								<p>Win Rate: <span id="p1-winrate">0.0</span>%</p>
							</div>
						</div>
			`;
			for (let playerNum:number = 2; playerNum <= playerCount; playerNum++) {
				html += /*html*/ `
							<div class="flex flex-col flex-1 gap-4 bg-green-500 py-2 px-4 rounded justify-items-center">
								<p>Player${playerNum}</p>
								<div class="flex items-center gap-4">
									<label class="flex items-center cursor-pointer">
										<span class="mr-2">Guest</span>
											<div class="relative inline-block w-16 h-8">
												<input type="checkbox" id="p${playerNum}-authToggle" class="absolute w-0 h-0 opacity-0">
												<div class="absolute inset-0 bg-gray-300 rounded-full transition-colors duration-300" id="p${playerNum}-toggleBackground"></div>
												<div class="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300" id="p${playerNum}-toggleCircle"></div>
											</div>
										<span class="ml-2">Login</span>
									</label>
								</div>
									<!-- Guest Form -->
								<form id="p${playerNum}-GuestAliasform" class="flex flex-col gap-2 text-black">
									<input type="text" id="p${playerNum}-guestAliasInput" class="p-2 rounded" placeholder="Guest alias" required minlength="3" maxlength="117" />
									<div class="flex gap-2">
										<button id="p${playerNum}-lockInGuest" type="button" class="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">Lock In</button>
										<button id="p${playerNum}-changeGuestAlias" type="button" class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded hidden">Change</button>
									</div>
								</form>
									<!-- Login Form -->
								<form id="p${playerNum}-LoginForm" class="form-fields text-black hidden flex flex-col">
									<input type="text" id="p${playerNum}-loginUsername" class="form-input" placeholder="Username" />
									<input type="password" id="p${playerNum}-loginPassword" class="form-input" placeholder="Password" />
									<div class="form-row flex">
										<button type="button" id="p${playerNum}-loginButton" class="button-primary bg-purple-500 hover:bg-purple-700">Login</button>
										<button type="button" id="p${playerNum}-logoutButton" class="button-primary bg-red-500 hover:bg-red-700 hidden">Logout</button>
									</div>
									<p id="p${playerNum}-loginStatus" class="text-white text-center mt-2 hidden"></p>
								</form>
								<p class="text-center player2-info"></p>
								<!-- PlayerX Stats Container (initially hidden) -->
								<div id="p${playerNum}-StatsContainer" class="bg-green-600 p-2 rounded hidden">
									<p>Wins: <span id="p${playerNum}-wins">0</span> | Losses: <span id="p${playerNum}-losses">0</span></p>
									<p>Win Rate: <span id="p${playerNum}-winrate">0.0</span>%</p>
								</div>
							</div>
				`;
			}
			html += /*html*/ `
					</div>
					<!-- Start/Post Game Buttons -->
					<button class="button-main bg-gray-500 cursor-not-allowed opacity-50 hidden" id="startGame" disabled>Start Game</button>
					<button class="button-main bg-gray-500 cursor-not-allowed opacity-50 hidden" id="startTournament" disabled>Start Game</button>
					<div class="hidden flex-row gap-4" id="replayButtons">
						<!-- <button class="button-primary bg-blue-500 hover:bg-blue-700" id="newGame">New Players</button> -->
						<button class="button-primary bg-pink-800 hover:bg-pink-600" id="restartGame">Rematch!</button>
					</div>
					<!-- Scroll Buffer -->
					<button class="button-main py-10 pointer-events-none opacity-0" ></button>
				</div>
			</div>
			`;
        	page.insertAdjacentHTML("beforeend", html);
        }
		try {
			if (playerCount === 2) {
    			const startGameButton = document.getElementById('startGame') as HTMLButtonElement;
				startGameButton.classList.remove('hidden')
			} else {
				const startTournamentButton = document.getElementById('startTournament') as HTMLButtonElement;
				startTournamentButton.classList.remove('hidden')
			}
			updatePongPlayerStatsDisplay("p1", playerStats);
			for (let playerNum:number = 2; playerNum <= playerCount; playerNum++) {
				const playerId:string = `p${playerNum}`;
				authStates[playerNum -1] = createAuthState()
				setupGuestAliasLocking(authStates[playerNum -1], playerId);
				FormToggleListener(authStates[playerNum -1], playerId);
				setupLoginValidation(authStates[playerNum -1], "pong", playerId);
				updateStartGameButton(authStates[playerNum -1], playerId);
				seedPlayerListener(authStates[playerNum -1], playerId);
				// newPlayersButton(authStates[playerNum -1]);
			}
			if (playerCount === 2)
				startGameListeners(authStates, 1, 2);
			else {
				const startTournamentButton = document.getElementById("startTournament") as HTMLButtonElement;
				if (startTournamentButton) {
					startTournamentButton.addEventListener("click", () => {
						startTournamentButton.disabled = true;
        				startTournamentButton.classList.add('bg-gray-500', 'cursor-not-allowed', 'opacity-50');
        				startTournamentButton.classList.remove('bg-blue-500', 'hover:bg-blue-700', 'text-white');
						startTournament(authStates, playerCount);
					});
				} else {
					console.error("startTournament Button Not Found");
				}
			}
		} catch (error) {
			console.error("Error setting up the game:", error);
			window.history.pushState({}, '', '/errorPages');
			setupErrorPages(500, "Error launching game");
		};
    });
}

// Function to update player stats display (for Pong)
export function updatePongPlayerStatsDisplay(display:string, stats: PlayerStats) {
    const wins = document.getElementById(`${display}-wins`);
    const losses = document.getElementById(`${display}-losses`);
    const winrate = document.getElementById(`${display}-winrate`);

    if (wins) wins.textContent = stats.wins.toString();
    if (losses) losses.textContent = stats.losses.toString();
    if (winrate) winrate.textContent = stats.win_rate.toFixed(2).toString();
}

// Function to fetch player stats (for Pong)
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

async function startPong(gamePayload:GameEndPayload, options:SceneOptions): Promise<GameEndPayload> {
	const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
	try {
		if (!canvas)
			throw new Error("Canvas element with id 'renderCanvas' not found.");
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

// Record game results (for Pong)
async function recordGameResults(gamePayload: GameEndPayload): Promise<boolean> {
    try {
        console.log("Submitting game results:", gamePayload);
        // Make the API call
        const response = await connectFunc(
            "/matches/new",
            requestBody("POST", JSON.stringify(gamePayload), "application/json")
        );
        if (response.ok) {
            console.log("Game results recorded successfully");
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

// starts the listeners for the game button (for Pong)
async function startGameListeners(authStates:AuthState[], player1Number:number, player2Number:number, winnerStates?:AuthState[]): Promise<void> {
    const startGameButton = document.getElementById('startGame') as HTMLButtonElement;
    const restartGameButton = document.getElementById('restartGame');
    const replayButtons = document.getElementById('replayButtons');

    if (!startGameButton || !restartGameButton || !replayButtons) {
        console.error("One or more elements not found");
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
            // In Case Of Tournament, Update The Array Of Winners
			if (winnerStates)
			{
				const matchIndex = player1Number //Because Seeding --> Player 1 Index === Matches Index
				if (gamePayload.status === 1 || gamePayload.status === 2)
					winnerStates[matchIndex -1] = gamePayload.status === 1 ? authStates[player1Number -1] : authStates[player2Number -1]
				else {
					console.log("Error During The Tournament, No Winner")
					// Some Proper Handling
				}
			}
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
		if (winnerStates) {

		}
		else if (replayButtons) {
        	replayButtons.classList.remove('hidden');
        	replayButtons.classList.add('flex');
		}
    };

    startGameButton.addEventListener('click', startGame)
    restartGameButton.addEventListener('click', startGame)
}

async function startTournament(authStates:AuthState[], playerCount:number) {
	try {
		let playerStates:AuthState[] = authStates
		for (let playerNum:number = 1; playerNum <= playerCount; playerNum++) {
			const seedInput = document.getElementById(`p${playerNum}-seed`) as HTMLInputElement;
			if (seedInput)
				playerStates[playerNum -1].seed = Number(seedInput.value)
			else {
				console.log("Error Seeding The Tournament")
				// Some Proper Handling
			}
		}
		playerStates.sort((a:AuthState, b:AuthState) => a.seed! - b.seed!)
		while (playerStates && playerStates.length !== 1)
			playerStates = await startTournamentRound(playerStates, playerStates.length)
		// Some kind of tournament end shit
	} catch (error) {
		console.error("Error Setting Up The Tournament:", error);
			// Some Proper Handling

	}
}
async function startTournamentRound(playerStates:AuthState[], playerCount:number) : Promise<AuthState[]> {
	try {
		const winnerStates:AuthState[] = []
		let matchIndex:number = 1
		if (playerCount % 2) {
			await startGameListeners(playerStates, playerCount - 1, playerCount, playerStates)
			playerCount--;
		}
		while (matchIndex !== playerCount - matchIndex) {
			await startGameListeners(playerStates, matchIndex, playerCount +1 - matchIndex, winnerStates)
		}
		return (winnerStates)
	} catch (error) {
		console.error("Error Setting Up The Tournament:", error);
		// Some Proper Handling
	}
	return [];
}