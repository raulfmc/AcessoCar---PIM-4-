function configuracaoEdicaoLocacao(aluguel_Id) {

	return {
		id: aluguel_Id,
		endpoint: "https://localhost:7240/api/Aluguel",
		formulario: document.querySelector("#registration-form"),

		mapearDados: (dados) => ({
			Nome: dados.nome,
			CPF: dados.cpf,
			Telefone: dados.telefone,
			Membros: Array.isArray(dados.membros)
				? dados.membros.join(",")
				: dados.membros ?? "",
			CNH: dados.cnh,
			Email: dados.email,
			Endereco: dados.endereco
		}),

		montarPayload: (formulario) => ({
			Nome: formulario.querySelector("#Nome").value,
			CPF: formulario.querySelector("#CPF").value,
			Telefone: formulario.querySelector("#Telefone").value,
			Membros: formulario.querySelector("#Membros").value,
			CNH: formulario.querySelector("#CNH").value,
			Email: formulario.querySelector("#Email").value,
			Endereco: formulario.querySelector("#Endereco").value,
			Ativo: true
		})
	};
};


async function iniciarEdicaoCliente() {
	const parametros = new URLSearchParams(window.location.search);
	const clienteId = parametros.get("id");
	
	if (!clienteId) {
		alert("ID da locação não informado.");
		return;
	}

	const config = configuracaoEdicaoCliente(clienteId);

	config.formulario.addEventListener("submit", async (event) => {
		event.preventDefault();

		await salvarEdicao(config);
	});

	try {
		const dados = await editarRegistro(config);

		

	} catch (error) {
		console.error("Erro ao carregar cliente:", error);
		showMessage("Não foi possível carregar os dados do cliente.", true);
	}
}

document.addEventListener("DOMContentLoaded", iniciarEdicaoCliente);