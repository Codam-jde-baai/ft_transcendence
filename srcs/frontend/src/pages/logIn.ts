import { setupUserHome } from './home';
import { setupSignUp } from './signUp';
import { getLanguage } from '../script/language';
import { connectFunc, requestBody, inputToContent } from '../script/connections';
import { emptyFields, errorDisplay } from '../script/errorFunctions';
import { eyeIcon_Button } from '../script/buttonHandling';
import { dropDownBar } from '../script/dropDownBar';
import { connectWebSocket } from '../script/socketConnect';

export function setupLogIn() {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", /*html*/`
		<link rel="stylesheet" href="src/styles/logIn.css"> <!-- Link to the CSS file -->
		<div class="overlay"></div>
		<language-menu></language-menu>

		<div class="middle">
			<div class="container">
				<h1 class="header" data-i18n="LogIn_Header"></h1>
				
				<div class="p1" id="login-name" data-i18n="LogIn_Name"></div>
				<input type="Login_Name" required minlength="3" maxlength= "17" id="username" class="input-field" data-i18n-placeholder="LogIn_placeholder1">

				<div class="p1" id="userPass" style="left: -160px;" data-i18n="Password"></div>
				<input type="password" required minlength="6" maxlength="117" id="password" class="input-field">
				<span id="show-password" class="field-icon">
					<img src="src/Pictures/eyeIcon.png" alt="Show Password" id="eye-icon">
				</span>
				
				<div class="buttons">
					<button class="btn" id="Home" data-i18n="btn_LogIn"></button>
				</div>

				<p>
					<span data-i18n="LogIn_P"></span>
					<a id="SignUp" class="cursor-pointer text-pink-600 underline" data-i18n="btn_SignUp"></a>
				</p>
			</div>
		</div>
		`);

		getLanguage();
		dropDownBar(["dropdown-btn", "language-btn", "language-content"]);
		eyeIcon_Button(["show-password"]);

		document.getElementById('SignUp')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/signUp');
			setupSignUp();
		});

		document.getElementById('Home')?.addEventListener('click', () => {
			const isValid = emptyFields(["username", "password"]);
			if (!isValid)
				return; // Stop execution if validation fails				
			const content: string = inputToContent(["username", "password"])
			const body = requestBody("POST", content, "application/json");
			const response = connectFunc("/user/login", body);
			response.then((response) => {
				if (response.ok) {
					response.json().then(() => {
						connectWebSocket()
							.then(() => {
								console.log('WebSocket connected after successful login');
								window.history.pushState({}, '', '/home');
								setupUserHome(true);
							})
							.catch((error) => {
								console.error('Failed to connect WebSocket after login:', error);
								window.history.pushState({}, '', '/home');
								setupUserHome(true);
							});
					});
				}
				else {
					response.json().then((data) => {
						if (data.error === "username and password combination do not match database entry") {
							const elem = document.getElementById("username") as HTMLInputElement
							const errorMsg = document.getElementById("login-name") as HTMLParagraphElement;
							errorDisplay(elem, errorMsg, "LogIn_noUser");
						}
					})
				}
			})
		});
	}
}