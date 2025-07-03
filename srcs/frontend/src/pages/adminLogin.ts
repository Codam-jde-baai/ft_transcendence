import { setupAdmin } from './admin';
import { setupLogIn } from './logIn';
import { getLanguage } from '../script/language';
import { connectFunc, requestBody, inputToContent } from '../script/connections';
import { errorDisplay } from '../script/errorFunctions';
import { eyeIcon_Button } from '../script/buttonHandling';
import { dropDownBar } from '../script/dropDownBar';

export function setupAdminLogIn() {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", /*html*/`
		<link rel="stylesheet" href="src/styles/logIn.css"> <!-- Link to the CSS file -->
		<div class="overlay"></div>
		<language-menu></language-menu>

		<div class="middle">
			<div class="container">
				<h1 class="header" data-i18n="LogIn_AdminHeader"></h1>
				
				<div class="p1" id="admin-name" data-i18n="LogIn_Name"></div>
				<input type="Login_Name" required minlength="3" maxlength= "17" id="admin" class="input-field">

				<div class="p1" id="userPass" style="left: -160px;" data-i18n="Password"></div>
				<input type="password" required minlength="6" maxlength="117" id="password" class="input-field">
				<span id="show-password" class="field-icon mt-1">
					<img src="src/Pictures/eyeIcon.png" alt="Show Password" id="eye-icon">
				</span>
				
				<div class="buttons">
					<button class="btn" id="Admin" data-i18n="btn_LogIn"></button>
				</div>
			</div>
		</div>
		`);

		getLanguage();
		dropDownBar(["dropdown-btn", "language-btn", "language-content"]);
		eyeIcon_Button(["show-password"]);

		document.getElementById('LogIn')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/logIn');
			setupLogIn();
		});


		document.getElementById('Admin')?.addEventListener('click', () => {				
			const content: string = inputToContent(["admin", "password"])
			const body = requestBody("POST", content, "application/json");
			const response = connectFunc("/admin/login", body);
			response.then((response) => {
				if (response.ok) {
						window.history.pushState({}, '', '/admin');
						setupAdmin();
				} else {
					response.json().then((data) => {
						if (data.error === "admin and password combination is not valid") {	
							const elem = document.getElementById("admin") as HTMLInputElement
							const errorMsg = document.getElementById("admin-name") as HTMLParagraphElement;
							errorDisplay(elem, errorMsg, "LogIn_noUser");
						}
					})
				}
			})
		});
	}
}