import { setupUserHome } from './home';
import { setupLogIn } from './logIn';
import { setupErrorPages } from './errorPages';
import { getLanguage } from '../script/language';
import { connectFunc, requestBody, inputToContent } from '../script/connections';
import { checkFields, errorDisplay } from '../script/errorFunctions';
import { eyeIcon_Button } from '../script/buttonHandling';
import { dropDownBar } from '../script/dropDownBar';
import { sendPicture } from '../script/sendPic';
import { websocketManager } from '../script/socket/socketClass';

export function setupSignUp() {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", /*html*/`
		<link rel="stylesheet" href="src/styles/signUp.css"> <!-- Link to the CSS file -->
		<div class="overlay"></div>
		<language-menu></language-menu>

		<div class="middle">
			<div class="container">
				<h1 class="header" data-i18n="SignUp_Header"></h1>
					
				<p class="p1" data-i18n="SignUp_Avatar"></p>
				<button class="edit-picture" onclick="document.getElementById('avatar').click()">
					<img id="profilePic" src="src/Pictures/defaultPP.png">
				</button>
				<input type="file" id="avatar" accept="image/*" style="display: none;">

				<p class="p1" id="login-name" data-i18n="LogIn_Name"></p>
				<input type="Login_Name" required minlength="3" maxlength= "17" id="username" class="input-field" data-i18n-placeholder="SignUp_placeholder1">

				<p class="p1" id="alias-name" data-i18n="SignUp_Alias"></p>
				<input type="Alias_Name" required minlength="3" maxlength= "17" id="alias" class="input-field" data-i18n-placeholder="SignUp_placeholder2">

				<p class="p1" id="userPass" data-i18n="Password"></p>
				<input type="password" required minlength="6" maxlength="117" id="password" class="input-field">
				<span id="show-password" class="field-iconn">
					<img src="src/Pictures/eyeIcon.png" alt="Show Password" id="eye-icon">
				</span>

				<p class="p1" id="password-match" data-i18n="ConfirmPassword"></p>
				<input type="password" required minlength="6" maxlength="117" id="password_confirm" class="input-field">
				<span id="show-password_confirm" class="field-icon">
					<img src="src/Pictures/eyeIcon.png" alt="Show Password" id="eye-icon_confirm">
				</span>	

				<p class="text-left">
					<input type="checkbox" id="termsCheckbox">
					<span class="text-white" data-i18n="T&C_P"></span>
					<a id="T&C" target="_blank" class="cursor-pointer text-pink-600 underline" data-i18n="btn_T&C"></a>
				</p>

				<div class="buttons mt-2">
					<button class="btn" id="Home" data-i18n="btn_SignUp"></button>
				</div> 

				<p>
					<span data-i18n="SignUp_P"></span>
					<a id="LogIn" class="cursor-pointer text-pink-600 underline" data-i18n="btn_LogIn"></a>
				</p>
			</div>
		</div>
		`);

		getLanguage();
		dropDownBar(["dropdown-btn", "language-btn", "language-content"]);
		eyeIcon_Button(["show-password", "show-password_confirm", "avatar"]);

		document.getElementById('LogIn')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/logIn');
			setupLogIn();
		});

		document.getElementById('T&C')?.addEventListener('click', () => {
			// Open in current tab
			window.location.href = './src/T&C/Terms&Conditions.pdf';
			// Open in a new tab
			// window.open('./src/T&C/Terms&Conditions.pdf', '_blank');
		});

		document.getElementById('Home')?.addEventListener('click', () => {
			const isValid = checkFields(["username", "alias", "password", "password_confirm", "termsCheckbox"]);
			if (!isValid)
				return; // Stop execution if validation fails

			const body = requestBody("POST", inputToContent(["username", "alias", "password"]), "application/json")
			connectFunc("/user/new", body)
				.then((response) => {
					if (response.ok) {
						response.json().then(async () => {
							sendPicture();
							await new Promise(resolve => setTimeout(resolve, 200));
							websocketManager.connect().catch(console.error);
							window.history.pushState({}, '', '/home');
							setupUserHome(true);
						});
					} else {
						response.json().then((data) => {
							if (data.error === "UNIQUE constraint failed: users_table.username") {
								// Username already exist in database
								const elem = document.getElementById("username") as HTMLInputElement
								const errorMsg = document.getElementById("login-name") as HTMLParagraphElement;
								errorDisplay(elem, errorMsg, "SignUp_error_user_exist");
							}
							else if (data.error === "UNIQUE constraint failed: users_table.alias") {
								// Alias already exist in database
								const elem = document.getElementById("alias") as HTMLInputElement
								const errorMsg = document.getElementById("alias-name") as HTMLParagraphElement;
								errorDisplay(elem, errorMsg, "SignUp_error_alias_exist");
							}
							else {
								// Network or server error
								window.history.pushState({}, '', '/errorPages');
								setupErrorPages(response.status, response.statusText);
							}
						})
					}
				})
		});
	}
}

