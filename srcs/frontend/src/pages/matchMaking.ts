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
            <h2 class="h2" data-i18n="MatchMaking"></h2>
        </div>
        <div class="flex flex-row justify-start">
            <button class="cbtn" data-i18n="goBack" style="width: 100px;" id="backBtn"></button>
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

    }
}

function eventListeners() {
    const toggleSwitch = document.querySelector('#gameToggle input') as HTMLInputElement;
    const goBackButton = document.querySelector('#backBtn') as HTMLButtonElement;

    toggleSwitch.addEventListener('change', () => {
        selectedGame = toggleSwitch.checked ? GameType.Snek : GameType.Pong;
    });

    goBackButton.addEventListener('click', () => {
        window.history.back();
    });
}
