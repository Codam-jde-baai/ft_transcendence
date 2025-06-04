import DOMPurify from 'dompurify';
import { connectFunc, requestBody } from './connections';
import { updateSnekPlayer2StatsDisplay, fetchSnekPlayer2Stats } from '../pages/startSGame'
import { updatePongPlayer2StatsDisplay, fetchPongPlayer2Stats } from '../pages/startPGame'

export interface AuthState {
	isAuthenticated: boolean;
	isGuestLocked: boolean;
	guestAlias: string;
	userAlias: string;
	userUuid?: string; // Added UUID for authenticated users
}

export interface UserData {
	uuid: string;
	alias: string;
}

// Prevents the toggle from being used if user is logged in / guest is locked in
export function FormToggleListener(authState:AuthState) {
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
export function updateFormToggle() {
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
export function updateStartGameButton(authState:AuthState) {
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
export function setupGuestAliasLocking(authState:AuthState) {
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
		updateStartGameButton(authState);
	});

	changeButton.addEventListener('click', () => {
		guestInputField.disabled = false;
		changeButton.classList.add('hidden');
		lockInButton.classList.remove('hidden');
		authState.isGuestLocked = false;
		updateStartGameButton(authState);
	});
}


// logs the user in
export function setupLoginValidation(authState:AuthState, game:string) {
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
                if (game === "pong") {
					const player2Stats = await fetchPongPlayer2Stats(userData.alias);
					if (player2Stats)
						updatePongPlayer2StatsDisplay(player2Stats);
				} else {
					const player2Stats = await fetchSnekPlayer2Stats(userData.alias);
					if (player2Stats)
						updateSnekPlayer2StatsDisplay(player2Stats);
				}

				updateStartGameButton(authState);
				updateFormToggle();
			} else {
				showLoginStatus(loginStatus, "Invalid username or password", false);
				authState.isAuthenticated = false;
				updateStartGameButton(authState);
				updateFormToggle();
			}
		} catch (error) {
			showLoginStatus(loginStatus, "Error during login. Please try again.", false);
			console.error("Login error:", error);
			authState.isAuthenticated = false;
			updateStartGameButton(authState);
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

		// resetGame(app);
		updateStartGameButton(authState);
		updateFormToggle();
	});
}

// displays output of login attempt
export function showLoginStatus(statusElement: HTMLElement, message: string, isSuccess: boolean) {
	statusElement.textContent = message;
	statusElement.classList.remove('hidden', 'text-green-500', 'text-red-500');
	statusElement.classList.add(isSuccess ? 'text-green-500' : 'text-red-500');
}

// calls login API
export async function validateLogin(username: string, password: string): Promise<UserData | null> {
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

// logic for resetting the game ( newplayer button )
export function newPlayersButton(authState:AuthState) {
    const newGameButton = document.getElementById('newGame');
    if (!newGameButton) {
        console.error("New game button not found");
        return;
    }

    newGameButton.addEventListener('click', () => {
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
        // resetGame(app);
        updateStartGameButton(authState);

        console.log("New players button clicked");
    });
}