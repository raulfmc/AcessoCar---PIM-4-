(() => {
	"use strict";

	// Listas retornam arrays; releaseMaintenance usa :id do registro de manutenção.

	const API_ROUTES = {
		vehicles: "/api/Carro",
		maintenance: "/api/Manutencao",
		createMaintenance: "/api/Manutencao",
		releaseMaintenance: "/api/Manutencao/:id"
	};
	const themeToggle = document.querySelector("#theme-toggle");
	const themeLabel = document.querySelector("#theme-label");
	const formPanel = document.querySelector("#maintenance-form-panel");
	const form = document.querySelector("#maintenance-form");
	const vehicleSelect = document.querySelector("#maintenance-vehicle");
	const maintenanceDate = document.querySelector("#maintenance-date");
	const maintenanceCost = document.querySelector("#maintenance-cost");
	const tableBody = document.querySelector("#maintenance-table-body");
	const count = document.querySelector("#maintenance-count");
	const message = document.querySelector("#maintenance-message");
	const addButton = document.querySelector("#new-maintenance-button");
	const closeButton = document.querySelector("#close-maintenance-form");
	const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
	let vehicles = [];
	let maintenanceRecords = [];
	const USE_MOCK = true;

	let mockVehicles = [
		{
			id: 1,
			name: "Fiat Argo 1.0",
			plate: "ABC-1234",
			estado: "Disponível"
		},
		{
			id: 2,
			name: "Chevrolet Onix LT",
			plate: "DEF-5678",
			estado: "Em Manutenção"
		},
		{
			id: 3,
			name: "Volkswagen Polo",
			plate: "GHI-9012",
			estado: "Disponível"
		},
		{
			id: 4,
			name: "Hyundai HB20",
			plate: "JKL-3456",
			estado: "Em Manutenção"
		},
		{
			id: 5,
			name: "Renault Kwid",
			plate: "MNO-7890",
			estado: "Disponível"
		}
	];

	let mockMaintenanceRecords = [
		{
			id: 1,
			Carro_ID: 2,
			Ativo: 1,
			report: "Problema no sistema de freios.",
			cost: 450.00,
			date: "2026-11-10"
		},
		{
			id: 2,
			Carro_ID: 4,
			Ativo: 1,
			report: "Troca de óleo e revisão do motor.",
			cost: 280.00,
			date: "2026-11-11"
		}
	];
	async function request(routeName, options = {}) {
		// MOCK ATIVADO
		if (USE_MOCK) {

			const method = options.method || "GET";

			// LISTAR VEÍCULOS
			if (routeName === "vehicles") {
				return [...mockVehicles];
			}

			// LISTAR MANUTENÇÕES
			if (routeName === "maintenance" && method === "GET") {
				return [...mockMaintenanceRecords];
			}

			// CADASTRAR MANUTENÇÃO
			if (routeName === "createMaintenance" && method === "POST") {

				const payload = JSON.parse(options.body);

				const vehicle = mockVehicles.find(
					v => v.id === Number(payload.vehicleId)
				);

				if (!vehicle) {
					throw new Error("Veículo não encontrado.");
				}

				if (vehicle.estado !== "Disponível") {
					throw new Error("Este veículo não está disponível.");
				}

				const newRecord = {
					id: mockMaintenanceRecords.length
						? Math.max(...mockMaintenanceRecords.map(r => r.id)) + 1
						: 1,

					Carro_ID: vehicle.id,
					Ativo: 1,
					report: payload.report,
					cost: payload.cost,
					date: payload.date
				};

				mockMaintenanceRecords.push(newRecord);

				vehicle.estado = "Em Manutenção";

				return newRecord;
			}

			// LIBERAR VEÍCULO
			if (routeName === "releaseMaintenance" && method === "PATCH") {

				const route = options.url || "";
				const maintenanceId = Number(route.split("/").pop());

				const record = mockMaintenanceRecords.find(
					r => r.id === maintenanceId && r.Ativo === 1
				);

				if (!record) {
					throw new Error("Registro de manutenção não encontrado.");
				}

				record.Ativo = 0;

				const vehicle = mockVehicles.find(
					v => v.id === record.Carro_ID
				);

				if (vehicle) {
					vehicle.estado = "Disponível";
				}

				return record;
			}

			throw new Error("Operação não encontrada no mock.");
		}

		// API REAL
		const route = options.url || API_ROUTES[routeName];

		if (!API_BASE_URL.trim() || !route.trim()) {
			throw new Error(`Configure API_BASE_URL e API_ROUTES.${routeName} em manutencao.js.`);
		}

		const { url, ...fetchOptions } = options;

		const response = await fetchProtegido(
			`${API_BASE_URL.replace(/\/+$/, "")}/${route.replace(/^\/+/, "")}`,
			{
				...fetchOptions,
				headers: {
					...(fetchOptions.body ? { "Content-Type": "application/json" } : {}),
					...fetchOptions.headers
				}
			}
		);

		const text = await response.text();
		const body = text ? JSON.parse(text) : null;

		if (!response.ok) {
			throw new Error(body?.detail || body?.message || body?.mensagem || body?.title || `A API respondeu com HTTP ${response.status}.`);
		}

		return body?.data ?? body;
	}

	async function loadData() {
		const [vehicleData, maintenanceData] = await Promise.all([
			request("vehicles"),
			request("maintenance")
		]);
		if (!Array.isArray(vehicleData) || !Array.isArray(maintenanceData)) {
			throw new Error("As rotas de veículos e manutenção devem retornar listas (ou { data: lista }).");
		}
		vehicles = vehicleData;
		maintenanceRecords = maintenanceData;
	}

	function setTheme(isLight) {
		document.documentElement.dataset.theme = isLight ? "light" : "dark";
		themeToggle.checked = isLight;
		themeToggle.setAttribute("aria-label", isLight ? "Ativar tema escuro" : "Ativar tema claro");
		themeLabel.textContent = isLight ? "Tema claro" : "Tema escuro";
	}

	function formatDate(value) {
		if (!value) return "—";
		const date = new Date(`${value}T12:00:00`);
		return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("pt-BR");
	}

	function formatCurrencyInput(value) {
		const digits = value.replace(/\D/g, "");
		return digits ? currency.format(Number(digits) / 100) : "";
	}

	function parseCurrencyInput(value) {
		const digits = value.replace(/\D/g, "");
		return digits ? Number(digits) / 100 : Number.NaN;
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
		return maintenanceRecords.find(
			record =>
				Number(record.Carro_ID) === Number(vehicleId) &&
				(record.Ativo === 1 || record.Ativo === true)
		);
	}

	function renderVehicleOptions() {
		const previousValue = vehicleSelect.value;
		const availableVehicles = vehicles.filter((vehicle) => vehicle.estado === "Disponível");
		vehicleSelect.replaceChildren(new Option("Selecione um veículo disponível", ""));
		availableVehicles.forEach((vehicle) => vehicleSelect.add(new Option(`${vehicle.name} · ${vehicle.plate}`, vehicle.id)));
		if (availableVehicles.some((vehicle) => vehicle.id === previousValue)) vehicleSelect.value = previousValue;
		addButton.disabled = availableVehicles.length === 0;
		addButton.title = addButton.disabled ? "Não há veículos disponíveis para encaminhar." : "";
	}

	function renderMaintenance() {
		renderVehicleOptions();
		const vehiclesInMaintenance = vehicles.filter((vehicle) => vehicle.estado === "Em Manutenção");
		tableBody.replaceChildren();
		if (vehiclesInMaintenance.length === 0) {
			const row = document.createElement("tr");
			const cell = createCell("Não há veículos em manutenção no momento.", "maintenance-empty");
			cell.colSpan = 7;
			row.append(cell);
			tableBody.append(row);
		} else {
			vehiclesInMaintenance.forEach((vehicle) => {
				const record = activeRecordForVehicle(vehicle.id);
				const row = document.createElement("tr");
				row.append(
					createCell(vehicle.name, "maintenance-vehicle"),
					createCell(vehicle.plate, "maintenance-id"),
					createCell(record ? record.report : "Sem relatório registrado para esta manutenção.", "maintenance-report"),
					createCell(record ? currency.format(record.cost) : "—", "maintenance-cost"),
					createCell(record ? formatDate(record.date) : "—", "maintenance-date")
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
				if (record) releaseButton.dataset.maintenanceId = record.id;
				releaseButton.disabled = !record;
				releaseButton.title = record ? "Concluir manutenção" : "A API não retornou o registro desta manutenção.";
				releaseButton.textContent = "Liberar veículo";
				releaseButton.setAttribute("aria-label", `Concluir manutenção e liberar ${vehicle.name}`);
				actionCell.append(releaseButton);
				row.append(actionCell);
				tableBody.append(row);
			});
		}
		count.textContent = `${vehiclesInMaintenance.length} ${vehiclesInMaintenance.length === 1 ? "veículo" : "veículos"}`;
	}

	async function refresh() {
		try {
			await loadData();
			renderMaintenance();
		} catch (error) {
			showMessage(`Não foi possível carregar as manutenções: ${error.message}`, true);
		}
	}

	function openForm() {
		renderVehicleOptions();
		if (addButton.disabled) {
			showMessage("Não há veículos disponíveis para encaminhar à manutenção.", true);
			return;
		}
		message.classList.remove("is-visible");
		formPanel.hidden = false;
		addButton.setAttribute("aria-expanded", "true");
		vehicleSelect.focus();
	}

	function closeForm() {
		formPanel.hidden = true;
		addButton.setAttribute("aria-expanded", "false");
	}

	setTheme(localStorage.getItem("acessocar-theme") === "light");
	maintenanceDate.value = AccessoCarUtils.formatDate(new Date());
	themeToggle.addEventListener("change", () => {
		setTheme(themeToggle.checked);
		localStorage.setItem("acessocar-theme", themeToggle.checked ? "light" : "dark");
	});
	addButton.addEventListener("click", openForm);
	closeButton.addEventListener("click", closeForm);
	maintenanceCost.addEventListener("input", () => {
		maintenanceCost.value = formatCurrencyInput(maintenanceCost.value);
	});
	form.addEventListener("submit", async (event) => {
		event.preventDefault();
		if (!form.reportValidity()) return;
		const cost = parseCurrencyInput(maintenanceCost.value);
		const payload = {
			vehicleId: vehicleSelect.value,
			cost,
			report: form.elements.namedItem("report").value.trim(),
			date: form.elements.namedItem("date").value
		};
		if (!Number.isFinite(cost) || cost < 0 || !payload.report || !payload.date) {
			showMessage("Informe um valor válido, o motivo e a data da manutenção.", true);
			return;
		}
		try {
			const record = await request("createMaintenance", { method: "POST", body: JSON.stringify(payload) });
			form.reset();
			maintenanceDate.value = AccessoCarUtils.formatDate(new Date());
			closeForm();
			showMessage(`Manutenção ${record?.id || ""} registrada com sucesso.`.trim());
			await refresh();
		} catch (error) {
			showMessage(`Não foi possível registrar a manutenção: ${error.message}`, true);
		}
	});
	tableBody.addEventListener("click", async (event) => {
		const button = event.target.closest("[data-release-vehicle]");
		if (!button) return;
		if (!button.dataset.maintenanceId) return;
		const route = API_ROUTES.releaseMaintenance.replace(":id", encodeURIComponent(button.dataset.maintenanceId));
		try {
			await request("releaseMaintenance", { url: route, method: "PATCH" });
			showMessage("Manutenção concluída e veículo liberado.");
			await refresh();
		} catch (error) {
			showMessage(`Não foi possível liberar o veículo: ${error.message}`, true);
		}
	});

	const sidebar = document.querySelector("#sidebar");
	const menuToggle = document.querySelector("#menu-toggle");
	menuToggle.addEventListener("click", () => {
		const isOpen = sidebar.classList.toggle("is-open");
		menuToggle.setAttribute("aria-expanded", String(isOpen));
		menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
	});
	refresh();
})();
