(() => {
    "use strict";

    const API_ROUTES = {
        vehicles: "/api/Carro/simples",
        adaptations: "/api/Adaptacao"
    };

    const form = document.querySelector("#registration-form");
    const message = document.querySelector("#registration-message");

    const adaptationSection = document.querySelector("#adaptation-section");
    const adaptationForm = document.querySelector("#adaptation-form");
    const adaptationList = document.querySelector("#adaptation-list");

    const adaptationMessage = document.querySelector("#adaptation-message");
    const cancelEditButton = document.querySelector("#cancel-adaptation-edit");
    const adaptationSubmit = adaptationForm.querySelector('[type="submit"]');

    const themeToggle = document.querySelector("#theme-toggle");
    const themeLabel = document.querySelector("#theme-label");

    let currentVehicleId = null;
    let editingAdaptationId = null;

    async function request(routeName, payload = null, method = "GET", id = null) {
        const route = API_ROUTES[routeName];

        if (!API_BASE_URL.trim() || !route) {
            throw new Error("Configure API_BASE_URL e API_ROUTES.");
        }

        const baseUrl = API_BASE_URL.replace(/\/+$/, "");
        const endpoint = route.replace(/^\/+/, "");
        const url = `${baseUrl}/${endpoint}${id !== null ? `/${id}` : ""}`;

        const options = {
            method,
            credentials: "include",
            headers: {}
        };

        if (payload !== null) {
            options.headers["Content-Type"] = "application/json";
            options.body = JSON.stringify(payload);
        }

        const response = await fetch(url, options);

        const body = response.status === 204
            ? null
            : await response.json();

        if (!response.ok) {
            throw new Error(
                body?.detail ||
                body?.message ||
                body?.mensagem ||
                body?.title ||
                `A API respondeu com HTTP ${response.status}.`
            );
        }

        return body?.data ?? body?.dados ?? body;
    }

    function setTheme(isLight) {
        document.documentElement.dataset.theme = isLight ? "light" : "dark";
        themeToggle.checked = isLight;

        themeToggle.setAttribute(
            "aria-label",
            isLight ? "Ativar tema escuro" : "Ativar tema claro"
        );

        themeLabel.textContent = isLight ? "Tema claro" : "Tema escuro";
    }

    function showMessage(text, isError = false) {
        message.textContent = text;
        message.classList.add("is-visible");
        message.classList.toggle("is-error", isError);
    }

    function showAdaptationMessage(text, isError = false) {
        adaptationMessage.textContent = text;
        adaptationMessage.classList.add("is-visible");
        adaptationMessage.classList.toggle("is-error", isError);
    }

    function getVehicleId(vehicle) {
        const id =
            vehicle?.id ??
            vehicle?.ID ??
            vehicle?.carro?.id ??
            vehicle?.carro?.ID;

        return Number(id);
    }

    async function createVehicleRecord() {
        const dados = {
            Marca: document.getElementById("Marca").value.trim(),
            Modelo: document.getElementById("Modelo").value.trim(),
            Ano_Fabricacao: parseInt(document.getElementById("Ano_Fabricacao").value),
            Numero: document.getElementById("Numero").value.trim(),
            Versao: document.getElementById("Versao").value.trim(),
            Cambio: document.getElementById("Cambio").value,
            Placa: document.getElementById("Placa").value.trim(),
            Cor: document.getElementById("Cor").value.trim(),
            Valor_Diaria: parseFloat(document.getElementById("Valor_Diaria").value)
        };

        return await request("vehicles", dados, "POST");
    }

    async function createAdaptation() {
        const dados = {
            Nome: document.getElementById("Nome").value.trim(),
            Tipo: document.getElementById("Tipo").value.trim(),
            Carro_ID: currentVehicleId
        };

        if (editingAdaptationId !== null) {
            await request(
                "adaptations",
                dados,
                "PUT",
                editingAdaptationId
            );

            showAdaptationMessage("Adaptação atualizada com sucesso.");
        } else {
            await request("adaptations", dados, "POST");

            showAdaptationMessage("Adaptação cadastrada com sucesso.");
        }

        adaptationForm.reset();
        editingAdaptationId = null;
        adaptationSubmit.textContent = "Cadastrar adaptação";
        cancelEditButton.hidden = true;

        await loadAdaptations();
    }

    async function loadAdaptations() {
        const adaptations = await request("adaptations");

        const vehicleAdaptations = adaptations.filter(adaptation =>
            Number(adaptation.carro_ID ?? adaptation.Carro_ID) === currentVehicleId
        );

        adaptationList.replaceChildren();

        if (vehicleAdaptations.length === 0) {
            const empty = document.createElement("p");
            empty.textContent = "Este veículo ainda não possui adaptações cadastradas.";
            adaptationList.appendChild(empty);
            return;
        }

        vehicleAdaptations.forEach(adaptation => {
            const item = document.createElement("div");
            item.className = "registration-field";

            const title = document.createElement("strong");
            title.textContent = adaptation.nome ?? adaptation.Nome;

            const type = document.createElement("p");
            type.textContent = `Tipo: ${adaptation.tipo ?? adaptation.Tipo}`;

            const actions = document.createElement("div");
            actions.className = "registration-actions-group";

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "registration-button";
            editButton.textContent = "Editar";

            editButton.addEventListener("click", () => {
                editingAdaptationId = adaptation.id ?? adaptation.ID;

                document.getElementById("Nome").value =
                    adaptation.nome ?? adaptation.Nome;

                document.getElementById("Tipo").value =
                    adaptation.tipo ?? adaptation.Tipo;

                adaptationSubmit.textContent = "Salvar edição";
                cancelEditButton.hidden = false;

                document.getElementById("Nome").focus();
            });

            actions.appendChild(editButton);

            item.append(title, type, actions);
            adaptationList.appendChild(item);
        });
    }

    setTheme(localStorage.getItem("acessocar-theme") === "light");

    themeToggle.addEventListener("change", () => {
        setTheme(themeToggle.checked);

        localStorage.setItem(
            "acessocar-theme",
            themeToggle.checked ? "light" : "dark"
        );
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        try {
            const vehicle = await createVehicleRecord();

            currentVehicleId = getVehicleId(vehicle);

            if (!Number.isInteger(currentVehicleId) || currentVehicleId <= 0) {
                throw new Error(
                    "O veículo foi enviado, mas a API não retornou seu ID."
                );
            }

            showMessage("Veículo cadastrado com sucesso.");

            adaptationSection.hidden = false;

            form.querySelector('[type="submit"]').disabled = true;
            form.querySelector('[type="submit"]').textContent = "Veículo cadastrado";

            await loadAdaptations();

        } catch (error) {
            showMessage(
                `Não foi possível cadastrar o veículo: ${error.message}`,
                true
            );
        }
    });

    adaptationForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        try {
            await createAdaptation();
        } catch (error) {
            showAdaptationMessage(
                `Não foi possível salvar a adaptação: ${error.message}`,
                true
            );
        }
    });

    cancelEditButton.addEventListener("click", () => {
        adaptationForm.reset();
        editingAdaptationId = null;

        adaptationSubmit.textContent = "Cadastrar adaptação";
        cancelEditButton.hidden = true;
    });

    const sidebar = document.querySelector("#sidebar");
    const menuToggle = document.querySelector("#menu-toggle");

    menuToggle.addEventListener("click", () => {
        const isOpen = sidebar.classList.toggle("is-open");

        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Fechar menu" : "Abrir menu"
        );
    });
})();

// (() => {
// 	"use strict";

	
// 	const API_ROUTES = {
// 		vehicles: "/api/Carro",
// 		adaptations: "/api/Adaptacao"
// 	};
// 	const form = document.querySelector("#registration-form");
// 	const message = document.querySelector("#registration-message");
	
// 	const themeToggle = document.querySelector("#theme-toggle");
// 	const themeLabel = document.querySelector("#theme-label");
	

// 	async function request(routeName, payload) {
// 		const route = API_ROUTES[routeName];
// 		if (!API_BASE_URL.trim() || !route.trim()) {
// 			throw new Error(`Configure API_BASE_URL e API_ROUTES.${routeName} em cadastro-veiculo.js.`);
// 		}
// 		const response = await fetch(`${API_BASE_URL.replace(/\/+$/, "")}/${route.replace(/^\/+/, "")}`, {
// 			method: "POST",
// 			credentials: "include",
// 			headers: { "Content-Type": "application/json" },
// 			body: JSON.stringify(payload)
// 		});
// 		const body = response.status === 204 ? null : await response.json();
// 		if (!response.ok) throw new Error(body?.message || `A API respondeu com HTTP ${response.status}.`);
// 		return body?.data ?? body;
// 	}

// 	function setTheme(isLight) {
// 		document.documentElement.dataset.theme = isLight ? "light" : "dark";
// 		themeToggle.checked = isLight;
// 		themeToggle.setAttribute("aria-label", isLight ? "Ativar tema escuro" : "Ativar tema claro");
// 		themeLabel.textContent = isLight ? "Tema claro" : "Tema escuro";
// 	}

// 	function showMessage(text, isError = false) {
// 		message.textContent = text;
// 		message.classList.add("is-visible");
// 		message.classList.toggle("is-error", isError);
// 	}

// 	function formValue(name) {
// 		return form.elements.namedItem(name).value.trim();
// 	}

	

// 	async function createVehicleRecord() {
// 		const dados = {
// 			Carro: {
// 				Marca: document.getElementById("Marca").value,
// 				Modelo: document.getElementById("Modelo").value,
// 				Ano_Fabricacao: parseInt(document.getElementById("Ano_Fabricacao").value),
// 				Numero: parseInt(document.getElementById("Numero").value),
// 				Versao: document.getElementById("Versao").value,
// 				Cambio: document.getElementById("Cambio").value,
// 				Placa: document.getElementById("Placa").value,
// 				Cor: document.getElementById("Cor").value,
// 				Valor_Diaria: parseFloat(document.getElementById("Valor_Diaria").value)
// 			},

// 			Adaptacao: {
// 				Nome: document.getElementById("Nome").value,
// 				Tipo: document.getElementById("Tipo").value,
// 				Ativo: true
// 			}
// 		};

// 		const vehicle = await request("vehicles", dados);

// 		return vehicle;
		
// 	}

	

// 	setTheme(localStorage.getItem("acessocar-theme") === "light");
// 	themeToggle.addEventListener("change", () => {
// 		setTheme(themeToggle.checked);
// 		localStorage.setItem("acessocar-theme", themeToggle.checked ? "light" : "dark");
// 	});
// 	form.addEventListener("submit", async (event) => {
// 		event.preventDefault();
		
// 		try {
// 			const vehicle = await createVehicleRecord();
// 			showMessage(`Veículo cadastrado com sucesso.`.trim());
// 			//${vehicle?.carro.id || ""}
// 			form.reset();
			
// 		} catch (error) {
// 			showMessage(`Não foi possível cadastrar o veículo: ${error.message}`, true);
// 		}
// 	});

// 	const sidebar = document.querySelector("#sidebar");
// 	const menuToggle = document.querySelector("#menu-toggle");
// 	menuToggle.addEventListener("click", () => {
// 		const isOpen = sidebar.classList.toggle("is-open");
// 		menuToggle.setAttribute("aria-expanded", String(isOpen));
// 		menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
// 	});
// })();
