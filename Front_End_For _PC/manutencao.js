(() => {
	"use strict";

	const themeToggle = document.querySelector("#theme-toggle");
	const themeLabel = document.querySelector("#theme-label");
	const savedTheme = localStorage.getItem("acessocar-theme");
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

	function activeRecordForVehicle(records, vehicleId) {
		return records.find((record) => record.vehicleId === vehicleId && record.status === "active");
	}

	function renderVehicleOptions(state) {
		const previousValue = vehicleSelect.value;
		vehicleSelect.replaceChildren(new Option("Selecione um veículo disponível", ""));
		state.vehicles
			.filter((vehicle) => vehicle.status === "available")
			.forEach((vehicle) => {
				vehicleSelect.add(new Option(`${vehicle.name} · ${vehicle.plate}`, vehicle.id));
			});
		if ([...vehicleSelect.options].some((option) => option.value === previousValue)) {
			vehicleSelect.value = previousValue;
		}
		addButton.disabled = !state.vehicles.some((vehicle) => vehicle.status === "available");
		addButton.title = addButton.disabled ? "Não há veículos disponíveis para encaminhar." : "";
	}

	function renderMaintenance() {
		const state = AccessoCarData.read();
		renderVehicleOptions(state);
		const inMaintenance = state.vehicles.filter((vehicle) => vehicle.status === "maintenance");
		tableBody.replaceChildren();

		if (inMaintenance.length === 0) {
			const row = document.createElement("tr");
			const cell = createCell("Não há veículos em manutenção no momento.", "maintenance-empty");
			cell.colSpan = 7;
			row.append(cell);
			tableBody.append(row);
		} else {
			inMaintenance.forEach((vehicle) => {
				const record = activeRecordForVehicle(state.maintenance, vehicle.id);
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
				releaseButton.textContent = "Liberar veículo";
				releaseButton.setAttribute("aria-label", `Concluir manutenção e liberar ${vehicle.name}`);
				actionCell.append(releaseButton);
				row.append(actionCell);
				tableBody.append(row);
			});
		}

		count.textContent = `${inMaintenance.length} ${inMaintenance.length === 1 ? "veículo" : "veículos"}`;
	}

	function openForm() {
		const state = AccessoCarData.read();
		renderVehicleOptions(state);
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

	setTheme(savedTheme === "light");
	maintenanceDate.value = AccessoCarData.formatDate(new Date());
	renderMaintenance();

	themeToggle.addEventListener("change", () => {
		setTheme(themeToggle.checked);
		localStorage.setItem("acessocar-theme", themeToggle.checked ? "light" : "dark");
	});
	addButton.addEventListener("click", openForm);
	closeButton.addEventListener("click", closeForm);
	maintenanceCost.addEventListener("input", () => {
		maintenanceCost.value = formatCurrencyInput(maintenanceCost.value);
	});

	form.addEventListener("submit", (event) => {
		event.preventDefault();
		if (!form.reportValidity()) return;

		const state = AccessoCarData.read();
		const vehicle = state.vehicles.find((item) => item.id === vehicleSelect.value);
		if (!vehicle || vehicle.status !== "available") {
			showMessage("O veículo selecionado não está mais disponível. Atualize a seleção.", true);
			renderMaintenance();
			return;
		}

		const cost = parseCurrencyInput(maintenanceCost.value);
		const report = form.elements.namedItem("report").value.trim();
		const date = form.elements.namedItem("date").value;
		if (!Number.isFinite(cost) || cost < 0 || !report || !date) {
			showMessage("Informe um valor válido, o motivo e a data da manutenção.", true);
			return;
		}

		const highestNumber = state.maintenance.reduce((highest, record) => {
			const match = /^MAN-(\d{4})-(\d+)$/.exec(record.id);
			return match ? Math.max(highest, Number(match[2])) : highest;
		}, 0);
		const record = {
			id: `MAN-${new Date().getFullYear()}-${String(highestNumber + 1).padStart(3, "0")}`,
			vehicleId: vehicle.id,
			report,
			cost,
			date,
			status: "active",
			createdAt: new Date().toISOString(),
			completedAt: null
		};

		try {
			state.maintenance.push(record);
			vehicle.status = "maintenance";
			AccessoCarData.write(state);
			form.reset();
			maintenanceDate.value = AccessoCarData.formatDate(new Date());
			closeForm();
			showMessage(`Manutenção de ${vehicle.name} registrada com sucesso.`);
			renderMaintenance();
		} catch (error) {
			showMessage(`Não foi possível registrar a manutenção: ${error.message}`, true);
		}
	});

	tableBody.addEventListener("click", (event) => {
		const releaseButton = event.target.closest("[data-release-vehicle]");
		if (!releaseButton) return;

		const state = AccessoCarData.read();
		const vehicle = state.vehicles.find((item) => item.id === releaseButton.dataset.releaseVehicle);
		if (!vehicle || vehicle.status !== "maintenance") return;

		const record = state.maintenance.find((item) => item.id === releaseButton.dataset.maintenanceId);
		if (record) {
			record.status = "completed";
			record.completedAt = new Date().toISOString();
		}
		vehicle.status = "available";

		try {
			AccessoCarData.write(state);
			showMessage(`${vehicle.name} foi liberado e está disponível para locação.`);
			renderMaintenance();
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

	window.addEventListener("accessocar:data-changed", renderMaintenance);
	window.addEventListener("storage", (event) => {
		if (event.key === "accessocar-management-v1") renderMaintenance();
	});
})();
