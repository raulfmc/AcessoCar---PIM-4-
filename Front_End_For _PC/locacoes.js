(() => {
	"use strict";

	// A API deve validar disponibilidade e gerar a locação/parcelas no POST.
	const API_BASE_URL = "";
	const API_ROUTES = {
		customers: "",
		vehicles: "",
		rentals: "",
		createRental: ""
	};
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
	let customers = [];
	let vehicles = [];
	let rentals = [];

	async function request(routeName, options = {}) {
		const route = options.url || API_ROUTES[routeName];
		if (!API_BASE_URL.trim() || !route.trim()) {
			throw new Error(`Configure API_BASE_URL e API_ROUTES.${routeName} em locacoes.js.`);
		}
		const { url, ...fetchOptions } = options;
		const response = await fetch(`${API_BASE_URL.replace(/\/+$/, "")}/${route.replace(/^\/+/, "")}`, {
			...fetchOptions,
			credentials: "include",
			headers: { ...(fetchOptions.body ? { "Content-Type": "application/json" } : {}), ...fetchOptions.headers }
		});
		const text = await response.text();
		const body = text ? JSON.parse(text) : null;
		if (!response.ok) throw new Error(body?.message || `A API respondeu com HTTP ${response.status}.`);
		return body?.data ?? body;
	}

	async function loadData() {
		const [customerData, vehicleData, rentalData] = await Promise.all([
			request("customers"),
			request("vehicles"),
			request("rentals")
		]);
		if (!Array.isArray(customerData) || !Array.isArray(vehicleData) || !Array.isArray(rentalData)) {
			throw new Error("As rotas de clientes, veículos e locações devem retornar listas (ou { data: lista }).");
		}
		customers = customerData;
		vehicles = vehicleData;
		rentals = rentalData;
	}

	function setTheme(isLight) {
		document.documentElement.dataset.theme = isLight ? "light" : "dark";
		const toggle = document.querySelector("#theme-toggle");
		toggle.checked = isLight;
		toggle.setAttribute("aria-label", isLight ? "Ativar tema escuro" : "Ativar tema claro");
		document.querySelector("#theme-label").textContent = isLight ? "Tema claro" : "Tema escuro";
	}

	function displayDate(value) {
		if (!value) return "—";
		const date = new Date(`${value}T00:00:00Z`);
		return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
	}

	function createCell(text, className = "") {
		const cell = document.createElement("td");
		cell.textContent = text;
		if (className) cell.className = className;
		return cell;
	}

	function getCompatibleVehicles(customer) {
		return vehicles.filter((vehicle) =>
			vehicle.status === "available"
			&& AccessoCarUtils.bodyRegionsAreCompatible(customer?.bodyRegions || [], vehicle.bodyRegions || [])
		);
	}

	function populateFormOptions() {
		const selectedCustomerId = customerSelect.value;
		const selectedVehicleId = vehicleSelect.value;
		customerSelect.replaceChildren(new Option("Selecione ou pesquise pelo nome", ""));
		customers.forEach((customer) => customerSelect.add(new Option(`${customer.name} · ${customer.id}`, customer.id)));
		customerSelect.value = selectedCustomerId;
		const customer = customers.find((item) => item.id === selectedCustomerId);
		const compatibleVehicles = getCompatibleVehicles(customer);
		vehicleSelect.replaceChildren(new Option(customer ? "Selecione um veículo compatível" : "Selecione um veículo disponível", ""));
		compatibleVehicles.forEach((vehicle) => vehicleSelect.add(new Option(`${vehicle.name} · ${vehicle.plate}`, vehicle.id)));
		vehicleSelect.value = compatibleVehicles.some((vehicle) => vehicle.id === selectedVehicleId) ? selectedVehicleId : "";
		updateCustomerDetails();
		updateVehicleDetails();
	}

	function updateCustomerDetails() {
		const customer = customers.find((item) => item.id === customerSelect.value);
		customerId.value = customer ? `${customer.cpf || customer.cid || "—"} · ${customer.id}` : "";
		customerContact.value = customer
			? AccessoCarUtils.normalizeBodyRegions(customer.bodyRegions || [])
				.map((part) => AccessoCarUtils.BODY_PARTS.find((item) => item.key === part)?.label || part)
				.join(", ")
			: "";
	}

	function updateVehicleDetails() {
		const vehicle = vehicles.find((item) => item.id === vehicleSelect.value && item.status === "available");
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
		const vehicle = vehicles.find((item) => item.id === vehicleSelect.value && item.status === "available");
		rentalDays.value = String(days);
		rentalTotal.value = vehicle ? currency.format(days * vehicle.dailyRate) : "";
	}

	function updatePaymentFields() {
		const isInstallment = paymentMethod.value === "Parcelado";
		const changed = lastPaymentMethod !== paymentMethod.value;
		installmentCount.disabled = !isInstallment;
		installmentsField.classList.toggle("is-muted", !isInstallment);
		firstDueField.hidden = !isInstallment;
		if (isInstallment && startDate.value && (!firstDueDate.value || changed)) {
			firstDueDate.value = AccessoCarUtils.addDays(startDate.value, 30);
		}
		if (!isInstallment && startDate.value) firstDueDate.value = startDate.value;
		lastPaymentMethod = paymentMethod.value;
	}

	function renderRentals() {
		const customerById = new Map(customers.map((customer) => [customer.id, customer]));
		const vehicleById = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));
		const activeRentals = rentals.filter((rental) => rental.status === "active")
			.sort((first, second) => String(second.createdAt || "").localeCompare(String(first.createdAt || "")));
		tableBody.replaceChildren();
		if (activeRentals.length === 0) {
			const row = document.createElement("tr");
			const cell = createCell("Nenhum carro está locado no momento.", "empty-cell");
			cell.colSpan = 8;
			row.append(cell);
			tableBody.append(row);
		} else {
			activeRentals.forEach((rental) => {
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
				badge.textContent = "ATIVA";
				statusCell.append(badge);
				row.append(statusCell);
				tableBody.append(row);
			});
		}
		recentCount.textContent = `${activeRentals.length} ${activeRentals.length === 1 ? "carro locado" : "carros locados"}`;
	}

	async function refreshPage() {
		try {
			await loadData();
			populateFormOptions();
			renderRentals();
			pageMessage.hidden = true;
			showRentalFormButton.disabled = false;
			return true;
		} catch (error) {
			pageMessage.textContent = `Não foi possível carregar as locações: ${error.message}`;
			pageMessage.hidden = false;
			showRentalFormButton.disabled = true;
			return false;
		}
	}

	setTheme(localStorage.getItem("acessocar-theme") === "light");
	document.querySelector("#theme-toggle").addEventListener("change", (event) => {
		setTheme(event.currentTarget.checked);
		localStorage.setItem("acessocar-theme", event.currentTarget.checked ? "light" : "dark");
	});
	const sidebar = document.querySelector("#sidebar");
	const menuToggle = document.querySelector("#menu-toggle");
	menuToggle.addEventListener("click", () => {
		const isOpen = sidebar.classList.toggle("is-open");
		menuToggle.setAttribute("aria-expanded", String(isOpen));
		menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
	});
	showRentalFormButton.disabled = true;
	showRentalFormButton.addEventListener("click", () => {
		message.textContent = "";
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
	startDate.value = AccessoCarUtils.formatDate(new Date());
	returnDate.value = AccessoCarUtils.addDays(startDate.value, 1);
	returnDate.min = startDate.value;
	startDate.addEventListener("change", () => {
		returnDate.min = startDate.value;
		if (!returnDate.value || returnDate.value <= startDate.value) returnDate.value = AccessoCarUtils.addDays(startDate.value, 1);
		if (paymentMethod.value === "Parcelado") firstDueDate.value = AccessoCarUtils.addDays(startDate.value, 30);
		updatePrice();
		updatePaymentFields();
	});
	returnDate.addEventListener("change", updatePrice);
	customerSelect.addEventListener("change", () => {
		updateCustomerDetails();
		populateFormOptions();
	});
	vehicleSelect.addEventListener("change", updateVehicleDetails);
	paymentMethod.addEventListener("change", updatePaymentFields);
	installmentCount.addEventListener("change", updatePaymentFields);
	form.addEventListener("submit", async (event) => {
		event.preventDefault();
		message.classList.remove("is-error");
		if (!form.reportValidity()) return;
		const payload = {
			customerId: customerSelect.value,
			vehicleId: vehicleSelect.value,
			startDate: startDate.value,
			returnDate: returnDate.value,
			paymentMethod: paymentMethod.value,
			installments: paymentMethod.value === "Parcelado" ? Number(installmentCount.value) : 1,
			firstDueDate: paymentMethod.value === "Parcelado" ? firstDueDate.value : startDate.value,
			notes: document.querySelector("#rental-notes").value.trim()
		};
		try {
			const rental = await request("createRental", { method: "POST", body: JSON.stringify(payload) });
			form.reset();
			startDate.value = AccessoCarUtils.formatDate(new Date());
			returnDate.value = AccessoCarUtils.addDays(startDate.value, 1);
			returnDate.min = startDate.value;
			installmentCount.value = "2";
			updatePaymentFields();
			newRentalSection.hidden = true;
			form.hidden = true;
			showRentalFormButton.setAttribute("aria-expanded", "false");
			const refreshed = await refreshPage();
			if (refreshed) {
				pageMessage.textContent = `Locação ${rental?.id || ""} cadastrada com sucesso.`.trim();
				pageMessage.hidden = false;
			}
		} catch (error) {
			message.textContent = `Não foi possível registrar a locação: ${error.message}`;
			message.classList.add("is-error");
		}
	});

	updatePaymentFields();
	updatePrice();
	refreshPage();
})();
