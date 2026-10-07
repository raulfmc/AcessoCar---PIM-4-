(() => {
	"use strict";

	const STORAGE_KEY = "accessocar-management-v1";

	const formatDate = (date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	const addDays = (date, days) => {
		const result = new Date(`${date}T12:00:00`);
		result.setDate(result.getDate() + days);
		return formatDate(result);
	};

	const addMonths = (date, months) => {
		const [year, month, day] = date.split("-").map(Number);
		const targetMonth = month - 1 + months;
		const lastDay = new Date(year, targetMonth + 1, 0).getDate();
		return formatDate(new Date(year, targetMonth, Math.min(day, lastDay), 12));
	};

	const createInitialState = () => {
		const today = formatDate(new Date());
		const year = new Date().getFullYear();
		const customers = [
			{ id: "CLI-001", name: "Ana Beatriz Lima", cid: "CID-8401", vehiclePlate: null },
			{ id: "CLI-002", name: "Bruno Martins", cid: "CID-8402", vehiclePlate: "GKN-5B27" },
			{ id: "CLI-003", name: "Camila Ferreira", cid: "CID-8403", vehiclePlate: null },
			{ id: "CLI-004", name: "Diego Nascimento", cid: "CID-8404", vehiclePlate: null },
			{ id: "CLI-005", name: "Elisa Carvalho", cid: "CID-8405", vehiclePlate: "LVB-7E62" },
			{ id: "CLI-006", name: "Felipe Ribeiro", cid: "CID-8406", vehiclePlate: null },
			{ id: "CLI-007", name: "Gabriela Souza", cid: "CID-8407", vehiclePlate: null },
			{ id: "CLI-008", name: "Henrique Alves", cid: "CID-8408", vehiclePlate: null },
			{ id: "CLI-009", name: "Isabela Rocha", cid: "CID-8409", vehiclePlate: "TDP-1J52" },
			{ id: "CLI-010", name: "João Pedro Costa", cid: "CID-8410", vehiclePlate: null },
			{ id: "CLI-011", name: "Karen Oliveira", cid: "CID-8411", vehiclePlate: null },
			{ id: "CLI-012", name: "Leonardo Mendes", cid: "CID-8412", vehiclePlate: null }
		];
		const vehicles = [
			{ id: "VEI-001", name: "Chevrolet Onix LT", plate: "FRT-2A41", year: "2024", category: "Hatch", dailyRate: 149.9, status: "available" },
			{ id: "VEI-002", name: "Hyundai HB20 Comfort", plate: "GKN-5B27", year: "2023", category: "Hatch", dailyRate: 139.9, status: "rented" },
			{ id: "VEI-003", name: "Jeep Renegade Sport", plate: "MTQ-9C14", year: "2024", category: "SUV", dailyRate: 229.9, status: "maintenance" },
			{ id: "VEI-004", name: "Volkswagen Polo TSI", plate: "PRX-4D83", year: "2023", category: "Hatch", dailyRate: 159.9, status: "available" },
			{ id: "VEI-005", name: "Toyota Corolla GLi", plate: "LVB-7E62", year: "2024", category: "Sedã", dailyRate: 269.9, status: "rented" },
			{ id: "VEI-006", name: "Fiat Argo Drive", plate: "QAZ-8F35", year: "2022", category: "Hatch", dailyRate: 129.9, status: "available" },
			{ id: "VEI-007", name: "Honda HR-V EX", plate: "RMT-3G76", year: "2023", category: "SUV", dailyRate: 249.9, status: "maintenance" },
			{ id: "VEI-008", name: "Renault Kwid Zen", plate: "SBC-6H19", year: "2022", category: "Compacto", dailyRate: 109.9, status: "available" },
			{ id: "VEI-009", name: "Nissan Versa Sense", plate: "TDP-1J52", year: "2024", category: "Sedã", dailyRate: 179.9, status: "rented" },
			{ id: "VEI-010", name: "Fiat Mobi Like", plate: "UFK-4K28", year: "2023", category: "Compacto", dailyRate: 99.9, status: "available" }
		];
		const sampleRentals = [
			{ id: `LOC-${year}-001`, customerId: "CLI-002", vehicleId: "VEI-002", startDate: today, returnDate: addDays(today, 5), days: 5, dailyRate: 139.9, total: 699.5, paymentMethod: "Parcelado", installments: 2, notes: "", status: "active", createdAt: `${today}T09:00:00` },
			{ id: `LOC-${year}-002`, customerId: "CLI-005", vehicleId: "VEI-005", startDate: today, returnDate: addDays(today, 5), days: 5, dailyRate: 269.9, total: 1349.5, paymentMethod: "À vista", installments: 1, notes: "", status: "active", createdAt: `${today}T10:00:00` },
			{ id: `LOC-${year}-003`, customerId: "CLI-009", vehicleId: "VEI-009", startDate: today, returnDate: addDays(today, 5), days: 5, dailyRate: 179.9, total: 899.5, paymentMethod: "Parcelado", installments: 2, notes: "", status: "active", createdAt: `${today}T11:00:00` }
		];
		const installments = [
			{ id: `PAR-${year}-001`, customerId: "CLI-002", rentalId: `LOC-${year}-001`, number: 1, amount: 349.75, dueDate: addDays(today, -1), status: "overdue", paidAt: null, notes: "" },
			{ id: `PAR-${year}-002`, customerId: "CLI-002", rentalId: `LOC-${year}-001`, number: 2, amount: 349.75, dueDate: addDays(today, 30), status: "pending", paidAt: null, notes: "" },
			{ id: `PAR-${year}-003`, customerId: "CLI-005", rentalId: `LOC-${year}-002`, number: 1, amount: 1349.5, dueDate: addDays(today, 7), status: "pending", paidAt: null, notes: "" },
			{ id: `PAR-${year}-004`, customerId: "CLI-009", rentalId: `LOC-${year}-003`, number: 1, amount: 449.75, dueDate: addDays(today, 14), status: "pending", paidAt: null, notes: "" },
			{ id: `PAR-${year}-005`, customerId: "CLI-009", rentalId: `LOC-${year}-003`, number: 2, amount: 449.75, dueDate: addMonths(addDays(today, 14), 1), status: "pending", paidAt: null, notes: "" }
		];

		return { customers, vehicles, rentals: sampleRentals, installments };
	};

	// Keep persistence behind one adapter so SQL Server can replace local storage later.
	const persist = (state) => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
		window.dispatchEvent(new CustomEvent("accessocar:data-changed"));
	};

	const refreshInstallmentStatuses = (state) => {
		const today = formatDate(new Date());
		let changed = false;
		state.installments.forEach((installment) => {
			const status = installment.paidAt ? "paid" : installment.dueDate < today ? "overdue" : "pending";
			if (installment.status !== status) {
				installment.status = status;
				changed = true;
			}
		});
		return changed;
	};

	const read = () => {
		const stored = localStorage.getItem(STORAGE_KEY);
		const state = stored === null ? createInitialState() : JSON.parse(stored);
		if (refreshInstallmentStatuses(state) || stored === null) persist(state);
		return state;
	};

	const write = (state) => {
		refreshInstallmentStatuses(state);
		persist(state);
	};

	const createRental = (details) => {
		const state = read();
		const customer = state.customers.find((item) => item.id === details.customerId);
		const vehicle = state.vehicles.find((item) => item.id === details.vehicleId);
		if (!customer) throw new Error("Selecione um cliente cadastrado.");
		if (!vehicle || vehicle.status !== "available") throw new Error("O veículo selecionado não está disponível.");
		if (!details.startDate || !details.returnDate || details.returnDate <= details.startDate) {
			throw new Error("A devolução prevista deve ser posterior ao início da locação.");
		}
		if (!details.firstDueDate || !Number.isFinite(new Date(`${details.firstDueDate}T00:00:00`).getTime())) {
			throw new Error("Informe uma data válida para o primeiro vencimento.");
		}
		const start = new Date(`${details.startDate}T12:00:00`);
		const end = new Date(`${details.returnDate}T12:00:00`);
		const days = Math.round((Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) - Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) / 86400000);
		if (!Number.isInteger(details.installments) || details.installments < 1 || details.installments > 24) {
			throw new Error("Informe uma quantidade de parcelas entre 1 e 24.");
		}

		const totalCents = Math.round(days * vehicle.dailyRate * 100);
		const baseCents = Math.floor(totalCents / details.installments);
		const rentalNumber = state.rentals.length + 1;
		const rentalId = `LOC-${new Date().getFullYear()}-${String(rentalNumber).padStart(3, "0")}`;
		const rental = {
			id: rentalId,
			customerId: customer.id,
			vehicleId: vehicle.id,
			startDate: details.startDate,
			returnDate: details.returnDate,
			days,
			dailyRate: vehicle.dailyRate,
			total: totalCents / 100,
			paymentMethod: details.paymentMethod,
			installments: details.installments,
			firstDueDate: details.firstDueDate,
			notes: details.notes.trim(),
			status: "active",
			createdAt: new Date().toISOString()
		};

		state.rentals.push(rental);
		vehicle.status = "rented";
		customer.vehiclePlate = vehicle.plate;
		for (let index = 0; index < details.installments; index += 1) {
			const cents = index === details.installments - 1 ? totalCents - baseCents * index : baseCents;
			const installmentNumber = state.installments.length + 1;
			state.installments.push({
				id: `PAR-${new Date().getFullYear()}-${String(installmentNumber).padStart(3, "0")}`,
				customerId: customer.id,
				rentalId,
				number: index + 1,
				amount: cents / 100,
				dueDate: addMonths(details.firstDueDate, index),
				status: "pending",
				paidAt: null,
				notes: ""
			});
		}
		write(state);
		return rental;
	};

	const confirmPayment = (installmentId) => {
		const state = read();
		const installment = state.installments.find((item) => item.id === installmentId);
		if (!installment) throw new Error("A parcela selecionada não foi encontrada.");
		if (installment.status === "paid") throw new Error("Esta parcela já foi confirmada como paga.");
		installment.status = "paid";
		installment.paidAt = formatDate(new Date());
		write(state);
		return installment;
	};

	const summarize = (state) => {
		const unpaid = state.installments.filter((item) => item.status !== "paid");
		const overdue = unpaid.filter((item) => item.status === "overdue");
		return {
			pendingInstallments: unpaid.filter((item) => item.status === "pending").length,
			overdueInstallments: overdue.length,
			overdueCustomers: new Set(overdue.map((item) => item.customerId)).size,
			receivableTotal: unpaid.reduce((total, item) => total + item.amount, 0),
			overdueTotal: overdue.reduce((total, item) => total + item.amount, 0),
			confirmedPayments: state.installments.filter((item) => item.status === "paid").length,
			activeRentals: state.rentals.filter((item) => item.status === "active").length
		};
	};

	window.AccessoCarData = { read, write, createRental, confirmPayment, summarize, formatDate, addDays, addMonths };
	window.setInterval(() => read(), 60000);
})();
