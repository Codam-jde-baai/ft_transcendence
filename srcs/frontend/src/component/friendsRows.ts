import "../styles/friends.css"

class PublicUser extends HTMLElement {
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
						friendid: this.getAttribute('friendid'),
						type: this.getAttribute("type"),
						status: this.getAttribute("status"),
					}
				}));
			});
		});
	}

	render() {
		const type: string = this.getAttribute("type") || "Could Not Load User"
		const alias: string = this.getAttribute("alias") || "Alias"
		const profilePicData: string = this.getAttribute("profilePicData") || "null"
		const profilePicMimeType: string = this.getAttribute("profilePicMimeType") || "null"
		const statusData: string | null = this.getAttribute("status")
		let image = ""
		if (profilePicData != "null" && profilePicMimeType != "null") {
			image = `data:${profilePicMimeType};base64,${profilePicData}`;
		}
		else {
			image = "src/Pictures/defaultPP.png"
		}
		const userStatus: string = statusData === "1" ? "online" : "offline";
		this.innerHTML = "";
		this.insertAdjacentHTML("beforeend", /*html*/`
        <div class="publicUser">
			<div class="statusProfile">
				<span class="statusIndicator ${type === 'friend' ? userStatus : 'hidden'}"></span>
				<div class="profile-content">
					<img src=${image} alt="Profile Picture">
					<p> ${alias} </p>
				</div>
			</div>
            
            <div>
                <button class="btn" ${type === 'friend' ? '' : 'hidden'} data-i18n="History"> </button>
                <button class="btn" ${type === 'friend' ? '' : 'hidden'} data-i18n="OurHistory"> </button>
                <button class="btn bg-red-800" ${type === 'friend' ? '' : 'hidden'} data-i18n="btn_Remove_Friend"> </button>

			<button class="btn accept" ${type === "friend-request" ? '' : 'hidden'} data-i18n="btn_Accept"> . </button>
			<button class="btn decline" ${type === "friend-request" ? '' : 'hidden'} data-i18n="btn_Decline"> . </button>
			
			<button class="btn" ${type === "unfriend" ? '' : 'hidden'} data-i18n="btn_Add_Friend"></button>
			<button class="btn" ${type === "unfriend" ? '' : 'hidden'} data-i18n="History"></button>

			<button class="btn accept" ${type === "pendingRequests" ? '' : 'hidden'} data-i18n="btn_Cancel"> </button>
			
		</div>`)
	}
}

customElements.define('public-user', PublicUser);