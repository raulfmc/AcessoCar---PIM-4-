(() => {
	"use strict";

	const API_ROUTES = {
		vehicles: "/api/Carro",
		maintenance: "/api/Manutencao",
		releaseMaintenance: "/api/Manutencao/:id"
	};

	const themeToggle = document.querySelector("#theme-toggle");
	const themeLabel = document.querySelector("#theme-label");
	const tableBody = document.querySelector("#maintenance-table-body");
	const count = document.querySelector("#maintenance-count");
	const message = document.querySelector("#maintenance-message");

	const currency = new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL"
	});

	let vehicles = [];
	let maintenanceRecords = [];

	async function request(routeName, options = {}) {
		const route = options.url || API_ROUTES[routeName];

		if (!API_BASE_URL.trim() || !route?.trim()) {
			throw new Error(`Configure API_BASE_URL e API_ROUTES.${routeName}.`);
		}

		const { url, ...fetchOptions } = options;

		const response = await fetchProtegido(
			`${API_BASE_URL.replace(/\/+$/, "")}/${route.replace(/^\/+/, "")}`,
			{
				...fetchOptions,
				headers: {
					...(fetchOptions.body
						? { "Content-Type": "application/json" }
						: {}),
					...fetchOptions.headers
				}
			}
		);

		const text = await response.text();
		const body = text ? JSON.parse(text) : null;

		if (!response.ok) {
			throw new Error(
				body?.detail ||
				body?.message ||
				body?.mensagem ||
				body?.title ||
				`A API respondeu com HTTP ${response.status}.`
			);
		}

		return body?.data ?? body;
	}

	async function loadData() {
		const [vehicleData, maintenanceData] = await Promise.all([
			request("vehicles"),
			request("maintenance")
		]);

		if (!Array.isArray(vehicleData) || !Array.isArray(maintenanceData)) {
			throw new Error("As rotas devem retornar listas.");
		}

		vehicles = vehicleData;
		maintenanceRecords = maintenanceData;

		console.log("Veículos:", vehicles);
		console.log("Manutenções:", maintenanceRecords);
	}

	function setTheme(isLight) {
		document.documentElement.dataset.theme = isLight ? "light" : "dark";
		themeToggle.checked = isLight;

		themeToggle.setAttribute(
			"aria-label",
			isLight ? "Ativar tema escuro" : "Ativar tema claro"
		);

		themeLabel.textContent = isLight ? "Tema claro" : "Tema escuro";
	}

	function formatDate(value) {
		if (!value) return "—";

		const [year, month, day] = value.split("T")[0].split("-");

		if (!year || !month || !day) return "—";

		return `${day}/${month}/${year}`;
	}

	function createCell(text, className = "") {
		const cell = document.createElement("td");
		cell.textContent = text;

		if (className) cell.className = className;

		return cell;
	}

	function showMessage(text, isError = false) {
		message.textContent = text;
		message.classList.add("is-visible");
		message.classList.toggle("is-error", isError);
	}

	function activeRecordForVehicle(vehicleId) {
		return maintenanceRecords.find(record =>
			Number(record.carro?.id) === Number(vehicleId) &&
			(record.ativo === 1 || record.ativo === true)
		);
	}

	function renderMaintenance() {
		const vehiclesInMaintenance = vehicles.filter(
			vehicle => vehicle.estado === "EM MANUTENÇÃO"
		);

		tableBody.replaceChildren();

		if (vehiclesInMaintenance.length === 0) {
			const row = document.createElement("tr");

			const cell = createCell(
				"Não há veículos em manutenção no momento.",
				"maintenance-empty"
			);

			cell.colSpan = 7;
			row.append(cell);
			tableBody.append(row);
		} else {
			vehiclesInMaintenance.forEach(vehicle => {
				const record = activeRecordForVehicle(vehicle.id);
				const row = document.createElement("tr");

				row.append(
					createCell(record.id),
					createCell(
						`${vehicle.marca} ${vehicle.modelo}`,
						"maintenance-vehicle"
					),
					createCell(vehicle.placa, "maintenance-id"),
					createCell(
						record ? record.descricao : "Sem relatório registrado para esta manutenção.",
						"maintenance-report"
					),
					createCell(
						record ? currency.format(record.valor) : "—",
						"maintenance-cost"
					),
					createCell(
						record ? formatDate(record.data_Prevista_Conclusao) : "—",
						"maintenance-date"
					)
				);

				const statusCell = document.createElement("td");
				const status = document.createElement("span");

				status.className = "maintenance-status";
				status.textContent = "EM MANUTENÇÃO";

				statusCell.append(status);
				row.append(statusCell);

				const actionCell = document.createElement("td");
				const releaseButton = document.createElement("button");

				releaseButton.className = "maintenance-release";
				releaseButton.type = "button";
				releaseButton.dataset.releaseVehicle = vehicle.id;

				if (record) {
					releaseButton.dataset.maintenanceId = record.id;
				}

				releaseButton.disabled = !record;
				releaseButton.title = record
					? "Concluir manutenção"
					: "A API não retornou o registro desta manutenção.";

				releaseButton.textContent = "Liberar veículo";

				releaseButton.setAttribute(
					"aria-label",
					`Concluir manutenção e liberar ${vehicle.marca} ${vehicle.modelo}`
				);

				actionCell.append(releaseButton);
				row.append(actionCell);

				tableBody.append(row);
			});
		}

		count.textContent =
			`${vehiclesInMaintenance.length} ${vehiclesInMaintenance.length === 1 ? "veículo" : "veículos"
			}`;
	}

	async function refresh() {
		try {
			await loadData();
			renderMaintenance();
		} catch (error) {
			showMessage(
				`Não foi possível carregar as manutenções: ${error.message}`,
				true
			);
		}
	}

	async function releaseMaintenance(button) {
		if (!button.dataset.maintenanceId) return;

		const route = API_ROUTES.releaseMaintenance.replace(
			":id",
			encodeURIComponent(button.dataset.maintenanceId)
		);

		try {
			await request("releaseMaintenance", {
				url: route,
				method: "DELETE"
			});

			showMessage("Manutenção concluída e veículo liberado.");

			await refresh();
		} catch (error) {
			showMessage(
				`Não foi possível liberar o veículo: ${error.message}`,
				true
			);
		}
	}

	setTheme(localStorage.getItem("acessocar-theme") === "light");

	themeToggle.addEventListener("change", () => {
		setTheme(themeToggle.checked);

		localStorage.setItem(
			"acessocar-theme",
			themeToggle.checked ? "light" : "dark"
		);
	});

	tableBody.addEventListener("click", async event => {
		const button = event.target.closest("[data-release-vehicle]");

		if (!button || button.disabled) return;

		await releaseMaintenance(button);
	});
	const newMaintenanceButton = document.querySelector("#new-maintenance-button");

	newMaintenanceButton.addEventListener("click", () => {
		window.location.href = "Cadastros/CadastroManutencao.html";
	});
	const sidebar = document.querySelector("#sidebar");
	const menuToggle = document.querySelector("#menu-toggle");

	menuToggle.addEventListener("click", () => {
		const isOpen = sidebar.classList.toggle("is-open");

		menuToggle.setAttribute("aria-expanded", String(isOpen));
		menuToggle.setAttribute(
			"aria-label",
			isOpen ? "Fechar menu" : "Abrir menu"
		);
	});
	function abrirEdicaoManutencao() {
		const clienteId = prompt("Digite o ID da manutenção que deseja editar:");

		if (clienteId === null || clienteId.trim() === "") {
			return;
		}

		if (!/^[1-9]\d*$/.test(clienteId.trim())) {
			alert("Informe um ID válido.");
			return;
		}

		window.location.href = `Edicoes/EdicaoManutencao.html?id=${clienteId.trim()}`;
	}
	document.querySelector(".btn-edit").addEventListener("click", () => {
		abrirEdicaoManutencao();
	});


	refresh();
})();