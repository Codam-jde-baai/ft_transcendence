import { connectFunc, requestBody, inputToContent } from './connections';
import { EditPicture } from './sendPic';
import { setupErrorPages } from '../pages/errorPages';
import DOMPurify from 'dompurify';

// Save button (settings.ts)
export async function updateUserSettings(input: string[]): Promise<boolean> {
	// const userID = localStorage.getItem('userID');

	for (const element of input) {
		const inputElement = document.getElementById(element) as HTMLInputElement;
		
		if (inputElement.value !== "" && inputElement.value !== null) {

			if (inputElement.id === "avatar") {
				if (!EditPicture())
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
				if (!userID) return false;

				let username: string | undefined;
				try {
					const result = await getname(userID);
					username = result !== null ? result : undefined;
					if (!username) return false;
				} catch (error) {
					return false;
				}
				const password = document.getElementById("password") as HTMLInputElement;
				const newPassword = document.getElementById("current_password") as HTMLInputElement;
				const body = requestBody("PUT", JSON.stringify({username: username, password: password.value, newPassword: newPassword.value}), "application/json");
				console.log("BOIDY", body);
				try {
					const response = await connectFunc("/user/updatepw", body);
					if (!response.ok)
							return false;
				} catch (error) {
					return false;
				}
			} else if (inputElement.id === "username") {
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
			}
		}
	}
	return true;
}


// // fill variables in settings
// export function fillSetting() {

// 	// Retrieve user uuid
// 	const userID = localStorage.getItem('userID');
// 	if (userID) {
// 		connectFunc(`/user/`, requestBody("GET", null, "application/json"))
// 		.then((userInfoResponse) => {
// 			if (userInfoResponse.ok) {
// 				userInfoResponse.json().then((data) => {

// 					// USER Name
// 					const nameElem = document.getElementById("name");
// 					if (nameElem)
// 						nameElem.textContent = data.username;

// 				});
// 			} else {
// 				window.history.pushState({}, '', '/errorPages');
// 				setupErrorPages(404, "Not Found");
// 			}
// 		}).catch(() => {
// 			// Network or server error
// 			window.history.pushState({}, '', '/errorPages');
// 			setupErrorPages(500, "Internal Server Error");
// 		});
// 	} else {
// 		// Network or server error
// 		window.history.pushState({}, '', '/errorPages');
// 		setupErrorPages(404, "Not Found");
// 	}

	
// }

// fill variables in settings
export async function getname(userID: string): Promise<string | null> {

	// Retrieve user uuid
	if (userID) {
		const userInfoResponse = await connectFunc(`/user/`, requestBody("GET", null, "application/json"));
		if (userInfoResponse.ok) {
			const data = await userInfoResponse.json();
			return data.username || null;
		} else
			return null;
	} else {
		// Invalid userID
		window.history.pushState({}, '', '/errorPages');
		setupErrorPages(404, "Not Found");
		return null;
	}	
}