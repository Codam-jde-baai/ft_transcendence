import DOMPurify from 'dompurify';
import { connectFunc, requestBody } from './connections';
import { updateSnekPlayer2StatsDisplay, fetchSnekPlayer2Stats } from '../pages/startSGame'
import { updatePongPlayerStatsDisplay, fetchPongPlayerStats } from '../pages/startPGame'
import { getTranslation } from './language';

export interface AuthState {
	isAuthenticated: boolean;
	isGuestLocked: boolean;
	guestAlias: string;
	userAlias: string;
	userUuid?: string; // Added UUID for authenticated users
	seed?: number;
	position?: number
}

export interface UserData {
	uuid: string;
	alias: string;
}

// Prevents the toggle from being used if user is logged in / guest is locked in
export function FormToggleListener(authState:AuthState, playerId?:string) {
	const player = playerId ? playerId : "p2";
	const toggle = document.getElementById(`${player}-authToggle`) as HTMLInputElement;
	if (!toggle) {
		console.error("Auth toggle not found");
		return;
	}

	toggle.addEventListener('change', () => {
		if (authState.isGuestLocked || authState.isAuthenticated) {
			toggle.checked = !toggle.checked;
			return;
		}
		updateFormToggle(player);
	});
}

// updates the state of the form toggle
export function updateFormToggle(playerId?:string) {
	const player = playerId ? playerId : "p2";
	const toggle = document.getElementById(`${player}-authToggle`) as HTMLInputElement;
	const toggleBackground = document.getElementById(`${player}-toggleBackground`);
	const toggleCircle = document.getElementById(`${player}-toggleCircle`);
	const guestForm = document.getElementById(`${player}-GuestAliasform`) as HTMLFormElement;
	const loginForm = document.getElementById(`${player}-LoginForm`) as HTMLFormElement;

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

		const loginStatus = document.getElementById(`${player}-loginStatus`);
		if (loginStatus) {
			loginStatus.classList.add('hidden');
		}
		(document.getElementById(`${player}-loginUsername`) as HTMLInputElement).value = '';
		(document.getElementById(`${player}-loginPassword`) as HTMLInputElement).value = '';
	}
}

// enables the start game button and displays the player2 alias
export function updateStartGameButton(authState:AuthState, playerId?:string) {
	const player = playerId ? playerId : "p2";
	const startGameButton = document.getElementById(`startGame`) as HTMLButtonElement;
	const playerInfoElements = document.querySelectorAll(`.${player}-info`);
	const StatsContainer = document.getElementById(`${player}-StatsContainer`);

	if (!startGameButton) {
		console.error("Start game button not found");
		return;
	}
	if (authState.isAuthenticated || authState.isGuestLocked) {
		startGameButton.disabled = false;
		startGameButton.classList.remove('bg-gray-500', 'cursor-not-allowed', 'opacity-50');
		startGameButton.classList.add('bg-blue-500', 'hover:bg-blue-700', 'text-white');

		const displayName = authState.isAuthenticated ? authState.userAlias : authState.guestAlias;
		playerInfoElements.forEach(element => {
			element.textContent = displayName;
		});

		// Show player2 stats if authenticated
		if (StatsContainer) {
			if (authState.isAuthenticated) {
				StatsContainer.classList.remove('hidden');
			} else {
				StatsContainer.classList.add('hidden');
			}
		}
	} else {
		startGameButton.disabled = true;
		startGameButton.classList.add('bg-gray-500', 'cursor-not-allowed', 'opacity-50');
		startGameButton.classList.remove('bg-blue-500', 'hover:bg-blue-700', 'text-white');
		playerInfoElements.forEach(element => {
			element.textContent = "";
		});

		// Hide player2 stats
		if (StatsContainer) {
			StatsContainer.classList.add('hidden');
		}
	}
}

// validates and locks/unlocks the guest alias
export function setupGuestAliasLocking(authState:AuthState, playerId?:string) {
	const player = playerId ? playerId : "p2";
	const guestInputField = document.getElementById(`${player}-guestAliasInput`) as HTMLInputElement;
	const lockInButton = document.getElementById(`${player}-lockInGuest`) as HTMLButtonElement;
	const changeButton = document.getElementById(`${player}-changeGuestAlias`) as HTMLButtonElement;

	if (!guestInputField || !lockInButton || !changeButton) {
		console.error("Guest alias input or buttons not found");
		return;
	}
	Object.assign(authState, {
		isAuthenticated: false,
		isGuestLocked: false,
		guestAlias: "",
		userAlias: ""
	})
	delete authState.userUuid
	lockInButton.addEventListener('click', () => {
		const rawInput = guestInputField.value.trim();
		const sanitizedInput = rawInput.replace(/[^a-zA-Z0-9]/g, '');
		const guestInput = DOMPurify.sanitize(sanitizedInput);

		if (guestInput.length < 3) {
			const message = getTranslation("Alias_Length_Warning")
			alert(message);
			return;
		}
		guestInputField.disabled = true;
		lockInButton.classList.add('hidden');
		changeButton.classList.remove('hidden');

		authState.isGuestLocked = true;
		authState.guestAlias = "(guest) " + guestInput;
		updateStartGameButton(authState, player);
	});

	changeButton.addEventListener('click', () => {
		guestInputField.disabled = false;
		changeButton.classList.add('hidden');
		lockInButton.classList.remove('hidden');
		authState.isGuestLocked = false;
		const replayButtons = document.getElementById(`replayButtons`);
        if (replayButtons) {
            replayButtons.classList.add('hidden');
            replayButtons.classList.remove('flex');
        }
		updateStartGameButton(authState, player);
	});
}


// logs the user in
export function setupLoginValidation(authState:AuthState, game:string, playerId?:string) {
	const player = playerId ? playerId : "p2";
	const loginButton = document.getElementById(`${player}-loginButton`);
	const logoutButton = document.getElementById(`${player}-logoutButton`);
	const usernameInput = document.getElementById(`${player}-loginUsername`) as HTMLInputElement;
	const passwordInput = document.getElementById(`${player}-loginPassword`) as HTMLInputElement;
	const loginStatus = document.getElementById(`${player}-loginStatus`);

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
					const player2Stats = await fetchPongPlayerStats(userData.alias);
					if (player2Stats)
						updatePongPlayerStatsDisplay(player, player2Stats);
				} else {
					const player2Stats = await fetchSnekPlayer2Stats(userData.alias);
					if (player2Stats)
						updateSnekPlayer2StatsDisplay(player2Stats);
				}

				updateStartGameButton(authState, player);
				updateFormToggle(player);
			} else {
				showLoginStatus(loginStatus, "Invalid username or password", false);
				authState.isAuthenticated = false;
				updateStartGameButton(authState, player);
				updateFormToggle(player);
			}
		} catch (error) {
			showLoginStatus(loginStatus, "Error during login. Please try again.", false);
			console.error("Login error:", error);
			authState.isAuthenticated = false;
			updateStartGameButton(authState, player);
			updateFormToggle(player);
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
		const replayButtons = document.getElementById(`replayButtons`);
        if (replayButtons) {
            replayButtons.classList.add('hidden');
            replayButtons.classList.remove('flex');
        }
		updateStartGameButton(authState, player);
		updateFormToggle(player);
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
export function newPlayersButton(authState:AuthState, playerId?:string) {
	const player = playerId ? playerId : "p2";
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
        const guestInput = document.getElementById(`${player}-guestAliasInput`) as HTMLInputElement;
        const lockInButton = document.getElementById(`${player}-lockInGuest`) as HTMLButtonElement;
        const changeButton = document.getElementById(`${player}-changeGuestAlias`) as HTMLButtonElement;

        if (guestInput && lockInButton && changeButton) {
            guestInput.value = "";
            guestInput.disabled = false;
            lockInButton.classList.remove('hidden');
            changeButton.classList.add('hidden');
        }

        // Reset login form
        const usernameInput = document.getElementById(`${player}-loginUsername`) as HTMLInputElement;
        const passwordInput = document.getElementById(`${player}-loginPassword`) as HTMLInputElement;
        const loginButton = document.getElementById(`${player}-loginButton`) as HTMLButtonElement;
        const logoutButton = document.getElementById(`${player}-logoutButton`) as HTMLButtonElement;
        const loginStatus = document.getElementById(`${player}-loginStatus`);

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
        const toggle = document.getElementById(`${player}-authToggle`) as HTMLInputElement;
        if (toggle) {
            toggle.checked = false;
            updateFormToggle(player);
        }

        // Hide player2 stats
        const StatsContainer = document.getElementById(`${player}-StatsContainer`);
        if (StatsContainer) {
            StatsContainer.classList.add('hidden');
        }

        // Hide replay buttons
        const replayButtons = document.getElementById(`replayButtons`);
        if (replayButtons) {
            replayButtons.classList.add('hidden');
            replayButtons.classList.remove('flex');
        }

        // Update start game button state
        // resetGame(app);
        updateStartGameButton(authState, player);

    });
}

export function lockAuthForm (playerCount:number) {
	for (let playerNum = 2; playerNum <= playerCount; playerNum++) {
		const logoutButton = document.getElementById(`p${playerNum}-logoutButton`) as HTMLButtonElement | null;
		const changeButton = document.getElementById(`p${playerNum}-changeGuestAlias`) as HTMLButtonElement | null;
		if (logoutButton) 
			logoutButton.disabled = true;
		if (changeButton)
			changeButton.disabled = true;
	}
}

export function unlockAuthForm (playerCount:number) {
	for (let playerNum = 2; playerNum <= playerCount; playerNum++) {
		const logoutButton = document.getElementById(`p${playerNum}-logoutButton`) as HTMLButtonElement | null;
		const changeButton = document.getElementById(`p${playerNum}-changeGuestAlias`) as HTMLButtonElement | null;
		if (logoutButton) 
			logoutButton.disabled = false;
		if (changeButton)
			changeButton.disabled = false;
	}
}