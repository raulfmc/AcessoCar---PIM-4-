async function editarRegistro(config) {
    const {
        id,
        endpoint,
        formulario,
        mapearDados,
        montarPayload
    } = config;

    try {
        // Busca os dados atuais

        const response = await fetch(`${endpoint}/${id}`);

        if (!response.ok) {
            throw new Error("Não foi possível buscar o registro.");
        }

        const dados = await response.json();

        // Preenche os campos do formulário
        const dadosFormulario = mapearDados(dados);

        Object.entries(dadosFormulario).forEach(([campo, valor]) => {

            if (campo === "Membros") return;

            const elemento = formulario.querySelector(`#${campo}`);

            if (elemento) {
                elemento.value = valor ?? "";
            }
        });

        // Retorna os dados para uso posterior
        return dados;

    } catch (error) {
        console.error("Erro na edição:", error);
        throw error;
    }
}

async function salvarEdicao(config) {
    const {
        id,
        endpoint,
        formulario,
        montarPayload
    } = config;

    try {
        const payload = montarPayload(formulario);

        const response = await fetch(`${endpoint}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        // if (!response.ok) {
        //     const erro = await response.json();
        //     throw new Error(
        //         erro.detail ?? erro.message ?? erro.mensagem ??
        //         erro.title ?? "Erro ao atualizar registro."
        //     );
        // }

        if (!response.ok) {
            const erro = await response.json();

            console.log("STATUS:", response.status);
            console.log("ERRO DA API:", erro);
            console.log("PAYLOAD ENVIADO:", payload);

            if (erro.errors) {
                Object.entries(erro.errors).forEach(([campo, mensagens]) => {
                    console.error(`${campo}:`, mensagens);
                });
            }

            throw new Error(
                erro.detail ??
                erro.message ??
                erro.title ??
                "Erro ao atualizar registro."
            );
        }
        showMessage("Registro atualizado com sucesso!");

        return true;

    } catch (error) {
        console.error("Erro ao salvar:", error);
        showMessage(error.message);
        return false;
    }
}
function showMessage(text, isError = false) {
    const message = document.querySelector("#registration-message");

    if (!message) return;
    message.textContent = text;
    message.classList.add("is-visible");
    message.classList.toggle("is-error", isError);
}