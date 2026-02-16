// Centralizacion de las peticiones fetch con manejo de errores

const TOKEN_KEY = 'jwt_token';

// Guardar el token después del login
export function saveToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

// Obtener el token
export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

// Eliminar el token (cerrar sesion)
export function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
}

// Comprobar si hay un token guardado
export function isAuthenticated() {
    return !!getToken();
}

export async function fetchClient(url, options = {}) {
    const token = getToken();

    // Añadir el token a los headers si existe
    const headers = {
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });

    // Si el servidor responde 401, el token expiró o es inválido
    if (response.status === 401) {
        removeToken();
        window.location.hash = '#login';
        throw new Error('Sesión expirada');
    }

    if (!response.ok) {
        const error = new Error(`Error ${response.status}: ${response.statusText}`);
        error.response = response;
        throw error;
    }
    return response;
}
