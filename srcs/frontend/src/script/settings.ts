import { connectFunc, requestBody, inputToContent } from '../script/connections';
import { EditPicture } from '../script/sendPic';
import { setupError404 } from '../pages/error404';

// Save button (settings.ts)
export function updateUserSettings(input: string[]): boolean {

	const userID = localStorage.getItem('userID');

	let isValid = true;
	let successfulUpdates = 0;
	let urlPWD: string = "/user/updatepw";
	let urlAlias: string = "/user/data";

	input.forEach(element => {
		const inputElement = document.getElementById(element) as HTMLInputElement

		if (inputElement.value !== "" && inputElement.value !== null )
		{
			let url: string = "";

			if (inputElement.id === "avatar")
			{
				if (EditPicture(userID))
					successfulUpdates += 1;
				else
					successfulUpdates = 0;	
			}
			else {
				if (inputElement.id === "alias")
					url = urlAlias;
				else if (inputElement.id === "password")
					url = urlPWD;
	
				const body = requestBody("PUT", inputToContent([inputElement.id]));
				const response = connectFunc(url, body);
				response.then((response) => {
					if (response.ok)
						successfulUpdates += 1;
					else
						successfulUpdates = 0;
				}).catch(() => {
					return false ;
				});
			}
		}
	});

	// Final success check
	if (successfulUpdates !== 0)
		isValid = true;
	else
		isValid = false;

	return isValid;
}

// fill variables in settings
export function fillSetting() {

	// Retrieve user uuid
	const userID = localStorage.getItem('userID');
	if (userID) {
		connectFunc(`/user/${userID}`, requestBody("GET", null))
		.then((userInfoResponse) => {
			if (userInfoResponse.ok) {
				userInfoResponse.json().then((data) => {

					// USER Name
					const nameElem = document.getElementById("name");
					if (nameElem)
						nameElem.textContent = data.username;

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