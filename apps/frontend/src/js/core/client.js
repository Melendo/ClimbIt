// Centralizacion de las peticiones fetch con manejo de errores

const TOKEN_KEY = 'jwt_token';
export const OFFLINE_READ_ONLY_ERROR_CODE = 'OFFLINE_READ_ONLY';
export const OFFLINE_UNAVAILABLE_ERROR_CODE = 'OFFLINE_UNAVAILABLE';


export function isOnline() {
    return typeof navigator === 'undefined' ? true : navigator.onLine;
}

function buildClientError(message, code) {
    const error = new Error(message);
    error.code = code;
    return error;
}

function isReadOnlyMethod(method) {
    return ['GET', 'HEAD', 'OPTIONS'].includes(method);
}

// Guardar el token después del login
export function saveToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

// Obtener el token
export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function decodeBase64Url(value) {
    if (!value || typeof value !== 'string') {
        return null;
    }

    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padding = normalized.length % 4;
    const padded = padding ? normalized + '='.repeat(4 - padding) : normalized;

    try {
        return atob(padded);
    } catch {
        return null;
    }
}

export function getTokenPayload() {
    const token = getToken();
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length < 2) return null;

    const payloadRaw = decodeBase64Url(parts[1]);
    if (!payloadRaw) return null;

    try {
        return JSON.parse(payloadRaw);
    } catch {
        return null;
    }
}

export function canManageRocodromo(idRocodromo) {
    const payload = getTokenPayload();
    if (!payload) return false;

    if (payload.rol === 'Admin') {
        return true;
    }

    if (payload.rol !== 'Gestor') {
        return false;
    }

    const targetId = Number(idRocodromo);
    if (!Number.isInteger(targetId) || targetId < 1) {
        return false;
    }

    const managedIds = Array.isArray(payload.rocodromosGestionados)
        ? payload.rocodromosGestionados.map((id) => Number(id))
        : [];

    return managedIds.includes(targetId);
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
    const method = (options.method || 'GET').toUpperCase();

    if (!isOnline() && !isReadOnlyMethod(method)) {
        throw buildClientError(
            'Sin conexión: la app está en modo lectura y no puedes realizar cambios.',
            OFFLINE_READ_ONLY_ERROR_CODE
        );
    }

    const token = getToken();
    const isFormDataBody = options.body instanceof FormData;

    // Añadir el token a los headers si existe
    const headers = {
        ...options.headers,
    };

    if (isFormDataBody && headers['Content-Type']) {
        // El navegador gestiona multipart/form-data y boundary automaticamente.
        delete headers['Content-Type'];
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    let response;

    try {
        response = await fetch(url, { ...options, method, headers });
    }
    catch {
        if (!isOnline()) {
            throw buildClientError(
                'Sin conexión y sin datos almacenados para esta solicitud.',
                OFFLINE_UNAVAILABLE_ERROR_CODE
            );
        }

        throw new Error('No se pudo completar la solicitud. Inténtalo de nuevo.');
    }

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

export async function fetchImageObjectUrl(url) {
    const response = await fetchClient(url);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
}

export async function fetchSvgText(url) {
    const response = await fetchClient(url);
    return await response.text();
}
