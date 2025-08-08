import { getLanguage } from '../script/language';
import { dropDownBar } from '../script/dropDownBar';
import { fillTopbar } from '../script/fillTopbar';
import { setupNavigation } from '../script/menuNavigation';
import { connectFunc, requestBody } from "../script/connections";
import { GameType } from './gameSelect';
import '../component/matchMakingField.ts';

let selectedGame: GameType;

type mmUser = {
    friends: boolean;
    alias: string;
    profile_pic: {
        data: string;
        mimeType: string;
    };
    status: number;
    win: number;
    loss: number;
    total_games: number;
    winrate: number;
    last_score: {
        self: number;
        opponent: number;
    }
}

type mmTable = {
    snake: {
        recentLoss: mmUser[];
        equalSkill: mmUser[];
        equalGameAmount: mmUser[];
    }
    pong: {
        recentLoss: mmUser[];
        equalSkill: mmUser[];
        equalGameAmount: mmUser[];
    }
};

let matchmakingData: mmTable | null = null;

export function setupMatchMaking(game: GameType = GameType.Pong) {
    selectedGame = game;
    const root = document.getElementById('app');

    if (root) {
        root.innerHTML = "";
        root.insertAdjacentHTML("beforeend", /*html*/`
        <link rel="stylesheet" href="src/styles/contentPages.css"> 
        <link rel="stylesheet" href="src/styles/friends.css"> 
        <div class="overlay"></div>
        <dropdown-menu></dropdown-menu>
        <div class="middle">
            <label class="toggleSwitch justify-center" id="gameToggle">
	    	    <input type="checkbox" ${game === GameType.Snek ? 'checked' : ''}>
    		    <span class="toggle-option" data-i18n="btn_PlayPong">Pong</span>
                <span class="toggle-option" data-i18n="btn_PlaySnek">Snake</span>
		    </label>
            <div class="contentArea">
                <h2 class="h1" data-i18n="MatchMaking">Matchmaking</h2>
                
                <!-- Loading indicator -->
                <div id="loading-indicator" style="text-align: center; padding: 20px;">
                    <p data-i18n="Loading">Loading...</p>
                </div>
                
                <!-- Recent Losses Section -->
                    <h1 class="h2" data-i18n="RecentLosses">Recent Losses</h1>
                    <div class="your-friends-list-wrapper">
                        <div class="friends-list" id="recent-losses-container">
                        </div>
                    </div>

                    <!-- Similar Skill Section -->
                    <h1 class="h2" data-i18n="SimilarSkill">Similar Skill Level</h1>
                    <div class="your-friends-list-wrapper">
                        <div class="friends-list" id="equal-skill-container">
                        </div>
                    </div>

                    <!-- Similar Game Amount Section -->
                    <h1 class="h2" data-i18n="SimilarGameAmount">Similar Game Experience</h1>
                    <div class="your-friends-list-wrapper">
                        <div class="friends-list" id="equal-games-container">
                        </div>
                    </div>
                </div>
                
                <!-- Error message -->
                <div id="error-message" style="display: none; text-align: center; padding: 20px; color: red;">
                    <p data-i18n="ErrorLoadingData">Error loading matchmaking data. Please try again.</p>
                    <button class="cbtn primary" id="retryBtn" data-i18n="Retry">Retry</button>
                </div>
                <div class="flex flex-row justify-start">
                    <button class="cbtn secondary" data-i18n="goBack" style="width: 100px;" id="backBtn">Back</button>
                </div>
            </div>
        </div>
        `);

        getLanguage();
        fillTopbar();
        dropDownBar(["dropdown-btn", "language-btn", "language-content"]);
        setupNavigation();
        eventListeners();
        setupUserActionListeners();

        // Load initial matchmaking data
        loadMatchMakingData();

        console.log('Page load selected game is: ', selectedGame);
    }
}

function loadMatchMakingData() {
    showLoading();

    // Fetch matchmaking data from the API
    connectFunc(`/matchmaking`, requestBody("GET"))
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        })
        .then((data: mmTable) => {
            matchmakingData = data;
            console.log('Matchmaking data received:', data);
            renderMatchmakingData();
            hideLoading();
        })
        .catch(error => {
            console.error('Error loading matchmaking data:', error);
            showError();
            hideLoading();
        });
}

function renderMatchmakingData() {
    if (!matchmakingData) return;

    const gameKey = selectedGame === GameType.Pong ? 'pong' : 'snake';
    const gameData = matchmakingData[gameKey];

    // Populate recent losses
    const recentLossesContainer = document.getElementById('recent-losses-container');
    if (recentLossesContainer) {
        if (gameData.recentLoss.length === 0) {
            recentLossesContainer.innerHTML = '<p class="no-users-message" data-i18n="NoRecentLosses">No recent losses found</p>';
        } else {
            recentLossesContainer.innerHTML = gameData.recentLoss.map(user =>
                createUserElement(user, 'recentLoss')
            ).join('');
        }
    }

    // Populate equal skill
    const equalSkillContainer = document.getElementById('equal-skill-container');
    if (equalSkillContainer) {
        if (gameData.equalSkill.length === 0) {
            equalSkillContainer.innerHTML = '<p class="no-users-message" data-i18n="NoSimilarSkill">No players with similar skill level found</p>';
        } else {
            equalSkillContainer.innerHTML = gameData.equalSkill.map(user =>
                createUserElement(user, 'equalSkill')
            ).join('');
        }
    }

    // Populate equal game amount
    const equalGamesContainer = document.getElementById('equal-games-container');
    if (equalGamesContainer) {
        if (gameData.equalGameAmount.length === 0) {
            equalGamesContainer.innerHTML = '<p class="no-users-message" data-i18n="NoSimilarExperience">No players with similar game experience found</p>';
        } else {
            equalGamesContainer.innerHTML = gameData.equalGameAmount.map(user =>
                createUserElement(user, 'equalGameAmount')
            ).join('');
        }
    }

    // Refresh language after adding elements
    getLanguage();
}

function createUserElement(user: mmUser, type: string): string {
    return `
        <mm-items 
            type="${type}" 
            alias="${user.alias}" 
            friends="${user.friends}"
            profilePicData="${user.profile_pic.data}" 
            profilePicMimeType="${user.profile_pic.mimeType}"
            status="${user.status}"
            winrate="${user.winrate}"
            wins="${user.win}"
            losses="${user.loss}"
            totalGames="${user.total_games}"
            lastScoreSelf="${user.last_score.self}"
            lastScoreOpponent="${user.last_score.opponent}">
        </mm-items>
    `;
}

function showLoading() {
    const loadingIndicator = document.getElementById('loading-indicator');
    const matchmakingContent = document.getElementById('matchmaking-content');
    const errorMessage = document.getElementById('error-message');

    if (loadingIndicator) loadingIndicator.style.display = 'block';
    if (matchmakingContent) matchmakingContent.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';
}

function hideLoading() {
    const loadingIndicator = document.getElementById('loading-indicator');
    const matchmakingContent = document.getElementById('matchmaking-content');

    if (loadingIndicator) loadingIndicator.style.display = 'none';
    if (matchmakingContent) matchmakingContent.style.display = 'block';
}

function showError() {
    const errorMessage = document.getElementById('error-message');
    const matchmakingContent = document.getElementById('matchmaking-content');

    if (errorMessage) errorMessage.style.display = 'block';
    if (matchmakingContent) matchmakingContent.style.display = 'none';
}

function eventListeners() {
    const toggleSwitch = document.querySelector('#gameToggle input') as HTMLInputElement;
    const goBackButton = document.querySelector('#backBtn') as HTMLButtonElement;
    const retryButton = document.querySelector('#retryBtn') as HTMLButtonElement;

    if (toggleSwitch) {
        toggleSwitch.addEventListener('change', () => {
            selectedGame = toggleSwitch.checked ? GameType.Snek : GameType.Pong;
            console.log(`Selected game: ${selectedGame}`);

            // If we already have data, just re-render. Otherwise, load fresh data.
            if (matchmakingData) {
                renderMatchmakingData();
            } else {
                loadMatchMakingData();
            }
        });
    }

    if (goBackButton) {
        goBackButton.addEventListener('click', () => {
            window.history.back();
        });
    }

    if (retryButton) {
        retryButton.addEventListener('click', () => {
            loadMatchMakingData();
        });
    }
}

function setupUserActionListeners() {
    // Handle all user actions with a single event listener
    document.addEventListener('user-action', (e: Event) => {
        const customEvent = e as CustomEvent<{
            action: string;
            alias: string;
            friends: string;
            type: string;
            status: string;
            winrate: string;
            wins: string;
            losses: string;
            totalGames: string;
            lastScoreSelf: string;
            lastScoreOpponent: string;
        }>;

        const { action, alias } = customEvent.detail;

        switch (action) {
            case 'Profile':
                viewUserProfile(alias);
                break;
            case 'PokeToPlay':
                pokeUserToPlay(alias);
                break;
        }
    });

    // Action handler functions
    function viewUserProfile(alias: string) {
        // Navigate to user profile or show profile modal
        console.log(`Viewing profile for: ${alias}`);
        // You can implement this similar to how viewUserHistory works in friends.ts
        window.history.pushState({ userData: alias }, '', `/profile?alias=${alias}`);
        // setupUserProfile(); // You would need to implement this function
    }

    function pokeUserToPlay(alias: string) {
        // Send a game invitation to the user
        console.log(`Poking ${alias} to play ${selectedGame}`);

        // Here you would make an API call to send a game invitation
        const gameType = selectedGame === GameType.Pong ? 'pong' : 'snake';

        // Disable the button to prevent multiple clicks
        const button = document.querySelector(`mm-items[alias="${alias}"] button[data-i18n="PokeToPlay"]`) as HTMLButtonElement;
        if (button) {
            button.disabled = true;
            button.textContent = 'Sending...';
        }

        connectFunc(`/game/invite`, requestBody("POST", JSON.stringify({
            alias: alias,
            gameType: gameType
        }), "application/json"))
            .then(response => {
                if (response.ok) {
                    console.log(`Game invitation sent to ${alias}`);
                    // Show success feedback
                    if (button) {
                        button.textContent = 'Sent!';
                        button.classList.add('success');
                        setTimeout(() => {
                            button.disabled = false;
                            button.textContent = 'Poke to Play';
                            button.classList.remove('success');
                            getLanguage(); // Re-apply translations
                        }, 2000);
                    }
                } else {
                    console.error(`Failed to send game invitation: ${response.status}`);
                    // Show error feedback
                    if (button) {
                        button.textContent = 'Failed';
                        button.classList.add('error');
                        setTimeout(() => {
                            button.disabled = false;
                            button.textContent = 'Poke to Play';
                            button.classList.remove('error');
                            getLanguage(); // Re-apply translations
                        }, 2000);
                    }
                }
            })
            .catch(error => {
                console.error('Error sending game invitation:', error);
                // Show error feedback
                if (button) {
                    button.textContent = 'Error';
                    button.classList.add('error');
                    setTimeout(() => {
                        button.disabled = false;
                        button.textContent = 'Poke to Play';
                        button.classList.remove('error');
                        getLanguage(); // Re-apply translations
                    }, 2000);
                }
            });
    }
}