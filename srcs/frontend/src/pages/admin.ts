import { renderPage } from './index';
import { getLanguage } from '../script/language';
import { dropDownBar } from '../script/dropDownBar';
import { fillTopbar } from '../script/fillTopbar';
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
		fillTopbar();
		fillUserTable();
		doSearch();
		
		document.getElementById('LogOut')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/index');
			renderPage();
		});
	}
}

function doSearch() {

	
}
