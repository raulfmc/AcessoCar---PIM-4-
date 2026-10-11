(() => {
	"use strict";

	// POST de login recebe { login, password }; configure sessão/token conforme sua API.
	const API_BASE_URL = "";
	const API_ROUTES = { login: "" };
	const form = document.querySelector("#login-form");
	const message = document.querySelector("#login-message");
	const submitButton = form.querySelector('button[type="submit"]');
	const themeToggle = document.querySelector("#theme-toggle");
	const themeLabel = document.querySelector("#theme-label");

	function setTheme(isLight) {
		document.documentElement.dataset.theme = isLight ? "light" : "dark";
		themeToggle.checked = isLight;
		themeToggle.setAttribute("aria-label", isLight ? "Ativar tema escuro" : "Ativar tema claro");
		themeLabel.textContent = isLight ? "Tema claro" : "Tema escuro";
	}

	async function authenticate(credentials) {
		const route = API_ROUTES.login;
		if (!API_BASE_URL.trim() || !route.trim()) {
			throw new Error("Configure API_BASE_URL e API_ROUTES.login em PG_LOGIN.js.");
		}
		const response = await fetch(`${API_BASE_URL.replace(/\/+$/, "")}/${route.replace(/^\/+/, "")}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(credentials)
		});
		const text = await response.text();
		const body = text ? JSON.parse(text) : null;
		if (!response.ok) throw new Error(body?.message || `A API respondeu com HTTP ${response.status}.`);
	}

	setTheme(localStorage.getItem("acessocar-theme") === "light");
	themeToggle.addEventListener("change", () => {
		setTheme(themeToggle.checked);
		localStorage.setItem("acessocar-theme", themeToggle.checked ? "light" : "dark");
	});
	form.addEventListener("submit", async (event) => {
		event.preventDefault();
		if (!form.reportValidity()) return;
		message.hidden = true;
		submitButton.disabled = true;
		try {
			const data = new FormData(form);
			await authenticate({
				login: String(data.get("login") || "").trim(),
				password: String(data.get("password") || "")
			});
			window.location.assign("PG_HOME.html");
		} catch (error) {
			message.textContent = `Não foi possível entrar: ${error.message}`;
			message.hidden = false;
		} finally {
			submitButton.disabled = false;
		}
	});
})();
