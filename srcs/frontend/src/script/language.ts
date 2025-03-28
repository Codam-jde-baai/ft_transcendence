// Import language files
import en from '../languages/en.json';
import de from '../languages/de.json';
import nl from '../languages/nl.json';

// Define LangData interface to type-check language data
interface LangData {
	[key: string]: string;
}

export function getTranslation(key: string): string {

	const lang = localStorage.getItem('selectedLang') || 'en';
	const langData: LangData = lang === 'de' ? de : lang === 'nl' ? nl : en;
	return langData[key] || key;
}

// Function to switch language
export function switchLanguage(lang: string) {
	let langData: LangData;

	// Determine which language data to use
	switch (lang) {
		case 'en':
			langData = en;
			break;
		case 'de':
			langData = de;
			break;
		case 'nl':
			langData = nl;
			break;
		default:
			langData = en; // Default to English if no valid language selected
			break;
	}

	updateContent(langData);
	if (document.getElementById("selected-flag"))
		document.getElementById("selected-flag")!.src = `src/component/Pictures/flagIcon-${lang}.png`;
	localStorage.setItem('selectedLang', lang);
}

export function getLanguage()
{
	let langData: LangData;
	
	// localStorage.removeItem('selectedLang');
	let lang: string = localStorage.getItem('selectedLang')!;
	// Determine which language data to use
	switch (lang) {
		case 'en':
			langData = en;
			break;
		case 'de':
			langData = de;
			break;
		case 'nl':  // Change to match 'nl.json' for Dutch
			langData = nl;
			break;
		default:
			lang = "en";
			langData = en; // Default to English if no valid language selected
			break;
	}
	// code for setting the language button to the correct language
	updateContent(langData);
	if (document.getElementById("selected-flag"))
		document.getElementById("selected-flag")!.src = `src/component/Pictures/flagIcon-${lang}.png`;
}

// Function to update content based on selected language
function updateContent(langData: LangData): void {
	document.querySelectorAll('[data-i18n]').forEach((element) => {
		const key = element.getAttribute('data-i18n');
		if (!key || !langData[key]) return;
		element.innerHTML = langData[key];
	});

	// Input placeholders
	document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
		if (element instanceof HTMLInputElement) {
			const key = element.getAttribute('data-i18n-placeholder');
			if (key && langData[key]) {
				element.placeholder = langData[key];
			}
		}
	});
}



// Load saved language or default to English
document.addEventListener('DOMContentLoaded', () => {
	const savedLang = localStorage.getItem('selectedLang') || 'en'; // Default to 'en'
	switchLanguage(savedLang);

	// Set the select dropdown to the saved language or default to English
	const languageSelector = document.getElementById('language-selector') as HTMLSelectElement;
	if (languageSelector) {
		languageSelector.value = savedLang;  // Update the dropdown to the selected language
	}
});

// Expose function globally (for use in HTML select onchange)
(window as any).switchLanguage = switchLanguage;
