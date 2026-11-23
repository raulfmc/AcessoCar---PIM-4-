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
		endpoint: "https://IP_DA_SUA_MAQUINA:7240/api/Cliente",
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
		montarPayload: async (formulario) => {

			const arquivoCNH = formulario.querySelector("#CNH").files[0];

			const payload = {
				Nome: formulario.querySelector("#Nome").value,
				CPF: formulario.querySelector("#CPF").value,
				Telefone: formulario.querySelector("#Telefone").value,
				Membros: formulario.querySelector("#Membros").value,
				Email: formulario.querySelector("#Email").value,
				Endereco: formulario.querySelector("#Endereco").value,
				Ativo: true
			};

			if (arquivoCNH) {
				payload.CNH = await arquivoParaBase64(arquivoCNH);
			}

			return payload;
		}
		// montarPayload: async (formulario) => {

		// 	const arquivoCNH = formulario.querySelector("#CNH").files[0];

		// 	let cnh = null;

		// 	if (arquivoCNH) {
		// 		cnh = await new Promise((resolve, reject) => {
		// 			const reader = new FileReader();

		// 			reader.onload = () => {
		// 				resolve(reader.result.split(",")[1]);
		// 			};

		// 			reader.onerror = () => reject(
		// 				new Error("Não foi possível carregar a CNH.")
		// 			);

		// 			reader.readAsDataURL(arquivoCNH);
		// 		});
		// 	}

		// 	return {
		// 		Nome: formulario.querySelector("#Nome").value,
		// 		CPF: formulario.querySelector("#CPF").value,
		// 		Telefone: formulario.querySelector("#Telefone").value,
		// 		Membros: formulario.querySelector("#Membros").value,
		// 		CNH: cnh,
		// 		Email: formulario.querySelector("#Email").value,
		// 		Endereco: formulario.querySelector("#Endereco").value,
		// 		Ativo: true
		// 	};
		// }
		// montarPayload: async (formulario) => ({

		// 	Nome: formulario.querySelector("#Nome").value,
		// 	CPF: formulario.querySelector("#CPF").value,
		// 	Telefone: formulario.querySelector("#Telefone").value,
		// 	Membros: formulario.querySelector("#Membros").value,
		// 	CNH: formulario.querySelector("#CNH").value,
		// 	Email: formulario.querySelector("#Email").value,
		// 	Endereco: formulario.querySelector("#Endereco").value,
		// 	Ativo: true
		// })
	};
};


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
	bodyRegionSelector.addEventListener("click", (event) => {
		const region = event.target.closest(
			".body-region, .body-region-option"
		);

		if (!region || !bodyRegionSelector.contains(region)) {
			return;
		}

		toggleBodyRegion(region);
	});
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

document.addEventListener("DOMContentLoaded", iniciarEdicaoCliente);