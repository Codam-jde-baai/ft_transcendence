import { connectFunc, requestBody } from './connections';
import { setupErrorPages } from '../pages/errorPages';

export function fillTopbar() {

	connectFunc(`/user/`, requestBody("GET", null, "application/json"))
	.then((userInfoResponse) => {
		if (userInfoResponse.ok) {
			userInfoResponse.json().then((data) => {

				// Alias Name
				const aliasElem = document.getElementById("aliasName");
				if (aliasElem)
					aliasElem.textContent = data.alias;

				// Profile-pic
				const pictureElem = document.getElementById("profile-picture") as HTMLImageElement;
				if (pictureElem && data.profile_pic && data.profile_pic.data) {
					pictureElem.src = `data:${data.profile_pic.mimeType};base64,${data.profile_pic.data}`;
				}
			});
		} else {
			window.history.pushState({}, '', '/errorPages');
			setupErrorPages(userInfoResponse.status, userInfoResponse.statusText);
		}
	})
}
