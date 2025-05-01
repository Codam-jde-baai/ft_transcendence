import { setupErrorPages } from '../pages/errorPages';
import { connectFunc, requestBody } from './connections';

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

	const body = requestBody("POST", form);

	connectFunc(`/users/profile-pic`, body)
		.then(response => {
			if (!response.ok) {
				window.history.pushState({}, '', '/errorPages');
				setupErrorPages(response.status,  response.statusText);
				return ;
			}
		})
		.catch(() => {
			// Network or server error
			window.history.pushState({}, '', '/errorPages');
			setupErrorPages(500, "Internal Server Error");
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
		const body = requestBody("POST", form);
		connectFunc(`/users/profile-pic`, body)
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