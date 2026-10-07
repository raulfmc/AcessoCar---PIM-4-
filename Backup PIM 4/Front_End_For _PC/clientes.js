const CUSTOMER_CREATE_PAGE = "CadastroCliente.html";

async function loadCustomers() {
	const resposta = await fetch('http://localhost:5104/api/Cliente');
        
        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        customers = await resposta.json();
	//const dados = await resposta.json();

    console.log("Clientes recebidos da API:", customers);

    return customers;
}

let customers = loadCustomers();

//Puxar o status do banco, vai ter que ter condições pro front saber as labels de acordo com o status do banco
const statusLabels = {
	ok: { label: "OK", className: "status-ok" },
	rented: { label: "LOCADO", className: "status-rented" },
	pending: { label: "PENDENTE", className: "status-pending" },
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

async function renderCustomers() {
	customers = await loadCustomers();
    
	console.log("customers:", customers);
    console.log("É array?", Array.isArray(customers));
	const visibleCustomers = customers.filter((customer) => {
		return activeFilter === "all"
			|| (activeFilter === "pending" && customer.hasPending)
			|| (activeFilter === "overdue" && customer.hasOverdue);
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
			//const status = statusLabels[customer.status];
			row.append(
				createCell(customer.id, "id"),
				createCell(customer.nome, "nome"),
				createCell(customer.cpf, "cpf"),
				createCell(customer.telefone, "telefone"),
				createCell(customer.email, "email"),
				createCell(customer.endereco, "endereco"),

				//createCell(customer.vehiclePlate || "—", "customer-plate")
			);

			const statusCell = document.createElement("td");
			const statusBadge = document.createElement("span");
			// statusBadge.className = `status-badge ${status.className}`;
			// statusBadge.textContent = status.label;
			// statusCell.append(statusBadge);
			// row.append(statusCell);

			const actionsCell = document.createElement("td");
			const deleteButton = document.createElement("button");
			deleteButton.className = "customer-delete";
			deleteButton.type = "button";
			deleteButton.dataset.deleteCustomer = customer.id;
			deleteButton.setAttribute("aria-label", `Excluir cliente ${customer.nome}`);
			deleteButton.title = `Excluir ${customer.nome}`;
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
renderCustomers().catch((erro) => {
    console.error("Erro ao carregar clientes:", erro);
});

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

	const state = AccessoCarData.read();
	const hasRentalHistory = state.rentals.some((rental) => rental.cliente_id === customer.id)
		|| state.installments.some((installment) => installment.cliente_id === customer.id);
	if (hasRentalHistory) {
		window.alert("Este cliente possui registros financeiros ou de locação e não pode ser excluído.");
		return;
	}
	state.customers = state.customers.filter((item) => item.ID !== customer.ID);
	AccessoCarData.write(state);
});

const sidebar = document.querySelector("#sidebar");
const menuToggle = document.querySelector("#menu-toggle");

menuToggle.addEventListener("click", () => {
	const isOpen = sidebar.classList.toggle("is-open");
	menuToggle.setAttribute("aria-expanded", String(isOpen));
	menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
});

window.addEventListener("accessocar:data-changed", renderCustomers);
window.addEventListener("storage", (event) => {
	if (event.key === "accessocar-management-v1") renderCustomers();
});