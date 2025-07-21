import "../styles/friends.css"

class mmItems extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.render();
		this.setupEventListeners();
	}

	setupEventListeners() {
		const buttons = this.querySelectorAll('button.btn');

		buttons.forEach(button => {
			button.addEventListener('click', () => {
				const buttonAction = button.getAttribute('data-i18n');

				// Dispatch a custom event
				this.dispatchEvent(new CustomEvent('user-action', {
					bubbles: true,
					detail: {
						action: buttonAction,
						alias: this.getAttribute('alias'),
						friends: this.getAttribute('friends'),
						type: this.getAttribute("type"),
						status: this.getAttribute("status"),
						winrate: this.getAttribute("winrate"),
						wins: this.getAttribute("wins"),
						losses: this.getAttribute("losses"),
						totalGames: this.getAttribute("totalGames"),
						lastScoreSelf: this.getAttribute("lastScoreSelf"),
						lastScoreOpponent: this.getAttribute("lastScoreOpponent"),
					}
				}));
			});
		});
	}

	render() {
		const friends: string = this.getAttribute("friends") || "false";
		const winrate: string = this.getAttribute("winrate") || "0";
		const totalGames: string = this.getAttribute("totalGames") || "0";
		const lastScoreSelf: string = this.getAttribute("lastScoreSelf") || "0";
		const lastScoreOpponent: string = this.getAttribute("lastScoreOpponent") || "0";
		const type: string = this.getAttribute("type") || "equalSkill";
		const alias: string = this.getAttribute("alias") || "Alias";
		const profilePicData: string = this.getAttribute("profilePicData") || "null";
		const profilePicMimeType: string = this.getAttribute("profilePicMimeType") || "null";
		const statusData: string | null = this.getAttribute("status");
		
		let image = ""
		if (profilePicData != "null" && profilePicMimeType != "null") {
			image = `data:${profilePicMimeType};base64,${profilePicData}`;
		}
		else {
			image = "src/Pictures/defaultPP.png"
		}
		
		const userStatus: string = statusData === "1" ? "online" : "offline";
		const isFriend: boolean = friends === "true";
		
		// Format winrate as percentage
		const winratePercent = Math.round(parseFloat(winrate) * 100);
		
		// Determine what additional info to show based on type
		let additionalInfo = "";
		if (type === "recentLoss") {
			additionalInfo = `<p class="match-info">Last Score: You ${lastScoreSelf} - ${lastScoreOpponent} ${alias}</p>`;
		} else if (type === "equalSkill") {
			additionalInfo = `<p class="match-info">Winrate: ${winratePercent}%</p>`;
		} else if (type === "equalGameAmount") {
			additionalInfo = `<p class="match-info">Games Played: ${totalGames}</p>`;
		}

		this.innerHTML = "";
		this.insertAdjacentHTML("beforeend", /*html*/`
        <div class="publicUser">
			<div class="statusProfile">
				<span class="statusIndicator ${isFriend === true ? userStatus : 'hidden'}"></span>
				<div class="profile-content">
					<img src=${image} alt="Profile Picture">
					<p> ${alias} </p>
				</div>
			</div>
            
			<p> ${additionalInfo} </p>

            <div class="action-buttons">
				<button class="btn" data-i18n="Profile">Profile</button>
				<button class="btn primary" data-i18n="PokeToPlay">Poke to Play</button>
			</div>
		</div>`);
	}
}

customElements.define('mm-items', mmItems);