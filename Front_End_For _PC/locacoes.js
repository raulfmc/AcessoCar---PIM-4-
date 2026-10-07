(() => {
	"use strict";

	const form = document.querySelector("#rental-form");
	const newRentalSection = document.querySelector("#new-rental-section");
	const showRentalFormButton = document.querySelector("#show-rental-form");
	const cancelRentalFormButton = document.querySelector("#cancel-rental-form");
	const pageMessage = document.querySelector("#page-message");
	const customerSelect = document.querySelector("#customer-select");
	const customerId = document.querySelector("#customer-id");
	const customerContact = document.querySelector("#customer-contact");
	const vehicleSelect = document.querySelector("#vehicle-select");
	const vehiclePlate = document.querySelector("#vehicle-plate");
	const dailyRate = document.querySelector("#daily-rate");
	const startDate = document.querySelector("#start-date");
	const returnDate = document.querySelector("#return-date");
	const rentalDays = document.querySelector("#rental-days");
	const rentalTotal = document.querySelector("#rental-total");
	const paymentMethod = document.querySelector("#payment-method");
	const installmentCount = document.querySelector("#installment-count");
	const installmentsField = document.querySelector("#installments-field");
	const firstDueField = document.querySelector("#first-due-field");
	const firstDueDate = document.querySelector("#first-due-date");
	const message = document.querySelector("#rental-message");
	const tableBody = document.querySelector("#rental-table-body");
	const recentCount = document.querySelector("#recent-count");
	const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
	const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "UTC" });
	let lastPaymentMethod = paymentMethod.value;

	function setTheme(isLight) {
		document.documentElement.dataset.theme = isLight ? "light" : "dark";
		const toggle = document.querySelector("#theme-toggle");
		toggle.checked = isLight;
		toggle.setAttribute("aria-label", isLight ? "Ativar tema escuro" : "Ativar tema claro");
		document.querySelector("#theme-label").textContent = isLight ? "Tema claro" : "Tema escuro";
	}

	function displayDate(value) {
		return value ? dateFormatter.format(new Date(`${value}T00:00:00Z`)) : "—";
	}

	function createCell(text, className = "") {
		const cell = document.createElement("td");
		cell.textContent = text;
		if (className) cell.className = className;
		return cell;
	}

	function populateFormOptions() {
		const state = AccessoCarData.read();
		const selectedCustomer = customerSelect.value;
		const selectedVehicle = vehicleSelect.value;
		customerSelect.replaceChildren(new Option("Selecione ou pesquise pelo nome", ""));
		state.customers.forEach((customer) => {
			customerSelect.add(new Option(`${customer.name} · ${customer.id}`, customer.id));
		});
		customerSelect.value = selectedCustomer;

		vehicleSelect.replaceChildren(new Option("Selecione um veículo disponível", ""));
		state.vehicles.filter((vehicle) => vehicle.status === "available").forEach((vehicle) => {
			vehicleSelect.add(new Option(`${vehicle.name} · ${vehicle.plate}`, vehicle.id));
		});
		if (state.vehicles.some((vehicle) => vehicle.id === selectedVehicle && vehicle.status === "available")) {
			vehicleSelect.value = selectedVehicle;
		}
		updateCustomerDetails();
		updateVehicleDetails();
	}

	function updateCustomerDetails() {
		const state = AccessoCarData.read();
		const customer = state.customers.find((item) => item.id === customerSelect.value);
		customerId.value = customer ? `${customer.cid} · ${customer.id}` : "";
		if (!customer) {
			customerContact.value = "";
			return;
		}
		const installments = state.installments.filter((item) => item.customerId === customer.id && item.status !== "paid");
		const hasOverdue = installments.some((item) => item.status === "overdue");
		const situation = hasOverdue ? "Em atraso" : installments.length ? "Com parcelas pendentes" : "Regular";
		customerContact.value = `${situation} · ${installments.length} parcela(s) em aberto`;
	}

	function updateVehicleDetails() {
		const vehicle = AccessoCarData.read().vehicles.find((item) => item.id === vehicleSelect.value && item.status === "available");
		vehiclePlate.value = vehicle ? vehicle.plate : "";
		dailyRate.value = vehicle ? currency.format(vehicle.dailyRate) : "";
		updatePrice();
	}

	function updatePrice() {
		if (!startDate.value || !returnDate.value || returnDate.value <= startDate.value) {
			rentalDays.value = "";
			rentalTotal.value = "";
			return;
		}
		const start = new Date(`${startDate.value}T12:00:00`);
		const end = new Date(`${returnDate.value}T12:00:00`);
		const days = Math.round((Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) - Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) / 86400000);
		const vehicle = AccessoCarData.read().vehicles.find((item) => item.id === vehicleSelect.value && item.status === "available");
		rentalDays.value = String(days);
		rentalTotal.value = vehicle ? currency.format(days * vehicle.dailyRate) : "";
	}

	function updatePaymentFields() {
		const isInstallment = paymentMethod.value === "Parcelado";
		const paymentMethodChanged = lastPaymentMethod !== paymentMethod.value;
		installmentCount.disabled = !isInstallment;
		installmentsField.classList.toggle("is-muted", !isInstallment);
		firstDueField.hidden = !isInstallment;
		if (isInstallment && startDate.value && (!firstDueDate.value || paymentMethodChanged)) {
			firstDueDate.value = AccessoCarData.addDays(startDate.value, 30);
		}
		if (!isInstallment && startDate.value) firstDueDate.value = startDate.value;
		lastPaymentMethod = paymentMethod.value;
	}

	function renderRentals() {
		const state = AccessoCarData.read();
		const customerById = new Map(state.customers.map((customer) => [customer.id, customer]));
		const vehicleById = new Map(state.vehicles.map((vehicle) => [vehicle.id, vehicle]));
		const rentals = state.rentals.filter((rental) => rental.status === "active")
			.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
		tableBody.replaceChildren();
		if (rentals.length === 0) {
			const row = document.createElement("tr");
			const cell = createCell("Nenhum carro está locado no momento.", "empty-cell");
			cell.colSpan = 8;
			row.append(cell);
			tableBody.append(row);
		} else {
			rentals.forEach((rental) => {
				const customer = customerById.get(rental.customerId);
				const vehicle = vehicleById.get(rental.vehicleId);
				const row = document.createElement("tr");
				row.append(
					createCell(rental.id, "table-id"),
					createCell(customer ? customer.name : "Cliente não encontrado", "table-primary"),
					createCell(vehicle ? vehicle.name : "Veículo não encontrado"),
					createCell(vehicle ? vehicle.plate : "—", "table-id"),
					createCell(displayDate(rental.startDate)),
					createCell(displayDate(rental.returnDate)),
					createCell(currency.format(rental.total), "table-value")
				);
				const statusCell = document.createElement("td");
				const badge = document.createElement("span");
				badge.className = "status-badge status-active";
				badge.textContent = rental.status === "active" ? "ATIVA" : "ENCERRADA";
				statusCell.append(badge);
				row.append(statusCell);
				tableBody.append(row);
			});
		}
		recentCount.textContent = `${rentals.length} ${rentals.length === 1 ? "carro locado" : "carros locados"}`;
	}

	document.querySelector("#theme-toggle").addEventListener("change", (event) => {
		setTheme(event.currentTarget.checked);
		localStorage.setItem("acessocar-theme", event.currentTarget.checked ? "light" : "dark");
	});
	setTheme(localStorage.getItem("acessocar-theme") === "light");

	const sidebar = document.querySelector("#sidebar");
	const menuToggle = document.querySelector("#menu-toggle");
	menuToggle.addEventListener("click", () => {
		const isOpen = sidebar.classList.toggle("is-open");
		menuToggle.setAttribute("aria-expanded", String(isOpen));
		menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
	});

	showRentalFormButton.addEventListener("click", () => {
		pageMessage.hidden = true;
		newRentalSection.hidden = false;
		form.hidden = false;
		showRentalFormButton.setAttribute("aria-expanded", "true");
		newRentalSection.scrollIntoView({ behavior: "smooth", block: "start" });
		customerSelect.focus();
	});

	cancelRentalFormButton.addEventListener("click", () => {
		form.reset();
		message.textContent = "";
		newRentalSection.hidden = true;
		form.hidden = true;
		showRentalFormButton.setAttribute("aria-expanded", "false");
	});

	const today = AccessoCarData.formatDate(new Date());
	startDate.value = today;
	startDate.addEventListener("change", () => {
		returnDate.min = startDate.value;
		if (!returnDate.value || returnDate.value <= startDate.value) returnDate.value = AccessoCarData.addDays(startDate.value, 1);
		if (paymentMethod.value === "Parcelado") firstDueDate.value = AccessoCarData.addDays(startDate.value, 30);
		updatePrice();
		updatePaymentFields();
	});
	returnDate.addEventListener("change", updatePrice);
	customerSelect.addEventListener("change", updateCustomerDetails);
	vehicleSelect.addEventListener("change", updateVehicleDetails);
	paymentMethod.addEventListener("change", updatePaymentFields);
	installmentCount.addEventListener("change", updatePaymentFields);

	form.addEventListener("submit", (event) => {
		event.preventDefault();
		message.classList.remove("is-error");
		try {
			const rental = AccessoCarData.createRental({
				customerId: customerSelect.value,
				vehicleId: vehicleSelect.value,
				startDate: startDate.value,
				returnDate: returnDate.value,
				paymentMethod: paymentMethod.value,
				installments: paymentMethod.value === "Parcelado" ? Number(installmentCount.value) : 1,
				firstDueDate: paymentMethod.value === "Parcelado" ? firstDueDate.value : startDate.value,
				notes: document.querySelector("#rental-notes").value
			});
			pageMessage.textContent = `Locação ${rental.id} registrada. O veículo foi reservado e as parcelas estão no Financeiro.`;
			pageMessage.hidden = false;
			form.reset();
			startDate.value = AccessoCarData.formatDate(new Date());
			returnDate.value = AccessoCarData.addDays(startDate.value, 1);
			returnDate.min = startDate.value;
			installmentCount.value = "2";
			updatePaymentFields();
			populateFormOptions();
			updatePrice();
			renderRentals();
			newRentalSection.hidden = true;
			form.hidden = true;
			showRentalFormButton.setAttribute("aria-expanded", "false");
		} catch (error) {
			message.textContent = error.message;
			message.classList.add("is-error");
		}
	});

	populateFormOptions();
	returnDate.value = AccessoCarData.addDays(today, 1);
	returnDate.min = today;
	updatePaymentFields();
	updatePrice();
	renderRentals();
	window.addEventListener("accessocar:data-changed", () => {
		populateFormOptions();
		renderRentals();
		updatePrice();
	});
	window.addEventListener("storage", (event) => {
		if (event.key === "accessocar-management-v1") {
			populateFormOptions();
			renderRentals();
			updatePrice();
		}
	});
})();
