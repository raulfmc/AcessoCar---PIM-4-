let vehicles = [];

const statusLabels = {
	available: { label: "DISPONÍVEL", className: "vehicle-status-available" },
	rented: { label: "LOCADO", className: "vehicle-status-rented" },
	maintenance: { label: "EM MANUTENÇÃO", className: "vehicle-status-maintenance" },
	unavailable: { label: "INDISPONÍVEL", className: "vehicle-status-unavailable" }
};

const themeToggle = document.querySelector("#theme-toggle");
const themeLabel = document.querySelector("#theme-label");
const savedTheme = localStorage.getItem("acessocar-theme");
const tableBody = document.querySelector("#vehicle-table-body");
const vehicleCount = document.querySelector("#vehicle-count");
const filterButtons = document.querySelectorAll(".vehicle-filter-button");
let activeFilter = "all";

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

function renderVehicles() {
	vehicles = AccessoCarData.read().vehicles;
	const visibleVehicles = vehicles.filter((vehicle) => activeFilter === "all" || vehicle.status === activeFilter);
	tableBody.replaceChildren();

	if (visibleVehicles.length === 0) {
		const row = document.createElement("tr");
		const cell = createCell("Nenhum veículo encontrado para este filtro.", "vehicle-empty");
		cell.colSpan = 8;
		row.append(cell);
		tableBody.append(row);
	} else {
		visibleVehicles.forEach((vehicle) => {
			const row = document.createElement("tr");
			const status = statusLabels[vehicle.status];
			row.append(
				createCell(vehicle.id, "vehicle-id"),
				createCell(vehicle.name, "vehicle-name"),
				createCell(vehicle.plate, "vehicle-plate"),
				createCell(vehicle.year, "vehicle-year"),
				createCell(vehicle.category),
				createCell(vehicle.dailyRate.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), "vehicle-price")
			);

			const statusCell = document.createElement("td");
			const statusBadge = document.createElement("span");
			statusBadge.className = `vehicle-status ${status.className}`;
			statusBadge.textContent = status.label;
			statusCell.append(statusBadge);
			row.append(statusCell);

			const actionsCell = document.createElement("td");
			const deleteButton = document.createElement("button");
			deleteButton.className = "vehicle-delete";
			deleteButton.type = "button";
			deleteButton.dataset.deleteVehicle = vehicle.id;
			deleteButton.setAttribute("aria-label", `Excluir veículo ${vehicle.name}`);
			deleteButton.title = `Excluir ${vehicle.name}`;
			deleteButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3"></path></svg>';
			actionsCell.append(deleteButton);
			row.append(actionsCell);
			tableBody.append(row);
		});
	}

	const vehicleWord = visibleVehicles.length === 1 ? "veículo" : "veículos";
	vehicleCount.textContent = `${visibleVehicles.length} ${vehicleWord}`;
}

setTheme(savedTheme === "light");
renderVehicles();

themeToggle.addEventListener("change", () => {
	setTheme(themeToggle.checked);
	localStorage.setItem("acessocar-theme", themeToggle.checked ? "light" : "dark");
});

filterButtons.forEach((button) => {
	button.addEventListener("click", () => {
		activeFilter = button.dataset.filter;
		filterButtons.forEach((filterButton) => {
			const isActive = filterButton === button;
			filterButton.classList.toggle("is-active", isActive);
			filterButton.setAttribute("aria-pressed", String(isActive));
		});
		renderVehicles();
	});
});

tableBody.addEventListener("click", (event) => {
	const deleteButton = event.target.closest("[data-delete-vehicle]");
	if (!deleteButton) return;

	const vehicle = vehicles.find((item) => item.id === deleteButton.dataset.deleteVehicle);
	if (!vehicle || !window.confirm(`Deseja excluir o veículo ${vehicle.name}?`)) return;

	const state = AccessoCarData.read();
	if (state.rentals.some((rental) => rental.vehicleId === vehicle.id)) {
		window.alert("Este veículo possui registros de locação e não pode ser excluído.");
		return;
	}
	state.vehicles = state.vehicles.filter((item) => item.id !== vehicle.id);
	AccessoCarData.write(state);
});

const sidebar = document.querySelector("#sidebar");
const menuToggle = document.querySelector("#menu-toggle");

menuToggle.addEventListener("click", () => {
	const isOpen = sidebar.classList.toggle("is-open");
	menuToggle.setAttribute("aria-expanded", String(isOpen));
	menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
});

window.addEventListener("accessocar:data-changed", renderVehicles);
window.addEventListener("storage", (event) => {
	if (event.key === "accessocar-management-v1") renderVehicles();
});