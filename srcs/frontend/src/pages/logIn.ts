import { setupUserHome } from './home';
import { setupAdmin} from './admin';
import { getLanguage } from '../script/language';
import { connectFunc, requestBody, inputToContent } from '../script/connections';

export function setupLogIn() {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", `
		<link rel="stylesheet" href="src/styles/logIn.css"> <!-- Link to the CSS file -->
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
			<h1 class="header" data-i18n="LogIn_Header"></h1>
			
			<p class="p1" data-i18n="LogIn_Name"></p>
			<input type="Login_Name" class="input-field" data-i18n-placeholder="LogIn_placeholder1">

			<p class="p1" data-i18n="Password"></p>
			<input type="Password" class="input-field">
			
			<div class="buttons">
				<button class="btn" id="Home" data-i18n="btn_LogIn"></button>
			</div>
			<div class="buttons">
				<button class="btn" id="Admin">Admin (Gonna be removed later)</button>
			</div>
		</div>
		`);

		getLanguage();
		document.getElementById('Home')?.addEventListener('click', () => {
			const content:string = inputToContent(["username", "alias", "password"])
			const body = requestBody("POST", content)
			const response = connectFunc("http://localhost:3000/user/login", body);
			response.then((response) => {
				console.log(response);
			})
			window.history.pushState({}, '', '/home'); // can be moved into the response.then section for proper usage
			setupUserHome();
		});

		document.getElementById('Admin')?.addEventListener('click', () => {
			window.history.pushState({}, '', '/admin');
			setupAdmin();
		});
	}
}