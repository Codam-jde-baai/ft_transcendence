import { connectFunc, requestBody, inputToContent } from './connections';
import { EditPicture } from './sendPic';
import { setupError404 } from '../pages/error404';
import DOMPurify from 'dompurify';

// Save button (settings.ts)
export async function updateUserSettings(input: string[]): Promise<boolean> {
	const userID = localStorage.getItem('userID');

	for (const element of input) {
		const inputElement = document.getElementById(element) as HTMLInputElement;
		
		if (inputElement.value !== "" && inputElement.value !== null) {

			if (inputElement.id === "avatar") {
				if (!EditPicture(userID))
					return false;
			} else if (inputElement.id === "alias") {
				const rawInput = inputElement.value;
				const sanitizedInput = DOMPurify.sanitize(rawInput); // Removes unsafe HTML
				const alphanumericInput = sanitizedInput.replace(/[^a-zA-Z0-9]/g, ''); // Keeps only alphanumeric
				const body = requestBody("PUT", JSON.stringify({ uuid: userID, [inputElement.id]: alphanumericInput }), "application/json");
				try {
					const response = await connectFunc("/user/data", body);
					if (!response.ok)
						return false;
				} catch (error) {
					return false;
				}
			} else if (inputElement.id === "password") {
				// Password NOT WORKING
				console.log("Password can't be changed yet!");
				const body = requestBody("PUT", inputToContent([inputElement.id]), "application/json");
				try {
					const response = await connectFunc("/user/updatepw", body);
					if (!response.ok)
							return false;
				} catch (error) {
					return false;
				}
			}
		}
	}
	return true;
}


// fill variables in settings
export function fillSetting() {

	// Retrieve user uuid
	const userID = localStorage.getItem('userID');
	if (userID) {
		connectFunc(`/user/${userID}`, requestBody("GET", null, "application/json"))
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