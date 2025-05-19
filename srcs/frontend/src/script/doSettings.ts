import { connectFunc, requestBody } from './connections';
import { EditPicture } from './sendPic';
import DOMPurify from 'dompurify';
import { errorDisplay } from '../script/errorFunctions';

// Save button (settings.ts)
export async function updateUserSettings(input: string[]): Promise<boolean> {

	let updateAvatar: boolean = false;
	let jsonPayload: { [key: string]: string } = {};
	for (const element of input) {
		const inputElement = document.getElementById(element) as HTMLInputElement;
		if (inputElement.value !== "" && inputElement.value !== null) {

			if (inputElement.id === "avatar") {
				updateAvatar = true;
			} else {
				const rawInput = inputElement.value;
				const sanitizedInput = DOMPurify.sanitize(rawInput); // Removes unsafe HTML
				const alphanumericInput = sanitizedInput.replace(/[^a-zA-Z0-9]/g, ''); // Keeps only alphanumeric
				jsonPayload[element] = alphanumericInput;
			}
		}
	}
	const jsonString = JSON.stringify(jsonPayload);
	const body = requestBody("PUT", jsonString, "application/json");
	const response = await connectFunc("/user/data", body);

	if (!response.ok) {
		response.json().then((data) => {
			const password = document.getElementById("current_password") as HTMLInputElement;
			const errorMsg = document.getElementById("current-password") as HTMLParagraphElement;
			if (data.error === "user and password combination do not match database entry")
			{
				errorDisplay(password, errorMsg, "LogIn_error");
				return false;
			}
		})
		if (updateAvatar)
			return EditPicture()
		return (false);

	} 
	if (updateAvatar)
		return EditPicture();
	return true;
}

/* Obsolete Function
export async function updateUserSettings(input: string[]): Promise<boolean> {

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
				const body = requestBody("PUT", JSON.stringify({[inputElement.id]: alphanumericInput }), "application/json");
				const response = await connectFunc("/user/data", body);
				if (!response.ok)
					return false;
			} else if (inputElement.id === "password") {
				const password = document.getElementById("current_password") as HTMLInputElement;
				const rawInput = inputElement.value;
				const sanitizedInput = DOMPurify.sanitize(rawInput); // Removes unsafe HTML
				const alphanumericInput = sanitizedInput.replace(/[^a-zA-Z0-9]/g, ''); // Keeps only alphanumeric
				const body = requestBody("PUT", JSON.stringify({password: password.value, newPassword: alphanumericInput}), "application/json");
				const response = await connectFunc("/user/updatepw", body);
				const errorMsg = document.getElementById("current-password") as HTMLParagraphElement;
				if (!response.ok) {
					response.json().then((data) => {
						if (data.error === "user and password combination do not match database entry") {	
							errorDisplay(password, errorMsg, "LogIn_error");
							return false;
						}
						else
							return false;
					})
					return false;
				} 
			} else if (inputElement.id === "username") {
				const rawInput = inputElement.value;
				const sanitizedInput = DOMPurify.sanitize(rawInput); // Removes unsafe HTML
				const alphanumericInput = sanitizedInput.replace(/[^a-zA-Z0-9]/g, ''); // Keeps only alphanumeric
				const body = requestBody("PUT", JSON.stringify({[inputElement.id]: alphanumericInput }), "application/json");
				const response = await connectFunc("/user/data", body);
				if (!response.ok)
					return false;
			}
		}
	}
	return true;
}
*/