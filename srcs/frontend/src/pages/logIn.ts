import { setupUserHome } from './home';
import { setupSignUp } from './signUp';
import { getLanguage } from '../script/language';
import { connectFunc, requestBody, inputToContent } from '../script/connections';
import { emptyFields, errorDisplay } from '../script/errorFunctions';
import { eyeIcon_Button } from '../script/buttonHandling';
import { dropDownBar } from '../script/dropDownBar';
import { websocketManager } from '../script/socket/socketClass';
// import { setupAdminLogIn} from './adminLogin';

export function setupLogIn() {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", /*html*/`
		<link rel="stylesheet" href="src/styles/logIn.css"> <!-- Link to the CSS file -->
		<!-- <div class="overlay"></div> -->
		<language-menu></language-menu>

		<div class="lmiddle">
			<div class="lcontainer">
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
				<!--For Chrome, because it can't find /adminLogin -->
				<!-- <p class="text-[10px] mb-[-40px]">
					<span data-i18n="LogIn_PA"></span>
					<a id="AdminL" class="cursor-pointer text-pink-600 underline" data-i18n="btn_adminL"></a>
				</p> -->
			</div>
		<!-- </div> -->
		`);

		getLanguage();
		dropDownBar(["dropdown-btn", "language-btn", "language-content"]);
		eyeIcon_Button(["show-password"]);

		// For Chrome -> don't remove
		// document.getElementById('AdminL')?.addEventListener('click', () => {
		// 	window.history.pushState({}, '', '/adminLogin');
		// 	setupAdminLogIn();
		// });

		document.getElementById('SignUp')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/signUp');
			setupSignUp();
		});

		document.getElementById('Home')?.addEventListener('click', async () => {
			const isValid = emptyFields(["username", "password"]);
			if (!isValid) return;

			const content = inputToContent(["username", "password"]);
			const body = requestBody("POST", content, "application/json");

			try {
				const response = await connectFunc("/user/login", body);

				if (response.ok) {
					await new Promise(resolve => setTimeout(resolve, 200));
					await websocketManager.connect();
					window.history.pushState({}, '', '/home');
					setupUserHome(true);
				} else {
					const data = await response.json();
					if (data.error === "username and password combination do not match database entry") {
						const elem = document.getElementById("username") as HTMLInputElement;
						const errorMsg = document.getElementById("login-name") as HTMLParagraphElement;
						errorDisplay(elem, errorMsg, "LogIn_noUser");
					}
				}
			} catch (error) {
				console.error('Login error:', error);
			}
		});
	}
}