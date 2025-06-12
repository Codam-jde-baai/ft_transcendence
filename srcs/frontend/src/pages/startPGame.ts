import "../styles/snek.css"

import { setupErrorPages } from './errorPages';
import DOMPurify from 'dompurify';
import { connectFunc, requestBody } from '../script/connections';
import { AuthState } from '../script/gameSetup'
import { FormToggleListener, updateStartGameButton, setupGuestAliasLocking, setupLoginValidation, newPlayersButton } from '../script/gameSetup'
import { Pong, SceneOptions } from "./babylon.ts";
import { getLanguage } from '../script/language.ts';
import { dropDownBar } from '../script/dropDownBar.ts';
import { fillTopbar } from '../script/fillTopbar.ts';
import { setupNavigation } from '../script/menuNavigation.ts';

export interface PlayerStats {
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

const authState: AuthState = {
	isAuthenticated: false,
	isGuestLocked: false,
	guestAlias: "",
	userAlias: ""
};

const options: SceneOptions = {
}

export function setupStartGame() {
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
					<button class="btn" id ="btn_1v1" data-i18n="btn_1v1"></button>
				</div>
				<div class="buttons">
					<button class="btn" data-i18n="btn_Tournament"></button>
				</div>
			</div>
		</div>
		`);

		getLanguage();
		fillTopbar();
		dropDownBar(["dropdown-btn", "language-btn", "language-content"]);
		setupNavigation();

// Add event listener to launch Pong game
	const Btn1v1 = document.getElementById("btn_1v1");
	Btn1v1?.addEventListener("click", () => {
		Pong1v1();
		});
	}
}

export function Pong1v1() {
    const userDataPromise = connectFunc("/user", requestBody("GET", null, "application/json"))
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
		options.p1_alias = playerStats.alias;
		const page = document.getElementById("middle");
        if (page) {
            page.innerHTML = "";
            page.insertAdjacentHTML("beforeend", /*html*/ `
			<canvas id="renderCanvas" style="pointer-events:none; position:absolute; width: 80vw; top:120px; left:220px; height: 80vh; display: block; z-index: 42;"></canvas> <!-- Edit Canvas -->
			<div class="fixed top-[120px] left-[220px] bg-black bg-opacity-75 py-10 px-8 rounded w-[500px] h-[100vh]">
				<div class="flex flex-col gap-4 items-center h-full overflow-y-auto w-full">
					<div class="flex flex-col w-full gap-10 bg-pink-500 text-white py-4 px-4 rounded justify-center">
						<div class="flex flex-col flex-1 gap-4 bg-red-500 py-2 px-4 rounded justify-items-center">
							<p>Player1 (WASD)</p>
							<p class="text-center">${playerStats.alias}</p>
							<div class="bg-red-600 p-2 rounded">
								<p>Wins: ${playerStats.wins} | Losses: ${playerStats.losses}</p>
								<p>Win Rate: ${(playerStats.win_rate)}%</p>
							</div>
						</div>
						<div class="flex flex-col flex-1 gap-4 bg-green-500 py-2 px-4 rounded justify-items-center">
							<p>Player2 (ARROW)</p>
							<div class="flex items-center gap-4">
								<label class="flex items-center cursor-pointer">
									<span class="mr-2">Guest</span>
										<div class="relative inline-block w-16 h-8">
											<input type="checkbox" id="authToggle" class="absolute w-0 h-0 opacity-0">
											<div class="absolute inset-0 bg-gray-300 rounded-full transition-colors duration-300" id="toggleBackground"></div>
											<div class="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300" id="toggleCircle"></div>
										</div>
									<span class="ml-2">Login</span>
								</label>
							</div>
								<!-- Guest Form -->
							<form id="GuestAliasform" class="flex flex-col gap-2 text-black">
								<input type="text" id="guestAliasInput" class="p-2 rounded" placeholder="Guest alias" required minlength="3" maxlength="117" />
								<div class="flex gap-2">
									<button id="lockInGuest" type="button" class="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">Lock In</button>
									<button id="changeGuestAlias" type="button" class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded hidden">Change</button>
								</div>
							</form>
								<!-- Login Form -->
							<form id="LoginForm" class="form-fields text-black hidden flex flex-col">
								<input type="text" id="loginUsername" class="form-input" placeholder="Username" />
								<input type="password" id="loginPassword" class="form-input" placeholder="Password" />
								<div class="form-row flex">
									<button type="button" id="loginButton" class="button-primary bg-purple-500 hover:bg-purple-700">Login</button>
									<button type="button" id="logoutButton" class="button-primary bg-red-500 hover:bg-red-700 hidden">Logout</button>
								</div>
								<p id="loginStatus" class="text-white text-center mt-2 hidden"></p>
							</form>
							<p class="text-center player2-info"></p>
							<!-- Player2 Stats Container (initially hidden) -->
							<div id="player2StatsContainer" class="bg-green-600 p-2 rounded hidden">
								<p>Wins: <span id="p2-wins">0</span> | Losses: <span id="p2-losses">0</span></p>
								<p>Win Rate: <span id="p2-winrate">0.0</span>%</p>
							</div>
						</div>
					</div>
					<!-- Start/Post Game Buttons -->
					<button class="button-main bg-gray-500 cursor-not-allowed opacity-50" id="startGame" disabled>Start Game</button>
					<div class="hidden flex-row gap-4" id="replayButtons">
						<button class="button-primary bg-blue-500 hover:bg-blue-700" id="newGame">New Players</button>
						<button class="button-primary bg-pink-800 hover:bg-pink-600" id="restartGame">Rematch!</button>
					</div>
					<!-- Scroll Buffer -->
					<button class="button-main py-10 pointer-events-none opacity-0" ></button>
				</div>
			</div>
		`);
        }
		try {
			setupGuestAliasLocking(authState);
			FormToggleListener(authState);
			setupLoginValidation(authState, "pong");
			updateStartGameButton(authState);
			newPlayersButton(authState);
			startGameListeners();
		} catch (error) {
			console.error("Error setting up the game:", error);
			window.history.pushState({}, '', '/errorPages');
			setupErrorPages(500, "Error launching game");
		};
    });
}

// Function to update player2 stats display (for Pong) // Also needed for p1 for tournament
export function updatePongPlayerStatsDisplay(stats: PlayerStats) {
    const wins = document.getElementById('p2-wins');
    const losses = document.getElementById('p2-losses');
    const winrate = document.getElementById('p2-winrate');

    if (wins) wins.textContent = stats.wins.toString();
    if (losses) losses.textContent = stats.losses.toString();
    if (winrate) winrate.textContent = stats.win_rate.toString();
}

// Function to fetch player2 stats (for Pong) // Also needed for p1 for tournament
export async function fetchPongPlayerStats(alias: string): Promise<PlayerStats | null> {
    try {
        const sanitizedAlias = DOMPurify.sanitize(alias);
        const response = await connectFunc(
            `/useralias/${encodeURIComponent(sanitizedAlias)}`,
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

async function startPong(gamePayload:GameEndPayload): Promise<GameEndPayload> {
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

// Record game results (for Snek)
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

// starts the listeners for the game button (for Snek)
async function startGameListeners(): Promise<void> {
    const startGameButton = document.getElementById('startGame') as HTMLButtonElement;
    const restartGameButton = document.getElementById('restartGame');
    const newGameButton = document.getElementById('newGame');
    const replayButtons = document.getElementById('replayButtons');

    if (!newGameButton || !startGameButton || !restartGameButton || !replayButtons) {
        console.error("One or more elements not found");
        return;
    }

async function startGame() {
	// Start the game with the appropriate player names
        startGameButton.disabled = true;
        startGameButton.classList.add('bg-gray-500', 'cursor-not-allowed', 'opacity-50');
        startGameButton.classList.remove('bg-blue-500', 'hover:bg-blue-700', 'text-white');

		try {
			options.p2_alias = authState.isAuthenticated ? authState.userAlias : authState.guestAlias
			let gamePayload:GameEndPayload = {
				p1_alias: options.p1_alias!,
				p2_alias: options.p2_alias!,
				winner_alias: null,
				p1_uuid: null,
				p2_uuid: authState.isAuthenticated ? authState.userUuid! : null,
				status: 0
			}
			gamePayload = await startPong(gamePayload);
			console.log("Game ended with data:", gamePayload);

			// Add p1.uuid
            // Record Game Results (Unless Played By 2 Guests Or Error Occurred)
			// if (gamePayload.status == -1 || !(gamePayload.p1_uuid || gamePayload.p2_uuid))
			if (gamePayload.status == -1)
				return; // TODO reset Pong
            await recordGameResults(gamePayload);
			// Change4Tournament
			if (1) {
				const updatedStats = await fetchPongPlayerStats(gamePayload.p1_alias);
                if (updatedStats) {
                    updatePongPlayerStatsDisplay(updatedStats);
                }
			}
            // If player2 is authenticated, refresh their stats
            if (authState.isAuthenticated) {
                const updatedStats = await fetchPongPlayerStats(authState.userAlias);
                if (updatedStats) {
                    updatePongPlayerStatsDisplay(updatedStats);
                }
            }
        } catch (error) {
            console.error("Error during game:", error);
        }
		if (replayButtons) {
        	replayButtons.classList.remove('hidden');
        	replayButtons.classList.add('flex');
		}
    };

    startGameButton.addEventListener('click', startGame)
    restartGameButton.addEventListener('click', startGame)
}
