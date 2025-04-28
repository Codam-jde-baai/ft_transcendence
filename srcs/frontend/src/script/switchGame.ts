// Import language files
import pong from '../pages/home';
import snek from '../pages/snek';

// Define GameData interface to type-check language data
interface GameData {
	[key: string]: string;
}

// export function getTranslation(key: string): string {

// 	const lang = localStorage.getItem('selectedLang') || 'en';
// 	const langData: LangData = lang === 'de' ? de : lang === 'nl' ? nl : en;
// 	return langData[key] || key;
// }

// Function to switch Game
export function switchGame(game: string) {
	let gameData: GameData;

	// Determine which gameuage data to use
	switch (game) {
		case 'pong':
			gameData = pong;
			break;
		case 'snek':
			gameData = snek;
			break;
		default:
			gameData = pong; // Default to English if no valid gameuage selected
			break;
	}

	updateHomeContent(gameData);
	if (document.getElementById("selected-game"))
		document.getElementById("selected-game")!.src = `src/Pictures/game-${game}.png`;
	localStorage.setItem('selectedGame', game);
}

export function getGame()
{
	let gameData: GameData;
	
	// localStorage.removeItem('selectedLang');
	let game: string = localStorage.getItem('selectedLang')!;
	// Determine which language data to use
	switch (game) {
		case 'en':
			gameData = pong;
			break;
		case 'de':
			gameData = snek;
			break;
		default:
			game = "pong";
			gameData = pong; // Default to English if no valid language selected
			break;
	}
	// code for setting the language button to the correct language
	updateHomeContent(gameData);
	if (document.getElementById("selected-game"))
		document.getElementById("selected-game")!.src = `src/Pictures/game-${game}.png`;
}

// Function to update content based on selected language
function updateHomeContent(gameData: GameData): void {
	console.log("TEST", gameData);
}


// Load saved language or default to English
document.addEventListener('DOMContentLoaded', () => {
	const savedGame = localStorage.getItem('selectedGame') || 'pong'; // Default to 'en'
	switchGame(savedGame);

	const GameSelector = document.getElementById('game-selector') as HTMLSelectElement;
	if (GameSelector) {
		GameSelector.value = savedGame;
	}
});

// Expose function globally (for use in HTML select onchange)
(window as any).switchGame = switchGame;
