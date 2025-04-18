import { connectFunc, requestBody, inputToContent } from '../script/connections';
// import { setupError404 } from './error404';
/* ---> These Functions handle the small buttons of each page <--- */

// Button for the eye-Icon show and hide password:
export function eyeIcon_Button(input: string[]) {
	input.forEach(element => {
		const elem = document.getElementById(element) as HTMLInputElement

		if (elem.id === "show-password") // Show Password (The eye)
		{ 
			elem.addEventListener('click', () => {
				const passwordField = document.getElementById("password");
				const eyeIcon = document.getElementById("eye-icon");
				console.log(passwordField);
				console.log(eyeIcon);

				if (passwordField && eyeIcon) {
					change_eyeIcon(passwordField, eyeIcon);
				}
			});
		}
		else if (elem.id === "show-password_confirm") // Hidde Password (The eye)
		{ 
			elem.addEventListener('click', () => {
				const passwordField = document.getElementById("password_confirm");
				const eyeIcon = document.getElementById("eye-icon_confirm");

				if (passwordField && eyeIcon) {
					change_eyeIcon(passwordField, eyeIcon);
				}
			});
		}
		else if (elem.id === "avatar") // Add Avatar
		{ 
			elem.addEventListener('change', (event) => {
				const file = (event.target as HTMLInputElement)?.files?.[0];
				const reader = new FileReader();
		
				reader.onload = function (e) {
					const profilePic = document.getElementById('profilePic') as HTMLImageElement | null;
					if (profilePic && e.target?.result) {
						profilePic.src = e.target.result as string; // Set the profile picture to the selected image
					}
				};
		
				if (file) {
					reader.readAsDataURL(file); // Read the selected file as a data URL
				}
			});
		}
	});
}

// Utils for buttons
export function change_eyeIcon(passwordField: HTMLElement, eyeIcon: HTMLElement) {
	if (passwordField.type === "password") {
		passwordField.type = "text";
		eyeIcon.src = "src/Pictures/Closed_eyeIcon.png";
	} else {
		passwordField.type = "password";
		eyeIcon.src = "src/Pictures/eyeIcon.png"; 
	}
}


// Save button (settings.ts)
export function updateUserSettings(input: string[], fields: { id: string, endpoint: string }[]): boolean {

	let isValid = true;
	let successfulUpdates = 0;

	input.forEach(element => {
		const inputElement = document.getElementById(element) as HTMLInputElement
		
		const field = fields.find(f => f.id === element);
		if (!field)
			return false;

		if (inputElement.value !== "" && inputElement.value !== null )
		{
			// Profile Picture is undefined. set it to null if not edit
			console.log("IAMIN");
			console.log(inputElement.id);
			console.log(inputElement.value);
			console.log(field.id);
			console.log(field.endpoint);

			const content: string = inputToContent([element])
			const body = requestBody("POST", content) 
			const response = connectFunc(field.endpoint, body);
			response.then((response) => {
				if (response.ok) {
					console.log("successfulUpdates");
					successfulUpdates += 1;
					
				} else {
					console.log("Something went wrong with the SAVE");
					successfulUpdates = 0;
				}
			}).catch(() => {
				return false ;
			});
		}
	});

	// Final success check
	if (successfulUpdates !== 0)
		isValid = true;
	else
		isValid = false;

	return isValid;
}