import { setupUserHome } from './home';
import { setupLogIn } from './logIn';
import { setupError404 } from './error404';
import { getLanguage } from '../script/language';
import { connectFunc, requestBody, inputToContent } from '../script/connections';

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
			<button class="edit-picture">
				<img id="profilePic" src="src/component/Pictures/defaultPP.avif">
			</button>

			<p class="p1" data-i18n="LogIn_Name"></p>
			<input type="Login_Name" id="username" class="input-field" data-i18n-placeholder="SignUp_placeholder1">

			<p class="p1" data-i18n="SignUp_Alias"></p>
			<input type="Alias_Name" id="alias" class="input-field" data-i18n-placeholder="SignUp_placeholder2">

			<p class="p1" data-i18n="Password"></p>
			<input type="Password" id="password" class="input-field">

			<p class="p1" data-i18n="ConfirmPassword"></p>
			<input type="Password" id="password_confirm" class="input-field">
				
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

		document.getElementById('Home')?.addEventListener('click', () => {
			{
				// ADMIN username not allowed
				const elem = document.getElementById("username") as HTMLInputElement
				if (elem.value.toUpperCase() === "ADMIN")
					console.log("Using admin username not allowed"); // Replace this with actual response to user.
			}
			{
				if ((document.getElementById("password") as HTMLInputElement).value != (document.getElementById("password_confirm") as HTMLInputElement).value)
					console.log("Passwords Don't Match"); // Replace this with actual response to user.
			}
			{
				// Might not be set from the user (This is then the default value)
				const elem = document.getElementById("profilePic") as HTMLInputElement
				if (elem.value == null)
					elem.value = "src/component/Pictures/flagIcon-en.png";
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

