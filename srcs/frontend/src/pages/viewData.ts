import DOMPurify from 'dompurify'; 
import { getLanguage } from '../script/language';
import { connectFunc, requestBody } from '../script/connections';
import { setupSetting } from './setting';
import { errorDisplay } from './../script/errorFunctions';


export function setupViewData() {
	const root = document.getElementById('app');
	if (root) {
		root.innerHTML = "";
		root.insertAdjacentHTML("beforeend", /*html*/`
		<link rel="stylesheet" href="src/styles/setting.css"> <!-- Link to the CSS file -->
		<div class="overlay"></div>
		
		<div class="smiddle"></div>
		<div class="scontainer">
			
			<!-- Popup PW check -->
			<div class="w-full bg-white p-5 rounded-[8px] w-[440px] relative;">
				<span id="PWClose" class="absolute top-5 right-4 text-[24px] cursor-pointer">&times;</span>
				<h2 class="text-[20px] mt-6 text-center" data-i18n="UserPW_Header"></h2>
				<form>
					<p class="w-full text-black text-left m-0 mt-4" id="PWCheck" data-i18n="Password"></p>
					<input class="bg-gray-300 w-full p-2 mb-2 rounded" type="password" id="password">
					<div class="buttons mt-[-10px]">
						<button class="btn" id="PWSave" data-i18n="btn_Save"></button>
					</div>
				</form>
			</div>
		</div>
		`);

		getLanguage();

		document.getElementById('PWClose')?.addEventListener('click', async () => {
			window.history.pushState({}, '', '/setting');
			setupSetting();
		});

		document.getElementById('PWSave')?.addEventListener('click', async () => {

			// Retrieve the data from localStorage
			const SettingsUserData = localStorage.getItem('SettingsUser');	
			const SettingsUser = SettingsUserData ? JSON.parse(SettingsUserData) : null;

			const PWElement = document.getElementById("password") as HTMLInputElement;
			const rawInput = PWElement.value;
			const sanitizedInput = DOMPurify.sanitize(rawInput); // Removes unsafe HTML
			const alphanumericInput = sanitizedInput.replace(/[^a-zA-Z0-9]/g, ''); // Keeps only alphanumeric

			if (SettingsUser) {
				connectFunc("/user/login", requestBody("POST", JSON.stringify({["username"]: SettingsUser , ["password"]: alphanumericInput}), "application/json"))
				.then(async (response) => {
					if (response.ok) {
						response.json().then((data) => {

							const settingsPopup = document.getElementById('settingsPopup');

							// Retrieve the data from localStorage
							const SettingsAliasData = localStorage.getItem('SettingsAlias');	
							const SettingsAlias = SettingsAliasData ? JSON.parse(SettingsAliasData) : null;

							if (settingsPopup === null) {
								root.insertAdjacentHTML("beforeend", /*html*/`
									<div class="smiddle"></div>
									<div class="scontainer">
									
										<!-- Popup for viewing user data -->
										<div id="settingsPopup" class="fixed top-0 left-[-20px] w-[500px] h-full bg-[rgba(0,0,0,0.8)] flex justify-center items-center z-40">
											<div class="bg-white p-5 rounded-[8px] w-[600px] h-[500px] relative;">
												<span id="Close" class="absolute top-2 right-3 text-[24px] cursor-pointer">&times;</span>
												<h2 class="w-full text-[20px] mt-3 text-center" data-i18n="UserP_Header"></h2>
												<p class="w-full text-[13px] mt-[-10px] mb-3 text-black " data-i18n="Pop_setting_P"></p>
												<form>
													<p class="w-full text-black text-left" data-i18n="LogIn_Name"></p>
													<div class="bg-gray-300 w-full p-2 mb-2 rounded" id="Susername"></div>
													
													<p class="w-full text-black text-left" data-i18n="SignUp_Alias"></p>
													<div class="bg-gray-300 w-full p-2 mb-2 rounded" id="Salias"></div>
												</form>
											</div>
										</div>
									</div>
								  `);

								getLanguage();
								if (SettingsAlias) {
									connectFunc(`/useralias/${SettingsAlias}`, requestBody("GET", null, "application/json"))
									.then(async (response) => {
										if (response.ok) {
											response.json().then((data) => {
												const usernameElem = document.getElementById('Susername');
												const aliasElem = document.getElementById('Salias');
												if (usernameElem && aliasElem) {
													usernameElem.textContent = data.username;
													aliasElem.textContent = data.alias;
												}
											});
										} else {
											console.error("Failed to fetch user data");
											window.history.pushState({}, '', '/setting');
											setupSetting();
										}
									});
								} else {
									window.history.pushState({}, '', '/setting');
									setupSetting();
								}
							}

							document.getElementById('Close')?.addEventListener('click', async () => {
								window.history.pushState({}, '', '/setting');
								setupSetting();
							});
							
						});
					} else {
						const password = document.getElementById("password") as HTMLInputElement;
						const errorMsg = document.getElementById("PWCheck") as HTMLParagraphElement;
						errorDisplay(password, errorMsg, "LogIn_error");
					}
				});
			} else {
				window.history.pushState({}, '', '/setting');
				setupSetting();
			}
				
		});
	}
}
