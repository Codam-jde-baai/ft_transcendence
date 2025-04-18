import { connectFunc, requestBody } from './connections';
import { setupError404 } from '../pages/error404';

export function fillAdmin() {

	connectFunc(`/public/users`, requestBody("GET", null, "application/json"))
		.then((Response) => {
			if (Response.ok) {
				Response.json().then((data) => {
					
					// fill user-table with user/info
					const userTableElement = document.querySelector('user-table');
					if (userTableElement) {
						// userTableElement.setAttribute('username', data.username);
						// userTableElement.setAttribute('alias', data.alias);
						userTableElement.setAttribute('users', JSON.stringify(data));
					}

				});
			} else {
				window.history.pushState({}, '', '/error404');
				setupError404();
			}
		}).catch(() => {
			// Network or server error
			window.history.pushState({}, '', '/error404');
			setupError404();
		});
}