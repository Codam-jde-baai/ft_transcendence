import { connectFunc, requestBody } from './connections';
import { setupErrorPages } from '../pages/errorPages';

export function fillUserTable(): Promise<any[]> {

	return connectFunc(`/users`, requestBody("GET", null, "application/json"))
		.then((Response) => {
			if (Response.ok) {
				return Response.json().then((data) => {
					
					// Return all users/info
					return data;
				});
			} else {
				window.history.pushState({}, '', '/errorPages');
				setupErrorPages(404, "Page Not Found");
				return null;
			}
		}).catch(() => {
			// Network or server error
			window.history.pushState({}, '', '/errorPages');
			setupErrorPages(500, "Internal Server Error");
			return null;
		});
}
