// Importamos los controladores de los diferentes modulos y las funciones de UI
import { mainContainer, showLoading, showError } from './ui.js';
import { isAuthenticated } from './client.js';
import { perfilCmd } from '../modules/escalador/escaladorController.js';
import { crearPistaCmd, infoPistaCmd } from '../modules/pista/pistaController.js';
import { mapaRocodromoCmd, misRocodromosCmd, buscarRocodromosCmd } from '../modules/rocodromo/rocodromoController.js';
import { homeCmd } from '../modules/home/homeController.js';
import { error404Cmd } from '../modules/error/errorController.js';
import { loginCmd, registroCmd } from '../modules/autenticacion/authController.js';

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = ['#home', '#login', '#registro', ''];

// Funcion para obtener parametros desde el hash de la URL despues del '?'
function obtenerParametroDesdeHash(nombre) {
    const hash = window.location.hash;
    const indexInterrogacion = hash.indexOf('?');
    if (indexInterrogacion === -1) return null;
    const stringParametros = hash.substring(indexInterrogacion + 1);
    const urlParams = new URLSearchParams(stringParametros);
    return urlParams.get(nombre);
}

// Obtener la ruta base sin parámetros
function getBaseRoute(hash) {
    const indexInterrogacion = hash.indexOf('?');
    return indexInterrogacion === -1 ? hash : hash.substring(0, indexInterrogacion);
}

// Manejador de navegacion basado en el '#' de la URL
export async function handleNavigation() {
    const hash = window.location.hash || '#home';
    const baseRoute = getBaseRoute(hash);

    // Verificar autenticación para rutas protegidas
    if (!PUBLIC_ROUTES.includes(baseRoute) && !isAuthenticated()) {
        window.location.hash = '#login';
        return;
    }

    showLoading();

    try {
        if (hash === '#home' || hash === '') {
            homeCmd(mainContainer);
        }
        else if (hash === '#login') {
            loginCmd(mainContainer);
        }
        else if (hash === '#registro') {
            registroCmd(mainContainer);
        }
        else if (hash === '#crearPista') {
            crearPistaCmd(mainContainer);
        }
        else if (hash.startsWith('#infoPista')) {
            const id = obtenerParametroDesdeHash('id');
            await infoPistaCmd(mainContainer, id);
        }
        else if (hash === '#misRocodromos') {
            await misRocodromosCmd(mainContainer);
        }
        else if (hash === '#buscarRocodromos') {
            await buscarRocodromosCmd(mainContainer);
        }
        else if (hash.startsWith('#mapaRocodromo')) {
            const id = obtenerParametroDesdeHash('id');
            await mapaRocodromoCmd(mainContainer, id);
        }
        else if (hash === '#perfil') {
            await perfilCmd(mainContainer);
        }
        else {
            error404Cmd(mainContainer);
        }
    }
    catch (err) {
        showError(err.message || 'Error desconocido');
    }
}

// Inicializa el router para escuchar cambios en el hash de la URL
export function initRouter() {
    window.addEventListener('hashchange', handleNavigation);
    handleNavigation();
}
