import { connectFunc, requestBody } from './connections';
import { EditPicture } from './sendPic';
import DOMPurify from 'dompurify';

// Save button (settings.ts)
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
				if (!response.ok)
						return false;
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
