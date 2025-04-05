import { setupUserHome } from './home';
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
		<language-menu></language-menu>
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
		</div>
		`);

		getLanguage();
		document.getElementById('Home')?.addEventListener('click', () => {
			{
				if ((document.getElementById("password") as HTMLInputElement).value != (document.getElementById("password_confirm") as HTMLInputElement).value)
					console.log("Passwords Don't Match"); // Replace this with actual response to user.
			}
			const content: string = inputToContent(["username", "alias", "password", "password_confirm", "profilePic"])
			const body = requestBody("POST", content) // Used for requests where the frontend has to send info to the backend (like making a new user). Will return null in case of GET
			connectFunc("/users/new", body)
				.then((response) => {
				if (response.ok) {
					console.log("User signed up successfully");
					// // ----- If successfull go to home page --------
					window.history.pushState({}, '', '/home');
					setupUserHome();
				} else {
					console.log("Sign-up failed")
					console.log(response)
					// // ----- Rm later --------
				}
				}).catch(() => {
				// Server/ Network error
				window.history.pushState({}, '', '/error404');
				setupError404();
				});
		});
	}
}

