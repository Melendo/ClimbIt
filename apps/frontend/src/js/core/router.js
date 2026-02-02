// Importamos los controladores de los diferentes modulos y las funciones de UI
import { mainContainer, showLoading, showError } from './ui.js';
import { crearEscaladorCmd } from '../modules/escalador/escaladorController.js';
import { crearPistaCmd, infoPistaCmd } from '../modules/pista/pistaController.js';
import { mapaRocodromoCmd, listaRocodromosCmd } from '../modules/rocodromo/rocodromoController.js';
import { homeCmd } from '../modules/home/homeController.js';
import { perfilCmd } from '../modules/perfil/perfilController.js';
import { error404Cmd } from '../modules/error/errorController.js';

// Funcion para obtener parametros desde el hash de la URL despues del '?'
function obtenerParametroDesdeHash(nombre) {
    const hash = window.location.hash;
    const indexInterrogacion = hash.indexOf('?');
    if (indexInterrogacion === -1) return null;
    const stringParametros = hash.substring(indexInterrogacion + 1);
    const urlParams = new URLSearchParams(stringParametros);
    return urlParams.get(nombre);
}

// Manejador de navegacion basado en el '#' de la URL
export async function handleNavigation() {
    const hash = window.location.hash || '#home';

    showLoading();

    try {
        if (hash === '#home' || hash === '') {
            homeCmd(mainContainer);
        }
        else if (hash === '#crearEscalador') {
            crearEscaladorCmd(mainContainer);
        }
        else if (hash === '#crearPista') {
            crearPistaCmd(mainContainer);
        }
        else if (hash.startsWith('#infoPista')) {
            const id = obtenerParametroDesdeHash('id');
            await infoPistaCmd(mainContainer, id);
        }
        else if (hash === '#listaRocodromos') {
            await listaRocodromosCmd(mainContainer);
        }
        else if (hash.startsWith('#mapaRocodromo')) {
            const id = obtenerParametroDesdeHash('id');
            await mapaRocodromoCmd(mainContainer, id);
        }
        else if (hash === '#perfil') {
            perfilCmd(mainContainer);
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
