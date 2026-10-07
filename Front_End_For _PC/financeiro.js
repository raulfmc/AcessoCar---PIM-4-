(() => {
	"use strict";

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
	const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
	const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "UTC" });
	const requestedStatus = new URLSearchParams(window.location.search).get("filter");
	const activeStatus = ["overdue", "unpaid"].includes(requestedStatus) ? requestedStatus : "pending";
	let selectedCustomerId = null;
	let selectedInstallmentId = null;

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

	function getFilters() {
		return {
			search: searchInput.value.trim().toLocaleLowerCase("pt-BR"),
			rentalId: rentalFilter.value.trim().toLocaleLowerCase("pt-BR"),
			startDate: periodStart.value,
			endDate: periodEnd.value
		};
	}

	function getCustomerRows(state) {
		const filters = getFilters();
		return state.customers.map((customer) => {
			const installments = state.installments.filter((item) =>
				item.customerId === customer.id
				&& (activeStatus === "unpaid" ? item.status !== "paid" : item.status === activeStatus)
				&& (!filters.rentalId || item.rentalId.toLocaleLowerCase("pt-BR").includes(filters.rentalId))
				&& (!filters.startDate || item.dueDate >= filters.startDate)
				&& (!filters.endDate || item.dueDate <= filters.endDate)
			);
			return { customer, installments };
		}).filter(({ customer, installments }) => {
			if (installments.length === 0) return false;
			if (!filters.search) return true;
			const searchable = `${customer.name} ${customer.id} ${installments.map((item) => `${item.id} ${item.rentalId}`).join(" ")}`.toLocaleLowerCase("pt-BR");
			return searchable.includes(filters.search);
		}).sort((first, second) => first.customer.name.localeCompare(second.customer.name, "pt-BR"));
	}

	function renderCustomerList(state) {
		const rows = getCustomerRows(state);
		customerTableBody.replaceChildren();
		if (rows.length === 0) {
			const row = document.createElement("tr");
			const cell = createCell(activeStatus === "overdue"
				? "Nenhuma pessoa possui parcelas vencidas com estes filtros."
				: "Nenhuma pessoa possui parcelas pendentes com estes filtros.", "empty-cell");
			cell.colSpan = 7;
			row.append(cell);
			customerTableBody.append(row);
		} else {
			rows.forEach(({ customer, installments }) => {
				const row = document.createElement("tr");
				const total = installments.reduce((sum, installment) => sum + installment.amount, 0);
				const nextDue = installments.reduce((earliest, installment) =>
					!earliest || installment.dueDate < earliest ? installment.dueDate : earliest, "");
				row.append(
					createCell(customer.name, "table-primary"),
					createCell(`${customer.cid} · ${customer.id}`, "table-id"),
					createCell(String(installments.length)),
					createCell(currency.format(total), "table-value"),
					createCell(displayDate(nextDue)),
					createCell("", "status-cell")
				);
				const badge = document.createElement("span");
				const hasOverdueInstallment = installments.some((installment) => installment.status === "overdue");
				const customerStatus = activeStatus === "unpaid" && !hasOverdueInstallment ? "pending" : activeStatus;
				badge.className = `status-badge status-${customerStatus}`;
				badge.textContent = customerStatus === "overdue" ? "DEVENDO / VENCIDO" : activeStatus === "unpaid" ? "EM ABERTO" : "PENDENTE";
				row.children[5].append(badge);

				const actionCell = document.createElement("td");
				const viewButton = document.createElement("button");
				viewButton.className = "confirm-button";
				viewButton.type = "button";
				viewButton.dataset.viewCustomer = customer.id;
				viewButton.textContent = "Visualizar parcelas";
				actionCell.append(viewButton);
				row.append(actionCell);
				customerTableBody.append(row);
			});
		}
		document.querySelector("#installment-count").textContent =
			`${rows.length} ${rows.length === 1 ? "pessoa" : "pessoas"}`;
	}

	function renderCustomerDetail(state) {
		if (!selectedCustomerId) return;
		const customer = state.customers.find((item) => item.id === selectedCustomerId);
		if (!customer) {
			closeCustomerDetail();
			return;
		}
		const filters = getFilters();
		const installments = state.installments
			.filter((item) =>
				item.customerId === selectedCustomerId
				&& (activeStatus === "unpaid" ? item.status !== "paid" : item.status === activeStatus)
				&& (!filters.rentalId || item.rentalId.toLocaleLowerCase("pt-BR").includes(filters.rentalId))
				&& (!filters.startDate || item.dueDate >= filters.startDate)
				&& (!filters.endDate || item.dueDate <= filters.endDate)
			)
			.sort((first, second) => first.dueDate.localeCompare(second.dueDate));
		document.querySelector("#detail-customer-name").textContent = customer.name;
		const detailSituation = activeStatus === "overdue" ? "vencidas" : activeStatus === "unpaid" ? "em aberto" : "pendentes";
		document.querySelector("#detail-customer-id").textContent = `${customer.cid} · ${customer.id} · ${installments.length} ${installments.length === 1 ? "parcela" : "parcelas"} ${detailSituation}`;
		installmentTableBody.replaceChildren();
		if (installments.length === 0) {
			const row = document.createElement("tr");
			const cell = createCell("Não há parcelas nesta situação para esta pessoa.", "empty-cell");
			cell.colSpan = 9;
			row.append(cell);
			installmentTableBody.append(row);
			return;
		}

		installments.forEach((installment) => {
			const row = document.createElement("tr");
			row.append(
				createCell(installment.id, "table-id"),
				createCell(installment.rentalId, "table-id"),
				createCell(`${installment.number}ª`, "table-number"),
				createCell(currency.format(installment.amount), "table-value"),
				createCell(displayDate(installment.dueDate)),
				createCell("", "status-cell"),
				createCell(displayDate(installment.paidAt)),
				createCell(installment.notes || "—", "table-note")
			);
			const badge = document.createElement("span");
			badge.className = `status-badge status-${installment.status}`;
			badge.textContent = installment.status === "overdue" ? "DEVENDO / VENCIDO" : "PENDENTE";
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

	function render() {
		const state = AccessoCarData.read();
		renderCustomerList(state);
		renderCustomerDetail(state);

		const summary = AccessoCarData.summarize(state);
		document.querySelector("#pending-summary").textContent = String(summary.pendingInstallments);
		document.querySelector("#overdue-summary").textContent = String(summary.overdueInstallments);
		document.querySelector("#receivable-summary").textContent = currency.format(summary.receivableTotal);

		const overdueLink = document.querySelector('.nav-submenu a[href="financeiro.html?filter=overdue"]');
		const installmentsLink = document.querySelector('.nav-submenu a[href="financeiro.html"]');
		overdueLink.classList.toggle("is-active", activeStatus === "overdue");
		installmentsLink.classList.toggle("is-active", activeStatus !== "overdue");
		overdueLink.toggleAttribute("aria-current", activeStatus === "overdue");
		installmentsLink.toggleAttribute("aria-current", activeStatus !== "overdue");
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
		const state = AccessoCarData.read();
		const installment = state.installments.find((item) => item.id === installmentId);
		const customer = installment && state.customers.find((item) => item.id === installment.customerId);
		if (!installment || !customer || installment.status === "paid") return;
		selectedInstallmentId = installment.id;
		document.querySelector("#dialog-customer").textContent = `${customer.name} · ${customer.id}`;
		document.querySelector("#dialog-installment").textContent = `${installment.id} · ${installment.number}ª parcela da locação ${installment.rentalId}`;
		document.querySelector("#dialog-amount").textContent = currency.format(installment.amount);
		dialogError.textContent = "";
		paymentDialog.showModal();
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
	confirmPaymentButton.addEventListener("click", () => {
		if (!selectedInstallmentId) return;
		try {
			AccessoCarData.confirmPayment(selectedInstallmentId);
			selectedInstallmentId = null;
			paymentDialog.close();
			render();
		} catch (error) {
			dialogError.textContent = error.message;
		}
	});

	document.querySelector("#installments-title").textContent = activeStatus === "overdue"
		? "Pessoas com pagamentos em atraso"
		: activeStatus === "unpaid" ? "Pessoas com valores a receber" : "Pessoas com parcelas pendentes";
	document.querySelector("#finance-description").textContent = activeStatus === "overdue"
		? "As parcelas vencidas aparecem aqui agrupadas por pessoa. Selecione para revisar e confirmar pagamentos."
		: activeStatus === "unpaid"
			? "As parcelas ainda não confirmadas aparecem aqui agrupadas por pessoa. Selecione para revisar os valores em aberto."
			: "As parcelas ainda não vencidas aparecem aqui agrupadas por pessoa. Selecione para consultar e confirmar pagamentos.";

	render();
	window.addEventListener("accessocar:data-changed", render);
	window.addEventListener("storage", (event) => {
		if (event.key === "accessocar-management-v1") render();
	});
})();
