(() => {
	"use strict";


	const API_ROUTES = {
		dashboard: "/api/Dashboard"
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

		console.log("Rota encontrada:", route);

		if (!route) {
			throw new Error(`Rota "${routeName}" não encontrada em API_ROUTES.`);
		}

		if (!API_BASE_URL.trim() || !route.trim()) {
			throw new Error(`Configure API_BASE_URL e API_ROUTES.${routeName} em PG_HOME.js.`);
		}

		const response = await fetchProtegido(`${API_BASE_URL.replace(/\/+$/, "")}/${route.replace(/^\/+/, "")}`, {
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
		console.log("Dashboard iniciado");
		console.log("URL base:", API_BASE_URL);
		console.log("Função protegida:", typeof fetchProtegido);
		statusMessage.hidden = true;
		try {

			const summary = await request("dashboard");
			console.log("Dashboard recebido:", summary);
			console.log("Pagamentos mensais:", summary.pagamentoMensal);
			const formatCurrency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
			const values = {
				parcelasPendentes: requireNumber(summary, "parcelasPendentes"),
				//pagamentosPendentes: requireNumber(summary, "pagamentosPendentes"),
				totalPendente: requireNumber(summary, "totalPendente"),
				clientes: requireNumber(summary, "clientes"),
				parcelasVencidas: requireNumber(summary, "parcelasVencidas"),
				totalAtrasado: requireNumber(summary, "totalAtrasado"),
				parcelasConfirmadas: requireNumber(summary, "parcelasConfirmadas"),
				locacoesAtivas: requireNumber(summary, "locacoesAtivas"),
				carrosDisponiveis: requireNumber(summary, "carrosDisponiveis"),
				carrosLocados: requireNumber(summary, "carrosLocados"),
				carrosManutencao: requireNumber(summary, "carrosManutencao")
			};

			document.querySelector("#pending-count").textContent = String(values.parcelasPendentes);
			//document.querySelector("#receivable-count").textContent = String(values.pagamentosPendentes);
			document.querySelector("#receivable-total").textContent = formatCurrency.format(values.totalPendente);
			document.querySelector("#overdue-count").textContent = String(values.clientes);
			document.querySelector("#overdue-installment-count").textContent = String(values.parcelasVencidas);
			document.querySelector("#overdue-total").textContent = formatCurrency.format(values.totalAtrasado);
			document.querySelector("#confirmed-count").textContent = String(values.parcelasConfirmadas);
			document.querySelector("#active-rentals").textContent = String(values.locacoesAtivas);
			document.querySelector("#available-count").textContent = String(values.carrosDisponiveis);
			document.querySelector("#rented-count").textContent = String(values.carrosLocados);
			document.querySelector("#maintenance-count").textContent = String(values.carrosManutencao);

			if (!Array.isArray(summary.pagamentoMensal)) {
				throw new Error('A resposta da rota de dashboard deve conter "monthlyPayments" como uma lista.');
			}
			renderRevenueChart(summary.pagamentoMensal, formatCurrency);
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
		const highestRevenue = Math.max(1, ...payments.map((payment) => payment.valor));
		payments.forEach((payment) => {
			if (typeof payment.mes !== "string" || typeof payment.valor !== "number" || !Number.isFinite(payment.valor)) {
				throw new Error('Cada item de "monthlyPayments" deve conter "month" (texto) e "value" (número).');
			}
			const column = document.createElement("div");
			column.className = "chart-column";
			column.tabIndex = 0;
			column.setAttribute("role", "listitem");
			const bar = document.createElement("span");
			bar.className = "chart-bar";
			bar.hidden = payment.valor === 0;
			bar.style.setProperty("--bar-height", payment.valor > 0 ? `${Math.max(12, (payment.valor / highestRevenue) * 100)}%` : "0%");
			const month = document.createElement("span");
			month.className = "chart-month";
			month.textContent = payment.mes;
			const tooltip = document.createElement("span");
			tooltip.className = "chart-tooltip";
			tooltip.textContent = `${payment.mes}: ${formatCurrency.format(payment.valor)}`;
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
