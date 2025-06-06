import { getLanguage } from '../script/language';
import { dropDownBar } from '../script/dropDownBar';
import { fillTopbar } from '../script/fillTopbar';
import { setupNavigation } from '../script/menuNavigation';


export function setupCssTemplate() {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", /*html*/`
		<link rel="stylesheet" href="src/styles/contentPages.css"> <!-- Link to the CSS file -->
			<dropdown-menu></dropdown-menu>
			<div class="middle">
				<h2 class="h2"> This is content that can be put outside the content area </h2>
				<button class="btnFullWidth secondary">
					<span>Full width secondary button</span>
				</button>
				<button class="btnFullWidth secondary">
					<span>Full width secondary button</span>
				</button>
				<div class="contentArea">
					<h1 class="h1">This is the H1 font</h1>
					<h2 class="h2">This is the H2 font</h2>
					<button class="cbtn">
						<span>default button</span> 
					</button>
					<h3 class="h3">This is the H3 font</h3>
					<p class="p1">p1 inside the content Area</p>
					<button class="cbtn secondary">
						<span>the default button --- grows with size</span> 
					</button>
					<p class="p2">p2 inside the content Area</p>
					<button class="btnFullWidth">
						<span>always has max width</span> 
					</button>
					<p class="p3">p3 inside the content Area</p>
				</div>
				<p class="p1">p1 below the content Area</p>
				<button class="btnFullWidth">
					<span>Full width primary button</span>
				</button>
				<div class="contentArea">
					<p> seconary content area </p>
				</div>
			</div>
		</div>
		`);

		fillTopbar();
		dropDownBar(["dropdown-btn", "language-btn", "language-content"]);
		setupNavigation();
		getLanguage();
	}
}
