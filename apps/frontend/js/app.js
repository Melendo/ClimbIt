// js/app.js
import {
  //  mainContainer,
  showLoading,
  showError,
  renderCrearEscalador,
  renderCrearPista,
  renderHome,
  renderInfoPista,
  renderPistasZona,
} from './ui.js';

// Router principal
async function handleNavigation() {
  const hash = window.location.hash || '#home';

  showLoading();
  try {
    if (hash === '#home') {
      renderHome();
    } else if (hash === '#crearEscalador') {
      renderCrearEscalador();
    } else if (hash === '#crearPista') {
      renderCrearPista();
    } else if (hash.startsWith('#infoPista')) {
      const id = obtenerParametroDesdeHash('id');
      if (id) {
        showLoading();
        try {
          const res = await fetch(`/pistas/${id}`);
          if (!res.ok) {
            throw new Error(`Error al obtener pista: ${res.status} ${res.statusText}`);
          }
          const pista = await res.json();
          renderInfoPista(pista);
        } catch (err) {
          showError(`Error al obtener o procesar la pista: ${err.message}`);
        }
      } else {
        showError('Página no encontrada');
      }
    } else if (hash.startsWith('#mapaZona')) {
      const id = obtenerParametroDesdeHash('id');
      if (id) {
        showLoading();
        try {
          const res = await fetch(`/zonas/pistas/${id}`);
          if (!res.ok) {
            throw new Error(`Error al obtener pistas de la zona: ${res.status} ${res.statusText}`);
          }
          const pistas = await res.json();
          renderPistasZona(pistas);
        } catch (err) {
          showError(`Error al obtener o procesar las pistas de la zona: ${err.message}`);
        }     
      } else {
        showError('ID de zona no válido o no proporcionado');
      }
    }
  } catch (err) {
    showError(err.message || 'Error desconocido');
  }
}

function obtenerParametroDesdeHash(nombre) {
  // Busca el índice del signo '?' dentro del hash
  const hash = window.location.hash;
  const indexInterrogacion = hash.indexOf('?');

  // Si no hay '?', devuelve null
  if (indexInterrogacion === -1) return null;

  // Corta el string desde después del '?'
  const stringParametros = hash.substring(indexInterrogacion + 1);

  // Busca el valor
  const urlParams = new URLSearchParams(stringParametros);
  return urlParams.get(nombre);
}

// --- Arranque de la App ---
// Escucha cambios en el hash (navegación)
window.addEventListener('hashchange', handleNavigation);

// Carga la página inicial
handleNavigation();
