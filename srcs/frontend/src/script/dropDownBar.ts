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
		if (elem.id === "game-btn") {
			// Close both dropdowns when clicking outside
			elem.addEventListener("click", (event) => {
				const gameDropdown = document.querySelector('.game-content');
				const gameBtn = document.querySelector('.game-btn');

				if (gameDropdown && gameBtn) {
					// Toggle dropdown visibility when clicking the button
					if (gameBtn.contains(event.target as Node)) 
						gameDropdown.classList.toggle('showGame');
				}
			});
			// Add a global click listener to hide the dropdown when clicking outside
			document.addEventListener("click", (event) => {
				const gameDropdown = document.querySelector('.game-content');
				const gameBtn = document.querySelector('.game-btn');
		
				if (gameDropdown && gameBtn) {
					// Hide dropdown if clicking outside of it
					if (!gameDropdown.contains(event.target as Node) && !gameBtn.contains(event.target as Node))
						gameDropdown.classList.remove('showGame');
				}
			});
		}
		if (elem.id === "game-content") {
			elem.addEventListener('click', (event) => {
				const pong = document.getElementById('pong');
				const snek = document.getElementById('snek');
				
				if (pong) {
					console.log("p");
					// if (pong.contains(event.target as Node))
					// 	switchGame("pong");
				}
				if (snek) {
					console.log("s");
					// if (snek.contains(event.target as Node))
					// 	switchGame("snek");
				}

			});
		}
	});
}