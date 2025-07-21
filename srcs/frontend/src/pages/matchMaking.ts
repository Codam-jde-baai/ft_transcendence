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

// Mock data - replace with actual API calls
const mockMatchMakingData: mmTable = {
    pong: {
        recentLoss: [
            {
                friends: false,
                alias: "UserA",
                profile_pic: { data: "base64stringA", mimeType: "image/png" },
                status: 1,
                win: 10,
                loss: 5,
                total_games: 15,
                winrate: 0.67,
                last_score: { self: 2, opponent: 3 }
            },
            {
                friends: true,
                alias: "UserB",
                profile_pic: { data: "base64stringB", mimeType: "image/jpeg" },
                status: 2,
                win: 8,
                loss: 7,
                total_games: 15,
                winrate: 0.53,
                last_score: { self: 1, opponent: 2 }
            }
        ],
        equalSkill: [
            {
                friends: true,
                alias: "UserC",
                profile_pic: { data: "base64stringC", mimeType: "image/png" },
                status: 1,
                win: 12,
                loss: 3,
                total_games: 15,
                winrate: 0.8,
                last_score: { self: 3, opponent: 2 }
            },
            {
                friends: false,
                alias: "UserD",
                profile_pic: { data: "base64stringD", mimeType: "image/jpeg" },
                status: 2,
                win: 11,
                loss: 4,
                total_games: 15,
                winrate: 0.73,
                last_score: { self: 2, opponent: 1 }
            }
        ],
        equalGameAmount: [
            {
                friends: true,
                alias: "UserE",
                profile_pic: { data: "base64stringE", mimeType: "image/png" },
                status: 1,
                win: 7,
                loss: 8,
                total_games: 15,
                winrate: 0.47,
                last_score: { self: 1, opponent: 3 }
            },
            {
                friends: false,
                alias: "UserF",
                profile_pic: { data: "base64stringF", mimeType: "image/jpeg" },
                status: 2,
                win: 9,
                loss: 6,
                total_games: 15,
                winrate: 0.6,
                last_score: { self: 2, opponent: 2 }
            }
        ]
    },
    snake: {
        recentLoss: [
            {
                friends: true,
                alias: "SnakeUserA",
                profile_pic: { data: "base64stringSnakeA", mimeType: "image/png" },
                status: 1,
                win: 5,
                loss: 10,
                total_games: 15,
                winrate: 0.33,
                last_score: { self: 150, opponent: 200 }
            }
        ],
        equalSkill: [
            {
                friends: false,
                alias: "SnakeUserB",
                profile_pic: { data: "base64stringSnakeB", mimeType: "image/jpeg" },
                status: 2,
                win: 8,
                loss: 7,
                total_games: 15,
                winrate: 0.53,
                last_score: { self: 180, opponent: 175 }
            }
        ],
        equalGameAmount: [
            {
                friends: true,
                alias: "SnakeUserC",
                profile_pic: { data: "base64stringSnakeC", mimeType: "image/png" },
                status: 1,
                win: 9,
                loss: 6,
                total_games: 15,
                winrate: 0.6,
                last_score: { self: 220, opponent: 190 }
            }
        ]
    }
};

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
            <div class="flex flex-row justify-start">
                <button class="cbtn secondary" data-i18n="goBack" style="width: 100px;" id="backBtn">Back</button>
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
        
        console.log('Page load selected game is: ', game);
    }
}

function loadMatchMakingData() {
    // In a real implementation, you would fetch data from your API
    // For now, we'll use the mock data
    const gameKey = selectedGame === GameType.Pong ? 'pong' : 'snake';
    const gameData = mockMatchMakingData[gameKey];
    
    // Populate recent losses
    const recentLossesContainer = document.getElementById('recent-losses-container');
    if (recentLossesContainer) {
        recentLossesContainer.innerHTML = gameData.recentLoss.map(user => 
            createUserElement(user, 'recentLoss')
        ).join('');
    }
    
    // Populate equal skill
    const equalSkillContainer = document.getElementById('equal-skill-container');
    if (equalSkillContainer) {
        equalSkillContainer.innerHTML = gameData.equalSkill.map(user => 
            createUserElement(user, 'equalSkill')
        ).join('');
    }
    
    // Populate equal game amount
    const equalGamesContainer = document.getElementById('equal-games-container');
    if (equalGamesContainer) {
        equalGamesContainer.innerHTML = gameData.equalGameAmount.map(user => 
            createUserElement(user, 'equalGameAmount')
        ).join('');
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

function eventListeners() {
    const toggleSwitch = document.querySelector('#gameToggle input') as HTMLInputElement;
    const goBackButton = document.querySelector('#backBtn') as HTMLButtonElement;

    if (toggleSwitch) {
        toggleSwitch.addEventListener('change', () => {
            selectedGame = toggleSwitch.checked ? GameType.Snek : GameType.Pong;
            console.log(`Selected game: ${selectedGame}`);
            loadMatchMakingData(); // Reload data when game changes
        });
    }

    if (goBackButton) {
        goBackButton.addEventListener('click', () => {
            window.history.back();
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
        
        connectFunc(`/game/invite`, requestBody("POST", JSON.stringify({ 
            alias: alias, 
            gameType: gameType 
        }), "application/json"))
        .then(response => {
            if (response.ok) {
                console.log(`Game invitation sent to ${alias}`);
                // You might want to show a success message to the user
                // Or update the UI to show that an invitation was sent
            } else {
                console.error(`Failed to send game invitation: ${response.status}`);
                // Show error message to user
            }
        })
        .catch(error => {
            console.error('Error sending game invitation:', error);
        });
    }
}