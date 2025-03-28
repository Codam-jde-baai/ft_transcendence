import { setupUserHome } from './home';
import { setupLogIn } from './logIn';
import { setupError404 } from './error404';
import { getLanguage } from '../script/language';
import { connectFunc, requestBody, inputToContent, errorDisplay, errorRMDisplay } from '../script/connections';

export function setupSignUp() {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", `
		<link rel="stylesheet" href="src/styles/signUp.css"> <!-- Link to the CSS file -->
		<div class="overlay"></div>
		<div class="btn-container">
			<button class="language-btn">
				<span data-i18n="Language"></span> <img id="selected-flag" src="src/component/Pictures/flagIcon-en.png">
			</button>
			<div class="language-content">
				<div class="language-option" id="gb">
					<img src="src/component/Pictures/flagIcon-en.png"> <span data-i18n="English"></span>
				</div>
				<div class="language-option" id="de">
					<img src="src/component/Pictures/flagIcon-de.png"> <span data-i18n="German"></span>
				</div>
				<div class="language-option" id="nl">
					<img src="src/component/Pictures/flagIcon-nl.png"> <span data-i18n="Dutch"></span>
				</div>
			</div>
		</div>
		<div class="container">
			<h1 class="header" data-i18n="SignUp_Header"></h1>
				
			<p class="p1" data-i18n="SignUp_Avatar"></p>
			<button class="edit-picture" onclick="document.getElementById('avatar').click()">
				<img id="profilePic" src="src/component/Pictures/defaultPP.avif">
			</button>
			<input type="file" id="avatar" accept="image/*" style="display: none;">

			<p class="p1" id="login-name" data-i18n="LogIn_Name"></p>
			<input type="Login_Name" required minlength="3" maxlength= "17" id="username" class="input-field" data-i18n-placeholder="SignUp_placeholder1">

			<p class="p1" id="alias-name" data-i18n="SignUp_Alias"></p>
			<input type="Alias_Name" required minlength="3" maxlength= "17" id="alias" class="input-field" data-i18n-placeholder="SignUp_placeholder2">

			<p class="p1" data-i18n="Password"></p>
			<input type="Password" required minlength="6" maxlength="117" id="password" class="input-field">

			<p class="p1" id="password-match" data-i18n="ConfirmPassword"></p>
			<input type="Password" required minlength="6" maxlength="117" id="password_confirm" class="input-field">
				
			<div class="buttons">
				<button class="btn" id="Home" data-i18n="btn_SignUp"></button>
			</div> 

			<p>
				<span data-i18n="SignUp_P"></span>
				<a id="LogIn" style="color: rgb(209, 7, 128); margin-left: 5px; text-decoration: underline;" data-i18n="btn_LogIn"></a>
			</p>

		</div>
		`);

		getLanguage();
		document.getElementById('LogIn')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/logIn');
			setupLogIn();
		});	

		// Add Avatar
		document.getElementById('avatar')?.addEventListener('change', (event) => {
			const file = event.target.files[0];
			const reader = new FileReader();

			reader.onload = function(e) {
				const profilePic = document.getElementById('profilePic');
				if (profilePic && e.target?.result) {
					profilePic.src = e.target.result; // Set the profile picture to the selected image
				}
			};

			if (file) {
				reader.readAsDataURL(file); // Read the selected file as a data URL
			}
		});

		document.getElementById('Home')?.addEventListener('click', () => {
			{
				// ADMIN username not allowed
				const elem = document.getElementById("username") as HTMLInputElement;
				const errorMsg = document.getElementById("login-name") as HTMLParagraphElement;

				if (elem.value.toUpperCase() === "ADMIN")
					errorDisplay(elem, errorMsg, "SignUp_error_admin");
				else
					errorRMDisplay(elem, errorMsg, "LogIn_Name");
			}
			{
				// ADMIN alias not allowed
				const elem = document.getElementById("alias") as HTMLInputElement
				const errorMsg = document.getElementById("alias-name") as HTMLParagraphElement;

				if (elem.value.toUpperCase() === "ADMIN")
					errorDisplay(elem, errorMsg, "SignUp_error_admin");
				else 
					errorRMDisplay(elem, errorMsg, "SignUp_Alias");
			}
			{
				// PASSWORD does NOT Match
				const elem = document.getElementById("password_confirm") as HTMLInputElement
				const errorMsg = document.getElementById("password-match") as HTMLParagraphElement;
				
				if ((document.getElementById("password") as HTMLInputElement).value != (document.getElementById("password_confirm") as HTMLInputElement).value)
					errorDisplay(elem, errorMsg, "SignUp_error_password");
				else
					errorRMDisplay(elem, errorMsg, "ConfirmPassword"); 
			}
			{
				// Might not be set from the user (This is then the default value)
				const elem = document.getElementById("profilePic") as HTMLInputElement
				if (elem.src == null)
					elem.value = "src/component/Pictures/flagIcon-en.png";
				else
					elem.value = elem.src; // Get the src of the profile picture image
			}
			const content: string = inputToContent(["username", "alias", "password", "password_confirm", "profilePic"])
			const body = requestBody("POST", content) // Used for requests where the frontend has to send info to the backend (like making a new user). Will return null in case of GET
			const response = connectFunc("http://localhost:3000/users/new", body); // saves the response.json. this can be changed to response.text in connections.ts (automatically does so if a response.json cannot be generated)
			response.then((response) => {
				if (response.ok) {
					console.log("User signed up successfully");
					
					// ----- If successfull go to home page --------
					window.history.pushState({}, '', '/home');
					setupUserHome();
				} else {
					console.log("Sign-up failed")
					console.log(response)
				}
			}).catch(() => {
				// Server/ Network error
				window.history.pushState({}, '', '/error404');
				setupError404();
			});
		});
	}
}
