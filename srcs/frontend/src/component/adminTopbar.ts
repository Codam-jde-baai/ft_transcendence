class AdminTopbar extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.render();
	}
	
	render() {
		this.innerHTML = "";
		this.insertAdjacentHTML("beforeend", /*html*/`
		<link rel="stylesheet" href="src/styles/adminTopbar.css"> <!-- Link to the CSS file -->
		<div class="topBar">
			<div class="dropdown">
				<button class="dropdown-btn" id="dropdown-btn">
					<img class="settingIcon" src="src/Pictures/setting-btn.png"/>
				</button>
				
					<div class="dropdown-content">
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
					</div>
					<div class="dropdown-item" id="LogOut" data-i18n="LogOut"></div>

				</div> 
			</div>
			<div class="topBarFrame">
				<div class="adminName" data-i18n="Admin"></div>
				<div class="profile-picture">
					<img src="src/Pictures/admin.jpg" alt="Profile Picture">
				</div>
			</div>
		</div>`)
	}
}

customElements.define('admin-topbar', AdminTopbar);

