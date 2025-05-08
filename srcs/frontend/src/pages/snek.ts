import { fillTopbar } from '../script/fillTopbar';
import { dropDownBar } from '../script/dropDownBar';
import { setupErrorPages } from "./errorPages";
import { setupNavigation } from '../script/menuNavigation';
import { setupGame } from '../game/snek/setupGame';
import { getLanguage } from '../script/language';

export function setupSnek() {
	console.log("Setting up Snek");
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", /*html*/ `
		<div class="flex flex-col gap-4 items-center bg-black bg-opacity-75 py-20 px-8 rounded">
			<div class="flex flex-row w-full gap-20 bg-pink-500 text-white py-2 px-4 rounded justify-center">
			<div class="flex flex-col flex-1 gap-4 bg-red-500 py-2 px-4 rounded justify-items-center">
					<p>Player1 (WASD)</p>
					<p class="text-center">${playerStats.alias}</p>
					<div class="bg-red-600 p-2 rounded">
						<p>Matches: ${playerStats.matches}</p>
						<p>Wins: ${playerStats.wins} | Losses: ${playerStats.losses}</p>
						<p>Win Rate: ${(playerStats.winrate)}%</p>
						<p>Avg Score: ${playerStats.avg_score}</p>
						<p>Highest Score: ${playerStats.highest_score}</p>
					</div>
				</div>
				<div class="flex flex-col flex-1 gap-4 bg-green-500 py-2 px-4 rounded justify-items-center">
					<p>Player2 (ARROW)</p>
					<div class="flex items-center gap-4">
						<label class="flex items-center cursor-pointer">
							<span class="mr-2">Guest</span>
							<div class="relative inline-block w-16 h-8">
								<input type="checkbox" id="authToggle" class="absolute w-0 h-0 opacity-0">
								<div class="absolute inset-0 bg-gray-300 rounded-full transition-colors duration-300" id="toggleBackground"></div>
								<div class="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300" id="toggleCircle"></div>
								</div>
							<span class="ml-2">Login</span>
							</label>
					</div>

					<!-- Guest Form -->
					<form id="GuestAliasform" class="flex flex-col gap-2 text-black">
						<input type="text" id="guestAliasInput" class="p-2 rounded" placeholder="Guest alias" required minlength="3" maxlength="117" />
						<div class="flex gap-2">
							<button id="lockInGuest" type="button" class="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">Lock In</button>
							<button id="changeGuestAlias" type="button" class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded hidden">Change</button>
						</div>
					</form>

					<!-- Login Form -->
					<form id="LoginForm" class="flex-col gap-2 text-black hidden">
						<input type="text" id="loginUsername" class="p-2 rounded" placeholder="Username" />
						<input type="password" id="loginPassword" class="p-2 rounded" placeholder="Password" />
						<div class="flex gap-2">
							<button type="button" id="loginButton" class="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">Login</button>
							<button type="button" id="logoutButton" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded hidden">Logout</button>
						</div>
						<p id="loginStatus" class="text-white text-center mt-2 hidden"></p>
						</form>
					<p class="text-center player2-info"></p>
					<!-- Player2 Stats Container (initially hidden) -->
					<div id="player2StatsContainer" class="bg-green-600 p-2 rounded hidden">
						<p>Matches: <span id="p2-matches">0</span></p>
						<p>Wins: <span id="p2-wins">0</span> | Losses: <span id="p2-losses">0</span></p>
						<p>Win Rate: <span id="p2-winrate">0.0</span>%</p>
						<p>Avg Score: <span id="p2-avg-score">0.0</span></p>
						<p>Highest Score: <span id="p2-highest-score">0</span></p>
					</div>
				</div>
			</div>
			<button class="btn bg-gray-500 cursor-not-allowed opacity-50" id="startGame" disabled>Start Game</button>
			<div id="gameContainer" class="mb-4"></div>
			<div class="hidden flex-row gap-4" id="replayButtons">
				<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" id="newGame">New Players</button>
				<button class="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded" id="restartGame">Rematch!</button>
				</div>
		</div>
		`);
		dropDownBar(["dropdown-btn", "language-btn", "language-content"]);
		getLanguage();
		fillTopbar();
		setupNavigation();

	}
	else {
		setupErrorPages(404, "Page Not Found");
	}
}
