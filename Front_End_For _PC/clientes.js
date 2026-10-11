(() => {
	"use strict";

	// Listas devem retornar arrays JSON ou { data: [] }; customerById usa :id.
	const API_BASE_URL = "";
	const API_ROUTES = {
		customers: "",
		installments: "",
		customerById: ""
	};
	const themeToggle = document.querySelector("#theme-toggle");
	const themeLabel = document.querySelector("#theme-label");
	const tableBody = document.querySelector("#customer-table-body");
	const customerCount = document.querySelector("#customer-count");
	const filterButtons = document.querySelectorAll(".filter-button");
	const main = document.querySelector(".main-content");
	const statusMessage = document.createElement("p");
	statusMessage.className = "api-error-message";
	statusMessage.setAttribute("role", "alert");
	statusMessage.hidden = true;
	main.insertBefore(statusMessage, main.querySelector("section"));
	const requestedFilter = new URLSearchParams(window.location.search).get("filter");
	let activeFilter = ["pending", "overdue"].includes(requestedFilter) ? requestedFilter : "all";
	let customers = [];

	async function request(routeName, options = {}) {
		const route = options.url || API_ROUTES[routeName];
		if (!API_BASE_URL.trim() || !route.trim()) {
			throw new Error(`Configure API_BASE_URL e API_ROUTES.${routeName} em clientes.js.`);
		}
		const { url, ...fetchOptions } = options;
		const response = await fetch(`${API_BASE_URL.replace(/\/+$/, "")}/${route.replace(/^\/+/, "")}`, {
			...fetchOptions,
			credentials: "include",
			headers: { ...(fetchOptions.body ? { "Content-Type": "application/json" } : {}), ...fetchOptions.headers }
		});
		const body = response.status === 204 ? null : await response.json();
		if (!response.ok) {
			throw new Error(body?.message || `A API respondeu com HTTP ${response.status}.`);
		}
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

	function readList(data, routeName) {
		if (Array.isArray(data)) return data;
		throw new Error(`A rota API_ROUTES.${routeName} deve retornar uma lista (ou { data: lista }).`);
	}

	async function renderCustomers() {
		statusMessage.hidden = true;
		try {
			const [customerData, installmentData] = await Promise.all([
				request("customers"),
				request("installments")
			]);
			const installments = readList(installmentData, "installments");
			customers = readList(customerData, "customers").map((customer) => {
				const customerInstallments = installments.filter((item) => item.customerId === customer.id && item.status !== "paid");
				return {
					...customer,
					hasPending: customerInstallments.some((item) => item.status === "pending"),
					hasOverdue: customerInstallments.some((item) => item.status === "overdue")
				};
			});

			const visibleCustomers = customers.filter((customer) =>
				activeFilter === "all"
				|| (activeFilter === "pending" && customer.hasPending)
				|| (activeFilter === "overdue" && customer.hasOverdue)
			);
			tableBody.replaceChildren();
			if (visibleCustomers.length === 0) {
				const row = document.createElement("tr");
				const cell = createCell("Nenhum cliente encontrado para este filtro.", "customer-empty");
				cell.colSpan = 5;
				row.append(cell);
				tableBody.append(row);
			} else {
				visibleCustomers.forEach((customer) => {
					const row = document.createElement("tr");
					const bodyCell = document.createElement("td");
					bodyCell.className = "customer-body-cell";
					bodyCell.append(AccessoCarUtils.buildBodyMiniature(customer.bodyRegions || []));
					row.append(
						createCell(customer.id, "customer-id"),
						createCell(customer.name, "customer-name"),
						createCell(customer.cpf || "—", "customer-cid"),
						bodyCell
					);
					const actionsCell = document.createElement("td");
					const deleteButton = document.createElement("button");
					deleteButton.className = "customer-delete";
					deleteButton.type = "button";
					deleteButton.dataset.deleteCustomer = customer.id;
					deleteButton.setAttribute("aria-label", `Excluir cliente ${customer.name}`);
					deleteButton.title = `Excluir ${customer.name}`;
					deleteButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3"></path></svg>';
					actionsCell.append(deleteButton);
					row.append(actionsCell);
					tableBody.append(row);
				});
			}

			customerCount.textContent = `${visibleCustomers.length} ${visibleCustomers.length === 1 ? "cliente" : "clientes"}`;
		} catch (error) {
			statusMessage.textContent = `Não foi possível carregar os clientes: ${error.message}`;
			statusMessage.hidden = false;
		}
	}

	setTheme(localStorage.getItem("acessocar-theme") === "light");
	themeToggle.addEventListener("change", () => {
		setTheme(themeToggle.checked);
		localStorage.setItem("acessocar-theme", themeToggle.checked ? "light" : "dark");
	});
	filterButtons.forEach((button) => {
		const isActive = button.dataset.filter === activeFilter;
		button.classList.toggle("is-active", isActive);
		button.setAttribute("aria-pressed", String(isActive));
		button.addEventListener("click", () => {
			activeFilter = button.dataset.filter;
			filterButtons.forEach((filterButton) => {
				const selected = filterButton === button;
				filterButton.classList.toggle("is-active", selected);
				filterButton.setAttribute("aria-pressed", String(selected));
			});
			renderCustomers();
		});
	});
	tableBody.addEventListener("click", async (event) => {
		const deleteButton = event.target.closest("[data-delete-customer]");
		if (!deleteButton) return;
		const customer = customers.find((item) => item.id === deleteButton.dataset.deleteCustomer);
		if (!customer || !window.confirm(`Deseja excluir o cliente ${customer.name}?`)) return;
		try {
			await request("customerById", {
				method: "DELETE",
				url: API_ROUTES.customerById.replace(":id", encodeURIComponent(customer.id))
			});
			await renderCustomers();
		} catch (error) {
			statusMessage.textContent = `Não foi possível excluir o cliente: ${error.message}`;
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
	renderCustomers();
})();
