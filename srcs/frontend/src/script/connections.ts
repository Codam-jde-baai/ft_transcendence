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
		return { "method": method, "headers": headers, "credentials": 'include'}
	}
	if (method.toUpperCase() === 'POST') {
		const headers = {
			"Authorization": `Bearer ${envConfig.privateKey}`,
			"Content-Type": "application/json",
		}
		const body = '{' + content + '}'
		return { "method": method, "headers": headers, "body": body, "credentials": 'include' };
	}
	if (method.toUpperCase() === 'DELETE') {
		const headers = {
			"Authorization": `Bearer ${envConfig.privateKey}`,
			"Content-Type": "application/json",
		}
		const body = '{' + content + '}'
		return { "method": method, "headers": headers, "body": body, "credentials": 'include' };
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
