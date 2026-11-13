const API_BASE_URL = "https://localhost:7240";

let csrfToken = null;

// Obtém um token antiforgery do servidor.
async function obterTokenCSRF() {
    const response = await fetch(
        `${API_BASE_URL}/api/Auth/csrf`,
        {
            method: "GET",
            credentials: "include"
        },
        
    );
    

    if (!response.ok) {
        throw new Error("Falha ao obter token CSRF.");
    }

    const data = await response.json();

    csrfToken = data.requestToken;

    return csrfToken;
}

// Envia requisições protegidas com o token.
async function fetchProtegido(url, options = {}) {
    const method = (options.method || "GET").toUpperCase();

    const metodosProtegidos = [
        "POST",
        "PUT",
        "PATCH",
        "DELETE"
    ];

    if (metodosProtegidos.includes(method)) {
        if (!csrfToken) {
            await obterTokenCSRF();
        }
    }

    const headers = {
        ...options.headers
    };

    if (metodosProtegidos.includes(method)) {
        headers["X-CSRF-TOKEN"] = csrfToken;
    }

    return fetch(url, {
        ...options,
        method,
        headers,
        credentials: "include"
    });
}