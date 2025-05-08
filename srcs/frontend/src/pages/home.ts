import { setupStartGame } from './startGame';
import { getLanguage } from '../script/language';
import { dropDownBar } from '../script/dropDownBar';
import { fillHome } from '../script/fillHome';
import { fillTopbar } from '../script/fillTopbar';
import { setupNavigation } from '../script/menuNavigation';
import { setupSnek } from '../pages/snek';

export function setupUserHome() {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", /*html*/`
		<link rel="stylesheet" href="src/styles/home.css"> <!-- Link to the CSS file -->
		<div class="overlay"></div>
		<dropdown-menu></dropdown-menu>
		
		<div class="middle">
			<div class="line"></div>
			<h1 data-i18n="Header_Pong"></h1>

			<div class="container">
				<div class="user-stats">
					<div class="stat-box">
						<div class="best-score">
							<img src="src/Pictures/bestScore.png">
						</div>
						<div class="text-container">
							<div class="best-score-text" data-i18n="Score"></div>
							<div id="best-score" class="score-number"> >-1200-< </div>
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
						<button class="btn" id="StartGame" data-i18n="btn_PlayPong"></button>
					</div>
					<!-- Switching between games -->
					<button class="game-btn" id="Snek">
						<span data-i18n="SwitchGame"></span> <img src="src/Pictures/game-snek.png">
					</button>
				</div>
				
				<div class="leaderboard">
					<h2 data-i18n="LeaderBoard"></h2>
					<div class="leaderboard-entry">
						<div class="img-container">
							<img src="src/Pictures/1.jpg">
							</div>
							<div class="text-container">
								<div class="position" data-i18n="1"></div>
								<div id="aliasName1" class="text"></div>
								<div class="number">
									<span data-i18n="wins_"></span> <span id="win1" class="number"></span>
								</div>
								<div class="number">
									<span data-i18n="losses_"></span> <span id="loss1" class="number"></span>
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
								<span data-i18n="wins_"></span> <span id="win2" class="number"></span>
							</div>
							<div class="number">
								<span data-i18n="losses_"></span> <span id="loss2" class="number"></span>
							</div>v>
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
								<span data-i18n="wins_"></span> <span id="win3" class="number"></span>
							</div>
							<div class="number">
								<span data-i18n="losses_"></span> <span id="loss3" class="number"></span>
							</div>
						</div>
					</div>
				</div>

			</div>
		</div>
		`);

		getLanguage();
		dropDownBar(["dropdown-btn", "language-btn", "language-content", "game-btn", "game-content"]);
		fillHome();
		fillTopbar();
		setupNavigation();

		document.getElementById('StartGame')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/startGame');
			setupStartGame();
		});
		
		document.getElementById('Snek')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/snek');
			setupSnek();
		});

	}
}

	