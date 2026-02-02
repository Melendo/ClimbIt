import { mainContainer, showLoading, showError } from './ui.js';
import { crearEscaladorCmd } from '../modules/escalador/escaladorController.js';
import { crearPistaCmd, infoPistaCmd } from '../modules/pista/pistaController.js';
import { mapaZonaCmd } from '../modules/zona/zonaController.js';
import { mapaRocodromoCmd } from '../modules/rocodromo/rocodromoController.js';
import { homeCmd } from '../modules/home/homeController.js';

function obtenerParametroDesdeHash(nombre) {
    const hash = window.location.hash;
    const indexInterrogacion = hash.indexOf('?');
    if (indexInterrogacion === -1) return null;
    const stringParametros = hash.substring(indexInterrogacion + 1);
    const urlParams = new URLSearchParams(stringParametros);
    return urlParams.get(nombre);
}

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
            if (id) {
                await infoPistaCmd(mainContainer, id);
            } else {
                showError('Página no encontrada');
            }
        }
        else if (hash.startsWith('#mapaZona')) {
            const id = obtenerParametroDesdeHash('id');
            await mapaZonaCmd(mainContainer, id);
        }
        else if (hash.startsWith('#mapaRocodromo')) {
            const id = obtenerParametroDesdeHash('id');
            await mapaRocodromoCmd(mainContainer, id);
        }
        else {
            // Habria que crear una pagina 404
            homeCmd(mainContainer);
        }
    }
    catch (err) {
        showError(err.message || 'Error desconocido');
    }
}

export function initRouter() {
    window.addEventListener('hashchange', handleNavigation);
    handleNavigation();
}
