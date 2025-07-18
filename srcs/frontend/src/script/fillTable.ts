import { connectFunc, requestBody } from './connections';
import { setupErrorPages } from '../pages/errorPages';

// Fill in for the Admin User Table
export async function fillUserTable(): Promise<any[] | null> {

	const table = document.querySelector('#userTable');

	const response = await connectFunc(`/users`, requestBody("GET", null, "application/json"));
	const data = await response.json();

	if (data.error === "No users in database") {
		if (table) {
			table.innerHTML = ``;
		}
		return null;
	} else if (response.ok) {

		const formattedData = data.map((entry: { username: string; alias: string }) => ({
			username: entry.username,
			alias: entry.alias,
		}));
		// Sort the formattedData alphabetically by username
		formattedData.sort((a: { username: string }, b: { username: string }) => a.username.localeCompare(b.username));
		return formattedData;
	} else {
		window.history.pushState({}, '', '/errorPages');;
		setupErrorPages(response.status, response.statusText);
		return null;
	}
}
