import envConfig from '../config/env';
import DOMPurify from 'dompurify';
import { setupLogIn } from '../pages/logIn'

/* ---> These Functions handle the connection between frontend and backend <--- */
// POST, GET, PUT and DELETE request

export function inputToContent(input: string[]): string {
	const obj: Record<string, string> = {};

	input.forEach(id => {
		const elem = document.getElementById(id) as HTMLInputElement | null;
		if (elem)
		{
			const rawInput = elem.value;
			const sanitizedInput = DOMPurify.sanitize(rawInput); // Removes unsafe HTML
			obj[elem.id] = sanitizedInput;
		}
	});

	const jsonStr = JSON.stringify(obj);
	return jsonStr;
}

export enum ContentType {
	JSON = "application/json",
	MultipartFormData = "multipart/form-data"
}

// simplified to only set everything once. baseRequest options always contain baseHeaders(currently Bearer token) + method, content and ContentType have if statements
// contentType needs to be a param because contentType for uploading a profile-pic should be multipart/formdata and for jsons should be json as we have it
export function requestBody(method: string, content?: string | FormData | null, contentType?: string | null | undefined): RequestInit {
	const baseHeaders: Record<string, string> = {
		"x-api-key": `${envConfig.privateKey}`
	};

	const uCaseMethod: string = method.toUpperCase();
	const validMethods = ['GET', 'POST', 'PUT', 'DELETE'];
	if (!validMethods.includes(uCaseMethod)) {
		throw new Error(`requestBody: Method ${method} we dont use`);
	}

	const baseRequestOptions: RequestInit = {
		method: method,
		headers: baseHeaders,
		credentials: "include"
	}
	if (content) {
		baseRequestOptions.body = content;
	}
	if (contentType) {
		baseRequestOptions.headers = {
			...baseHeaders,
			"Content-Type": contentType,
		};
	}
	return (baseRequestOptions);
}

// simplified httpGet
async function httpGet(url: string, request: RequestInit): Promise<Response> {
	try {
		return await fetch(url, request);
	} catch (error) {
		console.error("HTTP Request Error:", error);
		throw error;
	}
}

export async function connectFunc(url: string, request: RequestInit): Promise<Response> {
	
	// console.log("Connect To " + url + " Using:")
	// console.log(request)

	const response = await httpGet("https://localhost:3000" + url, request);
	if (response.status === 402) {
		window.history.pushState({}, '', '/logIn');
		setupLogIn(); // Redirect to logIn
	}
	return response
}
