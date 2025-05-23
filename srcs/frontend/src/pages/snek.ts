import { setupStartSGame } from './startSGame'; // REPLACE WITH CORRECT PATH FOR SNEK GAME
import { getLanguage } from '../script/language';
import { dropDownBar } from '../script/dropDownBar';
import { fillSnek } from '../script/fillSnek';
import { fillTopbar } from '../script/fillTopbar';
import { setupNavigation } from '../script/menuNavigation';
import { setupUserHome } from '../pages/home';

export function setupSnek() {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", /*html*/`
		<link rel="stylesheet" href="src/styles/home.css"> <!-- Link to the CSS file -->
		<div class="overlay"></div>
		<dropdown-menu></dropdown-menu>
		
		<div class="hmiddle">
			<div class="line"></div>
			<h1 class="heder" data-i18n="Header_Snek"></h1>

			<div class="hcontainer">
				<div class="user-stats">
					<div class="stat-box">
						<div class="Sbest-score">
							<img src="src/Pictures/SnekS.png">
						</div>
						<div class="text-container">
							<div class="best-score-text" data-i18n="HighestScore"></div>
							<div id="hScore" class="score-number"> </div>
							<div class="best-score-text text-[18px] mt-4" data-i18n="WinRate"></div>
							<div id="winRate" class="score-number text-[15px]"></div>
						</div>
					</div>
					<div class="smoll-stat-container">
						<div class="smoll-stat-box">
							<div class="win-losse">
								<img src="src/Pictures/wins.png">
							</div>
							<div class="text-container">
								<div class="score-text" data-i18n="Wins"></div>
								<div id="win" class="score-number"></div>
							</div>
						</div>
						<div class="smoll-stat-box">
							<div class="win-losse">
								<img src="src/Pictures/losses.png">
							</div>
							<div class="text-container">
								<div class="score-text" data-i18n="Losses"></div>
								<div id="loss" class="score-number"> </div>
							</div>
						</div>
					</div>

					<div class="buttons">
						<button class="btn" id="StartSnek" data-i18n="btn_PlaySnek"></button>
					</div>
					<!-- Switching between games -->
					<button class="game-btn" id="Pong">
						<span data-i18n="SwitchGame"></span> <img src="src/Pictures/game-pong.png">
					</button>
				</div>
				
				<div class="leaderboard">
					<h2 class="lboard" data-i18n="LeaderBoard"></h2>
					<div class="leaderboard-entry">
						<div class="img-container">
							<img src="src/Pictures/1.jpg">
						</div>
						<div class="text-container">
							<div class="position" data-i18n="1"></div>
							<div id="aliasName1" class="text"></div>
							<div class="number">
								<span data-i18n="HighestScore_"></span> <span id="hScore1" class="number"></span>
							</div>
							<div class="number">
								<span data-i18n="wins_"></span> <span id="SWin1" class="number"></span>
							</div>
							<div class="number">
								<span data-i18n="losses_"></span> <span id="Sloss1" class="number"></span>
							</div>
						</div>
					</div>
					<div class="leaderboard-entry">
						<div class="img-container">
							<img src="src/Pictures/2.jpg">
						</div>
						<div class="test-container">
							<div class="position" data-i18n="2"></div>
							<div id="aliasName2" class="text"></div>
							<div class="number">
								<span data-i18n="HighestScore_"></span> <span id="hScore2" class="number"></span>
							</div>
							<div class="number">
								<span data-i18n="wins_"></span> <span id="SWin2" class="number"></span>
							</div>
							<div class="number">
								<span data-i18n="losses_"></span> <span id="Sloss2" class="number"></span>
							</div>
						</div>
					</div>
					<div class="leaderboard-entry">
						<div class="img-container">
							<img src="src/Pictures/3.jpg">
						</div>
						<div class="test-container">
							<div class="position" data-i18n="3"></div>
							<div id="aliasName3" class="text"></div>
							<div class="number">
								<span data-i18n="HighestScore_"></span> <span id="hScore3" class="number"></span>
							</div>
							<div class="number">
								<span data-i18n="wins_"></span> <span id="SWin3" class="number"></span>
							</div>
							<div class="number">
								<span data-i18n="losses_"></span> <span id="Sloss3" class="number"></span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		`);

		getLanguage();
		dropDownBar(["dropdown-btn", "language-btn", "language-content", "game-btn", "game-content"]);
		fillSnek();
		fillTopbar();
		setupNavigation();

		document.getElementById('StartSnek')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/startSGame');  // change path !!!!!!!!
			setupStartSGame();
		});
		
		document.getElementById('Pong')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/home');
			setupUserHome();
		});

	}
}

	