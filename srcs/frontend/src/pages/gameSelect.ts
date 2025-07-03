import { getLanguage } from '../script/language';
import { dropDownBar } from '../script/dropDownBar';
import { fillTopbar } from '../script/fillTopbar';
import { setupNavigation } from '../script/menuNavigation';
import { setupMatchMaking } from './matchMaking';
import { setupQuickPong, setupTournamentPong } from './startPGame';
import { setupQuickSnek } from './startSGame';

export enum GameType {
	Pong = "Pong",
	Snek = "Snek"
}

let selectedGame: GameType = GameType.Pong;

export function setupGameSelect(gameInput?:string) {
	if (gameInput)
		selectedGame = gameInput === "Pong" ? GameType.Pong : GameType.Snek
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", /*html*/`
		<link rel="stylesheet" href="src/styles/contentPages.css"> 
		<div class="overlay"></div>
		<dropdown-menu></dropdown-menu>
		<div class="middle" id="middle">
			<div class="flex flex-row space-x-6">
				<img src="src/Pictures/game-pong.png" style="width: 100px; height: 100px;">
				<img src="src/Pictures/game-snek.png" style="width: 100px; height: 100px;">
			</div>
			<label class="toggleSwitch" id="gameToggle">
				<input type="checkbox">
				<span class="toggle-option" data-i18n="btn_PlayPong"></span>
				<span class="toggle-option" data-i18n="btn_PlaySnek"></span>
			</label>
			<div class="contentArea">
				<h2 class="h2" data-i18n="Game_Header"></h2>
				<button class="cbtn" data-i18n="QuickPlay" style="width: 200px;" id="quickPlay"></button>
				<button class="cbtn" data-i18n="Tournament" style="width: 200px;" id="Tournament"></button>
				<button class="cbtn" data-i18n="MatchMaking" style="width: 200px;" id="matchMaking"></button>
			</div>
		</div>
		`);

		getLanguage();
		fillTopbar();
		dropDownBar(["dropdown-btn", "language-btn", "language-content"]);
		setupNavigation();
		eventListeners(selectedGame);
	}
}

function eventListeners(selectedGame:string) {
	const toggleSwitch = document.querySelector('#gameToggle input') as HTMLInputElement; // Select the input inside the label
	const quickPlayButton = document.querySelector('#quickPlay') as HTMLButtonElement;
	const tournamentButton = document.querySelector('#Tournament') as HTMLButtonElement;
	const matchMakingButton = document.querySelector('#matchMaking') as HTMLButtonElement;

	if (selectedGame === GameType.Snek) {
		toggleSwitch.checked = true;
		tournamentButton.classList.add('hidden')
	}

	toggleSwitch.addEventListener('change', () => {
		selectedGame = toggleSwitch.checked ? GameType.Snek : GameType.Pong;
		toggleSwitch.checked ? tournamentButton.classList.add('hidden') : tournamentButton.classList.remove('hidden')
		console.log(`Selected game: ${selectedGame}`);
	});

	quickPlayButton.addEventListener('click', () => {
		selectedGame === GameType.Pong ? console.log("Pong Quick Play") : console.log("Snek Quick Play");
		window.history.pushState({}, '', `/${selectedGame.toLowerCase()}QuickPlay`);
		selectedGame === GameType.Pong ? setupQuickPong() : setupQuickSnek();
	});

	tournamentButton.addEventListener('click', () => {
		selectedGame === GameType.Pong ? console.log("Pong Tournament") : console.log("Snek Tournament");
		window.history.pushState({}, '', `/${selectedGame.toLowerCase()}Tournament`);
		selectedGame === GameType.Pong ? setupTournamentPong(5) : setupTournamentSnek();
	});

	matchMakingButton.addEventListener('click', () => {
		selectedGame === GameType.Pong ? console.log("Pong Match Making") : console.log("Snek Match Making");
		window.location.href = `/matchMaking`;
		setupMatchMaking(selectedGame);
	});
}

