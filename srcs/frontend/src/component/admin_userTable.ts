class UserTable extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
		console.log("UserTable connected");
        this.render();
    }

	render() {
		const username:string = this.getAttribute("username") || "User"
		const alias:string = this.getAttribute("alias") || "Alias"
		this.innerHTML = "";
		this.insertAdjacentHTML("beforeend", `
			<table class="userTable">
				<thead>
					<tr>
						<th data-i18n="LogIn_Name"></th>
						<th data-i18n="SignUp_Alias"></th>
						<th data-i18n="Action"></th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>${username}</td>
						<td>${alias}</td>
						<td>
							<button class="btn" data-i18n="btn_Remove"></button>
							<button class="btn" id="AdminSet" data-i18n="Change_Password"></button>
						</td>
					</tr>
				</tbody>
			</table>`)




		// interface User {
		// 	username: string;
		// 	alias: string;
		// }

		// const usersAttr = this.getAttribute("users");
		// const users: User[] = usersAttr ? JSON.parse(usersAttr) : [];

		// this.innerHTML = `
		// 	<div class="table-wrapper">
		// 		<table class="userTable">
		// 			<thead>
		// 				<tr>
		// 					<th data-i18n="LogIn_Name"></th>
		// 					<th data-i18n="SignUp_Alias"></th>
		// 					<th data-i18n="Action"></th>
		// 				</tr>
		// 			</thead>
		// 			<tbody>
		// 				${users.map(user => `
		// 					<tr>
		// 						<td>${user.username}</td>
		// 						<td>${user.alias}</td>
		// 						<td>
		// 							<button class="btn" data-i18n="btn_Remove"></button>
		// 							<button class="btn" id="AdminSet" data-i18n="Change_Password"></button>
		// 						</td>
		// 					</tr>
		// 				`).join('')}
		// 			</tbody>
		// 		</table>
		// 	</div>
		// `;
	}
}

customElements.define('user-table', UserTable);
