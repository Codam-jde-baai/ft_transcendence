import { connectFunc, requestBody } from './connections';
import { setupErrorPages } from '../pages/errorPages';

export function fillTopbar(refresh: boolean = false) {
	if (!refresh) {
		const storedalias = localStorage.getItem('myAlias');
		if (storedalias) {
			const aliasElem = document.getElementById("aliasName");
			if (aliasElem) {
				aliasElem.textContent = storedalias;
			}
			const pictureElem = document.getElementById("profile-picture") as HTMLImageElement;
			const storedProfilePic = localStorage.getItem('myProfilePic');
			if (pictureElem && storedProfilePic) {
				pictureElem.src = `data:image/png;base64,${storedProfilePic}`;
			}
			return;
		}
	}
	connectFunc(`/user`, requestBody("GET", null, "application/json"))
		.then((userInfoResponse) => {
			if (userInfoResponse.ok) {
				userInfoResponse.json().then((data) => {
					// Alias Name
					const aliasElem = document.getElementById("aliasName");
					localStorage.setItem('myAlias', data.alias);
					if (aliasElem)
						aliasElem.textContent = data.alias;
					// Profile-pic
					const pictureElem = document.getElementById("profile-picture") as HTMLImageElement;
					if (pictureElem && data.profile_pic && data.profile_pic.data) {
						localStorage.setItem('myProfilePic', data.profile_pic.data);
						pictureElem.src = `data:${data.profile_pic.mimeType};base64,${data.profile_pic.data}`;
					}
				});
			} else {
				window.history.pushState({}, '', '/errorPages');
				setupErrorPages(userInfoResponse.status, userInfoResponse.statusText);
			}
		})
}
