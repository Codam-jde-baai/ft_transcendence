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
			"Accept": "application/json",
		}
		return { "method": method, "headers": headers }
	}
	if (method.toUpperCase() === 'POST') {
		const headers = {
			"Authorization": `Bearer ${envConfig.privateKey}`,
			"Content-Type": "application/json",
			"Accept": "application/json",
		}
		const body = '{' + content + '}'
		return { "method": method, "headers": headers, "body": body };
	}
	if (method.toUpperCase() === 'DELETE') {
		const headers = {
			"Authorization": `Bearer ${envConfig.privateKey}`,
			"Content-Type": "application/json",
			"Accept": "application/json",
		}
		const body = '{' + content + '}'
		return { "method": method, "headers": headers, "body": body };
	}
	return `ERROR (requestBody): Method ${method} Not Recognized`
}
// return { method, headers, body: content }; // content is already a JSON string

async function httpGet(url: string, request: any | null): Promise<Response> {
	return fetch(url, request)
		.then((response) => {
			// const contentType = response.headers.get("Content-Type");
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
