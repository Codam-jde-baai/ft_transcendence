import { getTranslation } from '../script/language';

/* ---> These Functions handle the error display in html <--- */

// Error Display (HTML) function
export function errorDisplay(elem: HTMLInputElement, errorMsg: HTMLParagraphElement, newString: string) {
		elem.classList.add("input-error");					// Add new input field design (red box)
		errorMsg.classList.add("error-text");				// Add new text colour (red)
		errorMsg.dataset.i18n = newString; 					// Set new key
		errorMsg.textContent = getTranslation(newString); 	// Gets the value from the json language (data-i18n)
}

// Resets the Error Display (HTML) function
export function errorRMDisplay(elem: HTMLInputElement, errorMsg: HTMLParagraphElement, oldString: string) {
		elem.classList.remove("input-error");				// Removes the input field design (red box)
		errorMsg.classList.remove("error-text");			// Removes the text colour (red)
		errorMsg.dataset.i18n = oldString; 					// Reset key to old value
		errorMsg.textContent = getTranslation(oldString);	// Gets the value from the json language (data-i18n)
}

// Check for empty fiels 
export function checkFields(input: string[]): boolean {
	let isValid = true;
	
	input.forEach(element => {
		const elem = document.getElementById(element) as HTMLInputElement
		
		if (elem.id === "username")
		{
			const errorMsg = document.getElementById("login-name") as HTMLParagraphElement;
			if (!/^[a-zA-Z0-9]*$/.test(elem.value)) // Check if value is not alphanumeric
			{
				errorDisplay(elem, errorMsg, "Alphanumeric_error");
				isValid = false;
			}
			else if (elem.value.length < 3 || elem.value.length > 17)
			{
				errorDisplay(elem, errorMsg, "SignUp_error_user");
				isValid = false;
			}
			else if (elem.value.toUpperCase() === "ADMIN")	// ADMIN username not allowed
			{
				errorDisplay(elem, errorMsg, "SignUp_error_admin");
				isValid = false;
			}
			else
				errorRMDisplay(elem, errorMsg, "LogIn_Name");
		}
		if (elem.id === "alias")
		{
			const errorMsg = document.getElementById("alias-name") as HTMLParagraphElement;
			if (!/^[a-zA-Z0-9]*$/.test(elem.value)) // Check if value is not alphanumeric
			{
				errorDisplay(elem, errorMsg, "Alphanumeric_error");
				isValid = false;
			}
			else if (elem.value.length < 3 || elem.value.length > 17)
			{
				errorDisplay(elem, errorMsg, "SignUp_error_alias");
				isValid = false;		
			}
			else if (elem.value.toUpperCase() === "ADMIN") // ADMIN alias not allowed
			{
				errorDisplay(elem, errorMsg, "SignUp_error_admin");
				isValid = false;
			}
			else
				errorRMDisplay(elem, errorMsg, "SignUp_Alias");
		}
		if (elem.id === "password")
		{
			const errorMsg = document.getElementById("userPass") as HTMLParagraphElement;
			if (!/^[a-zA-Z0-9]*$/.test(elem.value)) // Check if value is not alphanumeric
			{
				errorDisplay(elem, errorMsg, "Alphanumeric_error");
				isValid = false;
			}
			else if (elem.value.length < 6 || elem.value.length > 117)
			{
				errorDisplay(elem, errorMsg, "SignUp_error_userPass");
				isValid = false;
			}
			else if (elem.value != (document.getElementById("password_confirm") as HTMLInputElement).value)
			{
				errorDisplay(elem, errorMsg, "SignUp_error_password"); // PASSWORD does NOT Match
				isValid = false;
			}
			else
				errorRMDisplay(elem, errorMsg, "Password");
		}
	});
	return isValid;
}

// Check for empty fiels for LogIn.ts
export function emptyFields(input: string[]): boolean {
	let isValid = true;
	
	input.forEach(element => {
		const elem = document.getElementById(element) as HTMLInputElement
		
		if (elem.id === "username")
		{
			const errorMsg = document.getElementById("login-name") as HTMLParagraphElement;
			if (!/^[a-zA-Z0-9]*$/.test(elem.value)) // Check if value is not alphanumeric
			{
				errorDisplay(elem, errorMsg, "Alphanumeric_error");
				isValid = false;
			}
			else if (elem.value.length < 3 || elem.value.length > 17)
			{
				errorDisplay(elem, errorMsg, "LogIn_error_user");
				isValid = false;
			}
			else
				errorRMDisplay(elem, errorMsg, "LogIn_Name");
		}
		if (elem.id === "password")
		{
			const errorMsg = document.getElementById("userPass") as HTMLParagraphElement;
			if (!/^[a-zA-Z0-9]*$/.test(elem.value)) // Check if value is not alphanumeric
			{
				errorDisplay(elem, errorMsg, "Alphanumeric_error");
				isValid = false;
			}
			else if (elem.value.length < 6 || elem.value.length > 117)
			{
				errorDisplay(elem, errorMsg, "LogIn_error_password");
				isValid = false;
			}
			else
				errorRMDisplay(elem, errorMsg, "Password");
		}
	});
	return isValid;
}


// Check for the password fiels in setting
export function passwordFields(input: string[]): boolean {
	let isValid = true;
	
	input.forEach(element => {
		const elem = document.getElementById(element) as HTMLInputElement
		
		if (elem.id === "username" && elem.value !== "")
		{
			const errorMsg = document.getElementById("user-name") as HTMLParagraphElement;
			if ((document.getElementById("current_password") as HTMLInputElement).value === "")
			{
				const errorMsg = document.getElementById("current-password") as HTMLParagraphElement;
				errorDisplay(elem, errorMsg, "CurrentPass_error1");
				isValid = false;
			}
			if (!/^[a-zA-Z0-9]*$/.test(elem.value)) // Check if value is not alphanumeric
			{
				errorDisplay(elem, errorMsg, "Alphanumeric_error");
				isValid = false;
			}
			else if (elem.value.length < 3 || elem.value.length > 17)
			{
				errorDisplay(elem, errorMsg, "SignUp_error_user");
				isValid = false;
			}
			else if (elem.value.toUpperCase() === "ADMIN")	// ADMIN username not allowed
			{
				errorDisplay(elem, errorMsg, "SignUp_error_admin");
				isValid = false;
			}
			else
					errorRMDisplay(elem, errorMsg, "Setting_Name");
		}
		if (elem.id === "alias" && elem.value !== "")
		{
			const errorMsg = document.getElementById("alias-name") as HTMLParagraphElement;
			if ((document.getElementById("current_password") as HTMLInputElement).value === "")
			{
				const errorMsg = document.getElementById("current-password") as HTMLParagraphElement;
				errorDisplay(elem, errorMsg, "CurrentPass_error1");
				isValid = false;
			}
			if (!/^[a-zA-Z0-9]*$/.test(elem.value)) // Check if value is not alphanumeric
			{
				errorDisplay(elem, errorMsg, "Alphanumeric_error");
				isValid = false;
			}
			else if (elem.value.length < 3 || elem.value.length > 17)
			{
				errorDisplay(elem, errorMsg, "SignUp_error_alias");
				isValid = false;		
			}
			else if (elem.value.toUpperCase() === "ADMIN") // ADMIN alias not allowed
			{
				errorDisplay(elem, errorMsg, "SignUp_error_admin");
				isValid = false;
			}
			else
				errorRMDisplay(elem, errorMsg, "Setting_Alias");
		}
		if (elem.id === "password" && elem.value !== "")
		{
			const errorMsg = document.getElementById("userPass") as HTMLParagraphElement;		
			if ((document.getElementById("current_password") as HTMLInputElement).value === "")
			{
				const errorMsg = document.getElementById("current-password") as HTMLParagraphElement;
				errorDisplay(elem, errorMsg, "CurrentPass_error1");
				isValid = false;
			}
			if (!/^[a-zA-Z0-9]*$/.test(elem.value)) // Check if value is not alphanumeric
			{
				errorDisplay(elem, errorMsg, "Alphanumeric_error");
				isValid = false;
			}
			else if (elem.value.length < 6 || elem.value.length > 117)
			{
				errorDisplay(elem, errorMsg, "SignUp_error_userPass");
				isValid = false;
			}
			else if (elem.value != (document.getElementById("password_confirm") as HTMLInputElement).value)
			{
				errorDisplay(elem, errorMsg, "SignUp_error_password"); // PASSWORD does NOT Match
				isValid = false;
			}
			else
				errorRMDisplay(elem, errorMsg, "Change_Password");
		}
		if (elem.id === "current_password" && elem.value !== "")
		{
			const errorMsg = document.getElementById("current-password") as HTMLParagraphElement;
			if ((document.getElementById("current_password") as HTMLInputElement).value === "")
			{
				errorDisplay(elem, errorMsg, "CurrentPass_error1");
				isValid = false;
			}
			if (!/^[a-zA-Z0-9]*$/.test(elem.value)) // Check if value is not alphanumeric
			{
				errorDisplay(elem, errorMsg, "Alphanumeric_error");
				isValid = false;
			}
			else if (
				!(document.getElementById("password") as HTMLInputElement).value && 
				!(document.getElementById("alias") as HTMLInputElement).value && 
				// !(document.getElementById("avatar") as HTMLInputElement).value && 
				!(document.getElementById("username") as HTMLInputElement).value
			) {
				errorDisplay(elem, errorMsg, "CurrentPass_error2");
				isValid = false;
			}
			else
				errorRMDisplay(elem, errorMsg, "CurrentPassword");
		}
	});
	return isValid;
}


// Check for the password fiels in Admin setting
export function adminPasswordFields(input: string[]): boolean {
	let isValid = true;
	
	input.forEach(element => {
		const elem = document.getElementById(element) as HTMLInputElement

		if (elem.id === "password" && elem.value !== "")
		{
			const errorMsg = document.getElementById("adminPass") as HTMLParagraphElement;
			if (!/^[a-zA-Z0-9]*$/.test(elem.value)) // Check if value is not alphanumeric
			{
				errorDisplay(elem, errorMsg, "Alphanumeric_error");
				isValid = false;
			}
			else if (elem.value.length < 6 || elem.value.length > 117)
			{
				errorDisplay(elem, errorMsg, "SignUp_error_userPass");
				isValid = false;
			}
			else if (elem.value != (document.getElementById("password_confirm") as HTMLInputElement).value)
			{
				errorDisplay(elem, errorMsg, "SignUp_error_password"); // PASSWORD does NOT Match
				isValid = false;
			}
			else
				errorRMDisplay(elem, errorMsg, "Change_Password");
		}
	});
	return isValid;
}
