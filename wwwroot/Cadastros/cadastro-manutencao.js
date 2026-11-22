(() => {
    "use strict";

    const API_ROUTES = {
        vehicles: "/api/Carro",
        createMaintenance: "/api/Manutencao"
    };

    const themeToggle = document.querySelector("#theme-toggle");
    const themeLabel = document.querySelector("#theme-label");

    const form = document.querySelector("#maintenance-form");
    const vehicleSelect = document.querySelector("#maintenance-vehicle");
    const maintenanceDate = document.querySelector("#maintenance-date");
    const maintenanceCost = document.querySelector("#maintenance-cost");
    const message = document.querySelector("#maintenance-message");

    const currency = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    let vehicles = [];

    async function request(routeName, options = {}) {
        const route = options.url || API_ROUTES[routeName];

        if (!API_BASE_URL.trim() || !route?.trim()) {
            throw new Error(`Configure API_BASE_URL e API_ROUTES.${routeName}.`);
        }

        const { url, ...fetchOptions } = options;

        const response = await fetchProtegido(
            `${API_BASE_URL.replace(/\/+$/, "")}/${route.replace(/^\/+/, "")}`,
            {
                ...fetchOptions,
                headers: {
                    ...(fetchOptions.body
                        ? { "Content-Type": "application/json" }
                        : {}),
                    ...fetchOptions.headers
                }
            }
        );

        const text = await response.text();
        const body = text ? JSON.parse(text) : null;

        if (!response.ok) {
            throw new Error(
                body?.detail ||
                body?.message ||
                body?.mensagem ||
                body?.title ||
                `A API respondeu com HTTP ${response.status}.`
            );
        }

        return body?.data ?? body;
    }

    async function loadVehicles() {
        const vehicleData = await request("vehicles");

        if (!Array.isArray(vehicleData)) {
            throw new Error("A API de veículos não retornou uma lista.");
        }

        vehicles = vehicleData;

        renderVehicleOptions();
    }

    function renderVehicleOptions() {
        const availableVehicles = vehicles.filter(
            vehicle => vehicle.estado === "DISPONÍVEL"
        );

        vehicleSelect.replaceChildren(
            new Option("Selecione um veículo disponível", "")
        );

        availableVehicles.forEach(vehicle => {
            vehicleSelect.add(
                new Option(
                    `${vehicle.marca} ${vehicle.modelo} · ${vehicle.placa}`,
                    vehicle.id
                )
            );
        });

        vehicleSelect.disabled = availableVehicles.length === 0;

        if (availableVehicles.length === 0) {
            vehicleSelect.replaceChildren(
                new Option("Não há veículos disponíveis", "")
            );

            showMessage(
                "Não há veículos disponíveis para encaminhar à manutenção.",
                true
            );
        }
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

    function formatCurrencyInput(value) {
        const digits = value.replace(/\D/g, "");

        return digits
            ? currency.format(Number(digits) / 100)
            : "";
    }

    function parseCurrencyInput(value) {
        const digits = value.replace(/\D/g, "");

        return digits
            ? Number(digits) / 100
            : Number.NaN;
    }

    function showMessage(text, isError = false) {
        message.textContent = text;
        message.classList.add("is-visible");
        message.classList.toggle("is-error", isError);
    }

    async function createMaintenance(payload) {
        return await request("createMaintenance", {
            method: "POST",
            body: JSON.stringify(payload)
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

    maintenanceDate.value = AccessoCarUtils.formatDate(new Date());

    maintenanceCost.addEventListener("input", () => {
        maintenanceCost.value = formatCurrencyInput(
            maintenanceCost.value
        );
    });

    form.addEventListener("submit", async event => {
        event.preventDefault();

        if (!form.reportValidity()) return;

        const cost = parseCurrencyInput(maintenanceCost.value);

        const payload = {
            carro_ID: Number(vehicleSelect.value),
            valor: cost,
            descricao: form.elements.namedItem("report").value.trim(),
            data_Prevista_Conclusao: form.elements.namedItem("date").value
        };

        if (
            !Number.isFinite(payload.carro_ID) ||
            payload.carro_ID <= 0 ||
            !Number.isFinite(cost) ||
            cost < 0 ||
            !payload.descricao ||
            !payload.data_Prevista_Conclusao
        ) {
            showMessage(
                "Informe um veículo, valor válido, motivo e data da manutenção.",
                true
            );

            return;
        }

        const submitButton = form.querySelector('[type="submit"]');

        try {
            submitButton.disabled = true;
            console.log("Valor exibido:", maintenanceCost.value);
            console.log("Valor convertido:", cost);
            console.log("Payload enviado:", JSON.stringify(payload));
            const record = await createMaintenance(payload);

            showMessage(
                `Manutenção ${record?.id || ""} registrada com sucesso.`
            );

            //window.location.href = "manutencao.html";

        } catch (error) {
            showMessage(
                `Não foi possível registrar a manutenção: ${error.message}`,
                true
            );

            submitButton.disabled = false;
        }
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

    loadVehicles().catch(error => {
        showMessage(
            `Não foi possível carregar os veículos: ${error.message}`,
            true
        );
    });

})();