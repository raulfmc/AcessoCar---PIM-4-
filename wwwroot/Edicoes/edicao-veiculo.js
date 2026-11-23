(() => {
    "use strict";

    const API_ROUTES = {
        vehicles: "/api/Carro",
        adaptations: "/api/Adaptacao"
    };

    const form = document.querySelector("#registration-form");
    const message = document.querySelector("#registration-message");

    const adaptationForm = document.querySelector("#adaptation-form");
    const adaptationList = document.querySelector("#adaptation-list");
    const adaptationMessage = document.querySelector("#adaptation-message");

    const adaptationSubmit = adaptationForm.querySelector('[type="submit"]');
    const cancelEditButton = document.querySelector("#cancel-adaptation-edit");

    const themeToggle = document.querySelector("#theme-toggle");
    const themeLabel = document.querySelector("#theme-label");

    const parametros = new URLSearchParams(window.location.search);
    const currentVehicleId = Number(parametros.get("id"));

    let editingAdaptationId = null;

    // Comunicação com a API
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

        const response = method === "GET"
            ? await fetch(url, options)
            : await fetchProtegido(url, options);

        const body = response.status === 204
            ? null
            : await response.json();

        if (!response.ok) {
            throw new Error(
                body?.detail ??
                body?.message ??
                body?.mensagem ??
                body?.title ??
                `A API respondeu com HTTP ${response.status}.`
            );
        }

        return body?.data ?? body?.dados ?? body;
    }

    // Mensagens
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

    // Tema
    function setTheme(isLight) {
        document.documentElement.dataset.theme = isLight ? "light" : "dark";

        themeToggle.checked = isLight;

        themeToggle.setAttribute(
            "aria-label",
            isLight ? "Ativar tema escuro" : "Ativar tema claro"
        );

        themeLabel.textContent = isLight ? "Tema claro" : "Tema escuro";
    }

    // Buscar veículo
    async function loadVehicle() {
        const carro = await request("vehicles", null, "GET", currentVehicleId);

        document.getElementById("Marca").value = carro.marca ?? carro.Marca ?? "";
        document.getElementById("Modelo").value = carro.modelo ?? carro.Modelo ?? "";
        document.getElementById("Ano_Fabricacao").value =
            carro.ano_Fabricacao ?? carro.Ano_Fabricacao ?? "";

        document.getElementById("Numero").value =
            carro.numero ?? carro.Numero ?? "";

        document.getElementById("Versao").value =
            carro.versao ?? carro.Versao ?? "";

        document.getElementById("Cambio").value =
            carro.cambio ?? carro.Cambio ?? "";

        document.getElementById("Placa").value =
            carro.placa ?? carro.Placa ?? "";

        document.getElementById("Cor").value =
            carro.cor ?? carro.Cor ?? "";

        document.getElementById("Valor_Diaria").value =
            carro.valor_Diaria ?? carro.Valor_Diaria ?? "";
    }

    // Atualizar veículo
    async function updateVehicle() {
        const dados = {
            Marca: document.getElementById("Marca").value.trim(),
            Modelo: document.getElementById("Modelo").value.trim(),
            Ano_Fabricacao: parseInt(
                document.getElementById("Ano_Fabricacao").value
            ),
            Numero: document.getElementById("Numero").value.trim(),
            Versao: document.getElementById("Versao").value.trim(),
            Cambio: document.getElementById("Cambio").value,
            Placa: document.getElementById("Placa").value.trim(),
            Cor: document.getElementById("Cor").value.trim(),
            Valor_Diaria: parseFloat(
                document.getElementById("Valor_Diaria").value
            )
        };

        await request("vehicles", dados, "PUT", currentVehicleId);

        showMessage("Veículo atualizado com sucesso.");
    }

    // Buscar adaptações vinculadas ao veículo
    async function loadAdaptations() {
        const adaptations = await request("adaptations");

        const vehicleAdaptations = adaptations.filter(adaptation =>
            Number(adaptation.carro_ID ?? adaptation.Carro_ID) === currentVehicleId
        );

        adaptationList.replaceChildren();

        if (vehicleAdaptations.length === 0) {
            const empty = document.createElement("p");

            empty.textContent =
                "Este veículo ainda não possui adaptações cadastradas.";

            adaptationList.appendChild(empty);
            return;
        }

        vehicleAdaptations.forEach(adaptation => {
            const adaptationId = adaptation.id ?? adaptation.ID;

            const nome = adaptation.nome ?? adaptation.Nome;
            const tipo = adaptation.tipo ?? adaptation.Tipo;

            const item = document.createElement("div");
            item.className = "registration-field";

            const title = document.createElement("strong");
            title.textContent = nome;

            const description = document.createElement("p");
            description.textContent = `Tipo: ${tipo}`;

            const actions = document.createElement("div");
            actions.className = "registration-actions-group";

            const editButton = document.createElement("button");

            editButton.type = "button";
            editButton.className = "registration-button";
            editButton.textContent = "Editar";

            editButton.addEventListener("click", () => {
                editingAdaptationId = adaptationId;

                document.getElementById("Nome").value = nome;
                document.getElementById("Tipo").value = tipo;

                adaptationSubmit.textContent = "Salvar edição";
                cancelEditButton.hidden = false;

                document.getElementById("Nome").focus();
            });

            actions.appendChild(editButton);

            item.append(title, description, actions);

            adaptationList.appendChild(item);
        });
    }

    // Atualizar adaptação
    async function updateAdaptation() {
        if (editingAdaptationId === null) {
            throw new Error("Selecione uma adaptação para editar.");
        }

        const dados = {
            Nome: document.getElementById("Nome").value.trim(),
            Tipo: document.getElementById("Tipo").value.trim(),
            Carro_ID: currentVehicleId
        };

        await request(
            "adaptations",
            dados,
            "PUT",
            editingAdaptationId
        );

        adaptationForm.reset();

        editingAdaptationId = null;

        adaptationSubmit.textContent = "Cadastrar adaptação";
        cancelEditButton.hidden = true;

        showAdaptationMessage("Adaptação atualizada com sucesso.");

        await loadAdaptations();
    }

    // Eventos do formulário do veículo
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        try {
            await updateVehicle();
        } catch (error) {
            console.error("Erro ao atualizar veículo:", error);

            showMessage(
                `Não foi possível atualizar o veículo: ${error.message}`,
                true
            );
        }
    });

    // Eventos do formulário de adaptação
    adaptationForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        try {
            await updateAdaptation();
        } catch (error) {
            console.error("Erro ao atualizar adaptação:", error);

            showAdaptationMessage(
                `Não foi possível atualizar a adaptação: ${error.message}`,
                true
            );
        }
    });

    // Cancelar edição da adaptação
    cancelEditButton.addEventListener("click", () => {
        adaptationForm.reset();

        editingAdaptationId = null;

        adaptationSubmit.textContent = "Editar adaptação";
        cancelEditButton.hidden = true;
    });

    // Tema
    setTheme(localStorage.getItem("acessocar-theme") === "light");

    themeToggle.addEventListener("change", () => {
        setTheme(themeToggle.checked);

        localStorage.setItem(
            "acessocar-theme",
            themeToggle.checked ? "light" : "dark"
        );
    });

    // Menu lateral
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

    // Inicialização
    async function iniciarEdicao() {
        if (!Number.isInteger(currentVehicleId) || currentVehicleId <= 0) {
            showMessage("ID do veículo não informado ou inválido.", true);
            form.querySelector('[type="submit"]').disabled = true;
            return;
        }

        try {
            await loadVehicle();
            await loadAdaptations();
        } catch (error) {
            console.error("Erro ao carregar edição:", error);

            showMessage(
                `Não foi possível carregar os dados: ${error.message}`,
                true
            );
        }
    }

    document.addEventListener("DOMContentLoaded", iniciarEdicao);

})();