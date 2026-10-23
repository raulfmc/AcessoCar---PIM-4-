(() => {
	"use strict";

	const form = document.querySelector("#registration-form");
	const kind = form.dataset.kind;
	const isCustomer = kind === "customer";
	const collectionName = isCustomer ? "customers" : "vehicles";
	const prefix = isCustomer ? "CLI" : "VEI";
	const listPage = isCustomer ? "clientes.html" : "veiculos.html";
	const message = document.querySelector("#registration-message");
	//const idField = document.querySelector("#registration-id");
	const photoField = document.querySelector("#photo");
	const photoPreview = document.querySelector("#photo-preview");
	const themeToggle = document.querySelector("#theme-toggle");
	const themeLabel = document.querySelector("#theme-label");
	const savedTheme = localStorage.getItem("acessocar-theme");
	let photoData = "";

	function setTheme(isLight) {
		document.documentElement.dataset.theme = isLight ? "light" : "dark";
		themeToggle.checked = isLight;
		themeToggle.setAttribute("aria-label", isLight ? "Ativar tema escuro" : "Ativar tema claro");
		themeLabel.textContent = isLight ? "Tema claro" : "Tema escuro";
	}

	function nextId() {
		const records = AccessoCarData.read()[collectionName];
		const highestNumber = records.reduce((highest, record) => {
			const match = new RegExp(`^${prefix}-(\\d+)$`).exec(record.id);
			return match ? Math.max(highest, Number(match[1])) : highest;
		}, 0);
		return `${prefix}-${String(highestNumber + 1).padStart(3, "0")}`;
	}

	function showMessage(text, isError = false) {
		message.textContent = text;
		message.classList.add("is-visible");
		message.classList.toggle("is-error", isError);
		message.scrollIntoView({ behavior: "smooth", block: "nearest" });
	}

	function readPhoto(file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.addEventListener("load", () => resolve(reader.result));
			reader.addEventListener("error", () => reject(new Error("Não foi possível carregar a foto selecionada.")));
			reader.readAsDataURL(file);
		});
	}

	function formValue(name) {
		return form.elements.namedItem(name).value.trim();
	}

	async function createCustomerRecord() {

		const dados = {
			Nome: document.getElementById("Nome").value,
			CPF: document.getElementById("CPF").value,
			Telefone: document.getElementById("Telefone").value,
			Endereco: document.getElementById("Endereco").value,
			Email: document.getElementById("Email").value,
			Ativo: true
		}

		try {
			const resposta = await fetch("http://localhost:5104/api/Cliente", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(dados)
			});
			console.log(resposta.status);
			const texto = await resposta.text();

			console.log("Status:", resposta.status);
			console.log("Resposta:", texto);

			if (resposta.ok) {
				alert("Cliente cadastrado com sucesso!");

			} else {
				alert("Erro ao cadastrar cliente.");
			}
		}
		catch (erro) {
			console.error("Erro:", erro);
			alert("Não foi possível conectar com a API.");
		}
		console.log(document.getElementById("Nome"));
		console.log(document.getElementById("CPF"));
		console.log(document.getElementById("Telefone"));
		console.log(document.getElementById("Email"));
		console.log(document.getElementById("Endereco"));


		// return {
		// 	id: idField.value,
		// 	name: formValue("name"),
		// 	cpf: formValue("cpf"),
		// 	address: formValue("address"),
		// 	phone: formValue("phone"),
		// 	email: formValue("email"),
		// 	cnh: formValue("cnh"), 
		// 	accessibilityDifficulty: formValue("accessibilityDifficulty"),
		// 	vehiclePlate: null
		// };
	}

	async function createVehicleRecord() {
		const dados = {
			Marca: document.getElementById("Marca").value,
			Modelo: document.getElementById("Modelo").value,
			Ano_Fabricacao: parseInt(document.getElementById("Ano_Fabricacao").value),
			Numero: parseInt(document.getElementById("Numero").value),
			Versao: document.getElementById("Versao").value,
			Cambio: document.getElementById("Cambio").value,
			Placa: document.getElementById("Placa").value,
			Cor: document.getElementById("Cor").value,
			Valor_Diaria: parseFloat(document.getElementById("Valor_Diaria").value),
			Ativo: true
		};



		try {
			const resposta = await fetch("http://localhost:5104/api/Carro", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(dados)
			});
			console.log(resposta.status);
			const texto = await resposta.text();

			console.log("Status:", resposta.status);
			console.log("Resposta:", texto);

			if (resposta.ok) {
				alert("Carro cadastrado com sucesso!");

			} else {
				alert("Erro ao cadastrar carro.");
			}
		}
		catch (erro) {
			console.error("Erro:", erro);
			alert("Não foi possível conectar com a API.");
		}





















		// const brand = formValue("brand");
		// const model = formValue("model");
		// const version = formValue("version");
		// return {
		// 	id: idField.value,
		// 	brand,
		// 	model,
		// 	name: [brand, model, version].filter(Boolean).join(" "),
		// 	year: formValue("year"),
		// 	number: formValue("number"),
		// 	version,
		// 	transmission: formValue("transmission"),
		// 	plate: formValue("plate").toUpperCase(),
		// 	color: formValue("color"),
		// 	dailyRate: Number(formValue("dailyRate")),
		// 	mainFeature: formValue("mainFeature"),
		// 	category: formValue("mainFeature") || "Não informada",
		// 	accessibilityDifficulty: formValue("accessibilityDifficulty"),
		// 	photo: photoData,
		// 	status: "available"
		// };
	}
	

	//idField.value = nextId();
	setTheme(savedTheme === "light");

	themeToggle.addEventListener("change", () => {
		setTheme(themeToggle.checked);
		localStorage.setItem("acessocar-theme", themeToggle.checked ? "light" : "dark");
	});

	if (!isCustomer) {
		photoField.addEventListener("change", async () => {
			const file = photoField.files[0];
			photoData = "";
			photoPreview.classList.remove("is-visible");
			photoPreview.removeAttribute("src");
			if (!file) return;

			if (!file.type.startsWith("image/")) {
				photoField.value = "";
				showMessage("Selecione um arquivo de imagem válido.", true);
				return;
			}
			if (file.size > 1024 * 1024) {
				photoField.value = "";
				showMessage("A foto deve ter no máximo 1 MB para ser salva neste cadastro.", true);
				return;
			}

			try {
				photoData = await readPhoto(file);
				photoPreview.src = photoData;
				photoPreview.classList.add("is-visible");
				message.classList.remove("is-visible");
			} catch (error) {
				photoField.value = "";
				showMessage(error.message, true);
			}
		});
	}

	form.addEventListener("submit", (event) => {
		event.preventDefault();
		if (!form.reportValidity()) return;
		if (!isCustomer && photoField.files.length && !photoData) {
			showMessage("Aguarde o carregamento da foto antes de salvar.", true);
			return;
		}

		try {
			const state = AccessoCarData.read();
			const record = isCustomer ? createCustomerRecord() : createVehicleRecord();
			state[collectionName].push(record);
			AccessoCarData.write(state);
			showMessage(`${isCustomer ? "Cliente" : "Veículo"} cadastrado com sucesso.`);
			form.reset();
			photoData = "";
			photoPreview.classList.remove("is-visible");
			photoPreview.removeAttribute("src");
			//idField.value = nextId();
			document.querySelector("#view-records").href = listPage;
		} catch (error) {
			showMessage(`Não foi possível salvar o cadastro: ${error.message}`, true);
		}
	});

	const sidebar = document.querySelector("#sidebar");
	const menuToggle = document.querySelector("#menu-toggle");
	menuToggle.addEventListener("click", () => {
		const isOpen = sidebar.classList.toggle("is-open");
		menuToggle.setAttribute("aria-expanded", String(isOpen));
		menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
	});
})();
