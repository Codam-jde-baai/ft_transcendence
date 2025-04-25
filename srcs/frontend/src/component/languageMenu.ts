class LanguageMenu extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
    }

	render() {
		this.innerHTML = "";
		this.insertAdjacentHTML("beforeend", /*html*/`
			<div class="btn-container" id="dropdown-btn">
				<button class="language-btn" id="language-btn">
					<span data-i18n="Language"></span> <img id="selected-flag" src="src/Pictures/flagIcon-en.png">
				</button>
				<div class="language-content" id="language-content">
					<div class="language-option" id="gb">
						<img src="src/Pictures/flagIcon-en.png"> <span data-i18n="English"></span>
					</div>
					<div class="language-option" id="de">
						<img src="src/Pictures/flagIcon-de.png"> <span data-i18n="German"></span>
					</div>
					<div class="language-option" id="nl">
						<img src="src/Pictures/flagIcon-nl.png"> <span data-i18n="Dutch"></span>
					</div>
			</div>`)
	}
}

customElements.define('language-menu', LanguageMenu);