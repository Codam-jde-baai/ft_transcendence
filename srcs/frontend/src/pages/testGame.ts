import { startSnek, preGameScreen, restartSnek, resetGame } from '../game/snek/main';
import { gameEndData } from '../game/snek/main';
import { Application } from 'pixi.js'
import { setupErrorPages } from './errorPages';
import DOMPurify from 'dompurify';
// topbar etc
// import { fillTopbar } from '../script/fillTopbar';
// import { dropDownBar } from '../script/dropDownBar';
// import { setupNavigation } from '../script/menuNavigation';
// import { getLanguage } from '../script/language';
import { connectFunc, requestBody } from '../script/connections';

interface AuthState {
    isAuthenticated: boolean;
    isGuestLocked: boolean;
    guestAlias: string;
    userAlias: string;
    userUuid?: string; // Added UUID for authenticated users
}

interface PlayerStats {
    alias: string;
    matches: number;
    wins: number;
    losses: number;
    winrate: number;
    avg_score: number;
    highest_score: number;
}

interface UserData {
    uuid: string;
    alias: string;
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

export function setupTestGame() {
    window.history.pushState({}, '', '/testgame');
    console.log("testgame page");

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
                        <form id="LoginForm" class="flex-col gap-2 text-black hidden">
                            <input type="text" id="loginUsername" class="p-2 rounded" placeholder="Username" />
                            <input type="password" id="loginPassword" class="p-2 rounded" placeholder="Password" />
                            <div class="flex gap-2">
                                <button type="button" id="loginButton" class="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">Login</button>
                                <button type="button" id="logoutButton" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded hidden">Logout</button>
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
                <button class="btn bg-gray-500 cursor-not-allowed opacity-50" id="startGame" disabled>Start Game</button>
                <div id="gameContainer" class="mb-4"></div>
                <div class="hidden flex-row gap-4" id="replayButtons">
                    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" id="newGame">New Players</button>
                    <button class="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded" id="restartGame">Rematch!</button>
                    </div>
            </div>
            `);
        }
        // getLanguage();
        // dropDownBar(["dropdown-btn", "language-btn", "language-content"]);
        // fillTopbar();
        // setupNavigation();
        const container = document.getElementById('gameContainer') as HTMLElement;
        if (container) {
            preGameScreen(container).then((app: Application) => {
                
                setupGuestAliasLocking();
                FormToggleListener();
                setupLoginValidation();
                updateStartGameButton();
                startGameListeners(app);
                newPlayersButton(app);
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

// Prevents the toggle from being used if user is logged in / guest is locked in
function FormToggleListener() {
    const toggle = document.getElementById("authToggle") as HTMLInputElement;
    if (!toggle) {
        console.error("Auth toggle not found");
        return;
    }

    toggle.addEventListener('change', () => {
        if (authState.isGuestLocked || authState.isAuthenticated) {
            toggle.checked = !toggle.checked;
            return;
        }
        updateFormToggle();
    });
}

// updates the state of the form toggle
function updateFormToggle() {
    const toggle = document.getElementById("authToggle") as HTMLInputElement;
    const toggleBackground = document.getElementById("toggleBackground");
    const toggleCircle = document.getElementById("toggleCircle");
    const guestForm = document.getElementById("GuestAliasform") as HTMLFormElement;
    const loginForm = document.getElementById("LoginForm") as HTMLFormElement;

    if (!toggle || !toggleBackground || !toggleCircle || !guestForm || !loginForm) {
        console.error("Form toggle not found");
        return;
    }
    if (toggle.checked) {
        toggleBackground.classList.add('bg-blue-600');
        toggleBackground.classList.remove('bg-gray-300');
        toggleCircle.style.transform = 'translateX(32px)'
        guestForm.classList.add('hidden');
        guestForm.classList.remove('flex');
        loginForm.classList.remove('hidden');
        loginForm.classList.add('flex');
    } else {
        toggleBackground.classList.remove('bg-blue-600');
        toggleBackground.classList.add('bg-gray-300');
        toggleCircle.style.transform = 'translateX(0)';
        loginForm.classList.add('hidden');
        loginForm.classList.remove('flex');
        guestForm.classList.remove('hidden');
        guestForm.classList.add('flex');

        const loginStatus = document.getElementById('loginStatus');
        if (loginStatus) {
            loginStatus.classList.add('hidden');
        }
        (document.getElementById('loginUsername') as HTMLInputElement).value = '';
        (document.getElementById('loginPassword') as HTMLInputElement).value = '';
    }
}

// enables the start game button and displays the player2 alias
function updateStartGameButton() {
    const startGameButton = document.getElementById('startGame') as HTMLButtonElement;
    const player2InfoElements = document.querySelectorAll('.player2-info');
    const player2StatsContainer = document.getElementById('player2StatsContainer');

    if (!startGameButton) {
        console.error("Start game button not found");
        return;
    }
    if (authState.isAuthenticated || authState.isGuestLocked) {
        startGameButton.disabled = false;
        startGameButton.classList.remove('bg-gray-500', 'cursor-not-allowed', 'opacity-50');
        startGameButton.classList.add('bg-blue-500', 'hover:bg-blue-700', 'text-white');

        const displayName = authState.isAuthenticated ? authState.userAlias : authState.guestAlias;
        player2InfoElements.forEach(element => {
            element.textContent = displayName;
        });
        
        // Show player2 stats if authenticated
        if (player2StatsContainer) {
            if (authState.isAuthenticated) {
                player2StatsContainer.classList.remove('hidden');
            } else {
                player2StatsContainer.classList.add('hidden');
            }
        }
    } else {
        startGameButton.disabled = true;
        startGameButton.classList.add('bg-gray-500', 'cursor-not-allowed', 'opacity-50');
        startGameButton.classList.remove('bg-blue-500', 'hover:bg-blue-700', 'text-white');
        player2InfoElements.forEach(element => {
            element.textContent = "";
        });
        
        // Hide player2 stats
        if (player2StatsContainer) {
            player2StatsContainer.classList.add('hidden');
        }
    }
}

// validates and locks/unlocks the guest alias
function setupGuestAliasLocking() {
    const guestInputField = document.getElementById("guestAliasInput") as HTMLInputElement;
    const lockInButton = document.getElementById("lockInGuest") as HTMLButtonElement;
    const changeButton = document.getElementById("changeGuestAlias") as HTMLButtonElement;

    if (!guestInputField || !lockInButton || !changeButton) {
        console.error("Guest alias input or buttons not found");
        return;
    }

    lockInButton.addEventListener('click', () => {
        const rawInput = guestInputField.value.trim();
        const sanitizedInput = rawInput.replace(/[^a-zA-Z0-9]/g, '');
        const guestInput = DOMPurify.sanitize(sanitizedInput);

        if (guestInput.length < 3) {
            alert("Guest alias must be at least 3 characters long.");
            return;
        }
        guestInputField.disabled = true;
        lockInButton.classList.add('hidden');
        changeButton.classList.remove('hidden');

        authState.isGuestLocked = true;
        authState.guestAlias = "(guest) " + guestInput;
        updateStartGameButton();
    });

    changeButton.addEventListener('click', () => {
        guestInputField.disabled = false;
        changeButton.classList.add('hidden');
        lockInButton.classList.remove('hidden');
        authState.isGuestLocked = false;
        updateStartGameButton();
    });
}

// Function to update player2 stats display
function updatePlayer2StatsDisplay(stats: PlayerStats) {
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

// Function to fetch player2 stats
async function fetchPlayer2Stats(alias: string): Promise<PlayerStats | null> {
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

// logs the user in
function setupLoginValidation() {
    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.getElementById('logoutButton');
    const usernameInput = document.getElementById('loginUsername') as HTMLInputElement;
    const passwordInput = document.getElementById('loginPassword') as HTMLInputElement;
    const loginStatus = document.getElementById('loginStatus');

    if (!loginButton || !logoutButton || !usernameInput || !passwordInput || !loginStatus) {
        console.error("Login elements not found");
        return;
    }

    loginButton.addEventListener('click', async () => {
        const usernameIn = usernameInput.value.trim().replace(/[^a-zA-Z0-9]/g, '');
        const passwordIn = passwordInput.value.trim().replace(/[^a-zA-Z0-9]/g, '');
        const username = DOMPurify.sanitize(usernameIn);
        const password = DOMPurify.sanitize(passwordIn);
        if (!username || username.length < 3) {
            showLoginStatus(loginStatus, "Username must be at least 3 characters long", false);
            return;
        }
        if (!password || password.length < 6) {
            showLoginStatus(loginStatus, "Password must be at least 6 characters long", false);
            return;
        }
        try {
            const userData = await validateLogin(username, password);
            if (userData) {
                showLoginStatus(loginStatus, "Login successful!", true);
                authState.isAuthenticated = true;
                authState.userAlias = userData.alias;
                authState.userUuid = userData.uuid; // Store UUID for game results

                usernameInput.disabled = true;
                passwordInput.disabled = true;
                loginButton.classList.add('hidden');
                logoutButton.classList.remove('hidden');

                // Fetch and display player2 stats
                const player2Stats = await fetchPlayer2Stats(userData.alias);
                if (player2Stats) {
                    updatePlayer2StatsDisplay(player2Stats);
                }

                updateStartGameButton();
                updateFormToggle();
            } else {
                showLoginStatus(loginStatus, "Invalid username or password", false);
                authState.isAuthenticated = false;
                updateStartGameButton();
                updateFormToggle();
            }
        } catch (error) {
            showLoginStatus(loginStatus, "Error during login. Please try again.", false);
            console.error("Login error:", error);
            authState.isAuthenticated = false;
            updateStartGameButton();
            updateFormToggle();
        }
    });

    logoutButton.addEventListener('click', () => {
        authState.isAuthenticated = false;
        authState.userAlias = "";
        authState.userUuid = undefined;
        
        usernameInput.disabled = false;
        passwordInput.disabled = false;
        usernameInput.value = "";
        passwordInput.value = "";
        loginButton.classList.remove('hidden');
        logoutButton.classList.add('hidden');
        loginStatus.classList.add('hidden');

        updateStartGameButton();
        updateFormToggle();
    });
}

// displays output of login attempt
function showLoginStatus(statusElement: HTMLElement, message: string, isSuccess: boolean) {
    statusElement.textContent = message;
    statusElement.classList.remove('hidden', 'text-green-500', 'text-red-500');
    statusElement.classList.add(isSuccess ? 'text-green-500' : 'text-red-500');
}

// calls login API
async function validateLogin(username: string, password: string): Promise<UserData | null> {
    console.log(`Attempting to login with username: ${username}`);

    try {
        const response = await connectFunc(
            "/user/game/login", 
            requestBody("POST", JSON.stringify({ username, password }), "application/json")
        );
        
        if (response.ok) {
            const userData: UserData = await response.json();
            return userData;
        } else {
            console.error(`Login failed: ${response.status}`);
            return null;
        }
    } catch (error) {
        console.error("Login error:", error);
        return null;
    }
}

// Record game results
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

// starts the listeners for the game button
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
                const updatedStats = await fetchPlayer2Stats(authState.userAlias);
                if (updatedStats) {
                    updatePlayer2StatsDisplay(updatedStats);
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
                const updatedStats = await fetchPlayer2Stats(authState.userAlias);
                if (updatedStats) {
                    updatePlayer2StatsDisplay(updatedStats);
                }
            }
        } catch (error) {
            console.error("Error during game restart:", error);
        }
        
        replayButtons.classList.remove('hidden');
        replayButtons.classList.add('flex');
    });
}

// logic for resetting the game ( newplayer button )
// logic for resetting the game ( newplayer button )
function newPlayersButton(app: Application) {
    const newGameButton = document.getElementById('newGame');
    if (!newGameButton) {
        console.error("New game button not found");
        return;
    }

    newGameButton.addEventListener('click', () => {
        window.history.pushState({}, '', '/home');

        // Reset auth state
        authState.isAuthenticated = false;
        authState.isGuestLocked = false;
        authState.guestAlias = "";
        authState.userAlias = "";
        authState.userUuid = undefined;

        // Reset guest form
        const guestInput = document.getElementById("guestAliasInput") as HTMLInputElement;
        const lockInButton = document.getElementById("lockInGuest") as HTMLButtonElement;
        const changeButton = document.getElementById("changeGuestAlias") as HTMLButtonElement;

        if (guestInput && lockInButton && changeButton) {
            guestInput.value = "";
            guestInput.disabled = false;
            lockInButton.classList.remove('hidden');
            changeButton.classList.add('hidden');
        }

        // Reset login form
        const usernameInput = document.getElementById("loginUsername") as HTMLInputElement;
        const passwordInput = document.getElementById("loginPassword") as HTMLInputElement;
        const loginButton = document.getElementById("loginButton") as HTMLButtonElement;
        const logoutButton = document.getElementById("logoutButton") as HTMLButtonElement;
        const loginStatus = document.getElementById("loginStatus");

        if (usernameInput && passwordInput && loginStatus) {
            usernameInput.value = "";
            passwordInput.value = "";
            usernameInput.disabled = false;
            passwordInput.disabled = false;
            loginStatus.classList.add('hidden');
        }

        // Reset login/logout buttons
        if (loginButton && logoutButton) {
            loginButton.classList.remove('hidden');
            logoutButton.classList.add('hidden');
        }

        // Reset toggle to guest mode
        const toggle = document.getElementById("authToggle") as HTMLInputElement;
        if (toggle) {
            toggle.checked = false;
            updateFormToggle();
        }

        // Hide player2 stats
        const player2StatsContainer = document.getElementById('player2StatsContainer');
        if (player2StatsContainer) {
            player2StatsContainer.classList.add('hidden');
        }

        // Hide replay buttons
        const replayButtons = document.getElementById('replayButtons');
        if (replayButtons) {
            replayButtons.classList.add('hidden');
            replayButtons.classList.remove('flex');
        }

        // Update start game button state
        resetGame(app);
        updateStartGameButton();

        console.log("New players button clicked");
    });
}