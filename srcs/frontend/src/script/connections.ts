import envConfig from '../config/env';

/* ---> These Functions handle the connection between frontend and backend <--- */
// POST and GET request

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
	const response = await httpGet("http://localhost:3000" + url, request);
	return response
}




// !!!!!!!!!!!!!!!!!!
// This version does not work with admin login or any other login!

// -----------------------------------------------------------------
// -----------------------------------------------------------------

// import envConfig from '../config/env';

// // we might have to change the profilePic replacement thingie.
// /**
//  * @brief input to JSON
//  * @param input 
//  * @returns 
//  */
// export function inputToContent(input: string[]): string {
// 	let str: string = "";
// 	input.forEach(element => {
// 		const elem = document.getElementById(element) as HTMLInputElement
// 		str += `"${elem.id}": "${elem.value}",`
// 	});
// 	str = str.slice(0, -1);
// 	console.log("string = " + str);
// 	return str;
// }

// export function inputToFormData(filename: string, file: File | Blob): FormData {
// 	const form = new FormData();
// 	form.append(filename, file);
// 	return (form)
// }


// export enum ContentType {
// 	JSON = "application/json",
// 	MultipartFormData = "multipart/form-data"
// }

// // simplified to only set everything once. baseRequest options always contain baseHeaders(currently Bearer token) + method, content and ContentType have if statements
// // contentType needs to be a param because contentType for uploading a profile-pic should be multipart/formdata and for jsons should be json as we have it
// export function requestBody(method: string, content?: string | FormData | null, contentType?: string | null | undefined): RequestInit {
// 	const baseHeaders: Record<string, string> = {
// 		"Authorization": `Bearer ${envConfig.privateKey}`,
// 	};

// 	const uCaseMethod: string = method.toUpperCase();
// 	const validMethods = ['GET', 'POST', 'PUT', 'DELETE'];
// 	if (!validMethods.includes(uCaseMethod)) {
// 		throw new Error(`requestBody: Method ${method} we dont use`);
// 	}

// 	const baseRequestOptions: RequestInit = {
// 		method: method,
// 		headers: baseHeaders
// 	}
// 	if (content) {
// 		baseRequestOptions.body = content;
// 	}
// 	if (contentType) {
// 		baseRequestOptions.headers = {
// 			...baseHeaders,
// 			"Content-Type": contentType,
// 		};
// 	}
// 	return (baseRequestOptions);
// }

// // simplified httpGet
// async function httpGet(url: string, request: RequestInit): Promise<Response> {
// 	try {
// 		return await fetch(url, request);
// 	} catch (error) {
// 		console.error("HTTP Request Error:", error);
// 		throw error;
// 	}
// }

// export async function connectFunc(url: string, request: RequestInit): Promise<Response> {
// 	console.log("Connect To " + url + " Using:")
// 	console.log(request)
// 	const response = await httpGet("http://localhost:3000" + url, request);
// 	return response
// }