// js/app.js
import {
  //  mainContainer,
  showLoading,
  showError,
  renderCrearEscalador,
  renderCrearPista,
  renderHome,
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
    } else {
      showError('Página no encontrada');
    }
  } catch (err) {
    showError(err.message);
  }
}

// --- Arranque de la App ---
// Escucha cambios en el hash (navegación)
window.addEventListener('hashchange', handleNavigation);

// Carga la página inicial
handleNavigation();
