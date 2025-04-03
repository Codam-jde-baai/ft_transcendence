import { switchLanguage } from '../script/language';

// DropDown Function
export function dropDownBar(input: string[]) {
	input.forEach(element => {
		const elem = document.getElementById(element) as HTMLInputElement

		if (elem.id === "dropdown-btn")
		{
			// Handle click events for toggling settings dropdown
			elem.addEventListener('click', (event) => {
				const dropdown = document.querySelector('.dropdown-content');
				const dropdownBtn = document.querySelector('.dropdown-btn');
				
				if (dropdown && dropdownBtn) {
					if (dropdownBtn.contains(event.target as Node)) {
						// Toggle dropdown visibility when clicking the button
						dropdown.classList.toggle('show');
					} else if (!dropdown.contains(event.target as Node)) {
						// Hide dropdown if clicking outside of it
						dropdown.classList.remove('show');
					}
				}
			});
		}
		if (elem.id === "language-btn")
		{
			// Close both dropdowns when clicking outside
			elem.addEventListener("click", (event) => {
				const languageDropdown = document.querySelector('.language-content');
				const languageBtn = document.querySelector('.language-btn');

				if (languageDropdown && languageBtn) {
					if (languageBtn.contains(event.target as Node)) {
						// Toggle dropdown visibility when clicking the button
						languageDropdown.classList.toggle('showLang');
					} else if (!languageDropdown.contains(event.target as Node)) {
						// Hide dropdown if clicking outside of it
						languageDropdown.classList.remove('showLang');
					}
				}
			});
		}
		if (elem.id === "language-content")
		{
			elem.addEventListener('click', (event) => {
				const gb = document.getElementById('gb');
				const de = document.getElementById('de');
				const nl = document.getElementById('nl');
				
				if (gb) {
					if (gb.contains(event.target as Node)) {
						switchLanguage("en");
					}
				}
				if (de) {
					if (de.contains(event.target as Node)) {
						switchLanguage("de");
					}
				}
				if (nl) {
					if (nl.contains(event.target as Node)) {
						switchLanguage("nl");
					}
				}
			});
		}
	});
}