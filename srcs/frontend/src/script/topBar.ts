export function loadTopBar() {
	fetch("src/component/topBar.html")
		.then(response => {
			if (!response.ok) {
				throw new Error(`Failed to load topBar: ${response.status}`);
			}
			return response.text();
		})
		.then(html => {
			const tempDiv = document.createElement("div");
			tempDiv.innerHTML = html;
			const topBar = tempDiv.firstElementChild;
			if (topBar) document.body.prepend(topBar);
		})
		.catch(error => console.error("Error loading top bar:", error));
}