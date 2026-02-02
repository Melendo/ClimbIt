import { showError } from '../../core/ui.js';

export function renderPistasZona(container, pistas) {
    try {
        if (!Array.isArray(pistas)) {
            throw new Error('Datos de pistas inválidos');
        }

        if (pistas.length === 0) {
            container.innerHTML = `
        <div class="container">
          <h1>Pistas de la Zona</h1>
          <div class="alert alert-info">No hay pistas disponibles en esta zona.</div>
        </div>
      `;
            return;
        }

        const pistasHTML = pistas.map(pista => `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <span>${pista.nombre} (Dificultad: ${pista.dificultad})</span>
        <a href="#infoPista?id=${pista.id}" class="btn btn-sm btn-primary">Ver Detalles</a>
      </li>
    `).join('');

        container.innerHTML = `
      <div class="container">
        <h1>Pistas de la Zona</h1>
        <ul class="list-group">
          ${pistasHTML}
        </ul>
      </div>
    `;
    } catch (err) {
        showError(err.message || 'Error al mostrar las pistas de la zona');
    }
}
