// import { renderPage } from './index';
import { getLanguage } from '../script/language';
// import { dropDownBar } from '../script/dropDownBar';
import { setupAdmin } from './admin';
// import { fillTopbar } from '../script/fillTopbar';
import { adminPasswordFields } from '../script/errorFunctions';
import { setupErrorPages } from './errorPages';
import { eyeIcon_Button } from '../script/buttonHandling';

export function setupAdminUserSetting(data: any) {
    console.log("TEST", data);

    const root = document.getElementById('app');
    if (root) {
        // Create a modal container
        const modal = document.createElement('div');
        modal.classList.add('modal-container');
        modal.innerHTML = `
            <div class="modal">
                <button class="close-btn" id="close-modal">&times;</button>
                <link rel="stylesheet" href="src/styles/adminSet.css"> <!-- Link to the CSS file -->
                <div class="overlay"></div>

                <admin-topbar></admin-topbar>
                
                <div class="middle">
                    <div class="ucontainer">
                        <h1 class="admin_header" data-i18n="Admin_Header"></h1>
                        <p class="p2" data-i18n="Admin_P"></p>
                        <p class="p2">$USERNAME</p>
                        
                        <button class="upicture">
                            <img src="src/Pictures/defaultPP.png">
                        </button>
        
                        <p class="p1" data-i18n="LogIn_Name"></p>
                        <div class="input-field display-only">Display USER LogIn Name</div>
        
                        <p class="p1" data-i18n="SignUp_Alias"></p>
                        <div class="input-field display-only">Display USER Alias Name</div>
        
                        <p class="p1" id="adminPass" data-i18n="Change_Password"></p>
                        <input type="password" required minlength="6" maxlength="117" id="password" class="input-field">
                        <span id="show-password" class="field-icon">
                            <img src="src/Pictures/eyeIcon.png" alt="Show Password" id="eye-icon">
                        </span>
        
                        <p class="p1" id="admin_password-match" data-i18n="ConfirmPassword"></p>
                        <input type="password" required minlength="6" maxlength="117" id="password_confirm" class="input-field">
                        <span id="show-password_confirm" class="field-icon">
                            <img src="src/Pictures/eyeIcon.png" alt="Show Password" id="eye-icon_confirm">
                        </span>		

                        <div class="ubuttons">
                            <button id="Save" class="ubtn" data-i18n="btn_Admin"></button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Append the modal to the root
        root.appendChild(modal);

        getLanguage();
        eyeIcon_Button(["show-password", "show-password_confirm"]);

        document.getElementById('close-modal')?.addEventListener('click', () => {
            modal.remove();
        });

        document.getElementById('Save')?.addEventListener('click', async () => {
			const isValid = adminPasswordFields(["password", "password_confirm"]);
			if (!isValid)
				return; // Stop execution if validation fails

			// if () {
			// 	window.history.pushState({}, '', '/admin');
			// 	setupAdmin();
			// }
			// else {
				// Network or server error
				window.history.pushState({}, '', '/errorPages');
				setupErrorPages(404, "Page Not Found");
			// }

		});
    }
}