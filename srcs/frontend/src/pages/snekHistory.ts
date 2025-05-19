import { getLanguage } from '../script/language';
import { dropDownBar } from '../script/dropDownBar';
import { fillTopbar } from '../script/fillTopbar';
import { setupNavigation } from '../script/menuNavigation';
import { connectFunc, requestBody } from '../script/connections';
import { setupErrorPages } from './errorPages';
import { setupMatchHistory } from './history';

interface snekMatchHistory {
		id: string;
		p1_alias: string;
		p2_alias: string;
		winner_id: number;
		p1_score: number;
		p2_score: number;
		p2_isGuest: boolean;
}

export async function setupSnekMatchHistory() {
    const root = document.getElementById('app');
    const url = new URL(window.location.href);
    const pathSegments = url.pathname.split('/').filter(segment => segment);
    const alias1 = pathSegments[2] || null;
    const alias2 = pathSegments[3] || null;

    let apiRoute: string;

    // Determine the appropriate API endpoint based on alias1 and alias2
    if (alias1 === null) {
        apiRoute = `/snek/history/me`;
    } else if (alias2 === null) {
        apiRoute = `/snek/history/${alias1}`;
    } else {
        apiRoute = `/snek/history/${alias1}/${alias2}`;
    }

    try {
        // Await the response from connectFunc
        const response = await connectFunc(apiRoute, requestBody("GET"));

        if (!response.ok) {
            if (response.status === 404) {
                // Handle 404 error (e.g., display a message in the content area)
                if (root) {
                    root.innerHTML = `<p>History not found.</p>`;
                }
            } else {
                // Handle other errors
                setupErrorPages(response.status, response.statusText);
            }
            return;
        }

        // Parse the JSON response
        const snekMatchHistory: snekMatchHistory[] = await response.json();

        // Render the HTML
        if (root) {
            root.innerHTML = "";
            root.insertAdjacentHTML("beforeend", /*html*/`
                <link rel="stylesheet" href="src/styles/history.css"> <!-- Link to the CSS file -->
                <div class="overlay"></div>
                <dropdown-menu></dropdown-menu>
                
                <!-- Switching between games -->
                <button class="game-btn" id="PongHistory">
                    <span data-i18n="SwitchGame"></span> <img src="src/Pictures/game-pong.png">
                </button>
                <div class="imiddle">
                    <div class="hcontainer">
                        <h1 class="Pongheader" data-i18n="Snek"></h1>
                        <h1 class="header" data-i18n="History"></h1>
                        <p class="p1" data-i18n="History_P"></p>
                        <p class="p1" id="historyAliasName"></p>
                    </div>
                </div>
            `);

            getLanguage();
            dropDownBar(["dropdown-btn", "language-btn", "language-content"]);
            fillTopbar();
            setupNavigation();

            document.getElementById('PongHistory')?.addEventListener('click', () => {
                window.history.pushState({}, '', '/history');
                setupMatchHistory();
            });
        }

        // Fetch user info and update alias name
        const userInfoResponse = await connectFunc(`/user`, requestBody("GET", null));
        if (userInfoResponse.ok) {
            const userData = await userInfoResponse.json();
            const aliasElem = document.getElementById("historyAliasName");
            if (aliasElem) {
                aliasElem.textContent = userData.alias;
            }
        } else {
            window.history.pushState({}, '', '/errorPages');
            setupErrorPages(userInfoResponse.status, userInfoResponse.statusText);
        }
    } catch (error) {
        console.error("Error fetching snek match history:", error);
        setupErrorPages(500, "Internal Server Error");
    }
}
