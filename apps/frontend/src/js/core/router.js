import { mainContainer, showLoading, showError } from './ui.js';
import { crearEscaladorCmd } from '../modules/escalador/escaladorController.js';
import { crearPistaCmd, infoPistaCmd } from '../modules/pista/pistaController.js';
import { mapaZonaCmd } from '../modules/zona/zonaController.js';
import { mapaRocodromoCmd } from '../modules/rocodromo/rocodromoController.js';

function renderHome() {
    mainContainer.innerHTML = `
    <div class="container"><div class="text-center my-5">
      <h1>Bienvenido a ClimbIt</h1>
      <p class="lead">Tu aplicación para gestionar escaladores y pistas de escalada.</p>
      <a href="#crearEscalador" class="btn btn-primary mx-2">Crear Escalador</a>
      <a href="#crearPista" class="btn btn-secondary mx-2">Crear Pista</a>
    </div></div>`;
}

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
            renderHome();
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
            renderHome();
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
