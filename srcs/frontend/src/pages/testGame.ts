import { startSnek, preGameScreen, restartSnek, gameEndData, resetGame } from '../game/snek/main';
import { Application } from 'pixi.js'
import { setupErrorPages } from './errorPages';
import DOMPurify from 'dompurify';
// topbar etc
import { fillTopbar } from '../script/fillTopbar';
import { dropDownBar } from '../script/dropDownBar';
import { setupNavigation } from '../script/menuNavigation';
import { getLanguage } from '../script/language';

interface AuthState {
    isAuthenticated: boolean;
    isGuestLocked: boolean;
    guestAlias: string;
    userAlias: string;
}

const authState: AuthState = {
    isAuthenticated: false,
    isGuestLocked: false,
    guestAlias: "",
    userAlias: ""
};

export function setupTestGame() {
    const player1Alias = "julius"
    console.log("testgame page");
    const root = document.getElementById('app');
    if (root) {
        root.innerHTML = "";
        root.insertAdjacentHTML("beforeend", /*html*/ `
        <div class="flex flex-col gap-4 items-center bg-black bg-opacity-75 py-20 px-8 rounded">
            <div class="flex flex-row w-full gap-20 bg-pink-500 text-white py-2 px-4 rounded justify-center">
                <div class="flex flex-col flex-1 gap-4 bg-red-500 py-2 px-4 rounded justify-items-center">
                    <p>Player1 info (WASD)</span>
                    <p class="text-center">${player1Alias}</span>
                </div>
                <div class="flex flex-col flex-1 gap-4 bg-green-500 py-2 px-4 rounded justify-items-center">
                    <p>Player2 info (ARROW)</span>
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
                    <p class="text-center player2-info"></span>
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
            setupErrorPages(500, "Error launching game");
        });
    } else {
        console.error("Game container not found");
        return;
    }
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
    } else {
        startGameButton.disabled = true;
        startGameButton.classList.add('bg-gray-500', 'cursor-not-allowed', 'opacity-50');
        startGameButton.classList.remove('bg-blue-500', 'hover:bg-blue-700', 'text-white');
        player2InfoElements.forEach(element => {
            element.textContent = "";
        });
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
            let success = await validateLogin(username, password);
            if (success) {
                showLoginStatus(loginStatus, "Login successful!", true);
                authState.isAuthenticated = true;
                authState.userAlias = username;

                usernameInput.disabled = true;
                passwordInput.disabled = true;
                loginButton.classList.add('hidden');
                logoutButton.classList.remove('hidden');

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
async function validateLogin(username: string, password: string): Promise<boolean> {
    // This is a placeholder function for login validation
    // In a real application, you would make an API call to validate the credentials

    console.log(`Attempting to login with username: ${username}`);

    // Simulate API request with a delay
    return new Promise((resolve) => {
        setTimeout(() => {
            // For testing: consider "test" / "password" as valid credentials
            const isValid = (username === "test" && password === "password");
            console.log(`Login ${isValid ? 'successful' : 'failed'}`);
            resolve(isValid);
        }, 1000); // Simulate network delay
    });
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
        const gameData: gameEndData = await startSnek(app, "player1", player2Name);
        console.log("gameData", gameData);

        replayButtons.classList.remove('hidden');
        replayButtons.classList.add('flex');
    });

    restartGameButton.addEventListener('click', async () => {
        // Get the player2 name based on authentication state
        const player2Name = authState.isAuthenticated ? authState.userAlias : authState.guestAlias;
        replayButtons.classList.remove('flex');
        replayButtons.classList.add('hidden');
        const gameData: gameEndData = await restartSnek(app, "player1", player2Name);
        console.log("9Restarted) Game results", gameData);
        replayButtons.classList.remove('hidden');
        replayButtons.classList.add('flex');
    });
}

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
        const loginStatus = document.getElementById("loginStatus");

        if (usernameInput && passwordInput && loginStatus) {
            usernameInput.value = "";
            passwordInput.value = "";
            loginStatus.classList.add('hidden');
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