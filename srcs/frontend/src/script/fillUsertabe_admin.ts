import { connectFunc, requestBody } from './connections';
import { setupError404 } from '../pages/error404';

export function fillUserTable(): Promise<any[]> {

	return connectFunc(`/users`, requestBody("GET", null, "application/json"))
		.then((Response) => {
			if (Response.ok) {
				return Response.json().then((data) => {
					
					// Return all users/info
					return data;
				});
			} else {
				window.history.pushState({}, '', '/error404');
				setupError404();
				return null;
			}
		}).catch(() => {
			// Network or server error
			window.history.pushState({}, '', '/error404');
			setupError404();
			return null;
		});
}
