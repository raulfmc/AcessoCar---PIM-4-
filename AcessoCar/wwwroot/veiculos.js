(() => {
	"use strict";

	// A rota vehicles deve retornar um array JSON ou { data: [] }; vehicleById usa :id.
	const API_BASE_URL = "http://localhost:5104/api";
	const API_ROUTES = {
		vehicles: "Carro",
		vehicleById: "Carro/{id}"
	};
	const themeToggle = document.querySelector("#theme-toggle");
	const themeLabel = document.querySelector("#theme-label");
	const tableBody = document.querySelector("#vehicle-table-body");
	const vehicleCount = document.querySelector("#vehicle-count");
	const filterButtons = document.querySelectorAll(".vehicle-filter-button");
	const main = document.querySelector(".main-content");
	const statusMessage = document.createElement("p");
	statusMessage.className = "api-error-message";
	statusMessage.setAttribute("role", "alert");
	statusMessage.hidden = true;
	main.insertBefore(statusMessage, main.querySelector("section"));
	let activeFilter = "all";
	let vehicles = [];

	async function request(routeName, options = {}) {
		const route = options.url || API_ROUTES[routeName];
		if (!API_BASE_URL.trim() || !route.trim()) {
			throw new Error(`Configure API_BASE_URL e API_ROUTES.${routeName} em veiculos.js.`);
		}
		const { url, ...fetchOptions } = options;
		const response = await fetch(`${API_BASE_URL.replace(/\/+$/, "")}/${route.replace(/^\/+/, "")}`, {
			...fetchOptions,
			headers: { ...(fetchOptions.body ? { "Content-Type": "application/json" } : {}), ...fetchOptions.headers }
		});
		const body = response.status === 204 ? null : await response.json();
		if (!response.ok) throw new Error(body?.message || `A API respondeu com HTTP ${response.status}.`);
		console.log(body);
		return body?.data ?? body;
	}

	function setTheme(isLight) {
		document.documentElement.dataset.theme = isLight ? "light" : "dark";
		themeToggle.checked = isLight;
		themeToggle.setAttribute("aria-label", isLight ? "Ativar tema escuro" : "Ativar tema claro");
		themeLabel.textContent = isLight ? "Tema claro" : "Tema escuro";
	}

	function createCell(text, className = "") {
		const cell = document.createElement("td");
		cell.textContent = text;
		if (className) cell.className = className;
		return cell;
	}

	async function renderVehicles() {
		statusMessage.hidden = true;
		try {
			const data = await request("vehicles");
			if (!Array.isArray(data)) {
				throw new Error("A rota API_ROUTES.vehicles deve retornar uma lista (ou { data: lista }).");
			}
			vehicles = data;
			const visibleVehicles = vehicles.filter((vehicle) => activeFilter === "all" || vehicle.status === activeFilter);
			tableBody.replaceChildren();
			if (visibleVehicles.length === 0) {
				const row = document.createElement("tr");
				const cell = createCell("Nenhum veículo encontrado para este filtro.", "vehicle-empty");
				cell.colSpan = 7;
				row.append(cell);
				tableBody.append(row);
			} else {
				visibleVehicles.forEach((vehicle) => {
					const row = document.createElement("tr");
					const bodyCell = document.createElement("td");
					bodyCell.className = "vehicle-body-cell";
					bodyCell.append(AccessoCarUtils.buildBodyMiniature(vehicle.bodyRegions || []));
					row.append(
						createCell(vehicle.id, "id"),
						createCell(String(vehicle.marca + " " + vehicle.modelo), "nome_Veiculo"),
						createCell(vehicle.placa, "placa"),
						createCell(String(vehicle.ano_Fabricacao), "ano_Fabricacao"),
						bodyCell,
						createCell(Number(vehicle.valor_Diaria).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), "valor_Diaria")
					);
					const actionsCell = document.createElement("td");
					const deleteButton = document.createElement("button");
					deleteButton.className = "vehicle-delete";
					deleteButton.type = "button";
					deleteButton.dataset.deleteVehicle = vehicle.id;
					deleteButton.setAttribute("aria-label", `Excluir veículo ${vehicle.nome}`);
					deleteButton.title = `Excluir ${vehicle.nome}`;
					deleteButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3"></path></svg>';
					actionsCell.append(deleteButton);
					row.append(actionsCell);
					tableBody.append(row);
				});
			}
			vehicleCount.textContent = `${visibleVehicles.length} ${visibleVehicles.length === 1 ? "veículo" : "veículos"}`;
		} catch (error) {
			statusMessage.textContent = `Não foi possível carregar os veículos: ${error.message}`;
			statusMessage.hidden = false;
		}
	}

	setTheme(localStorage.getItem("acessocar-theme") === "light");
	themeToggle.addEventListener("change", () => {
		setTheme(themeToggle.checked);
		localStorage.setItem("acessocar-theme", themeToggle.checked ? "light" : "dark");
	});
	filterButtons.forEach((button) => button.addEventListener("click", () => {
		activeFilter = button.dataset.filter;
		filterButtons.forEach((filterButton) => {
			const selected = filterButton === button;
			filterButton.classList.toggle("is-active", selected);
			filterButton.setAttribute("aria-pressed", String(selected));
		});
		renderVehicles();
	}));
	tableBody.addEventListener("click", async (event) => {
		const button = event.target.closest("[data-delete-vehicle]");
		if (!button) return;
		const vehicle = vehicles.find((item) => item.id === button.dataset.deleteVehicle);
		if (!vehicle || !window.confirm(`Deseja excluir o veículo ${vehicle.nome}?`)) return;
		try {
			await request("vehicleById", {
				method: "DELETE",
				url: API_ROUTES.vehicleById.replace(":id", encodeURIComponent(vehicle.id))
			});
			await renderVehicles();
		} catch (error) {
			statusMessage.textContent = `Não foi possível excluir o veículo: ${error.message}`;
			statusMessage.hidden = false;
		}
	});

	const sidebar = document.querySelector("#sidebar");
	const menuToggle = document.querySelector("#menu-toggle");
	menuToggle.addEventListener("click", () => {
		const isOpen = sidebar.classList.toggle("is-open");
		menuToggle.setAttribute("aria-expanded", String(isOpen));
		menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
	});
	renderVehicles();
})();
