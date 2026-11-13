(() => {
	"use strict";

	// Listas retornam arrays; confirmPayment usa :id e recebe status/paidAt.

	const API_ROUTES = {
		customers: "/api/Cliente",
		installments: "/api/Parcela",
		financeiro: "/api/Financeiro"

	};
	const customerTableBody = document.querySelector("#customer-table-body");
	const installmentTableBody = document.querySelector("#installment-table-body");
	const overview = document.querySelector("#customer-overview");
	const detail = document.querySelector("#customer-detail");
	const searchInput = document.querySelector("#installment-search");
	const rentalFilter = document.querySelector("#rental-filter");
	const periodStart = document.querySelector("#period-start");
	const periodEnd = document.querySelector("#period-end");
	const paymentDialog = document.querySelector("#payment-dialog");
	const confirmPaymentButton = document.querySelector("#confirm-payment-button");
	const dialogError = document.querySelector("#dialog-error");
	const main = document.querySelector(".main-content");
	const statusMessage = document.createElement("p");
	statusMessage.className = "api-error-message";
	statusMessage.setAttribute("role", "alert");
	statusMessage.hidden = true;
	main.insertBefore(statusMessage, main.querySelector("section"));
	const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
	const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "UTC" });
	const requestedStatus = new URLSearchParams(window.location.search).get("filter");
	const activeStatus = ["ATRASADO", "PENDENTE"].includes(requestedStatus) ? requestedStatus : "PENDENTE";
	let selectedCustomerId = null;
	let selectedInstallmentId = null;
	let customers = [];
	let installments = [];
	let finanças = [];

	async function request(routeName, options = {}) {
		const route = options.url || API_ROUTES[routeName];
		if (!API_BASE_URL.trim() || !route.trim()) {
			throw new Error(`Configure API_BASE_URL e API_ROUTES.${routeName} em financeiro.js.`);
		}
		const { url, ...fetchOptions } = options;
		const response = await fetchProtegido(`${API_BASE_URL.replace(/\/+$/, "")}/${route.replace(/^\/+/, "")}`, {
			...fetchOptions,

			headers: { ...(fetchOptions.body ? { "Content-Type": "application/json" } : {}), ...fetchOptions.headers }
		});
		const text = await response.text();
		const body = text ? JSON.parse(text) : null;
		if (!response.ok) throw new Error(body?.message || `A API respondeu com HTTP ${response.status}.`);
		return body?.data ?? body;
	}

	async function loadData() {
		const [customerData, installmentData, financeData] = await Promise.all([
			request("customers"),
			request("installments"),
			request("financeiro")

		]);
		if (!Array.isArray(customerData) || !Array.isArray(installmentData || !Array.isArray(fin))) {
			throw new Error("As rotas de clientes e parcelas devem retornar listas (ou { data: lista }).");
		}
		customers = customerData;
		installments = installmentData;
		finanças = financeData;
		return { customers, installments, finanças };
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
		const date = new Date(value);
		return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
	}

	function createCell(text, className = "") {
		const cell = document.createElement("td");
		cell.textContent = text;
		if (className) cell.className = className;
		return cell;
	}

	function getFilters() {
		return {
			search: searchInput.value.trim().toLocaleLowerCase("pt-BR"),
			aluguel_ID: rentalFilter.value.trim().toLocaleLowerCase("pt-BR"),
			data_Inicio: periodStart.value,
			data_Fim: periodEnd.value
		};
	}

	function installmentsForCustomer(customerId) {
		const filters = getFilters();
		return installments.filter((item) =>
			item.id === customerId
			&& (activeStatus === "PENDENTE" ? item.estado !== "OK" : item.estado === activeStatus)
			&& (!filters.aluguel_ID || String(item.aluguel_Id).toLocaleLowerCase("pt-BR").includes(filters.aluguel_ID))
			&& (!filters.data_Inicio || item.data_Vencimento >= filters.data_Inicio)
			&& (!filters.data_Fim || item.data_Vencimento <= filters.data_Fim)
		);
	}

	function getCustomerRows() {
		const filters = getFilters();
		return finanças.filter((finance) => {
			const customer = customers.find(
				(item) => item.id === finance.clienteID
			);

			const searchable = `
            ${finance.clienteNome}
            ${finance.clienteID}
            ${customer?.cpf || ""}
        `.toLocaleLowerCase("pt-BR");

			return (!filters.search || searchable.includes(filters.search))
				&& (!filters.startDate ||
					finance.proxVencimento >= filters.startDate)
				&& (!filters.endDate ||
					finance.proxVencimento <= filters.endDate);
		});
	}

	function renderCustomerList() {
		const rows = getCustomerRows();
		customerTableBody.replaceChildren();
		if (rows.length === 0) {
			const row = document.createElement("tr");
			const cell = createCell(activeStatus === "ATRASADO" || "PENDENTE"
				? "Nenhuma pessoa possui parcelas vencidas com estes filtros."
				: "Nenhuma pessoa possui parcelas pendentes com estes filtros.", "empty-cell");
			cell.colSpan = 7;
			row.append(cell);
			customerTableBody.append(row);
		} else {
			rows.forEach((finance) => {
				const row = document.createElement("tr");

				row.append(
					createCell(finance.clienteNome, "table-primary"),
					createCell(
						`${finance.clienteID}`,
						"table-id"
					),
					createCell(String(finance.qtdParcelas)),
					createCell(
						currency.format(finance.valorEmAberto),
						"table-value"
					),
					createCell(displayDate(finance.proxVencimento)),
					createCell("", "status-cell")
				);
				const customerInstallments = installments.filter(
					(item) => Number(item.cliente_ID) === Number(finance.clienteID));
				const hasOverdue = customerInstallments.some((item) => item.estado === "ATRASADO");
				const badge = document.createElement("span");
				const customerStatus = activeStatus === "PENDENTE" && hasOverdue
					? "ATRASADO"
					: activeStatus;

				badge.className = `status-badge ${customerStatus}`;

				badge.textContent = customerStatus === "ATRASADO"
					? "PENDENTE / ATRASADO"
					: "PENDENTE";
				row.children[5].append(badge);
				const actionCell = document.createElement("td");
				const viewButton = document.createElement("button");
				viewButton.className = "confirm-button";
				viewButton.type = "button";
				viewButton.dataset.viewCustomer = finance.clienteID;
				viewButton.textContent = "Visualizar parcelas";
				actionCell.append(viewButton);
				row.append(actionCell);
				customerTableBody.append(row);
			});
		}
		document.querySelector("#installment-count").textContent = `${rows.length} ${rows.length === 1 ? "pessoa" : "pessoas"}`;
	}

	function renderCustomerDetail() {
		if (!selectedCustomerId) return;
		const customer = customers.find((item) => Number(item.id) === Number(selectedCustomerId));
		if (!customer) {
			closeCustomerDetail();
			return;
		}
		const customerInstallments = installmentsForCustomer(selectedCustomerId)
			.sort((first, second) => first.data_Vencimento.localeCompare(second.data_Vencimento));
		document.querySelector("#detail-customer-name").textContent = customer.nome;
		const situation = activeStatus === "ATRASADO" ? "vencidas" : activeStatus === "ATRASADO" ? "OK" : "PENDENTE";
		document.querySelector("#detail-customer-id").textContent = `${customer.cpf || "—"} · ${customer.id} · ${customerInstallments.length} ${customerInstallments.length === 1 ? "parcela" : "parcelas"} ${situation}`;
		installmentTableBody.replaceChildren();
		if (customerInstallments.length === 0) {
			const row = document.createElement("tr");
			const cell = createCell("Não há parcelas nesta situação para esta pessoa.", "empty-cell");
			cell.colSpan = 9;
			row.append(cell);
			installmentTableBody.append(row);
			return;
		}
		customerInstallments.forEach((installment) => {
			const row = document.createElement("tr");
			row.append(
				createCell(installment.id, "table-id"),
				//createCell(installment.rentalId, "table-id"),
				//createCell(`${installment.number}ª`, "table-number"),
				createCell(currency.format(installment.valor), "table-value"),
				createCell(displayDate(installment.data_Vencimento)),
				createCell("", "status-cell"),
				createCell(displayDate(installment.data_Confirmacao)),
				createCell(installment.notes || "—", "table-note")
			);
			const badge = document.createElement("span");
			badge.className = `status-badge status-${installment.estado}`;
			badge.textContent = installment.estado === "ATRASADO" ? "DEVENDO / VENCIDO" : "PENDENTE";
			row.children[5].append(badge);
			const actionCell = document.createElement("td");
			const button = document.createElement("button");
			button.className = "confirm-button";
			button.type = "button";
			button.dataset.confirmInstallment = installment.id;
			button.textContent = "Confirmar pagamento";
			actionCell.append(button);
			row.append(actionCell);
			installmentTableBody.append(row);
		});
	}

	async function render() {
		statusMessage.hidden = true;
		try {
			await loadData();
			console.log("Finanças:", finanças);
			renderCustomerList();
			renderCustomerDetail();
			const unpaid = installments.filter((item) => item.estado !== "OK");
			const overdue = unpaid.filter((item) => item.estado === "ATRASADO");
			document.querySelector("#pending-summary").textContent = String(unpaid.filter((item) => item.estado === "PENDENTE").length);
			document.querySelector("#overdue-summary").textContent = String(overdue.length);
			document.querySelector("#receivable-summary").textContent = currency.format(unpaid.reduce((total, item) => total + item.valor, 0));
		} catch (error) {
			console.error("Erro completo:", error);
			console.trace("Rastreamento do erro:");

			statusMessage.textContent =
				`Não foi possível carregar o financeiro: ${error.message}`;

			statusMessage.hidden = false;

		}
	}

	function openCustomerDetail(customerId) {
		selectedCustomerId = customerId;
		overview.hidden = true;
		detail.hidden = false;
		render();
		detail.scrollIntoView({ behavior: "smooth", block: "start" });
		document.querySelector("#back-to-customers").focus();
	}

	function closeCustomerDetail() {
		selectedCustomerId = null;
		detail.hidden = true;
		overview.hidden = false;
		render();
	}

	function openConfirmation(installmentId) {
		const installment = installments.find((item) => item.id === installmentId);
		const customer = installment && customers.find((item) => item.id === installment.id);
		if (!installment || !customer || installment.estado === "OK") return;
		selectedInstallmentId = installment.id;
		document.querySelector("#dialog-customer").textContent = `${customer.nome} · ${customer.id}`;
		//document.querySelector("#dialog-installment").textContent = `${installment.id} · ${installment.number}ª parcela da locação ${installment.id}`;
		document.querySelector("#dialog-amount").textContent = currency.format(installment.valor);
		dialogError.textContent = "";
		paymentDialog.showModal();
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
	[searchInput, rentalFilter, periodStart, periodEnd].forEach((control) => {
		control.addEventListener("input", render);
		control.addEventListener("change", render);
	});
	customerTableBody.addEventListener("click", (event) => {
		const button = event.target.closest("[data-view-customer]");
		if (button) openCustomerDetail(button.dataset.viewCustomer);
	});
	document.querySelector("#back-to-customers").addEventListener("click", closeCustomerDetail);
	installmentTableBody.addEventListener("click", (event) => {
		const button = event.target.closest("[data-confirm-installment]");
		if (button) openConfirmation(button.dataset.confirmInstallment);
	});
	confirmPaymentButton.addEventListener("click", async () => {
		if (!selectedInstallmentId) return;
		try {
			const route = API_ROUTES.confirmPayment.replace(":id", encodeURIComponent(selectedInstallmentId));
			await request("confirmPayment", {
				url: route,
				method: "PATCH",
				body: JSON.stringify({ status: "OK", paidAt: new Date().toISOString().slice(0, 10) })
			});
			selectedInstallmentId = null;
			paymentDialog.close();
			await render();
		} catch (error) {
			dialogError.textContent = `Não foi possível confirmar o pagamento: ${error.message}`;
		}
	});

	document.querySelector("#installments-title").textContent = activeStatus === "ATRASADO"
		? "Pessoas com pagamentos em atraso"
		: activeStatus === "PENDENTE" ? "Pessoas com valores a receber" : "Pessoas com parcelas pendentes";
	document.querySelector("#finance-description").textContent = activeStatus === "ATRASADO"
		? "As parcelas vencidas aparecem aqui agrupadas por pessoa. Selecione para revisar e confirmar pagamentos."
		: activeStatus === "PENDENTE"
			? "As parcelas ainda não confirmadas aparecem aqui agrupadas por pessoa. Selecione para revisar os valores em aberto."
			: "As parcelas ainda não vencidas aparecem aqui agrupadas por pessoa. Selecione para consultar e confirmar pagamentos.";
	render();
})();
