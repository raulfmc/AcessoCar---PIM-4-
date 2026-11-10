(() => {
	"use strict";

	const BODY_PARTS = [
		{ key: "left-arm", label: "Braço esquerdo" },
		{ key: "right-arm", label: "Braço direito" },
		{ key: "left-leg", label: "Perna esquerda" },
		{ key: "right-leg", label: "Perna direita" }
	];
	const validBodyParts = new Set(BODY_PARTS.map((part) => part.key));

	function normalizeBodyRegions(value) {
		const regions = Array.isArray(value) ? value : String(value || "").split(",");
		return Array.from(new Set(regions.map((region) => String(region).trim()).filter((region) => validBodyParts.has(region))));
	}

	function bodyRegionsAreCompatible(customerRegions, vehicleRegions) {
		const required = normalizeBodyRegions(customerRegions);
		const available = new Set(normalizeBodyRegions(vehicleRegions));
		return required.length === 0 || required.every((region) => available.has(region));
	}

	function formatDate(date) {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	}

	function addDays(value, days) {
		const date = new Date(`${value}T12:00:00`);
		date.setDate(date.getDate() + days);
		return formatDate(date);
	}

	function addMonths(value, months) {
		const [year, month, day] = value.split("-").map(Number);
		const targetMonth = month - 1 + months;
		const lastDay = new Date(year, targetMonth + 1, 0).getDate();
		return formatDate(new Date(year, targetMonth, Math.min(day, lastDay), 12));
	}

	function buildBodyMiniature(bodyRegions) {
		const selected = new Set(normalizeBodyRegions(bodyRegions));
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.setAttribute("viewBox", "0 0 100 220");
		svg.setAttribute("class", "body-miniature");
		svg.setAttribute("role", "img");
		svg.setAttribute("aria-label", selected.size
			? `Membros selecionados: ${BODY_PARTS.filter((part) => selected.has(part.key)).map((part) => part.label).join(", ")}`
			: "Nenhum membro selecionado");

		const shapes = [
			["head", "circle", { cx: "50", cy: "35", r: "23" }],
			["torso", "rect", { x: "29", y: "58", width: "44", height: "81", rx: "12" }],
			["left-arm", "rect", { x: "73", y: "60", width: "17", height: "73", rx: "8.5" }],
			["right-arm", "rect", { x: "10", y: "60", width: "17", height: "73", rx: "8.5" }],
			["left-leg", "rect", { x: "54", y: "140", width: "18", height: "78", rx: "9" }],
			["right-leg", "rect", { x: "28", y: "140", width: "18", height: "78", rx: "9" }]
		];

		shapes.forEach(([key, tagName, attributes]) => {
			const element = document.createElementNS("http://www.w3.org/2000/svg", tagName);
			element.classList.add("body-mini-part", `part-${key}`);
			element.setAttribute("fill", selected.has(key) ? "#5bd6aa" : "#c9ccd5");
			Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
			svg.append(element);
		});
		return svg;
	}

	window.AccessoCarUtils = {
		BODY_PARTS,
		addDays,
		addMonths,
		bodyRegionsAreCompatible,
		buildBodyMiniature,
		formatDate,
		normalizeBodyRegions
	};
})();
