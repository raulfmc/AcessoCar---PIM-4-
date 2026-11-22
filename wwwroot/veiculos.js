(() => {
	"use strict";

	// A rota vehicles deve retornar um array JSON ou { data: [] }; vehicleById usa :id.

	const API_ROUTES = {
		vehicles: "/api/Carro",
		vehicleById: "/api/Carro/{id}",
		adaptations: "/api/Adaptacao"
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
	let adaptations = [];

	async function request(routeName, options = {}) {
		const route = options.url || API_ROUTES[routeName];
		if (!API_BASE_URL.trim() || !route.trim()) {
			throw new Error(`Configure API_BASE_URL e API_ROUTES.${routeName} em veiculos.js.`);
		}
		const { url, ...fetchOptions } = options;
		const response = await fetchProtegido(`${API_BASE_URL.replace(/\/+$/, "")}/${route.replace(/^\/+/, "")}`, {
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
			const data1 = await request("adaptations");
			if (!Array.isArray(data)) {
				throw new Error("A rota API_ROUTES.adaptations deve retornar uma lista (ou { data: lista }).");
			}
			adaptations = data1;
			const visibleVehicles = vehicles.filter((vehicle) => activeFilter === "all" || vehicle.estado === activeFilter);
			tableBody.replaceChildren();
			if (visibleVehicles.length === 0) {
				const row = document.createElement("tr");
				const cell = createCell("Nenhum veículo encontrado para este filtro.", "vehicle-empty");
				cell.colSpan = 7;
				row.append(cell);
				tableBody.append(row);
			} else {
				visibleVehicles.forEach((vehicle) => {
					const vehicleAdaptations = adaptations.filter(
						adaptation => adaptation.carro_ID === vehicle.id
					);

					const row = document.createElement("tr");

					row.append(
						createCell(vehicle.id, "id"),
						createCell(String(vehicle.marca + " " + vehicle.modelo), "nome_Veiculo"),
						createCell(vehicle.placa, "placa"),
						createCell(String(vehicle.ano_Fabricacao), "ano_Fabricacao"),
						createCell(Number(vehicle.valor_Diaria).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), "valor_Diaria"),
						createCell(Number(vehicle.qtd_Alugueis)),
						createCell(
							vehicleAdaptations.length > 0
								? vehicleAdaptations.map(adaptation =>
									`${adaptation.nome} (${adaptation.tipo})`
								).join(", ")
								: "Nenhuma adaptação"
						),
						//createCell()
					);
					const statusCell = document.createElement("td");
					const statusClass = {
						"DISPONÍVEL": "disponivel",
						"LOCADO": "locado",
						"EM MANUTENÇÃO": "emmanutencao"
					};
					const status = statusClass[vehicle.estado];
					const badge = document.createElement("span");
					badge.className = `status-badge ${status}`;
					badge.textContent = vehicle.estado;
					statusCell.append(badge);
					row.append(statusCell);
					tableBody.append(row);
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
	function abrirEdicaoVeiculo() {
		const carroId = prompt("Digite o ID do veículo que deseja editar:");

		if (carroId === null || carroId.trim() === "") {
			return;
		}

		if (!/^[1-9]\d*$/.test(carroId.trim())) {
			alert("Informe um ID válido.");
			return;
		}

		window.location.href = `Edicoes/EdicaoVeiculo.html?id=${carroId.trim()}`;
	}
	document.querySelector(".btn-edit").addEventListener("click", () => {
		abrirEdicaoVeiculo();
	});
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
		const deleteButton = event.target.closest("[data-delete-vehicle]");

		if (!deleteButton) return;

		const vehicleId = deleteButton.dataset.deleteVehicle;

		const vehicle = vehicles.find(
			item => String(item.id) === String(vehicleId)
		);

		if (!vehicle) {
			alert("Veículo não encontrado na lista.");
			return;
		}

		if (!confirm(`Deseja excluir o veículo ${vehicle.marca} ${vehicle.modelo}?`)) {
			return;
		}

		try {
			deleteButton.disabled = true;

			const resposta = await fetchProtegido(
				`https://localhost:7240/api/Carro/${encodeURIComponent(vehicleId)}`,
				{
					method: "DELETE",
					credentials: "include"
				}
			);

			let body = null;

			if (resposta.status !== 204) {
				const texto = await resposta.text();
				body = texto ? JSON.parse(texto) : null;
			}

			if (!resposta.ok) {
				throw new Error(
					body?.detail ||
					body?.message ||
					body?.mensagem ||
					body?.title ||
					`Erro HTTP ${resposta.status}`
				);
			}

			alert(`Veículo ${vehicle.marca} ${vehicle.modelo} excluído com sucesso!`);

			await renderVehicles();

		} catch (error) {
			console.error("Erro ao excluir veículo:", error);

			alert(`Não foi possível excluir o veículo: ${error.message}`);

			deleteButton.disabled = false;
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
