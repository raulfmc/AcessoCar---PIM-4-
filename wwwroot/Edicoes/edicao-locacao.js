(() => {
    "use strict";

    const form = document.querySelector("#rental-edit-form");
    const message = document.querySelector("#registration-message");
    const recordLabel = document.querySelector("#rental-record-label");
    const saveButton = document.querySelector("#save-rental-button");
    const startDate = document.querySelector("#start-date");
    const returnDate = document.querySelector("#return-date");
    const rentalDays = document.querySelector("#rental-days");
    const rentalTotal = document.querySelector("#rental-total");
    const themeToggle = document.querySelector("#theme-toggle");

    const params = new URLSearchParams(window.location.search);
    const rentalId = params.get("id");

    const currency = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    let rental;

    function showMessage(text, isError = false) {
        message.textContent = text;
        message.classList.add("is-visible");
        message.classList.toggle("is-error", isError);
    }

    function setTheme(isLight) {
        document.documentElement.dataset.theme = isLight ? "light" : "dark";

        themeToggle.checked = isLight;

        themeToggle.setAttribute(
            "aria-label",
            isLight ? "Ativar tema escuro" : "Ativar tema claro"
        );

        document.querySelector("#theme-label").textContent =
            isLight ? "Tema claro" : "Tema escuro";
    }

    function formatDateInput(value) {
        return value ? String(value).slice(0, 10) : "";
    }

    function updateTotal() {
        returnDate.min = startDate.value;

        if (
            !startDate.value ||
            !returnDate.value ||
            returnDate.value <= startDate.value
        ) {
            rentalDays.value = "";
            rentalTotal.value = "";
            return 0;
        }

        const start = Date.parse(`${startDate.value}T00:00:00Z`);
        const end = Date.parse(`${returnDate.value}T00:00:00Z`);

        const days = Math.round(
            (end - start) / 86400000
        );

        const total = days * Number(rental.carro.valor_Diaria);

        rentalDays.value = String(days);
        rentalTotal.value = currency.format(total);

        return total;
    }

    function configuracaoEdicaoLocacao(locacaoId) {

        return {
            id: locacaoId,

            endpoint: `${API_BASE_URL.replace(/\/+$/, "")}/api/Aluguel`,

            formulario: form,

            mapearDados: (dados) => ({
                "customer-name":
                    dados.cliente?.nome || `Cliente ${dados.cliente_ID}`,

                "vehicle-name":
                    [dados.carro?.marca, dados.carro?.modelo]
                        .filter(Boolean)
                        .join(" ") || `Veículo ${dados.carro_ID}`,

                "vehicle-plate": dados.carro?.placa || "",

                "payment-info":
                    `${dados.forma_Pagamento} · ${dados.parcelas} parcela(s)`,

                "start-date": formatDateInput(dados.data_Inicio),

                "return-date": formatDateInput(dados.data_Fim),

                "rental-record-label": `Locação ${dados.id}`
            }),

            montarPayload: async (formulario) => {

                const total = updateTotal();

                return {
                    data_Inicio: formulario.querySelector("#start-date").value,

                    data_Fim: formulario.querySelector("#return-date").value,

                    valor_Total: total,

                    forma_Pagamento: rental.forma_Pagamento,

                    parcelas: rental.parcelas
                };
            }
        };
    }

    async function iniciarEdicaoLocacao() {

        if (!rentalId || !/^[1-9]\d*$/.test(rentalId)) {
            showMessage("Informe um ID de locação válido.", true);
            recordLabel.textContent = "ID inválido.";
            return;
        }

        const config = configuracaoEdicaoLocacao(rentalId);

        try {

            // Carrega os dados da locação pela função compartilhada.
            rental = await editarRegistro(config);

            if (!rental || !rental.ativo) {
                throw new Error(`Locação ${rentalId} não encontrada.`);
            }

            if (
                !rental.carro ||
                !Number.isFinite(Number(rental.carro.valor_Diaria))
            ) {
                throw new Error(
                    "A API não retornou o valor da diária do veículo."
                );
            }

            updateTotal();

            saveButton.disabled = false;

        } catch (error) {

            console.error("Erro ao carregar locação:", error);

            recordLabel.textContent =
                "Não foi possível carregar a locação.";

            showMessage(error.message, true);
        }

        // O formulário utiliza o mesmo padrão de edição dos clientes.
        form.addEventListener("submit", async (event) => {

            event.preventDefault();

            if (!rental) return;

            updateTotal();

            if (!form.reportValidity()) return;

            const sucesso = await salvarEdicao(config);

            if (sucesso) {

                rental.data_Inicio = startDate.value;
                rental.data_Fim = returnDate.value;
                rental.valor_Total = updateTotal();

                showMessage(
                    `Locação ${rental.id} atualizada com sucesso.`
                );
            }
        });
    }

    // Alternância de tema.
    setTheme(localStorage.getItem("acessocar-theme") === "light");

    themeToggle.addEventListener("change", () => {

        setTheme(themeToggle.checked);

        localStorage.setItem(
            "acessocar-theme",
            themeToggle.checked ? "light" : "dark"
        );
    });

    // Atualização automática do valor.
    startDate.addEventListener("change", updateTotal);
    returnDate.addEventListener("change", updateTotal);

    // Menu lateral.
    document.querySelector("#menu-toggle").addEventListener("click", () => {

        const sidebar = document.querySelector("#sidebar");

        const isOpen = sidebar.classList.toggle("is-open");

        document.querySelector("#menu-toggle").setAttribute(
            "aria-expanded",
            String(isOpen)
        );
    });

    document.addEventListener(
        "DOMContentLoaded",
        iniciarEdicaoLocacao
    );

})();

// (() => {
// 	"use strict";

// 	const form = document.querySelector("#rental-edit-form");
// 	const message = document.querySelector("#registration-message");
// 	const recordLabel = document.querySelector("#rental-record-label");
// 	const saveButton = document.querySelector("#save-rental-button");
// 	const startDate = document.querySelector("#start-date");
// 	const returnDate = document.querySelector("#return-date");
// 	const rentalDays = document.querySelector("#rental-days");
// 	const rentalTotal = document.querySelector("#rental-total");
// 	const params = new URLSearchParams(window.location.search);
// 	const rentalId = params.get("id");
// 	const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
// 	const themeToggle = document.querySelector("#theme-toggle");
// 	let rental;

// 	function showMessage(text, isError = false) {
// 		message.textContent = text;
// 		message.classList.add("is-visible");
// 		message.classList.toggle("is-error", isError);
// 	}

// 	async function request(url, options = {}) {
// 		const response = await fetchProtegido(`${API_BASE_URL.replace(/\/+$/, "")}${url}`, {
// 			...options,
// 			credentials: "include",
// 			headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers }
// 		});
// 		const body = response.status === 204 ? null : await response.json();
// 		if (!response.ok) {
// 			throw new Error(
// 				body?.detail ||
// 				body?.message ||
// 				body?.mensagem ||
// 				body?.title ||
// 				`A API respondeu com HTTP ${response.status}.`
// 			);
// 		}
		
// 		return body?.data ?? body;
// 	}

// 	function setTheme(isLight) {
// 		document.documentElement.dataset.theme = isLight ? "light" : "dark";
// 		themeToggle.checked = isLight;
// 		themeToggle.setAttribute("aria-label", isLight ? "Ativar tema escuro" : "Ativar tema claro");
// 		document.querySelector("#theme-label").textContent = isLight ? "Tema claro" : "Tema escuro";
// 	}

// 	function formatDateInput(value) {
// 		return value ? String(value).slice(0, 10) : "";
// 	}

// 	function updateTotal() {
// 		returnDate.min = startDate.value;
// 		if (!startDate.value || !returnDate.value || returnDate.value <= startDate.value) {
// 			rentalDays.value = "";
// 			rentalTotal.value = "";
// 			return 0;
// 		}
// 		const start = Date.parse(`${startDate.value}T00:00:00Z`);
// 		const end = Date.parse(`${returnDate.value}T00:00:00Z`);
// 		const days = Math.round((end - start) / 86400000);
// 		const total = days * Number(rental.carro.valor_Diaria);
// 		rentalDays.value = String(days);
// 		rentalTotal.value = currency.format(total);
// 		return total;
// 	}

// 	async function loadRental() {
// 		if (!rentalId || !/^[1-9]\d*$/.test(rentalId)) {
// 			throw new Error("Informe um ID de locação válido na página anterior.");
// 		}
// 		rental = await request(`/api/Aluguel/${encodeURIComponent(rentalId)}`);
// 		if (!rental.ativo) throw new Error(`Locação ${rentalId} não encontrada.`);
// 		if (!rental.carro || !Number.isFinite(Number(rental.carro.valor_Diaria))) {
// 			throw new Error("A API não retornou o valor da diária do veículo desta locação.");
// 		}
// 		document.querySelector("#customer-name").value = rental.cliente?.nome || `Cliente ${rental.cliente_ID}`;
// 		document.querySelector("#vehicle-name").value = [rental.carro?.marca, rental.carro?.modelo].filter(Boolean).join(" ") || `Veículo ${rental.carro_ID}`;
// 		document.querySelector("#vehicle-plate").value = rental.carro?.placa || "";
// 		document.querySelector("#payment-info").value = `${rental.forma_Pagamento} · ${rental.parcelas} parcela(s)`;
// 		startDate.value = formatDateInput(rental.data_Inicio);
// 		returnDate.value = formatDateInput(rental.data_Fim);
// 		recordLabel.textContent = `Locação ${rental.id}`;
// 		updateTotal();
// 		saveButton.disabled = false;
// 	}

// 	setTheme(localStorage.getItem("acessocar-theme") === "light");
// 	themeToggle.addEventListener("change", () => {
// 		setTheme(themeToggle.checked);
// 		localStorage.setItem("acessocar-theme", themeToggle.checked ? "light" : "dark");
// 	});

// 	startDate.addEventListener("change", updateTotal);
// 	returnDate.addEventListener("change", updateTotal);

// 	form.addEventListener("submit", async (event) => {
// 		event.preventDefault();
// 		if (!rental) return;
// 		updateTotal();
// 		if (!form.reportValidity()) return;

// 		const total = updateTotal();
// 		const payload = {
// 			data_Inicio: startDate.value,
// 			data_Fim: returnDate.value,
// 			valor_Total: total,
// 			forma_Pagamento: rental.forma_Pagamento,
// 			parcelas: rental.parcelas
// 		};
// 		try {
// 			await request(`/api/Aluguel/${encodeURIComponent(rental.id)}`, {
// 				method: "PUT",
// 				body: JSON.stringify(payload)
// 			});
// 			rental.data_Inicio = startDate.value;
// 			rental.data_Fim = returnDate.value;
// 			rental.valor_Total = total;
// 			showMessage(`Locação ${rental.id} atualizada com sucesso.`);
// 		} catch (error) {
// 			showMessage(`Não foi possível atualizar a locação: ${error.message}`, true);
// 		}
// 	});

// 	document.querySelector("#menu-toggle").addEventListener("click", () => {
// 		const sidebar = document.querySelector("#sidebar");
// 		const isOpen = sidebar.classList.toggle("is-open");
// 		document.querySelector("#menu-toggle").setAttribute("aria-expanded", String(isOpen));
// 	});

// 	loadRental().catch((error) => {
// 		recordLabel.textContent = "Não foi possível carregar a locação.";
// 		showMessage(error.message, true);
// 	});
// })();
