(() => {
	"use strict";

	
	const API_ROUTES = {
		vehicles: "/api/Carro",
		adaptations: "/api/Adaptacao"
	};
	const form = document.querySelector("#registration-form");
	const message = document.querySelector("#registration-message");
	
	const themeToggle = document.querySelector("#theme-toggle");
	const themeLabel = document.querySelector("#theme-label");
	

	async function request(routeName, payload) {
		const route = API_ROUTES[routeName];
		if (!API_BASE_URL.trim() || !route.trim()) {
			throw new Error(`Configure API_BASE_URL e API_ROUTES.${routeName} em cadastro-veiculo.js.`);
		}
		const response = await fetch(`${API_BASE_URL.replace(/\/+$/, "")}/${route.replace(/^\/+/, "")}`, {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload)
		});
		const body = response.status === 204 ? null : await response.json();
		if (!response.ok) throw new Error(body?.message || `A API respondeu com HTTP ${response.status}.`);
		return body?.data ?? body;
	}

	function setTheme(isLight) {
		document.documentElement.dataset.theme = isLight ? "light" : "dark";
		themeToggle.checked = isLight;
		themeToggle.setAttribute("aria-label", isLight ? "Ativar tema escuro" : "Ativar tema claro");
		themeLabel.textContent = isLight ? "Tema claro" : "Tema escuro";
	}

	function showMessage(text, isError = false) {
		message.textContent = text;
		message.classList.add("is-visible");
		message.classList.toggle("is-error", isError);
	}

	function formValue(name) {
		return form.elements.namedItem(name).value.trim();
	}

	

	async function createVehicleRecord() {
		const dados = {
			Carro: {
				Marca: document.getElementById("Marca").value,
				Modelo: document.getElementById("Modelo").value,
				Ano_Fabricacao: parseInt(document.getElementById("Ano_Fabricacao").value),
				Numero: parseInt(document.getElementById("Numero").value),
				Versao: document.getElementById("Versao").value,
				Cambio: document.getElementById("Cambio").value,
				Placa: document.getElementById("Placa").value,
				Cor: document.getElementById("Cor").value,
				Valor_Diaria: parseFloat(document.getElementById("Valor_Diaria").value)
			},

			Adaptacao: {
				Nome: document.getElementById("Nome").value,
				Tipo: document.getElementById("Tipo").value,
				Ativo: true
			}
		};

		const vehicle = await request("vehicles", dados);

		return vehicle;
		
	}

	

	setTheme(localStorage.getItem("acessocar-theme") === "light");
	themeToggle.addEventListener("change", () => {
		setTheme(themeToggle.checked);
		localStorage.setItem("acessocar-theme", themeToggle.checked ? "light" : "dark");
	});
	form.addEventListener("submit", async (event) => {
		event.preventDefault();
		
		try {
			const vehicle = await createVehicleRecord();
			showMessage(`Veículo cadastrado com sucesso.`.trim());
			//${vehicle?.carro.id || ""}
			form.reset();
			
		} catch (error) {
			showMessage(`Não foi possível cadastrar o veículo: ${error.message}`, true);
		}
	});

	const sidebar = document.querySelector("#sidebar");
	const menuToggle = document.querySelector("#menu-toggle");
	menuToggle.addEventListener("click", () => {
		const isOpen = sidebar.classList.toggle("is-open");
		menuToggle.setAttribute("aria-expanded", String(isOpen));
		menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
	});
})();
