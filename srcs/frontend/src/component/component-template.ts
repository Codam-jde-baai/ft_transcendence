// TODO: Delete File For Production

class Template extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
    }

	render() {
		// const currentPage = window.location.pathname
		this.innerHTML = "";
		this.insertAdjacentHTML("beforeend", /*html*/`
		<div class="template">
			
		</div>`)
	}
}

customElements.define('template', Template);