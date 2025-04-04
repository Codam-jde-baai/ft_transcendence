import { renderPage } from './index';
import { setupSetting } from './setting';
import { setupFriends } from './friends';
import { setupMatchHistory } from './history';
import { setupStartGame } from './startGame';
import { getLanguage } from '../script/language';
import { dropDownBar } from '../script/dropDownBar';
import { fillHome } from '../script/fillHome';

export function setupUserHome () {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", `
		<link rel="stylesheet" href="src/styles/userMain.css"> <!-- Link to the CSS file -->
		<link rel="stylesheet" href="src/styles/home.css"> <!-- Link to the CSS file -->
		<div class="overlay"></div>
		<div class="topBar">
			<div class="dropdown">
				<button class="dropdown-btn" id="dropdown-btn">
					<img class="settingIcon" src="src/component/Pictures/setting-btn.png"/></img>
				</button>
				<div class="dropdown-content">
					
					<button class="language-btn" id="language-btn">
						<span data-i18n="Language"></span> <img id="selected-flag" src="src/component/Pictures/flagIcon-en.png">
					</button>
					<div class="language-content" id="language-content">
							<div class="language-option" id="gb">
								<img src="src/component/Pictures/flagIcon-en.png"> <span data-i18n="English"></span>
							</div>
							<div class="language-option" id="de">
								<img src="src/component/Pictures/flagIcon-de.png"> <span data-i18n="German"></span>
							</div>
							<div class="language-option" id="nl">
								<img src="src/component/Pictures/flagIcon-nl.png"> <span data-i18n="Dutch"></span>
							</div>
					</div>
					<div class="dropdown-item" id="Home" data-i18n="Home"></div>
					<div class="dropdown-item" id="Settings" data-i18n="Settings"></div>
					<div class="dropdown-item" id="Friends" data-i18n="Friends"></div>
					<div class="dropdown-item" id="History" data-i18n="History"></div>
					<div class="dropdown-item" id="LogOut" data-i18n="LogOut"></div>
				</div>
			</div>
			<div class="topBarFrame">
				<div class="aliasName" id="aliasName"></div>
				<div class="profile-picture">
					<img id="profile-picture" src="src/component/Pictures/defaultPP.avif" alt="Profile Picture">
				</div>
			</div>
		</div>
		
		<div class="middle">
			<!-- BODY CHANGE -->
			<div class="container">

				<div class="user-stats">
					<div class="stat-box">
						<div class="best-score">
							<img src="src/component/Pictures/bestScore.png">
						</div>
						<div class="text-container">
							<div class="best-score-text" data-i18n="Score"></div>
							<div id="best-score" class="score-number"> >-1200-< </div>
						</div>
					</div>

					<div class="smoll-stat-container">
						<div class="smoll-stat-box">
							<div class="win-losse">
								<img src="src/component/Pictures/wins.png">
							</div>
							<div class="text-container">
								<div class="score-text" data-i18n="Wins"></div>
								<div id="win" class="score-number"></div>
							</div>
						</div>

						<div class="smoll-stat-box">
							<div class="win-losse">
								<img src="src/component/Pictures/losses.png">
							</div>
							<div class="text-container">
								<div class="score-text" data-i18n="Losses"></div>
								<div id="loss" class="score-number"> </div>
							</div>
						</div>
					</div>

					<div class="buttons">
						<button class="btn" id="StartGame" data-i18n="btn_PlayGame"></button>
					</div>
				</div>
				
				<div class="leaderboard">
					<h2 data-i18n="LeaderBoard"></h2>
					<div class="leaderboard-entry">
						<div class="img-container">
							<img src="src/component/Pictures/1.jpg">
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
							<img src="src/component/Pictures/2.jpg">
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
							<img src="src/component/Pictures/3.jpg">
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
			<!-- ^^^ -->
		</div>
		`);

		getLanguage();
		dropDownBar(["dropdown-btn", "language-btn", "language-content"]);
		fillHome(); // Retrieve user uuid

		document.getElementById('LogOut')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/index');
			renderPage();
		});

		document.getElementById('Home')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/home');
			setupUserHome();
		});

		document.getElementById('Settings')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/setting');
			setupSetting();
		});

		document.getElementById('Friends')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/friends');
			setupFriends();
		});

		document.getElementById('History')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/history');
			setupMatchHistory();
		});

		document.getElementById('StartGame')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/startGame');
			setupStartGame();
		});

	}
}

	