import { getLanguage } from '../script/language';
import { dropDownBar } from '../script/dropDownBar';
import { fillTopbar } from '../script/fillTopbar';
import { setupNavigation } from '../script/menuNavigation';
import { GameType } from './gameSelect';

let selectedGame;

export function setupMatchMaking(game: GameType = GameType.Pong) {
    selectedGame = game;
    const root = document.getElementById('app');
    if (root) {
        root.innerHTML = "";
        root.insertAdjacentHTML("beforeend", /*html*/`
        <link rel="stylesheet" href="src/styles/contentPages.css"> 
        <div class="overlay"></div>
        <dropdown-menu></dropdown-menu>
        <div class="middle">
            <label class="toggleSwitch" id="gameToggle">
	    	    <input type="checkbox">
    		    <span class="toggle-option" data-i18n="btn_PlayPong"></span>
                <span class="toggle-option" data-i18n="btn_PlaySnek"></span>
		    </label>
            <div class="contentArea">
                <div style="width: 100%; background: red; height: 20px;">FULL WIDTH TEST</div>
                <h2 class="h1" data-i18n="MatchMaking"></h2>
                <h1 class="h2" data-i18n="Friends_Header"></h1>
                <div class="your-friends-list-wrapper">
                    <div class="friends-list" id="friends-container">
                    </div>
                </div>
            </div>
            <div class="flex flex-row justify-start">
                <button class="cbtn secondary" data-i18n="goBack" style="width: 100px;" id="backBtn"></button>
            </div>
        </div>
        `);

        getLanguage();
        fillTopbar();
        dropDownBar(["dropdown-btn", "language-btn", "language-content"]);
        setupNavigation();
        eventListeners();

        const toggleSwitch = document.querySelector('gameToggle') as HTMLInputElement;
        if (game === GameType.Snek) {
            toggleSwitch.checked = true;
            toggleSwitch.dispatchEvent(new Event('change'));
        }
        console.log('Page load selected game is: ', game);
    }
}

function eventListeners() {
    const toggleSwitch = document.querySelector('#gameToggle input') as HTMLInputElement;
    const goBackButton = document.querySelector('#backBtn') as HTMLButtonElement;

    toggleSwitch.addEventListener('change', () => {
        selectedGame = toggleSwitch.checked ? GameType.Snek : GameType.Pong;
        console.log(`Selected game: ${selectedGame}`);
    });

    goBackButton.addEventListener('click', () => {
        window.history.back();
    });
}
