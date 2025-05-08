import { renderPage } from './index';
import { getLanguage } from '../script/language';
import { dropDownBar } from '../script/dropDownBar';
import { fillUserTable } from '../script/fillTable';

export function setupAdmin() {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", /*html*/`
		<link rel="stylesheet" href="src/styles/admin.css"> <!-- Link to the CSS file -->
		<div class="overlay"></div>
		
		<admin-topbar></admin-topbar>
		
		<div class="middle">
			<div class="container">
				<div class="search-container">
					<form id="searchForm">
						<button type="button" id="searchButton" class="search-btn">
							<img class="searchIcon" src="src/Pictures/searchIcon.png"/>
						</button>
						<input type="search" id="friendSearch" class="userSearch" data-i18n-placeholder="Friends_placeholder1">
					</form>
				</div>
				<div class="search-results" id="searchResults"></div>

				<user-table></user-table>

			</div>
		</div>
		`);

		getLanguage();
		dropDownBar(["dropdown-btn", "language-btn", "language-content"]);
		fillUserTable();
		setupSearch();
		
		document.getElementById('LogOut')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/index');
			renderPage();
		});
	}
}


function setupSearch() {
    const searchInput = document.getElementById('friendSearch');
    const searchResults = document.getElementById('searchResults');

    let debounceTimer: any;

    searchInput?.addEventListener('input', () => {
        clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => performSearch((searchInput as HTMLInputElement).value.trim().toLowerCase(), searchResults), 300);
    });
}

async function performSearch(query: string, searchResults: HTMLElement) {
    searchResults.innerHTML = "";

    if (query.length === 0) return;

    searchResults.innerHTML = "<p>Loading...</p>";

    try {
        const users = await fetchUsers();
        const filteredUsers = users.filter(user => 
            user.name.toLowerCase().includes(query) || user.alias.toLowerCase().includes(query)
        );

        searchResults.innerHTML = filteredUsers.length
            ? filteredUsers.map(user => `<div class='search-result-item'>${user.name} (${user.alias})</div>`).join('')
            : "<p>No results found</p>";
    } catch (error) {
        searchResults.innerHTML = "<p>Error fetching results. Please try again.</p>";
    }
}

async function fetchUsers() {
    // Replace this with an actual API call or data source
    return [
        { name: "John Doe", alias: "johnd" },
        { name: "Jane Smith", alias: "janes" },
        { name: "Alice Johnson", alias: "alicej" },
    ];
}
