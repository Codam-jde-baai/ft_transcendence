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
			<div class="bg-white p-5 rounded-[8px] w-[441px] relative;">
				<span id="PWClose" class="mt-[-100px] mr-[-380px] text-[24px] cursor-pointer">&times;</span>
				<h2 class="text-[20px] mt-6 text-center" data-i18n="UserPW_Header"></h2>
				<form>
					<p class="w-full text-black text-left m-0 mt-4" id="PWCheck" data-i18n="Password"></p>
					<input class="bg-gray-300 w-full p-2 mb-2 rounded" type="password" id="password">
				</form>
				<div class="buttons mt-[-10px]">
					<button class="mb-2.5 w-[399px] py-3 text-[1.1rem] text-white bg-[#902063] border-none rounded-[5px] cursor-pointer mt-2.5 transition duration-300 box-border font-sans" id="PWSave" data-i18n="btn_Conf"></button>
				</div>
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
				connectFunc("/user/game/login", requestBody("POST", JSON.stringify({["username"]: SettingsUser , ["password"]: alphanumericInput}), "application/json"))
				.then(async (response) => {
					if (response.ok) {
						response.json().then((data) => {
							const settingsPopup = document.getElementById('settingsPopup');
							const SettingsAlias = data.alias;

							if (settingsPopup === null) {
								root.insertAdjacentHTML("beforeend", /*html*/`
									<div class="smiddle"></div>
									
										<!-- Popup for viewing user data -->
										<div id="settingsPopup" class="fixed top-0 left-[-20px] w-[500px] h-full bg-[rgba(0,0,0,0.8)] flex justify-center items-center z-40">
											<div class="bg-white p-5 mt-5 items-start rounded-[8px] w-[400px] min-h-[200px] fixed top-0">
												<span id="Close" class="absolute top-2 right-2 text-[24px] cursor-pointer">&times;</span>
												<div class="text-center">
													<h2 class="text-[20px] mt-3" data-i18n="UserP_Header"></h2>
													<div class="text-[13px] mt-[-9px] mb-3 text-black" data-i18n="Pop_setting_P"></div>
												</div>
												<form class="text-left">
													<div class="w-full text-black text-left mt-3" data-i18n="LogIn_Name"></div>
													<div class="bg-gray-300 w-full p-2 mb-2 rounded" id="Susername"></div>
													
													<div class="w-full text-black text-left" data-i18n="SignUp_Alias"></div>
													<div class="bg-gray-300 w-full p-2 mb-2 rounded" id="Salias"></div>
												</form>
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
