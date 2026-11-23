(() => {
	"use strict";

	//A API deve validar disponibilidade e gerar a locação/parcelas no POST.

	const API_ROUTES = {
		clientes: "api/Cliente",
		carros: "api/Carro",
		alugueis: "api/Aluguel",
		Aluguel: "api/Aluguel"
	};
	const form = document.querySelector("#rental-form");
	const newRentalSection = document.querySelector("#new-rental-section");

	const showRentalFormButton = document.querySelector("#show-rental-form");
	const editRentalButton = document.querySelector("#edit-rental-button");
	const cancelRentalFormButton = document.querySelector("#cancel-rental-form");

	const pageMessage = document.querySelector("#page-message");

	const customerSelect = document.querySelector("#customer-select");
	const submitButton = form?.querySelector('[type="submit"]');

	const customerId = document.querySelector("#customer-id");
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

	const currency = new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL"
	});

	const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
		dateStyle: "short",
		timeZone: "UTC"
	});

	const filterButtons = document.querySelectorAll(".vehicle-filter-button");

	let lastPaymentMethod = paymentMethod?.value || "À vista";
	let valorTotalCalculado = 0;

	let customers = [];
	let vehicles = [];
	let rentals = [];

	let activeFilter = "all";
	// const form = document.querySelector("#rental-form");
	// const newRentalSection = document.querySelector("#new-rental-section");
	// const showRentalFormButton = document.querySelector("#show-rental-form");
	// const editRentalButton = document.querySelector("#edit-rental-button");
	// const cancelRentalFormButton = document.querySelector("#cancel-rental-form");
	// const pageMessage = document.querySelector("#page-message");
	// const customerSelect = document.querySelector("#customer-select");
	// const submitButton = form.querySelector('[type="submit"]');
	// const customerId = document.querySelector("#customer-id");
	// //const customerContact = document.querySelector("#customer-contact");
	// const vehicleSelect = document.querySelector("#vehicle-select");
	// const vehiclePlate = document.querySelector("#vehicle-plate");
	// const dailyRate = document.querySelector("#daily-rate");
	// const startDate = document.querySelector("#start-date");
	// const returnDate = document.querySelector("#return-date");
	// const rentalDays = document.querySelector("#rental-days");
	// const rentalTotal = document.querySelector("#rental-total");
	// const paymentMethod = document.querySelector("#payment-method");
	// const installmentCount = document.querySelector("#installment-count");
	// const installmentsField = document.querySelector("#installments-field");
	// const firstDueField = document.querySelector("#first-due-field");
	// const firstDueDate = document.querySelector("#first-due-date");
	// const message = document.querySelector("#rental-message");
	// const tableBody = document.querySelector("#rental-table-body");
	// const recentCount = document.querySelector("#recent-count");
	// const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
	// const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "UTC" });
	// const filterButtons = document.querySelectorAll(".vehicle-filter-button");
	// let lastPaymentMethod = paymentMethod.value;
	// let valorTotalCalculado = 0;
	// let customers = [];
	// let vehicles = [];
	// let rentals = [];
	// let activeFilter = "all";

	async function request(routeName, options = {}) {
		const route = options.url || API_ROUTES[routeName];
		if (!API_BASE_URL.trim() || !route.trim()) {
			throw new Error(`Configure API_BASE_URL e API_ROUTES.${routeName} em locacoes.js.`);
		}
		const { url, ...fetchOptions } = options;
		const response = await fetchProtegido(`${API_BASE_URL.replace(/\/+$/, "")}/${route.replace(/^\/+/, "")}`, {
			...fetchOptions,

			headers: { ...(fetchOptions.body ? { "Content-Type": "application/json" } : {}), ...fetchOptions.headers }
		});
		const text = await response.text();
		const body = text ? JSON.parse(text) : null;
		if (!response.ok) throw new Error(body?.message || body?.detail || `A API respondeu com HTTP ${response.status}.`);
		console.log(body);
		return body?.data ?? body;
	}

	async function loadData() {
		const [customerData, vehicleData, rentalData] = await Promise.all([
			request("clientes"),
			request("carros"),
			request("alugueis")
		]);
		if (!Array.isArray(customerData) || !Array.isArray(vehicleData) || !Array.isArray(rentalData)) {
			throw new Error("As rotas de clientes, veículos e locações devem retornar listas (ou { data: lista }).");
		}
		customers = customerData;
		vehicles = vehicleData;
		rentals = rentalData;
	}
	async function loadFormData() {


		const [customerData, vehicleData] = await Promise.all([
			request("clientes"),
			request("carros")
		]);


		if (!Array.isArray(customerData) || !Array.isArray(vehicleData)) {
			throw new Error("Não foi possível carregar clientes e veículos.");
		}

		customers = customerData;
		vehicles = vehicleData;

		populateFormOptions();
	}
	function setTheme(isLight) {
		document.documentElement.dataset.theme = isLight ? "light" : "dark";

		const toggle = document.querySelector("#theme-toggle");
		const label = document.querySelector("#theme-label");

		if (toggle) {
			toggle.checked = isLight;
			toggle.setAttribute(
				"aria-label",
				isLight ? "Ativar tema escuro" : "Ativar tema claro"
			);
		}

		if (label) {
			label.textContent = isLight ? "Tema claro" : "Tema escuro";
		}
		// document.documentElement.dataset.theme = isLight ? "light" : "dark";
		// const toggle = document.querySelector("#theme-toggle");
		// toggle.checked = isLight;
		// toggle.setAttribute("aria-label", isLight ? "Ativar tema escuro" : "Ativar tema claro");
		// document.querySelector("#theme-label").textContent = isLight ? "Tema claro" : "Tema escuro";
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

	function isVehicleAvailable(vehicle) {
		return ["disponível", "disponivel", "available"].includes(
			String(vehicle?.estado || "").toLocaleLowerCase("pt-BR")
		);
	}

	function findSelectedVehicle() {
		return vehicles.find((vehicle) =>
			String(vehicle.id) === vehicleSelect.value
			&& isVehicleAvailable(vehicle)
		);
	}
	function getCompatibleVehicles() {
		return vehicles.filter(isVehicleAvailable);
	}

	function populateFormOptions() {
		if (!customerSelect || !vehicleSelect) return;

		const selectedCustomerId = customerSelect.value;
		const selectedVehicleId = vehicleSelect.value;

		customerSelect.replaceChildren(
			new Option("Selecione ou pesquise pelo nome", "")
		);

		customers
			.filter(customer => customer.ativo !== false && customer.estado != "ATRASADO")
			.forEach(customer => {
				customerSelect.add(
					new Option(
						`${customer.nome} · ${customer.id}`,
						customer.id
					)
				);
			});

		customerSelect.value = selectedCustomerId;

		const availableVehicles = getCompatibleVehicles();

		vehicleSelect.replaceChildren(
			new Option("Selecione um veículo disponível", "")
		);

		availableVehicles.forEach(vehicle => {
			vehicleSelect.add(
				new Option(
					`${vehicle.marca} ${vehicle.modelo} · ${vehicle.placa}`,
					vehicle.id
				)
			);
		});

		vehicleSelect.value = availableVehicles.some(
			vehicle => String(vehicle.id) === selectedVehicleId
		) ? selectedVehicleId : "";

		updateCustomerDetails();
		updateVehicleDetails();
	}
	// function getCompatibleVehicles(customer) {
	// 	return vehicles.filter((vehicle) =>
	// 		isVehicleAvailable(vehicle)
	// 		&& AccessoCarUtils.bodyRegionsAreCompatible(customer?.bodyRegions || [], vehicle.bodyRegions || [])
	// 	);
	// }

	// function populateFormOptions() {
	// 	const selectedCustomerId = customerSelect.value;
	// 	const selectedVehicleId = vehicleSelect.value;
	// 	customerSelect.replaceChildren(new Option("Selecione ou pesquise pelo nome", ""));
	// 	customers.forEach((customer) => customerSelect.add(new Option(`${customer.nome} · ${customer.id}`, customer.id)));
	// 	customerSelect.value = selectedCustomerId;
	// 	const customer = customers.find((item) => String(item.id) === selectedCustomerId);
	// 	const compatibleVehicles = getCompatibleVehicles(customer);
	// 	vehicleSelect.replaceChildren(new Option(customer ? "Selecione um veículo compatível" : "Selecione um veículo disponível", ""));
	// 	compatibleVehicles.forEach((vehicle) => vehicleSelect.add(new Option(`${vehicle.marca + " " + vehicle.modelo} · ${vehicle.placa}`, vehicle.id)));
	// 	vehicleSelect.value = compatibleVehicles.some((vehicle) => String(vehicle.id) === selectedVehicleId) ? selectedVehicleId : "";
	// 	updateCustomerDetails();
	// 	updateVehicleDetails();
	// }

	function updateCustomerDetails() {
		const customer = customers.find((item) => String(item.id) === customerSelect.value);
		customerId.value = customer ? `${customer.cpf || "—"} · ${customer.id}` : "";
		// customerContact.value = customer
		// 	? AccessoCarUtils.normalizeBodyRegions(customer.bodyRegions || [])
		// 		.map((part) => AccessoCarUtils.BODY_PARTS.find((item) => item.key === part)?.label || part)
		// 		.join(", ")
		// 	: "";


	}

	function updateVehicleDetails() {
		const vehicle = findSelectedVehicle();
		vehiclePlate.value = vehicle ? vehicle.placa : "";
		dailyRate.value = vehicle ? currency.format(vehicle.valor_Diaria) : "";
		updatePrice();

	}

	function updatePrice() {
		if (!startDate.value || !returnDate.value || returnDate.value <= startDate.value) {
			rentalDays.value = "";
			rentalTotal.value = "";
			valorTotalCalculado = 0;
			return;
		}
		const start = new Date(`${startDate.value}T12:00:00`);
		const end = new Date(`${returnDate.value}T12:00:00`);
		const days = Math.round((Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) - Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) / 86400000);
		const vehicle = findSelectedVehicle();
		rentalDays.value = String(days);
		valorTotalCalculado = vehicle ? days * Number(vehicle.valor_Diaria) : 0;
		rentalTotal.value = vehicle ? currency.format(valorTotalCalculado) : "";

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
	const statusLabels = {
		OK: { label: "OK", className: "OK" },
		PENDENTE: { label: "PENDENTE", className: "PENDENTE" },
		ATRASADO: { label: "ATRASADO", className: "ATRASADO" }
	};
	function renderRentals() {
		const customerById = new Map(customers.map((customer) => [customer.id, customer]));
		const vehicleById = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));
		const activeRentals = rentals.filter((rental) => rental.ativo === true)
			.sort((first, second) => String(second.createdAt || "").localeCompare(String(first.createdAt || "")));
		tableBody.replaceChildren();
		if (activeRentals.length === 0) {
			const row = document.createElement("tr");
			const cell = createCell("Nenhum carro está locado no momento.", "empty-cell");
			cell.colSpan = 10;
			row.append(cell);
			tableBody.append(row);
		} else {
			activeRentals.forEach((rental) => {
				const customer = customerById.get(rental.cliente_ID);
				const vehicle = vehicleById.get(rental.carro_ID);
				const row = document.createElement("tr");
				const status = statusLabels[rental.estado] || statusLabels.OK;
				row.append(
					createCell(rental.id, "table-id"),
					createCell(customer ? customer.nome : "Cliente não encontrado", "table-primary"),
					createCell(vehicle ? vehicle.marca + " " + vehicle.modelo : "Veículo não encontrado"),
					createCell(vehicle ? vehicle.placa : "—", "placa"),
					createCell(displayDate(rental.data_Inicio?.split("T")[0])),
					createCell(displayDate(rental.data_Fim?.split("T")[0])),
					createCell(currency.format(rental.valor_Total), "table-value"),
					createCell(rental.parcelas),

				);
				const statusCell = document.createElement("td");
				const badge = document.createElement("span");

				badge.className = `status-badge ${rental.estado}`;
				badge.textContent = status.label;
				statusCell.append(badge);

				const actionsCell = document.createElement("td");
				actionsCell.className = "rental-actions";
				const deleteButton = document.createElement("button");

				deleteButton.className = "vehicle-delete";
				deleteButton.type = "button";
				deleteButton.dataset.deleteRental = rental.id;
				deleteButton.setAttribute("aria-label", `Excluir locação ${rental.id}`);
				deleteButton.title = `Excluir locação ${rental.id}`;

				deleteButton.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7h16M10 11v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3"></path>
    </svg>
`;

				actionsCell.append(deleteButton);
				row.append(statusCell, actionsCell);

				tableBody.append(row);
			});
		}
		recentCount.textContent = `${activeRentals.length} ${activeRentals.length === 1 ? "carro locado" : "carros locados"}`;
	}
	async function refreshPage() {
		try {
			await loadData();

			renderRentals();

			pageMessage.hidden = true;

			showRentalFormButton.disabled = false;
			editRentalButton.disabled = false;

			return true;

		} catch (error) {
			pageMessage.textContent =
				`Não foi possível carregar as locações: ${error.message}`;

			pageMessage.hidden = false;

			showRentalFormButton.disabled = true;
			editRentalButton.disabled = true;

			return false;
		}
	}
	// async function refreshPage() {
	// 	try {
	// 		await loadData();
	// 		populateFormOptions();
	// 		renderRentals();
	// 		pageMessage.hidden = true;
	// 		showRentalFormButton.disabled = false;
	// 		editRentalButton.disabled = false;
	// 		return true;
	// 	} catch (error) {
	// 		pageMessage.textContent = `Não foi possível carregar as locações: ${error.message}`;
	// 		pageMessage.hidden = false;
	// 		showRentalFormButton.disabled = true;
	// 		editRentalButton.disabled = true;
	// 		return false;
	// 	}
	// }

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

	// showRentalFormButton.disabled = true;
	// editRentalButton.disabled = true;
	// showRentalFormButton.addEventListener("click", () => {
	// 	window.location.href = "CadastroLocacao.html";
	// 	resetRentalForm();
	// 	message.textContent = "";
	// 	pageMessage.hidden = true;
	// 	newRentalSection.hidden = false;
	// 	form.hidden = false;
	// 	showRentalFormButton.setAttribute("aria-expanded", "true");
	// 	newRentalSection.scrollIntoView({ behavior: "smooth", block: "start" });
	// 	customerSelect.focus();
	// });
	cancelRentalFormButton?.addEventListener("click", () => {
		if (tableBody) {
			resetRentalForm();

			message.textContent = "";
			newRentalSection.hidden = true;
			form.hidden = true;

			showRentalFormButton.setAttribute("aria-expanded", "false");
		} else {
			window.location.href = "locacoes.html";
		}
	});
	// cancelRentalFormButton.addEventListener("click", () => {
	// 	resetRentalForm();
	// 	message.textContent = "";
	// 	newRentalSection.hidden = true;
	// 	form.hidden = true;
	// 	showRentalFormButton.setAttribute("aria-expanded", "false");
	// });
	function resetRentalForm() {
		form.reset();
		submitButton.textContent = "Confirmar locação";
		customerSelect.disabled = false;
		vehicleSelect.disabled = false;
		paymentMethod.disabled = false;
		installmentCount.disabled = false;
		startDate.value = AccessoCarUtils.formatDate(new Date());
		returnDate.value = AccessoCarUtils.addDays(startDate.value, 1);
		returnDate.min = startDate.value;
		updatePaymentFields();
		updatePrice();
	}


	if (form) {
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
				cliente_ID: customerSelect.value,
				carro_ID: vehicleSelect.value,
				data_Inicio: startDate.value,
				data_Fim: returnDate.value,
				valor_Total: valorTotalCalculado,
				forma_Pagamento: paymentMethod.value,
				parcelas: paymentMethod.value === "Parcelado" ? Number(installmentCount.value) : 1,
				estado: "OK",
				primeiro_Vencimento: paymentMethod.value === "Parcelado" ? firstDueDate.value : startDate.value,
				//notes: document.querySelector("#rental-notes").value.trim()
			};
			try {
				const rental = await request("Aluguel", { method: "POST", body: JSON.stringify(payload) });
				resetRentalForm();
				installmentCount.value = "2";
				updatePaymentFields();
				if (tableBody) {
					newRentalSection.hidden = true;
					form.hidden = true;

					showRentalFormButton.setAttribute("aria-expanded", "false");

					const refreshed = await refreshPage();

					if (refreshed) {
						pageMessage.textContent =
							`Locação ${rental?.id || ""} cadastrada com sucesso.`.trim();

						pageMessage.hidden = false;
					}
				} else {
					window.location.href = "../locacoes.html";
				}
				// newRentalSection.hidden = true;
				// form.hidden = true;
				// showRentalFormButton.setAttribute("aria-expanded", "false");
				// const refreshed = await refreshPage();
				// if (refreshed) {
				// 	pageMessage.textContent = `Locação ${rental?.id || ""} cadastrada com sucesso.`.trim();
				// 	pageMessage.hidden = false;
				// }
			} catch (error) {
				message.textContent = `Não foi possível registrar a locação: ${error.message}`;
				message.classList.add("is-error");
			}
		});
	}


	if (tableBody) {

		// Exclusão de locações.
		tableBody.addEventListener("click", async (event) => {
			const deleteButton = event.target.closest("[data-delete-rental]");

			if (!deleteButton) return;

			const rental = rentals.find(
				item => String(item.id) === deleteButton.dataset.deleteRental
			);

			if (!rental || !window.confirm(
				`Deseja excluir a locação ${rental.id}?`
			)) return;

			try {
				await request("alugueis", {
					method: "DELETE",
					url: `${API_ROUTES.alugueis}/${encodeURIComponent(rental.id)}`
				});

				const refreshed = await refreshPage();

				if (refreshed) {
					pageMessage.textContent =
						`Locação ${rental.id} excluída com sucesso.`;

					pageMessage.hidden = false;
				}

			} catch (error) {
				pageMessage.textContent =
					`Não foi possível excluir a locação: ${error.message}`;

				pageMessage.hidden = false;
			}
		});

		// Edição de locações.
		editRentalButton.addEventListener("click", async () => {
			const rentalId = window.prompt(
				"Digite o ID da locação que deseja editar:"
			);

			if (rentalId === null || rentalId.trim() === "") return;

			if (!/^[1-9]\d*$/.test(rentalId.trim())) {
				window.alert("Informe um ID válido.");
				return;
			}

			const id = rentalId.trim();
			const endpoint = "https://192.168.100.150:7240/api/Aluguel";
			const registroAtivo = await window.Edicao.validarRegistroAtivo(endpoint, id);

			if (!registroAtivo) return;

			if (!valido) return;

			window.location.href =
				`Edicoes/EdicaoLocacao.html?id=${encodeURIComponent(id)}`;
		});

		// Filtros da listagem.
		filterButtons.forEach(button => {
			button.addEventListener("click", () => {
				activeFilter = button.dataset.filter;

				filterButtons.forEach(filterButton => {
					const selected = filterButton === button;

					filterButton.classList.toggle("is-active", selected);

					filterButton.setAttribute(
						"aria-pressed",
						String(selected)
					);
				});

				renderRentals();
			});
		});

	}
	// tableBody.addEventListener("click", async (event) => {
	// 	const deleteButton = event.target.closest("[data-delete-rental]");
	// 	if (!deleteButton) return;
	// 	const rental = rentals.find((item) => String(item.id) === deleteButton.dataset.deleteRental);
	// 	if (!rental || !window.confirm(`Deseja excluir a locação ${rental.id}?`)) return;

	// 	try {
	// 		await request("alugueis", {
	// 			method: "DELETE",
	// 			url: `${API_ROUTES.alugueis}/${encodeURIComponent(rental.id)}`
	// 		});
	// 		const refreshed = await refreshPage();
	// 		if (refreshed) {
	// 			pageMessage.textContent = `Locação ${rental.id} excluída com sucesso.`;
	// 			pageMessage.hidden = false;
	// 		}
	// 	} catch (error) {
	// 		pageMessage.textContent = `Não foi possível excluir a locação: ${error.message}`;
	// 		pageMessage.hidden = false;
	// 	}
	// });

	// editRentalButton.addEventListener("click", () => {
	// 	const rentalId = window.prompt("Digite o ID da locação que deseja editar:");
	// 	if (rentalId === null || rentalId.trim() === "") return;
	// 	if (!/^[1-9]\d*$/.test(rentalId.trim())) {
	// 		window.alert("Informe um ID válido.");
	// 		return;
	// 	}

	// 	const rental = rentals.find((item) => Number(item.id) === Number(rentalId) && item.ativo === true);
	// 	if (!rental) {
	// 		pageMessage.textContent = `Locação ${rentalId} não encontrada.`;
	// 		pageMessage.hidden = false;
	// 		return;
	// 	}

	// 	window.location.href = `EdicaoLocacao.html?id=${encodeURIComponent(rental.id)}`;
	// });

	// filterButtons.forEach((button) => button.addEventListener("click", () => {
	// 	activeFilter = button.dataset.filter;
	// 	filterButtons.forEach((filterButton) => {
	// 		const selected = filterButton === button;
	// 		filterButton.classList.toggle("is-active", selected);
	// 		filterButton.setAttribute("aria-pressed", String(selected));
	// 	});
	// 	renderRentals();
	// }));
	if (form) {

		startDate.value = AccessoCarUtils.formatDate(new Date());

		returnDate.value = AccessoCarUtils.addDays(
			startDate.value,
			1
		);

		returnDate.min = startDate.value;

		updatePaymentFields();
		updatePrice();

		loadFormData().catch(error => {
			message.textContent =
				`Não foi possível carregar os dados: ${error.message}`;

			message.classList.add("is-error");

			console.error(error);
		});

	}

	// Inicialização da página de listagem.
	if (tableBody) {

		showRentalFormButton.disabled = true;
		editRentalButton.disabled = true;

		showRentalFormButton.addEventListener("click", () => {
			window.location.href = "Cadastros/CadastroLocacao.html";
		});

		refreshPage();

	}
	// updatePaymentFields();
	// updatePrice();

	// refreshPage();

})();
