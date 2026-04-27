// Centralizacion de las peticiones fetch con manejo de errores

const TOKEN_KEY = 'jwt_token';
export const OFFLINE_READ_ONLY_ERROR_CODE = 'OFFLINE_READ_ONLY';
export const OFFLINE_UNAVAILABLE_ERROR_CODE = 'OFFLINE_UNAVAILABLE';
const USER_DYNAMIC_CACHE_NAME = 'api-dynamic-data';


export function isOnline() {
    return typeof navigator === 'undefined' ? true : navigator.onLine;
}

// Estandariza errores de cliente para poder identificarlos por codigo.
function buildClientError(message, code) {
    const error = new Error(message);
    error.code = code;
    return error;
}

// Determina si una peticion es de solo lectura (permitida en modo offline).
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

// Decodifica un fragmento Base64URL de JWT de forma segura.
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

// Obtiene el payload del JWT para decisiones de autorizacion en frontend.
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

// Verifica permisos de gestion de rocodromo segun rol y lista en el token.
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

export async function clearUserCache() {
    if (typeof caches === 'undefined') {
        return;
    }

    try {
        await caches.delete(USER_DYNAMIC_CACHE_NAME);
    } catch (err) {
        console.warn('No se pudo limpiar la cache de usuario:', err.message);
    }
}

// Helper de warm-up: hace GET autenticado y devuelve la respuesta.
// El SW de Workbox intercepta la peticion y cachea la respuesta automaticamente.
async function fetchAuthenticatedGet(url, headers) {
    const response = await fetch(url, {
        method: 'GET',
        headers,
    });

    if (!response.ok) {
        throw new Error(`Warm-up fallido para ${url} (${response.status})`);
    }

    return response;
}

// Ceba cache de zonas, mapas SVG y rutas de cada rocodromo suscrito para offline.
async function warmUpRocodromoDataCache(misRocodromos, headers) {
    if (!Array.isArray(misRocodromos) || misRocodromos.length === 0) {
        return;
    }

    const rocodromoEndpoints = [];

    for (const rocodromo of misRocodromos) {
        const idRoco = Number(rocodromo?.id);
        if (!Number.isInteger(idRoco) || idRoco < 1) {
            continue;
        }

        // Cachear info del rocodromo, zonas y escalas de dificultad.
        rocodromoEndpoints.push(`/rocodromos/${idRoco}`);
        rocodromoEndpoints.push(`/rocodromos/zonas/${idRoco}`);
        rocodromoEndpoints.push(`/rocodromos/${idRoco}/escalasDificultad`);
    }

    const rocoResults = await Promise.allSettled(
        rocodromoEndpoints.map((endpoint) => fetchAuthenticatedGet(endpoint, headers))
    );
    const failedRoco = rocoResults.filter((r) => r.status === 'rejected').length;
    if (failedRoco > 0) {
        console.warn(`Warm-up de rocodromos completado con ${failedRoco} fallo(s).`);
    }

    // Extraer zonas obtenidas para cachear sus mapas y rutas.
    const zonaEndpoints = [];

    for (const rocodromo of misRocodromos) {
        const idRoco = Number(rocodromo?.id);
        if (!Number.isInteger(idRoco) || idRoco < 1) {
            continue;
        }

        // Buscar la respuesta de zonas en los resultados previos.
        const zonasEndpoint = `/rocodromos/zonas/${idRoco}`;
        const zonasResultIndex = rocodromoEndpoints.indexOf(zonasEndpoint);
        const zonasResult = zonasResultIndex > -1 ? rocoResults[zonasResultIndex] : null;

        let zonas = [];
        if (zonasResult?.status === 'fulfilled' && zonasResult.value) {
            try {
                zonas = await zonasResult.value.clone().json();
            } catch {
                zonas = [];
            }
        }

        if (!Array.isArray(zonas)) {
            continue;
        }

        for (const zona of zonas) {
            const idZona = Number(zona?.id);
            if (!Number.isInteger(idZona) || idZona < 1) {
                continue;
            }

            // Cachear rutas de la zona (datos JSON, sin imagenes).
            zonaEndpoints.push(`/zonas/pistas/${idZona}`);

            // Cachear mapa SVG de la zona si tiene uno.
            if (zona.mapa) {
                zonaEndpoints.push(`/zonas/${idZona}/mapa`);
            }
        }
    }

    if (zonaEndpoints.length === 0) {
        return;
    }

    const zonaResults = await Promise.allSettled(
        zonaEndpoints.map((endpoint) => fetchAuthenticatedGet(endpoint, headers))
    );
    const failedZonas = zonaResults.filter((r) => r.status === 'rejected').length;
    if (failedZonas > 0) {
        console.warn(`Warm-up de zonas/rutas completado con ${failedZonas} fallo(s).`);
    }

    // Extraer IDs de rutas de las respuestas de /zonas/pistas/:id para cachear info individual.
    const rutaEndpoints = [];

    for (let i = 0; i < zonaEndpoints.length; i++) {
        if (!zonaEndpoints[i].startsWith('/zonas/pistas/')) {
            continue;
        }

        const result = zonaResults[i];
        if (result?.status !== 'fulfilled' || !result.value) {
            continue;
        }

        let rutas = [];
        try {
            rutas = await result.value.clone().json();
        } catch {
            continue;
        }

        if (!Array.isArray(rutas)) {
            continue;
        }

        for (const ruta of rutas) {
            const idRuta = Number(ruta?.id);
            if (!Number.isInteger(idRuta) || idRuta < 1) {
                continue;
            }

            rutaEndpoints.push(`/pistas/${idRuta}`);
            rutaEndpoints.push(`/pistas/${idRuta}/valoracionTotal`);
        }
    }

    if (rutaEndpoints.length > 0) {
        const rutaResults = await Promise.allSettled(
            rutaEndpoints.map((endpoint) => fetchAuthenticatedGet(endpoint, headers))
        );
        const failedRutas = rutaResults.filter((r) => r.status === 'rejected').length;
        if (failedRutas > 0) {
            console.warn(`Warm-up de info de rutas completado con ${failedRutas} fallo(s).`);
        }
    }
}

// Ceba cache de datos e imagenes clave inmediatamente despues de iniciar sesion.
// Las peticiones son interceptadas por el SW de Workbox que las cachea automaticamente.
export async function warmUpAppDataCache() {
    if (!isOnline() || typeof fetch === 'undefined') {
        return;
    }

    const token = getToken();
    if (!token) {
        return;
    }

    const headers = {
        Authorization: `Bearer ${token}`,
    };

    const now = new Date();
    const actividadParams = new URLSearchParams({
        year: String(now.getFullYear()),
        month: String(now.getMonth() + 1),
    });

    // Endpoints de datos del usuario.
    const userEndpoints = [
        '/escaladores/perfil',
        '/escaladores/mis-rocodromos',
        '/escaladores/stats/resumen',
        '/escaladores/stats/tipos',
        `/escaladores/stats/actividad-mensual?${actividadParams.toString()}`,
        '/amistades/mis-amigos',
        '/amistades/solicitudes-pendientes',
        '/rocodromos',
    ];

    const userResults = await Promise.allSettled(
        userEndpoints.map((endpoint) => fetchAuthenticatedGet(endpoint, headers))
    );
    const failedUser = userResults.filter((r) => r.status === 'rejected').length;
    if (failedUser > 0) {
        console.warn(`Warm-up de datos de usuario completado con ${failedUser} fallo(s).`);
    }

    // Extraer datos del perfil para cachear la foto.
    const perfilResult = userResults[0];
    if (perfilResult?.status === 'fulfilled') {
        try {
            const perfil = await perfilResult.value.clone().json();
            const idFotoPerfil = Number(perfil?.idFotoPerfil);
            if (Number.isInteger(idFotoPerfil) && idFotoPerfil > 0) {
                await fetchAuthenticatedGet(`/escaladores/fotos-perfil/${idFotoPerfil}`, headers).catch(() => null);
            }
        } catch {
            // Ignorar parseo y continuar con el warm-up.
        }
    }

    // Extraer rocodromos suscritos para cachear logos y datos de zonas/rutas.
    const misRocodromosResult = userResults[1];
    let misRocodromos = [];
    if (misRocodromosResult?.status === 'fulfilled') {
        try {
            misRocodromos = await misRocodromosResult.value.clone().json();
            if (!Array.isArray(misRocodromos)) {
                misRocodromos = [];
            }
        } catch {
            misRocodromos = [];
        }
    }

    // Cachear logos de rocodromos suscritos.
    const logoEndpoints = misRocodromos
        .map((r) => Number(r?.id))
        .filter((id) => Number.isInteger(id) && id > 0)
        .map((id) => `/rocodromos/${id}/logo`);

    if (logoEndpoints.length > 0) {
        const logoResults = await Promise.allSettled(
            logoEndpoints.map((endpoint) => fetchAuthenticatedGet(endpoint, headers))
        );
        const failedLogos = logoResults.filter((r) => r.status === 'rejected').length;
        if (failedLogos > 0) {
            console.warn(`Warm-up de logos completado con ${failedLogos} fallo(s).`);
        }
    }

    // Cachear datos de rocodromos suscritos (zonas, mapas SVG, rutas) para offline.
    await warmUpRocodromoDataCache(misRocodromos, headers).catch((err) => {
        console.warn('Warm-up de datos de rocodromos incompleto:', err.message);
    });
}

// Comprobar si hay un token guardado
export function isAuthenticated() {
    return !!getToken();
}

// Wrapper central de fetch con token, control de offline y fallback de cache.
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
        await clearUserCache();
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

// Descarga una imagen autenticada y devuelve un object URL utilizable en <img>.
export async function fetchImageObjectUrl(url, options = {}) {
    const response = await fetchClient(url, options);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
}

// Descarga contenido SVG como texto para renderizado dinamico.
export async function fetchSvgText(url) {
    const response = await fetchClient(url);
    return await response.text();
}
