const CUSTOMER_CREATE_PAGE = "CadastroCliente.html";

// Troque estes registros demonstrativos pelos dados recebidos do banco de dados.
let customers = [
	{ id: "CLI-001", name: "Ana Beatriz Lima", cid: "CID-8401", vehiclePlate: null, status: "ok", paymentStatus: "paid" },
	{ id: "CLI-002", name: "Bruno Martins", cid: "CID-8402", vehiclePlate: "FRT-2A41", status: "rented", paymentStatus: "paid" },
	{ id: "CLI-003", name: "Camila Ferreira", cid: "CID-8403", vehiclePlate: null, status: "owing", paymentStatus: "pending" },
	{ id: "CLI-004", name: "Diego Nascimento", cid: "CID-8404", vehiclePlate: "GKN-5B27", status: "owing", paymentStatus: "overdue" },
	{ id: "CLI-005", name: "Elisa Carvalho", cid: "CID-8405", vehiclePlate: "MTQ-9C14", status: "rented", paymentStatus: "paid" },
	{ id: "CLI-006", name: "Felipe Ribeiro", cid: "CID-8406", vehiclePlate: null, status: "ok", paymentStatus: "paid" },
	{ id: "CLI-007", name: "Gabriela Souza", cid: "CID-8407", vehiclePlate: null, status: "owing", paymentStatus: "pending" },
	{ id: "CLI-008", name: "Henrique Alves", cid: "CID-8408", vehiclePlate: null, status: "owing", paymentStatus: "overdue" },
	{ id: "CLI-009", name: "Isabela Rocha", cid: "CID-8409", vehiclePlate: "PRX-4D83", status: "rented", paymentStatus: "paid" },
	{ id: "CLI-010", name: "João Pedro Costa", cid: "CID-8410", vehiclePlate: null, status: "ok", paymentStatus: "paid" },
	{ id: "CLI-011", name: "Karen Oliveira", cid: "CID-8411", vehiclePlate: "LVB-7E62", status: "owing", paymentStatus: "pending" },
	{ id: "CLI-012", name: "Leonardo Mendes", cid: "CID-8412", vehiclePlate: null, status: "ok", paymentStatus: "paid" }
];

const statusLabels = {
	ok: { label: "OK", className: "status-ok" },
	rented: { label: "LOCADO", className: "status-rented" },
	owing: { label: "DEVENDO", className: "status-owing" }
};

const themeToggle = document.querySelector("#theme-toggle");
const themeLabel = document.querySelector("#theme-label");
const savedTheme = localStorage.getItem("acessocar-theme");
const tableBody = document.querySelector("#customer-table-body");
const customerCount = document.querySelector("#customer-count");
const filterButtons = document.querySelectorAll(".filter-button");
const newCustomerLink = document.querySelector("#new-customer-link");
const requestedFilter = new URLSearchParams(window.location.search).get("filter");
let activeFilter = ["pending", "overdue"].includes(requestedFilter) ? requestedFilter : "all";

function updateActiveFilterButton() {
	filterButtons.forEach((button) => {
		const isActive = button.dataset.filter === activeFilter;
		button.classList.toggle("is-active", isActive);
		button.setAttribute("aria-pressed", String(isActive));
	});
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

function renderCustomers() {
	const visibleCustomers = customers.filter((customer) => {
		return activeFilter === "all" || customer.paymentStatus === activeFilter;
	});
	tableBody.replaceChildren();

	if (visibleCustomers.length === 0) {
		const row = document.createElement("tr");
		const cell = createCell("Nenhum cliente encontrado para este filtro.", "customer-empty");
		cell.colSpan = 6;
		row.append(cell);
		tableBody.append(row);
	} else {
		visibleCustomers.forEach((customer) => {
			const row = document.createElement("tr");
			const status = statusLabels[customer.status];
			row.append(
				createCell(customer.id, "customer-id"),
				createCell(customer.name, "customer-name"),
				createCell(customer.cid, "customer-cid"),
				createCell(customer.vehiclePlate || "—", "customer-plate")
			);

			const statusCell = document.createElement("td");
			const statusBadge = document.createElement("span");
			statusBadge.className = `status-badge ${status.className}`;
			statusBadge.textContent = status.label;
			statusCell.append(statusBadge);
			row.append(statusCell);

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

	const customerWord = visibleCustomers.length === 1 ? "cliente" : "clientes";
	customerCount.textContent = `${visibleCustomers.length} ${customerWord}`;
}

setTheme(savedTheme === "light");
newCustomerLink.href = CUSTOMER_CREATE_PAGE;
updateActiveFilterButton();
renderCustomers();

themeToggle.addEventListener("change", () => {
	setTheme(themeToggle.checked);
	localStorage.setItem("acessocar-theme", themeToggle.checked ? "light" : "dark");
});

filterButtons.forEach((button) => {
	button.addEventListener("click", () => {
		activeFilter = button.dataset.filter;
		updateActiveFilterButton();
		renderCustomers();
	});
});

tableBody.addEventListener("click", (event) => {
	const deleteButton = event.target.closest("[data-delete-customer]");
	if (!deleteButton) return;

	const customer = customers.find((item) => item.id === deleteButton.dataset.deleteCustomer);
	if (!customer || !window.confirm(`Deseja excluir o cliente ${customer.name}?`)) return;

	customers = customers.filter((item) => item.id !== customer.id);
	renderCustomers();
});

const sidebar = document.querySelector("#sidebar");
const menuToggle = document.querySelector("#menu-toggle");

menuToggle.addEventListener("click", () => {
	const isOpen = sidebar.classList.toggle("is-open");
	menuToggle.setAttribute("aria-expanded", String(isOpen));
	menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
});