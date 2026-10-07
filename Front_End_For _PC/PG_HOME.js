const themeToggle = document.querySelector("#theme-toggle");
const themeLabel = document.querySelector("#theme-label");
const savedTheme = localStorage.getItem("acessocar-theme");

function setTheme(isLight) {
    document.documentElement.dataset.theme = isLight ? "light" : "dark";
    themeToggle.checked = isLight;
    themeToggle.setAttribute("aria-label", isLight ? "Ativar tema escuro" : "Ativar tema claro");
    themeLabel.textContent = isLight ? "Tema claro" : "Tema escuro";
}

function renderDashboard() {
    const formatCurrency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
    const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "long" });
    const state = AccessoCarData.read();
    const summary = AccessoCarData.summarize(state);
    const availableCars = state.vehicles.filter((vehicle) => vehicle.status === "available").length;
    const rentedCars = state.vehicles.filter((vehicle) => vehicle.status === "rented").length;
    const maintenanceCars = state.vehicles.filter((vehicle) => vehicle.status === "maintenance").length;

    document.querySelector("#pending-count").textContent = String(summary.pendingInstallments);
    document.querySelector("#receivable-count").textContent = String(summary.pendingInstallments + summary.overdueInstallments);
    document.querySelector("#receivable-total").textContent = formatCurrency.format(summary.receivableTotal);
    document.querySelector("#overdue-count").textContent = String(summary.overdueCustomers).padStart(2, "0");
    document.querySelector("#overdue-installment-count").textContent = String(summary.overdueInstallments);
    document.querySelector("#overdue-total").textContent = formatCurrency.format(summary.overdueTotal);
    document.querySelector("#confirmed-count").textContent = String(summary.confirmedPayments);
    document.querySelector("#active-rentals").textContent = String(summary.activeRentals);
    document.querySelector("#available-count").textContent = String(availableCars).padStart(2, "0");
    document.querySelector("#rented-count").textContent = String(rentedCars).padStart(2, "0");
    document.querySelector("#maintenance-count").textContent = String(maintenanceCars).padStart(2, "0");

    const chart = document.querySelector("#revenue-chart");
    const chartDescription = document.querySelector("#chart-description");
    chart.replaceChildren();
    chartDescription.replaceChildren();
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, index) => new Date(now.getFullYear(), now.getMonth() - 5 + index, 1, 12));
    const monthlyPayments = months.map((month) => {
        const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
        const value = state.installments
            .filter((installment) => installment.status === "paid" && installment.paidAt && installment.paidAt.slice(0, 7) === key)
            .reduce((total, installment) => total + installment.amount, 0);
        const label = monthFormatter.format(month);
        return { month: label.charAt(0).toLocaleUpperCase("pt-BR") + label.slice(1), value };
    });
    const highestRevenue = Math.max(1, ...monthlyPayments.map((item) => item.value));
    monthlyPayments.forEach((item, index) => {
        const column = document.createElement("div");
        column.className = "chart-column";
        column.tabIndex = 0;
        column.setAttribute("role", "listitem");

        const bar = document.createElement("span");
        bar.className = "chart-bar";
        bar.style.setProperty("--bar-height", `${Math.max(12, (item.value / highestRevenue) * 100)}%`);

        const month = document.createElement("span");
        month.className = "chart-month";
        month.textContent = item.month;

        const tooltip = document.createElement("span");
        tooltip.className = "chart-tooltip";

        const tooltipMonth = document.createElement("strong");
        tooltipMonth.textContent = item.month;

        const tooltipRevenue = document.createElement("span");
        tooltipRevenue.textContent = formatCurrency.format(item.value);

        const previousMonth = monthlyPayments[index - 1];
        const tooltipVariation = document.createElement("span");
        if (previousMonth) {
            if (previousMonth.value === 0) {
                tooltipVariation.textContent = item.value > 0 ? `Recebimentos iniciados vs. ${previousMonth.month}` : `Sem recebimentos confirmados vs. ${previousMonth.month}`;
            } else {
                const variation = ((item.value - previousMonth.value) / previousMonth.value) * 100;
                const direction = variation > 0 ? "aumento" : variation < 0 ? "queda" : "sem variação";
                tooltipVariation.textContent = `${direction} de ${Math.abs(variation).toFixed(1).replace(".", ",")}% vs. ${previousMonth.month}`;
            }
        } else {
            tooltipVariation.textContent = "Início do período";
        }

        tooltip.append(tooltipMonth, tooltipRevenue, tooltipVariation);
        column.setAttribute("aria-label", `${item.month}: ${formatCurrency.format(item.value)}; ${tooltipVariation.textContent}`);
        column.append(bar, month, tooltip);
        chart.append(column);

        const description = document.createElement("li");
        description.textContent = `${item.month}: ${formatCurrency.format(item.value)}`;
        chartDescription.append(description);
    });
}

setTheme(savedTheme === "light");
renderDashboard();

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

window.addEventListener("accessocar:data-changed", renderDashboard);
window.addEventListener("storage", (event) => {
    if (event.key === "accessocar-management-v1") renderDashboard();
});