import { setupError404 } from '../pages/error404';
import { connectFunc } from './connections';
import envConfig from '../config/env';

// Add Profile Pic
export async function sendPicture(userID: any) {
	
	const avatarInput = document.getElementById('avatar') as HTMLInputElement;
	let file: File | Blob | null = null;
	
	if (avatarInput && avatarInput.files && avatarInput.files.length > 0) {
		file = avatarInput.files[0];
	} else {
		const response = await fetch("src/Pictures/defaultPP.png");
		if (!response.ok)
			return ;
		file = await response.blob();
	}

	const form = new FormData();
	form.append("avatar", file);
	const baseRequestOptions: RequestInit = {
		method: 'POST',
		headers: {
			"Authorization": `Bearer ${envConfig.privateKey}`
			// Note: DO NOT set Content-Type for FormData manually
		},
		body: form
	};

	connectFunc(`/users/${userID}/profile-pic`, baseRequestOptions)
		.then(response => {
			if (!response.ok) {
				window.history.pushState({}, '', '/error404');
				setupError404();
				return ;
			}
		})
		.catch(() => {
			// Network or server error
			window.history.pushState({}, '', '/error404');
			setupError404();
		});
}

// Edit Profile Pic
export function EditPicture(userID: any): boolean {
	
	let isValid = true;
	const avatarInput = document.getElementById('avatar') as HTMLInputElement;
	let file = null;
	
	if (avatarInput && avatarInput.files && avatarInput.files.length > 0)
	{
		file = avatarInput.files[0]
		const form = new FormData();
		form.append("avatar", file);

		const baseRequestOptions: RequestInit = {
			method: 'POST',
			headers: {
				"Authorization": `Bearer ${envConfig.privateKey}`
				// Note: DO NOT set Content-Type for FormData manually
			},
			body: form
		};

		connectFunc(`/users/${userID}/profile-pic`, baseRequestOptions)
		.then(response => {
			if (!response.ok) {
				isValid = false;
			}
		})
		.catch(() => {
			isValid = false;
		});
	}
	return isValid
}