(() => {
    "use strict";

    const form = document.querySelector("#maintenance-form");
    const message = document.querySelector("#maintenance-message");
    const saveButton = document.querySelector("#save-maintenance-button");

    const vehicleInput = document.querySelector("#maintenance-vehicle");
    const dateInput = document.querySelector("#maintenance-date");
    const costInput = document.querySelector("#maintenance-cost");
    const reportInput = form.querySelector('[name="report"]');

    const themeToggle = document.querySelector("#theme-toggle");

    const params = new URLSearchParams(window.location.search);
    const maintenanceId = params.get("id");

    const currency = new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    let maintenance;

    function showMessage(text, isError = false) {
        message.textContent = text;
        message.classList.add("is-visible");
        message.classList.toggle("is-error", isError);
    }

    function setTheme(isLight) {
        document.documentElement.dataset.theme =
            isLight ? "light" : "dark";

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

    function parseCurrency(value) {
        const texto = String(value ?? "").trim();

        if (!texto) return 0;

        // Valores formatados no padrão brasileiro.
        if (texto.includes(",")) {
            return Number(
                texto.replace(/[^\d,-]/g, "")
                    .replace(/\./g, "")
                    .replace(",", ".")
            );
        }

        // Valores numéricos no padrão decimal.
        return Number(texto.replace(/[^\d.-]/g, ""));
    }

    function configuracaoEdicaoManutencao(manutencaoId) {

        return {
            id: manutencaoId,

            endpoint: `${API_BASE_URL.replace(/\/+$/, "")}/api/Manutencao`,

            formulario: form,

            mapearDados: (dados) =>  ({
                
                
                "maintenance-vehicle":
                    [dados.carro?.marca, dados.carro?.modelo]
                        .filter(Boolean)
                        .join(" ") || `Veículo ${dados.carro_ID}`,

                "maintenance-date":
                    formatDateInput(dados.data_Prevista_Conclusao),

                "maintenance-cost":
                    currency.format(Number(dados.valor ?? 0))
            }),

            montarPayload: async (formulario) => {

                return {
                    carro_ID: maintenance.carro_ID,

                    valor: parseCurrency(
                        formulario.querySelector("#maintenance-cost").value
                    ),

                    descricao:
                        formulario.querySelector('[name="report"]').value.trim(),

                    data_Prevista_Conclusao:
                        formulario.querySelector("#maintenance-date").value,

                    Ativo: true
                };
            }
        };
    }

    async function iniciarEdicaoManutencao() {

        if (!maintenanceId || !/^[1-9]\d*$/.test(maintenanceId)) {
            showMessage("Informe um ID de manutenção válido.", true);
            return;
        }

        const config = configuracaoEdicaoManutencao(maintenanceId);

        try {

            // Carrega os dados da manutenção pela função compartilhada.
            maintenance = await editarRegistro(config);

            if (!maintenance || !maintenance.ativo) {
                throw new Error(
                    `Manutenção ${maintenanceId} não encontrada.`
                );
            }

            // Restaura a descrição.
            reportInput.value = maintenance.descricao ?? "";

            // Atualiza o valor apresentado.
            costInput.value = currency.format(
                Number(maintenance.valor ?? 0)
            );

            saveButton.disabled = false;

        } catch (error) {

            console.error("Erro ao carregar manutenção:", error);

            showMessage(
                error.message || "Não foi possível carregar a manutenção.",
                true
            );
        }

        // O formulário utiliza o mesmo padrão de edição das locações.
        form.addEventListener("submit", async (event) => {

            event.preventDefault();

            if (!maintenance) return;

            if (!form.reportValidity()) return;

            const sucesso = await salvarEdicao(config);

            if (sucesso) {

                maintenance.valor = parseCurrency(costInput.value);

                maintenance.descricao = reportInput.value.trim();

                maintenance.data_Prevista_Conclusao = dateInput.value;

                showMessage(
                    `Manutenção ${maintenance.id ?? maintenanceId} atualizada com sucesso.`
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
        iniciarEdicaoManutencao
    );

})();// (() => {
//     "use strict";

//     const form = document.querySelector("#maintenance-form");
//     const message = document.querySelector("#maintenance-message");
//     const saveButton = document.querySelector("#save-maintenance-button");

//     const vehicleInput = document.querySelector("#maintenance-vehicle");
//     const dateInput = document.querySelector("#maintenance-date");
//     const costInput = document.querySelector("#maintenance-cost");
//     const reportInput = form.querySelector('[name="report"]');

//     const themeToggle = document.querySelector("#theme-toggle");

//     const params = new URLSearchParams(window.location.search);
//     const maintenanceId = params.get("id");

//     const currency = new Intl.NumberFormat("pt-BR", {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2
//     });

//     let maintenance;

//     function showMessage(text, isError = false) {
//         message.textContent = text;
//         message.classList.add("is-visible");
//         message.classList.toggle("is-error", isError);
//     }

//     function setTheme(isLight) {
//         document.documentElement.dataset.theme =
//             isLight ? "light" : "dark";

//         themeToggle.checked = isLight;

//         themeToggle.setAttribute(
//             "aria-label",
//             isLight ? "Ativar tema escuro" : "Ativar tema claro"
//         );

//         document.querySelector("#theme-label").textContent =
//             isLight ? "Tema claro" : "Tema escuro";
//     }

//     function formatDateInput(value) {
//         return value ? String(value).slice(0, 10) : "";
//     }

//     function parseCurrency(value) {
//         const texto = String(value ?? "").trim();

//         if (!texto) return 0;

//         // Valores formatados no padrão brasileiro.
//         if (texto.includes(",")) {
//             return Number(
//                 texto.replace(/[^\d,-]/g, "")
//                     .replace(/\./g, "")
//                     .replace(",", ".")
//             );
//         }

//         // Valores numéricos no padrão decimal.
//         return Number(texto.replace(/[^\d.-]/g, ""));
//     }

//     function configuracaoEdicaoManutencao(manutencaoId) {

//         return {
//             id: manutencaoId,

//             endpoint: `${API_BASE_URL.replace(/\/+$/, "")}/api/Manutencao`,

//             formulario: form,

//             mapearDados: (dados) => ({
//                 "maintenance-vehicle": String(dados.carro_ID),

//                 "maintenance-date":
//                     formatDateInput(dados.data_Prevista_Conclusao),

//                 "maintenance-cost":
//                     currency.format(Number(dados.valor ?? 0))
//             }),

//             montarPayload: async (formulario) => {

//                 const payload = {
//                     carro_ID: Number(
//                         formulario.querySelector("#maintenance-vehicle").value
//                     ),

//                     valor: parseCurrency(
//                         formulario.querySelector("#maintenance-cost").value
//                     ),

//                     descricao:
//                         formulario.querySelector('[name="report"]').value.trim(),

//                     data_Prevista_Conclusao:
//                         formulario.querySelector("#maintenance-date").value,

//                     Ativo: true
//                 };

//                 return payload;
//             }
//         };
//     }

//     async function iniciarEdicaoManutencao() {

//         if (
//             !maintenanceId ||
//             !/^[1-9]\d*$/.test(maintenanceId)
//         ) {
//             showMessage("Informe um ID de manutenção válido.", true);
//             return;
//         }

//         const config = configuracaoEdicaoManutencao(maintenanceId);

//         try {

            
//             maintenance = await editarRegistro(config);

//             if (!maintenance || !maintenance.ativo) {
//                 throw new Error(
//                     `Manutenção ${maintenanceId} não encontrada.`
//                 );
//             }

//             // Restaura a descrição.
//             reportInput.value = maintenance.descricao ?? "";

//             // Atualiza o valor apresentado.
//             costInput.value = currency.format(
//                 Number(maintenance.valor ?? 0)
//             );

//             saveButton.disabled = false;

//         } catch (error) {

//             console.error("Erro ao carregar manutenção:", error);

//             showMessage(
//                 error.message || "Não foi possível carregar a manutenção.",
//                 true
//             );
//         }

//         form.addEventListener("submit", async (event) => {

//             event.preventDefault();

//             if (!maintenance) return;

//             if (!form.reportValidity()) return;

//             const sucesso = await salvarEdicao(config);

//             if (sucesso) {

//                 maintenance.carro_ID = Number(vehicleInput.value);

//                 maintenance.valor = parseCurrency(costInput.value);

//                 maintenance.descricao = reportInput.value.trim();

//                 maintenance.data_Prevista_Conclusao = dateInput.value;

//                 showMessage(
//                     `Manutenção ${maintenance.id} atualizada com sucesso.`
//                 );
//             }
//         });
//     }

//     // Alternância de tema.
//     setTheme(localStorage.getItem("acessocar-theme") === "light");

//     themeToggle.addEventListener("change", () => {

//         setTheme(themeToggle.checked);

//         localStorage.setItem(
//             "acessocar-theme",
//             themeToggle.checked ? "light" : "dark"
//         );
//     });

   
//     document.querySelector("#menu-toggle").addEventListener("click", () => {

//         const sidebar = document.querySelector("#sidebar");

//         const isOpen = sidebar.classList.toggle("is-open");

//         document.querySelector("#menu-toggle").setAttribute(
//             "aria-expanded",
//             String(isOpen)
//         );
//     });

//     document.addEventListener(
//         "DOMContentLoaded",
//         iniciarEdicaoManutencao
//     );

// })();