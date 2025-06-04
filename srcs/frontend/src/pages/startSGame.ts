import { startSnek, preGameScreen, restartSnek, resetGame } from '../game/snek/main';
import { gameEndData } from '../game/snek/main';
import { Application } from 'pixi.js'
import { setupErrorPages } from './errorPages';
import DOMPurify from 'dompurify';
import { connectFunc, requestBody } from '../script/connections';
import { setupSnek } from './snek';
import { AuthState } from '../script/gameSetup'
import { FormToggleListener, updateStartGameButton, setupGuestAliasLocking, setupLoginValidation, newPlayersButton } from '../script/gameSetup'

import "../styles/snek.css"

interface PlayerStats {
	alias: string;
	matches: number;
	wins: number;
	losses: number;
	winrate: number;
	avg_score: number;
	highest_score: number;
}

interface GameEndPayload {
	p2_alias: string;
	p2_uuid?: string;
	winner_id: number;
	p1_score: number;
	p2_score: number;
}

const authState: AuthState = {
	isAuthenticated: false,
	isGuestLocked: false,
	guestAlias: "",
	userAlias: ""
};

export function setupStartSGame() {
    const userDataPromise = connectFunc("/snek/stats/me", requestBody("GET", null, "application/json"))
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
        const root = document.getElementById('app');
        if (root) {
            root.innerHTML = "";
            root.insertAdjacentHTML("beforeend", /*html*/ `
            
            <div class="flex flex-col gap-4 items-center bg-black bg-opacity-75 py-20 px-8 rounded">

            <button class="fixed top-4 left-4 w-[190px] py-3 text-lg text-white bg-green-600 rounded-[7px] cursor-pointer mt-5 transition-all box-border font-sans hover:bg-green-500" id="SnekHome">Go back to home</button>

                <div class="flex flex-row w-full gap-20 bg-pink-500 text-white py-2 px-4 rounded justify-center">
                <div class="flex flex-col flex-1 gap-4 bg-red-500 py-2 px-4 rounded justify-items-center">
                        <p>Player1 (WASD)</p>
                        <p class="text-center">${playerStats.alias}</p>
                        <div class="bg-red-600 p-2 rounded">
                            <p>Matches: ${playerStats.matches}</p>
                            <p>Wins: ${playerStats.wins} | Losses: ${playerStats.losses}</p>
                            <p>Win Rate: ${(playerStats.winrate)}%</p>
                            <p>Avg Score: ${playerStats.avg_score}</p>
                            <p>Highest Score: ${playerStats.highest_score}</p>
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
                    <p>Matches: <span id="p2-matches">0</span></p>
                    <p>Wins: <span id="p2-wins">0</span> | Losses: <span id="p2-losses">0</span></p>
                    <p>Win Rate: <span id="p2-winrate">0.0</span>%</p>
                    <p>Avg Score: <span id="p2-avg-score">0.0</span></p>
                    <p>Highest Score: <span id="p2-highest-score">0</span></p>
                </div>
            </div>
        </div>
        <button class="button-main bg-gray-500 cursor-not-allowed opacity-50" id="startGame" disabled>Start Game</button>
        <div id="gameContainer" class="mb-4"></div>
        <div class="hidden flex-row gap-4" id="replayButtons">
            <button class="button-primary bg-blue-500 hover:bg-blue-700" id="newGame">New Players</button>
            <button class="button-primary bg-pink-800 hover:bg-pink-600" id="restartGame">Rematch!</button>
        </div>
    </div>
`);

            document.getElementById('SnekHome')?.addEventListener('click', () => {
                window.history.pushState({}, '', '/snek');
                setupSnek();
            });

            // getLanguage();
            // setupNavigation();

        }
        const container = document.getElementById('gameContainer') as HTMLElement;
        if (container) {
            preGameScreen(container).then(async (app: Application) => {

                setupGuestAliasLocking(authState);
                FormToggleListener(authState);
                setupLoginValidation(authState, "snek");
                updateStartGameButton(authState);
                startGameListeners(app);
                newPlayersButton(authState);

				const changeButton = document.getElementById("changeGuestAlias") as HTMLButtonElement;
				if (changeButton)
					changeButton.addEventListener('click', () => {
						resetGame(app);
    				});
				const logoutButton = document.getElementById('logoutButton');
				if (logoutButton)
					logoutButton.addEventListener('click', () => {
						resetGame(app);
    				});
				const newGameButton = document.getElementById('newGame');
				if (newGameButton)
					newGameButton.addEventListener('click', () => {
        				resetGame(app);
    				});
            }).catch((error) => {
                console.error("Error setting up the game:", error);
                window.history.pushState({}, '', '/errorPages');
                setupErrorPages(500, "Error launching game");
            });
        } else {
            console.error("Game container not found");
            return;
        }
    });

}

// Function to update player2 stats display (for Snek)
export function updateSnekPlayer2StatsDisplay(stats: PlayerStats) {
    const matches = document.getElementById('p2-matches');
    const wins = document.getElementById('p2-wins');
    const losses = document.getElementById('p2-losses');
    const winrate = document.getElementById('p2-winrate');
    const avgScore = document.getElementById('p2-avg-score');
    const highestScore = document.getElementById('p2-highest-score');

    if (matches) matches.textContent = stats.matches.toString();
    if (wins) wins.textContent = stats.wins.toString();
    if (losses) losses.textContent = stats.losses.toString();
    if (winrate) winrate.textContent = stats.winrate.toString();
    if (avgScore) avgScore.textContent = stats.avg_score.toString();
    if (highestScore) highestScore.textContent = stats.highest_score.toString();
}

// Function to fetch player2 stats (for Snek)
export async function fetchSnekPlayer2Stats(alias: string): Promise<PlayerStats | null> {
    try {
        const sanitizedAlias = DOMPurify.sanitize(alias);
        const response = await connectFunc(
            `/snek/stats/${encodeURIComponent(sanitizedAlias)}`,
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

// Record game results (for Snek)
async function recordGameResults(gameData: gameEndData): Promise<boolean> {
    try {
        // Prepare the payload for the API
        const payload: GameEndPayload = {
            p2_alias: DOMPurify.sanitize(authState.isAuthenticated ? authState.userAlias : authState.guestAlias),
            winner_id: gameData.winner,
            p1_score: gameData.p1score,
            p2_score: gameData.p2score
        };

        // Add UUID if player2 is authenticated
        if (authState.isAuthenticated && authState.userUuid) {
            payload.p2_uuid = DOMPurify.sanitize(authState.userUuid);
        }

        console.log("Submitting game results:", payload);

        // Make the API call
        const response = await connectFunc(
            "/snek/new",
            requestBody("POST", JSON.stringify(payload), "application/json")
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
async function startGameListeners(app: Application): Promise<void> {
    const startGameButton = document.getElementById('startGame') as HTMLButtonElement;
    const restartGameButton = document.getElementById('restartGame');
    const gameContainer = document.getElementById('gameContainer');
    const replayButtons = document.getElementById('replayButtons');

    if (!gameContainer || !startGameButton || !restartGameButton || !replayButtons) {
        console.error("One or more elements not found");
        return;
    }

    startGameButton.addEventListener('click', async () => {
        // Get the player2 name based on authentication state
        const player2Name = authState.isAuthenticated ? authState.userAlias : authState.guestAlias;

        // Start the game with the appropriate player names
        startGameButton.disabled = true;
        startGameButton.classList.add('bg-gray-500', 'cursor-not-allowed', 'opacity-50');
        startGameButton.classList.remove('bg-blue-500', 'hover:bg-blue-700', 'text-white');

        try {
            const gameData: gameEndData = await startSnek(app, "player1", player2Name);
            console.log("Game ended with data:", gameData);

            // Record game results
            const recordSuccess = await recordGameResults(gameData);
            if (recordSuccess) {
                console.log("Game results recorded successfully");
            } else {
                console.warn("Failed to record game results");
            }

            // If player2 is authenticated, refresh their stats
            if (authState.isAuthenticated) {
                const updatedStats = await fetchSnekPlayer2Stats(authState.userAlias);
                if (updatedStats) {
                    updateSnekPlayer2StatsDisplay(updatedStats);
                }
            }
        } catch (error) {
            console.error("Error during game:", error);
        }

        replayButtons.classList.remove('hidden');
        replayButtons.classList.add('flex');
    });

    restartGameButton.addEventListener('click', async () => {
        // Get the player2 name based on authentication state
        const player2Name = authState.isAuthenticated ? authState.userAlias : authState.guestAlias;
        replayButtons.classList.remove('flex');
        replayButtons.classList.add('hidden');

        try {
            const gameData: gameEndData = await restartSnek(app, "player1", player2Name);
            console.log("Restarted Game results:", gameData);

            // Record game results
            const recordSuccess = await recordGameResults(gameData);
            if (recordSuccess) {
                console.log("Game results recorded successfully");
            } else {
                console.warn("Failed to record game results");
            }

            // If player2 is authenticated, refresh their stats
            if (authState.isAuthenticated) {
                const updatedStats = await fetchSnekPlayer2Stats(authState.userAlias);
                if (updatedStats) {
                    updateSnekPlayer2StatsDisplay(updatedStats);
                }
            }
        } catch (error) {
            console.error("Error during game restart:", error);
        }

        replayButtons.classList.remove('hidden');
        replayButtons.classList.add('flex');
    });
}
