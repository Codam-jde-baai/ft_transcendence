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
				<h1 class="h1">examples of splits in the content Area</h1>
				<div class="contentArea">
					<!-- Single content box -->
					<div class="contentBox">
						<p class="p1">content in rows(vertical)</p>
						<button class="cbtn"><span>abc</span></button>
					</div>
				
					<!-- Row content box -->
					<div class="contentBox row">
						<p class="p1">content in columns(horizontal)</p>
						<button class="cbtn"><span>abc</span></button>
					</div>
				
					<!-- Split 1-3 -->
					<div class="split-1-3">
						<div class="contentBox">
							<p class="p1">1/3 of the content area</p>
							<button class="cbtn"><span>abc</span></button>
						</div>
						<div class="contentBox">
							<p class="p1">2/3 of the content area</p>
							<button class="cbtn"><span>abc</span></button>
						</div>
					</div>
				
					<!-- Split 1-1 -->
					<div class="split-1-1">
						<div class="contentBox">
							<p class="p1">50-50 content</p>
							<button class="cbtn"><span>abc</span></button>
						</div>
						<div class="contentBox">
							<p class="p1">50-50 content</p>
							<button class="cbtn"><span>abc</span></button>
						</div>
					</div>
				
					<!-- Split 2-1 -->
					<div class="split-2-1">
						<div class="contentBox">
							<p class="p1">2/3rd of the content area</p>
							<button class="cbtn"><span>abc</span></button>
						</div>
						<div class="contentBox">
							<p class="p1">1/3rd of the content area</p>
							<button class="cbtn"><span>abc</span></button>
						</div>
					</div>
		</div>
					<h2 class="h2">Search Players from History</h2>
					<div class="contentArea">
						<div class="itemsCenter">
							<input type="text" class="alias-input" placeholder="placeholderField">
							<input type="text" class="alias-input" placeholder="placeholderField">
							<button class="small-btn">
								<span>Find</span>
							</button>
						</div>
					</div>
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
