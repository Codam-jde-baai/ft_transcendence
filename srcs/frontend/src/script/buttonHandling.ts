/* ---> These Functions handle the small buttons of each page <--- */

// Button for the eye-Icon show and hide password:
export function eyeIcon_Button(input: string[]) {
	input.forEach(element => {
		const elem = document.getElementById(element) as HTMLInputElement

		if (elem.id === "show-password") // Show Password (The eye)
		{ 
			elem.addEventListener('click', () => {
				const passwordField = document.getElementById("password");
				const eyeIcon = document.getElementById("eye-icon");
				console.log(passwordField);
				console.log(eyeIcon);

				if (passwordField && eyeIcon) {
					change_eyeIcon(passwordField, eyeIcon);
				}
			});
		}
		else if (elem.id === "show-password_confirm") // Hidde Password (The eye)
		{ 
			elem.addEventListener('click', () => {
				const passwordField = document.getElementById("password_confirm");
				const eyeIcon = document.getElementById("eye-icon_confirm");

				if (passwordField && eyeIcon) {
					change_eyeIcon(passwordField, eyeIcon);
				}
			});
		}
		else if (elem.id === "avatar") // Add Avatar
		{ 
			elem.addEventListener('change', (event) => {
				const file = (event.target as HTMLInputElement)?.files?.[0];
				const reader = new FileReader();
		
				reader.onload = function (e) {
					const profilePic = document.getElementById('profilePic') as HTMLImageElement | null;
					if (profilePic && e.target?.result) {
						profilePic.src = e.target.result as string; // Set the profile picture to the selected image
					}
				};
		
				if (file) {
					reader.readAsDataURL(file); // Read the selected file as a data URL
				}
			});
		}
	});
}

// Utils for buttons
export function change_eyeIcon(passwordField: HTMLElement, eyeIcon: HTMLElement) {
	if (passwordField.type === "password") {
		passwordField.type = "text";
		eyeIcon.src = "src/component/Pictures/Closed_eyeIcon.png";
	} else {
		passwordField.type = "password";
		eyeIcon.src = "src/component/Pictures/eyeIcon.png"; 
	}
}
