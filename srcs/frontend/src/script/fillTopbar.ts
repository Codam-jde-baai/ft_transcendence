import { connectFunc, requestBody } from './connections';
import { setupError404 } from '../pages/error404';

export function fillTopbar() {
	// Retrieve user uuid
	const userID = localStorage.getItem('userID');
	if (userID) {
		connectFunc(`/user/${userID}`, requestBody("GET", null, "application/json"))
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
				window.history.pushState({}, '', '/error404');
				setupError404();
			}
		}).catch(() => {
			// Network or server error
			window.history.pushState({}, '', '/error404');
			setupError404();
		});
	} else {
		// Network or server error
		window.history.pushState({}, '', '/error404');
		setupError404();
	}

}
