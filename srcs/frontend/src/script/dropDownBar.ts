import { switchLanguage } from '../script/language';

// DropDown Function
export function dropDownBar(input: string[]) {
	input.forEach(element => {
		const elem = document.getElementById(element) as HTMLInputElement

		if (!elem)
			return;

		if (elem.id === "dropdown-btn") {
			// Handle click events for toggling settings dropdown
			elem.addEventListener('click', (event) => {
				const dropdown = document.querySelector('.dropdown-content');
				const dropdownBtn = document.querySelector('.dropdown-btn');
				
				if (dropdown && dropdownBtn) {
					// Toggle dropdown visibility when clicking the button
					if (dropdownBtn.contains(event.target as Node))
						dropdown.classList.toggle('show');
				}
			});
			// Add a global click listener to hide the dropdown when clicking outside
			document.addEventListener("click", (event) => {
				const dropdown = document.querySelector('.dropdown-content');
				const dropdownBtn = document.querySelector('.dropdown-btn');
		
				if (dropdown && dropdownBtn) {
					// Hide dropdown if clicking outside of it
					if (!dropdown.contains(event.target as Node) && !dropdownBtn.contains(event.target as Node))
						dropdown.classList.remove('show');
				}
			});
		}
		if (elem.id === "language-btn") {
			// Close both dropdowns when clicking outside
			elem.addEventListener("click", (event) => {
				const languageDropdown = document.querySelector('.language-content');
				const languageBtn = document.querySelector('.language-btn');

				if (languageDropdown && languageBtn) {
					// Toggle dropdown visibility when clicking the button
					if (languageBtn.contains(event.target as Node)) 
						languageDropdown.classList.toggle('showLang');
				}
			});
			// Add a global click listener to hide the dropdown when clicking outside
			document.addEventListener("click", (event) => {
				const languageDropdown = document.querySelector('.language-content');
				const languageBtn = document.querySelector('.language-btn');
		
				if (languageDropdown && languageBtn) {
					// Hide dropdown if clicking outside of it
					if (!languageDropdown.contains(event.target as Node) && !languageBtn.contains(event.target as Node))
						languageDropdown.classList.remove('showLang');
				}
			});
		}
		if (elem.id === "language-content") {
			elem.addEventListener('click', (event) => {
				const gb = document.getElementById('gb');
				const de = document.getElementById('de');
				const nl = document.getElementById('nl');
				
				if (gb) {
					if (gb.contains(event.target as Node))
						switchLanguage("en");
				}
				if (de) {
					if (de.contains(event.target as Node))
						switchLanguage("de");
				}
				if (nl) {
					if (nl.contains(event.target as Node))
						switchLanguage("nl");
				}
			});
		}
	});
}