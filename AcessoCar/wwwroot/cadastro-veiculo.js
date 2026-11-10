(() => {
	"use strict";

	// POST de veículo recebe os campos do formulário e deve gerar o identificador.
	const API_BASE_URL = "";
	const API_ROUTES = { vehicles: "" };
	const form = document.querySelector("#registration-form");
	const message = document.querySelector("#registration-message");
	const photoField = document.querySelector("#photo");
	const photoPreview = document.querySelector("#photo-preview");
	const themeToggle = document.querySelector("#theme-toggle");
	const themeLabel = document.querySelector("#theme-label");
	const bodyRegionSelector = document.querySelector(".body-selector");
	const bodyRegionsInput = document.querySelector("#body-regions");
	let photoData = "";
	let selectedBodyRegions = new Set();

	async function request(routeName, payload) {
		const route = API_ROUTES[routeName];
		if (!API_BASE_URL.trim() || !route.trim()) {
			throw new Error(`Configure API_BASE_URL e API_ROUTES.${routeName} em cadastro-veiculo.js.`);
		}
		const response = await fetch(`${API_BASE_URL.replace(/\/+$/, "")}/${route.replace(/^\/+/, "")}`, {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload)
		});
		const body = response.status === 204 ? null : await response.json();
		if (!response.ok) throw new Error(body?.message || `A API respondeu com HTTP ${response.status}.`);
		return body?.data ?? body;
	}

	function setTheme(isLight) {
		document.documentElement.dataset.theme = isLight ? "light" : "dark";
		themeToggle.checked = isLight;
		themeToggle.setAttribute("aria-label", isLight ? "Ativar tema escuro" : "Ativar tema claro");
		themeLabel.textContent = isLight ? "Tema claro" : "Tema escuro";
	}

	function showMessage(text, isError = false) {
		message.textContent = text;
		message.classList.add("is-visible");
		message.classList.toggle("is-error", isError);
	}

	function formValue(name) {
		return form.elements.namedItem(name).value.trim();
	}

	function syncBodySelectionUI() {
		bodyRegionSelector.querySelectorAll(".body-region, .body-region-option").forEach((region) => {
			const selected = selectedBodyRegions.has(region.dataset.bodyPart);
			region.classList.toggle("is-selected", selected);
			region.setAttribute("aria-pressed", String(selected));
		});
		bodyRegionsInput.value = Array.from(selectedBodyRegions).join(",");
	}

	function toggleBodyRegion(region) {
		const part = region.dataset.bodyPart;
		if (!part) return;
		if (selectedBodyRegions.has(part)) selectedBodyRegions.delete(part);
		else selectedBodyRegions.add(part);
		syncBodySelectionUI();
	}

	function readPhoto(file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.addEventListener("load", () => resolve(reader.result));
			reader.addEventListener("error", () => reject(new Error("Não foi possível carregar a foto selecionada.")));
			reader.readAsDataURL(file);
		});
	}

	function createVehicleRecord() {
		const brand = formValue("brand");
		const model = formValue("model");
		const version = formValue("version");
		return {
			brand,
			model,
			name: [brand, model, version].filter(Boolean).join(" "),
			year: formValue("year"),
			number: formValue("number"),
			version,
			transmission: formValue("transmission"),
			plate: formValue("plate").toUpperCase(),
			color: formValue("color"),
			dailyRate: Number(formValue("dailyRate")),
			mainFeature: formValue("mainFeature"),
			category: formValue("mainFeature") || "Não informada",
			bodyRegions: Array.from(selectedBodyRegions),
			photo: photoData
		};
	}

	bodyRegionSelector.addEventListener("click", (event) => {
		const region = event.target.closest(".body-region, .body-region-option");
		if (region) toggleBodyRegion(region);
	});
	bodyRegionSelector.addEventListener("keydown", (event) => {
		const region = event.target.closest(".body-region");
		if (region && (event.key === "Enter" || event.key === " ")) {
			event.preventDefault();
			toggleBodyRegion(region);
		}
	});
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
			showMessage("A foto deve ter no máximo 1 MB.", true);
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

	setTheme(localStorage.getItem("acessocar-theme") === "light");
	themeToggle.addEventListener("change", () => {
		setTheme(themeToggle.checked);
		localStorage.setItem("acessocar-theme", themeToggle.checked ? "light" : "dark");
	});
	form.addEventListener("submit", async (event) => {
		event.preventDefault();
		if (!form.reportValidity()) return;
		if (photoField.files.length && !photoData) {
			showMessage("Aguarde o carregamento da foto antes de salvar.", true);
			return;
		}
		if (selectedBodyRegions.size === 0) {
			showMessage("Selecione pelo menos um membro funcional do veículo.", true);
			return;
		}
		try {
			const vehicle = await request("vehicles", createVehicleRecord());
			showMessage(`Veículo ${vehicle?.id || ""} cadastrado com sucesso.`.trim());
			form.reset();
			selectedBodyRegions.clear();
			syncBodySelectionUI();
			photoData = "";
			photoPreview.classList.remove("is-visible");
			photoPreview.removeAttribute("src");
		} catch (error) {
			showMessage(`Não foi possível cadastrar o veículo: ${error.message}`, true);
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
