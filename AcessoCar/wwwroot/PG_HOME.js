(() => {
	"use strict";

	// A rota deve retornar os indicadores e monthlyPayments; veja API-INTEGRATION.md.
	const API_BASE_URL = "";
	const API_ROUTES = {
		dashboard: ""
	};
	const themeToggle = document.querySelector("#theme-toggle");
	const themeLabel = document.querySelector("#theme-label");
	const main = document.querySelector(".main-content");
	const statusMessage = document.createElement("p");
	statusMessage.className = "api-error-message";
	statusMessage.setAttribute("role", "alert");
	statusMessage.hidden = true;
	main.insertBefore(statusMessage, main.querySelector("section"));

	async function request(routeName) {
		const route = API_ROUTES[routeName];
		if (!API_BASE_URL.trim() || !route.trim()) {
			throw new Error(`Configure API_BASE_URL e API_ROUTES.${routeName} em PG_HOME.js.`);
		}

		const response = await fetch(`${API_BASE_URL.replace(/\/+$/, "")}/${route.replace(/^\/+/, "")}`, {
			credentials: "include"
		});
		const body = await response.json();
		if (!response.ok) {
			throw new Error(body.message || `A API respondeu com HTTP ${response.status}.`);
		}
		return body.data ?? body;
	}

	function setTheme(isLight) {
		document.documentElement.dataset.theme = isLight ? "light" : "dark";
		themeToggle.checked = isLight;
		themeToggle.setAttribute("aria-label", isLight ? "Ativar tema escuro" : "Ativar tema claro");
		themeLabel.textContent = isLight ? "Tema claro" : "Tema escuro";
	}

	function requireNumber(data, key) {
		if (typeof data[key] !== "number" || !Number.isFinite(data[key])) {
			throw new Error(`A resposta da rota de dashboard deve conter o campo numérico "${key}".`);
		}
		return data[key];
	}

	async function renderDashboard() {
		statusMessage.hidden = true;
		try {
			const summary = await request("dashboard");
			const formatCurrency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
			const values = {
				pendingInstallments: requireNumber(summary, "pendingInstallments"),
				receivableCount: requireNumber(summary, "receivableCount"),
				receivableTotal: requireNumber(summary, "receivableTotal"),
				overdueCustomers: requireNumber(summary, "overdueCustomers"),
				overdueInstallments: requireNumber(summary, "overdueInstallments"),
				overdueTotal: requireNumber(summary, "overdueTotal"),
				confirmedPayments: requireNumber(summary, "confirmedPayments"),
				activeRentals: requireNumber(summary, "activeRentals"),
				availableVehicles: requireNumber(summary, "availableVehicles"),
				rentedVehicles: requireNumber(summary, "rentedVehicles"),
				maintenanceVehicles: requireNumber(summary, "maintenanceVehicles")
			};

			document.querySelector("#pending-count").textContent = String(values.pendingInstallments);
			document.querySelector("#receivable-count").textContent = String(values.receivableCount);
			document.querySelector("#receivable-total").textContent = formatCurrency.format(values.receivableTotal);
			document.querySelector("#overdue-count").textContent = String(values.overdueCustomers);
			document.querySelector("#overdue-installment-count").textContent = String(values.overdueInstallments);
			document.querySelector("#overdue-total").textContent = formatCurrency.format(values.overdueTotal);
			document.querySelector("#confirmed-count").textContent = String(values.confirmedPayments);
			document.querySelector("#active-rentals").textContent = String(values.activeRentals);
			document.querySelector("#available-count").textContent = String(values.availableVehicles);
			document.querySelector("#rented-count").textContent = String(values.rentedVehicles);
			document.querySelector("#maintenance-count").textContent = String(values.maintenanceVehicles);

			if (!Array.isArray(summary.monthlyPayments)) {
				throw new Error('A resposta da rota de dashboard deve conter "monthlyPayments" como uma lista.');
			}
			renderRevenueChart(summary.monthlyPayments, formatCurrency);
		} catch (error) {
			statusMessage.textContent = `Não foi possível carregar os indicadores: ${error.message}`;
			statusMessage.hidden = false;
		}
	}

	function renderRevenueChart(payments, formatCurrency) {
		const chart = document.querySelector("#revenue-chart");
		const chartDescription = document.querySelector("#chart-description");
		chart.replaceChildren();
		chartDescription.replaceChildren();
		const highestRevenue = Math.max(1, ...payments.map((payment) => payment.value));
		payments.forEach((payment) => {
			if (typeof payment.month !== "string" || typeof payment.value !== "number" || !Number.isFinite(payment.value)) {
				throw new Error('Cada item de "monthlyPayments" deve conter "month" (texto) e "value" (número).');
			}
			const column = document.createElement("div");
			column.className = "chart-column";
			column.tabIndex = 0;
			column.setAttribute("role", "listitem");
			const bar = document.createElement("span");
			bar.className = "chart-bar";
			bar.hidden = payment.value === 0;
			bar.style.setProperty("--bar-height", payment.value > 0 ? `${Math.max(12, (payment.value / highestRevenue) * 100)}%` : "0%");
			const month = document.createElement("span");
			month.className = "chart-month";
			month.textContent = payment.month;
			const tooltip = document.createElement("span");
			tooltip.className = "chart-tooltip";
			tooltip.textContent = `${payment.month}: ${formatCurrency.format(payment.value)}`;
			column.setAttribute("aria-label", tooltip.textContent);
			column.append(bar, month, tooltip);
			chart.append(column);
			const description = document.createElement("li");
			description.textContent = tooltip.textContent;
			chartDescription.append(description);
		});
	}

	const savedTheme = localStorage.getItem("acessocar-theme");
	setTheme(savedTheme === "light");
	themeToggle.addEventListener("change", () => {
		setTheme(themeToggle.checked);
		localStorage.setItem("acessocar-theme", themeToggle.checked ? "light" : "dark");
	});

	const sidebar = document.querySelector("#sidebar");
	const menuToggle = document.querySelector("#menu-toggle");
	menuToggle.addEventListener("click", () => {
		const isOpen = sidebar.classList.toggle("is-open");
		menuToggle.setAttribute("aria-expanded", String(isOpen));
		menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
	});

	renderDashboard();
})();
