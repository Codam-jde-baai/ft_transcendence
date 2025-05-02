import { setupErrorPages } from '../pages/errorPages';
import { connectFunc, requestBody } from './connections';

// Add Profile Pic
export async function sendPicture() {
	
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
	connectFunc(`/user/profile-pic`, body)
		.then(response => {
			if (!response.ok) {
				window.history.pushState({}, '', '/errorPages');
				setupErrorPages(response.status,  response.statusText);
				return ;
			}
		})
}

// Edit Profile Pic
export function EditPicture(): boolean {
	
	let isValid = true;
	const avatarInput = document.getElementById('avatar') as HTMLInputElement;
	let file = null;
	
	if (avatarInput && avatarInput.files && avatarInput.files.length > 0)
	{
		file = avatarInput.files[0]
		const form = new FormData();
		form.append("avatar", file);
		const body = requestBody("POST", form);
		connectFunc(`/user/profile-pic`, body)
		.then(response => {
			if (!response.ok) {
				isValid = false;
			}
		})
	}
	return isValid
}