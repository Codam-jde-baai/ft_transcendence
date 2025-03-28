import envConfig from '../config/env';
import { getTranslation } from '../script/language';

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

export function inputToContent(input: string[]) {
	let str: string = "";
	input.forEach(element => {
		const elem = document.getElementById(element) as HTMLInputElement
		str += `"${elem.id}": "${elem.value}",`
	});
	str = str.slice(0, -1);
	console.log("string = " + str);
	return str;
}

export function requestBody(method: string, content: string | null) {
	if (method.toUpperCase() === 'GET') {
		const headers = {
			"Authorization": `Bearer ${envConfig.privateKey}`,
		}
		return { "method": method, "headers": headers }
	}
	if (method.toUpperCase() === 'POST') {
		const headers = {
			"Authorization": `Bearer ${envConfig.privateKey}`,
			"Content-Type": "application/json",
		}
		const body = '{' + content + '}'
		return { "method": method, "headers": headers, "body": body };
	}
	if (method.toUpperCase() === 'DELETE') {
		const headers = {
			"Authorization": `Bearer ${envConfig.privateKey}`,
			"Content-Type": "application/json",
		}
		const body = '{' + content + '}'
		return { "method": method, "headers": headers, "body": body };
	}
	return `ERROR (requestBody): Method ${method} Not Recognized`
}

async function httpGet(url: string, request: any | null): Promise<Response> {
	return fetch(url, request)
		.then((response) => {
			//const contentType = response.headers.get("Content-Type");
			// if (contentType && contentType.includes("application/json"))
			// 	return response.json();
			// else
			// 	return response.text();
			return (response)
		})
		.catch((error) => {
			console.log(error)
			return (error)
		})
}

export async function connectFunc(url: string, request: any | null): Promise<Response> {
	console.log("Connect To " + url + " Using:")
	console.log(request)
	const response = await httpGet(url, request);
	return response
}