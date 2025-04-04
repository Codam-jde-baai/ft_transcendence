import { setupUserHome } from './home';
import { setupLogIn } from './logIn';
import { setupError404 } from './error404';
import { getLanguage } from '../script/language';
import { connectFunc, requestBody, inputToContent } from '../script/connections';
import { checkFields, errorDisplay } from '../script/errorFunctions';
import { eyeIcon_Button } from '../script/buttonHandling';


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

			<p class="p1" id="userPass" data-i18n="Password"></p>
			<input type="password" required minlength="6" maxlength="117" id="password" class="input-field">
			<span id="show-password" class="field-icon">
				<img src="src/component/Pictures/eyeIcon.png" alt="Show Password" id="eye-icon">
			</span>

			<p class="p1" id="password-match" data-i18n="ConfirmPassword"></p>
			<input type="password" required minlength="6" maxlength="117" id="password_confirm" class="input-field">
			<span id="show-password_confirm" class="field-icon">
				<img src="src/component/Pictures/eyeIcon.png" alt="Show Password" id="eye-icon_confirm">
			</span>	

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
		eyeIcon_Button(["show-password", "show-password_confirm", "avatar"]);
		
		document.getElementById('LogIn')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/logIn');
			setupLogIn();
		});	

		document.getElementById('Home')?.addEventListener('click', () => {
			const isValid = checkFields(["username", "alias", "password", "password_confirm", "profilePic"]);
			if (!isValid)
				return; // Stop execution if validation fails

			const content: string = inputToContent(["username", "alias", "password", "profilePic"])
			const body = requestBody("POST", content) // Used for requests where the frontend has to send info to the backend (like making a new user). Will return null in case of GET
			const response = connectFunc("/users/new", body); // saves the response.json. this can be changed to response.text in connections.ts (automatically does so if a response.json cannot be generated)
			response.then((response) => {
				if (response.ok) {
					response.json().then((data) => {
						// Get user ID  -> user uuid
						const userID = data.uuid;
						if (!userID) {
							// Network or server error
							window.history.pushState({}, '', '/error404');
							setupError404();
							return ;
						}
						localStorage.setItem('userID', userID); // Store userID securely
						
						window.history.pushState({}, '', '/home');
						setupUserHome();
					});

				} else {
					response.json().then((data) => {
						if (data.error === "UNIQUE constraint failed: users_table.username")
						{	
							// Username already exist in database
							const elem = document.getElementById("username") as HTMLInputElement
							const errorMsg = document.getElementById("login-name") as HTMLParagraphElement;
							errorDisplay(elem, errorMsg, "SignUp_error_user_exist");
						} 
						else if (data.error === "UNIQUE constraint failed: users_table.alias")
						{
							// Alias already exist in database
							const elem = document.getElementById("alias") as HTMLInputElement
							const errorMsg = document.getElementById("alias-name") as HTMLParagraphElement;
							errorDisplay(elem, errorMsg, "SignUp_error_alias_exist");
						}
					}).catch(() => {
						// Network or server error
						window.history.pushState({}, '', '/error404');
						setupError404();
					});
				}
			}).catch(() => {
				// Server/ Network error
				window.history.pushState({}, '', '/error404');
				setupError404();
			});
		});
	}
}
