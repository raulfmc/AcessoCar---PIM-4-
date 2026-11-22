function configuracaoEdicaoVeiculo(carro_Id) {
    const endpointCarro = "https://localhost:7240/api/Carro";
    const endpointAdaptacao = "https://localhost:7240/api/Adaptacao";
    let adaptacaoId;
    return {
        id: carro_Id,
        endpoint: endpointCarro,
        formulario: document.querySelector("#registration-form"),
        buscarDados: async (id) => {

            const [resCarro, resAdaptacao] = await Promise.all([
                fetch(`${endpointCarro}/${id}`),
                fetch(endpointAdaptacao)
            ]);

            if (!resCarro.ok || !resAdaptacao.ok) {
                throw new Error("Não foi possível buscar os dados do veículo.");
            }

            const [carro, respostaAdaptacoes] = await Promise.all([
                resCarro.json(),
                resAdaptacao.json()
            ]);

            const adaptacoes = respostaAdaptacoes.data ?? respostaAdaptacoes;

            const adaptacao = adaptacoes.find(
                item => String(item.carro_ID) === String(id)
            );

            if (!adaptacao) {
                throw new Error("Não foi encontrada uma adaptação para este veículo.");
            }

            adaptacaoId = adaptacao.id;

            return { carro, adaptacao };
        },
        // buscarDados: async (id) => {

        //     const [resCarro, resAdaptacao] = await Promise.all([
        //         fetch(`${endpointCarro}/${id}`),


        //         fetch(`${endpointAdaptacao}/${id}`)
        //     ]);

        //     if (!resCarro.ok || !resAdaptacao.ok) {
        //         throw new Error("Não foi possível buscar os dados do veículo.");
        //     }

        //     const [carro, adaptacao] = await Promise.all([
        //         resCarro.json(),
        //         resAdaptacao.json()
        //     ]);

        //     return { carro, adaptacao };
        // },

        mapearDados: (dados) => ({
            Marca: dados.carro.marca,
            Modelo: dados.carro.modelo,
            Ano_Fabricacao: dados.carro.ano_Fabricacao,
            Numero: dados.carro.numero,
            Versao: dados.carro.versao,
            Cambio: dados.carro.cambio,
            Placa: dados.carro.placa,
            Cor: dados.carro.cor,
            Valor_Diaria: dados.carro.valor_Diaria,
            Nome: dados.adaptacao.nome,
            Tipo: dados.adaptacao.tipo
        }),
        montarPayload: (formulario) => ({
            carro: {
                Marca: formulario.querySelector("#Marca").value,
                Modelo: formulario.querySelector("#Modelo").value,
                Ano_Fabricacao: Number(formulario.querySelector("#Ano_Fabricacao").value),
                Numero: formulario.querySelector("#Numero").value,
                Versao: formulario.querySelector("#Versao").value,
                Cambio: formulario.querySelector("#Cambio").value,
                Placa: formulario.querySelector("#Placa").value,
                Cor: formulario.querySelector("#Cor").value,
                Valor_Diaria: Number(formulario.querySelector("#Valor_Diaria").value)
            },

            adaptacao: {
                ID: adaptacaoId,
                Nome: formulario.querySelector("#Nome").value,
                Tipo: formulario.querySelector("#Tipo").value
            }
        }),
        // montarPayload: (formulario) => ({
        //     carro: {
        //         Marca: formulario.querySelector("#Marca").value,
        //         Modelo: formulario.querySelector("#Modelo").value,
        //         Ano_Fabricacao: Number(formulario.querySelector("#Ano_Fabricacao").value),
        //         Numero: formulario.querySelector("#Numero").value,
        //         Versao: formulario.querySelector("#Versao").value,
        //         Cambio: formulario.querySelector("#Cambio").value,
        //         Placa: formulario.querySelector("#Placa").value,
        //         Cor: formulario.querySelector("#Cor").value,
        //         Valor_Diaria: Number(formulario.querySelector("#Valor_Diaria").value)
        //     },

        //     adaptacao: {
        //         ID: adaptacaoId,
        //         Nome: formulario.querySelector("#Nome").value,
        //         Tipo: formulario.querySelector("#Tipo").value
        //     }

        // }),
        atualizarDados: async (id, payload) => {

            console.log("ID do veículo:", id);
            console.log("Objeto enviado:", payload);

            const resCarro = await fetch(`${endpointCarro}/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!resCarro.ok) {
                const erro = await resCarro.json();
                throw new Error(erro.detail ?? erro.message ?? erro.mensagem ?? "Erro ao atualizar veículo.");
            }
        },
        // atualizarDados: async (id, payload) => {

        //     console.log("ID do veículo:", id);
        //     console.log("Objeto enviado no PUT:", payload.carro);
        //     console.log("Placa enviada:", payload.carro.Placa);
        //     const resCarro = await fetch(`${endpointCarro}/${id}`, {
        //         method: "PUT",
        //         headers: {
        //             "Content-Type": "application/json"
        //         },
        //         body: JSON.stringify(payload.carro)
        //     });

        //     if (!resCarro.ok) {
        //         throw new Error("Erro ao atualizar o veículo.");
        //     }

        //     // Atualizar adaptação
        //     // A rota e o ID precisam corresponder à sua API.
        //     const resAdaptacao = await fetch(`${endpointAdaptacao}/...`, {
        //         method: "PUT",
        //         headers: {
        //             "Content-Type": "application/json"
        //         },
        //         body: JSON.stringify(payload.adaptacao)
        //     });

        //     if (!resAdaptacao.ok) {
        //         throw new Error("Erro ao atualizar a adaptação.");
        //     }
        // },


    };
    // return {
    //     id: carro_Id,
    //     endpoint: "https://localhost:7240/api/Carro",
    //     formulario: document.querySelector("#registration-form"),
    //     mapearDados: (dados) => ({
    //         carro: {
    //             Marca: dados.marca,
    //             Modelo: dados.modelo,
    //             Ano_Fabricacao: dados.ano_Fabricacao,
    //             Numero: dados.numero,
    //             Versao: dados.versao,
    //             Cambio: dados.cambio,
    //             Placa: dados.placa,
    //             Cor: dados.cor,
    //             Valor_Diaria: dados.valor_Diaria
    //         },

    //         adaptacao: {
    //             Nome: dados.nome,
    //             Tipo: dados.tipo,
    //             Ativo: true
    //         }
    //     }),

    //     montarPayload: (formulario) => ({
    //         Nome: formulario.querySelector("#Nome").value,
    //         CPF: formulario.querySelector("#CPF").value,
    //         Telefone: formulario.querySelector("#Telefone").value,
    //         Membros: formulario.querySelector("#Membros").value,
    //         CNH: formulario.querySelector("#CNH").value,
    //         Email: formulario.querySelector("#Email").value,
    //         Endereco: formulario.querySelector("#Endereco").value,
    //         Ativo: true
    //     })
    // };
};


async function iniciarEdicaoVeiculo() {
    const parametros = new URLSearchParams(window.location.search);
    const carroId = parametros.get("id");

    if (!carroId) {
        alert("ID do veículo não informado.");
        return;
    }

    const config = configuracaoEdicaoVeiculo(carroId);

    config.formulario.addEventListener("submit", async (event) => {
        event.preventDefault();

        await salvarEdicao(config);
    });

    try {
        const dados = await editarRegistro(config);



    } catch (error) {
        console.error("Erro ao carregar veículo:", error);
        showMessage("Não foi possível carregar os dados do veículo.", true);
    }
}

document.addEventListener("DOMContentLoaded", iniciarEdicaoVeiculo);