const dashboardData = {
    revenue: "R$ 25.400,00",
    receivableClients: 8,
    overdueClients: 3,
    availableCars: 8,
    rentedCars: 4,
    carsInMaintenance: 2,
    monthlyRevenue: [
        { month: "Abril", value: 15400 },
        { month: "Maio", value: 18700 },
        { month: "Junho", value: 16300 },
        { month: "Julho", value: 22400 },
        { month: "Agosto", value: 20800 },
        { month: "Setembro", value: 25400 }
    ]
};

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
    document.querySelector("#revenue-value").textContent = dashboardData.revenue;
    document.querySelector("#receivable-count").textContent = String(dashboardData.receivableClients).padStart(2, "0");
    document.querySelector("#overdue-count").textContent = String(dashboardData.overdueClients).padStart(2, "0");
    document.querySelector("#available-count").textContent = String(dashboardData.availableCars).padStart(2, "0");
    document.querySelector("#rented-count").textContent = String(dashboardData.rentedCars).padStart(2, "0");
    document.querySelector("#maintenance-count").textContent = String(dashboardData.carsInMaintenance).padStart(2, "0");

    const chart = document.querySelector("#revenue-chart");
    const chartDescription = document.querySelector("#chart-description");
    const highestRevenue = Math.max(...dashboardData.monthlyRevenue.map((item) => item.value));
    const formatCurrency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

    dashboardData.monthlyRevenue.forEach((item) => {
        const column = document.createElement("div");
        column.className = "chart-column";

        const bar = document.createElement("span");
        bar.className = "chart-bar";
        bar.style.setProperty("--bar-height", `${Math.max(12, (item.value / highestRevenue) * 100)}%`);

        const month = document.createElement("span");
        month.className = "chart-month";
        month.textContent = item.month;

        column.append(bar, month);
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