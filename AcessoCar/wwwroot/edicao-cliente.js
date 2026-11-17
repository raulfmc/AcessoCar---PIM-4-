let bodyRegionSelector;
let bodyRegionsInput;

let selectedBodyRegions = new Set();



function syncBodySelectionUI() {
	bodyRegionSelector.querySelectorAll(
		".body-region, .body-region-option"
	).forEach((region) => {

		const selected = selectedBodyRegions.has(
			region.dataset.bodyPart
		);

		region.classList.toggle("is-selected", selected);
		region.setAttribute("aria-pressed", String(selected));
	});

	bodyRegionsInput.value = Array.from(selectedBodyRegions).join(",");
}

function restaurarMembros(membros) {
	selectedBodyRegions.clear();

	// Aceita tanto array quanto string
	const lista = Array.isArray(membros)
		? membros
		: typeof membros === "string"
			? membros.split(",")
			: [];

	lista.forEach((membro) => {
		const valor = membro.trim();

		if (valor) {
			selectedBodyRegions.add(valor);
		}
	});

	syncBodySelectionUI();
}

function toggleBodyRegion(region) {
	const part = region.dataset.bodyPart;

	if (!part) return;

	if (selectedBodyRegions.has(part)) {
		selectedBodyRegions.delete(part);
	} else {
		selectedBodyRegions.add(part);
	}

	syncBodySelectionUI();
}

function configuracaoEdicaoCliente(cliente_Id) {

	return {
		id: cliente_Id,
		endpoint: "https://localhost:7240/api/Cliente",
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
// function abrirEdicaoCliente() {
// 	const clienteId = prompt("Digite o ID do cliente que deseja editar:");

// 	// Verifica se o usuário cancelou ou não informou nada
// 	if (clienteId === null || clienteId.trim() === "") {
// 		return;
// 	}

// 	// Verifica se o ID é numérico e positivo
// 	if (!/^[1-9]\d*$/.test(clienteId.trim())) {
// 		alert("Informe um ID válido.");
// 		return;
// 	}

// 	window.location.href = `EdiçãoCliente.html?id=${clienteId.trim()}`;
// }
async function iniciarEdicaoCliente() {
	const parametros = new URLSearchParams(window.location.search);
	const clienteId = parametros.get("id");
	bodyRegionSelector = document.querySelector(".body-selector");
	bodyRegionsInput = document.querySelector("#Membros");
	console.log("Seletor corporal:", bodyRegionSelector);
	console.log("Campo de membros:", bodyRegionsInput);
	if (!bodyRegionSelector || !bodyRegionsInput) {
		console.error("Elementos do seletor corporal não encontrados.");
		return;
	}
	if (!clienteId) {
		alert("ID do cliente não informado.");
		return;
	}

	const config = configuracaoEdicaoCliente(clienteId);

	config.formulario.addEventListener("submit", async (event) => {
		event.preventDefault();

		await salvarEdicao(config);
	});

	try {
		const dados = await editarRegistro(config);

		restaurarMembros(
			dados.membros ?? dados.Membros ?? ""
		);

	} catch (error) {
		console.error("Erro ao carregar cliente:", error);
		showMessage("Não foi possível carregar os dados do cliente.", true);
	}
}
// tableBody.addEventListener("click", (event) => {
// 	const editButton = event.target.closest("[data-edit-customer]");
// 	if (!editButton) return;

// 	abrirEdicaoCliente();
// });
document.addEventListener("DOMContentLoaded", iniciarEdicaoCliente);