class PublicUser extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
    }

	render() {
		const type:string = this.getAttribute("type") || "Could Not Load User"
		const alias:string = this.getAttribute("alias") || "Alias"
		const profilePicData:string = this.getAttribute("profilePicData") || "null"
		const profilePicMimeType:string = this.getAttribute("profilePicMimeType") || "null"
		let image = ""
		if (profilePicData != "null" && profilePicMimeType != "null")
		{
			image = `data:${profilePicMimeType};base64,${profilePicData}`;
		}
		else
		{
			image = "src/Pictures/defaultPP.avif"
		}
		this.innerHTML = "";
		this.insertAdjacentHTML("beforeend", `
		<div class="publicUser">
			<img src=${image} alt="Profile Picture">
			<p> ${alias} </p>
			
			<button class="btn" ${type === 'friend' ? '' : 'hidden'} data-i18n="History"> </button>
			<button class="btn" ${type === 'friend' ? '' : 'hidden'} data-i18n="btn_Remove_Friend"> </button>

			<button class="btn accept" ${type === "friend-request" ? '' : 'hidden'} data-i18n="btn_Accept"> </button>
			<button class="btn decline" ${type === "friend-request" ? '' : 'hidden'} data-i18n="btn_Decline"> </button>
			<button class="btn blok" ${type === "friend-request" ? '' : 'hidden'} data-i18n="btn_Block"> </button>
		
			<button class="btn" ${type === "unfriend" ? '' : 'hidden'} data-i18n="btn_Add_Friend"> </button>
			<button class="btn" ${type === "unfriend" ? '' : 'hidden'} id="UserHistory" data-i18n="History"> </button>

		</div>`)
	}
}

customElements.define('public-user', PublicUser);