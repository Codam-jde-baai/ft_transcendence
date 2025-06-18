import { setupLogOut } from '../pages/index';
import { setupUserHome } from '../pages/home';
import { setupSetting } from '../pages/setting';
import { setupFriends } from '../pages/friends';
import { setupMatchHistory } from '../pages/history';
import { setupGameSelect } from '../pages/gameSelect';


export function setupNavigation() {
	const currentPath = window.location.pathname;

	const navItems = [
		{ id: 'Home', path: '/home', action: setupUserHome },
		{ id: 'Settings', path: '/setting', action: setupSetting },
		{ id: 'Friends', path: '/friends', action: setupFriends },
		{ id: 'History', path: '/history', action: setupMatchHistory },
		{ id: 'LogOut', path: '/index', action: setupLogOut },
		{ id: 'Game', path: '/gameSelect', action: setupGameSelect }
	];

	document.getElementById('TC')?.addEventListener('click', () => {
		// Open in a new tab
		window.open('./src/T&C/Terms&Conditions.pdf', '_blank');
	});

	navItems.forEach(({ id, path, action }) => {
		if (path === currentPath) 
		return;

		const element = document.getElementById(id);
		if (element) {
			element.addEventListener('click', () => {
				window.history.pushState({}, '', path);
				action();
			});
		}
	});
}