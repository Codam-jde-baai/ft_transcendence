import { renderPage } from './index';
import { setupSetting } from './setting';
import { setupFriends } from './friends';
import { setupMatchHistory } from './history';
import { setupStartGame } from './startGame';
import { getLanguage } from '../script/language';
import { dropDownBar } from '../script/dropDownBar';
import { connectFunc, requestBody, inputToContent } from '../script/connections';
import { errorDisplay } from '../script/errorFunctions';
import { setupError404 } from './error404';

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
				<div class="aliasName">cool alias</div>
				<div class="profile-picture">
					<img src="src/component/Pictures/defaultPP.avif" alt="Profile Picture">
				</div>
			</div>
		</div>
		
		<div class="middle">
			<!-- BODY CHANGE -->
			<div class="container">

				<div class="user-stats">
					<div class="stat-box">
						<div class="total-score">
							<img src="src/component/Pictures/totalScore.png">
						</div>
						<div class="text-container">
							<div class="total-score-text" data-i18n="Total_Score"></div>
							<div class="score-number"> >-1200-< </div>
						</div>
					</div>

					<div class="smoll-stat-container">
						<div class="smoll-stat-box">
							<div class="win-losse">
								<img src="src/component/Pictures/wins.png">
							</div>
							<div class="text-container">
								<div class="score-text" data-i18n="Wins"></div>
								<div class="score-number"> >-1200-< </div>
							</div>
						</div>

						<div class="smoll-stat-box">
							<div class="win-losse">
								<img src="src/component/Pictures/losses.png">
							</div>
							<div class="text-container">
								<div class="score-text" data-i18n="Losses"></div>
								<div class="score-number"> >-900-< </div>
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
								<div class="text"> $user123</div>
								<div class="number" data-i18n="wins_"></div>
								<div class="number" data-i18n="losses_"></div>
							</div>
						</div>
					<div class="leaderboard-entry">
						<div class="img-container">
							<img src="src/component/Pictures/2.jpg">
						</div>
						<div class="test-container">
							<div class="position" data-i18n="2"></div>
							<div class="text">$welp</div>
							<div class="number" data-i18n="wins_"></div>
							<div class="number" data-i18n="losses_"></div>
						</div>
					</div>
					<div class="leaderboard-entry">
						<div class="img-container">
							<img src="src/component/Pictures/3.jpg">
						</div>
						<div class="test-container">
							<div class="position" data-i18n="3"></div>
							<div class="text">$coolalias</div>
							<div class="number" data-i18n="wins_"></div>
							<div class="number" data-i18n="losses_"></div>
						</div>
					</div>
				</div>

			</div>
			<!-- ^^^ -->
		</div>
		`);

		getLanguage();
		dropDownBar(["dropdown-btn", "language-btn", "language-content"]);

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

		const token = localStorage.getItem('authToken'); // Retrieve the token
		console.log("USER " + token);  // -> RM <-

		if (token) {

			const body = requestBody("GET", null); // GET requests typically don't have a body
			const response = connectFunc("/users", body); // Pass headers to connectFunc

			response.then((response) => {
				if (response.ok) {
					response.json().then((data) => {
						console.log("User data fetched successfully:", data);
						// Use the fetched data (e.g., display user stats, leaderboard, etc.)
					});
				} else {
					console.error("Failed to fetch user data");
				}
			}).catch(() => {
				console.error("Network or server error");
				window.history.pushState({}, '', '/error404');
				setupError404();
			});
		} else {
			console.error("No auth token found. Redirecting to login.");
		}

	}
}

	