import { showError } from '../../core/ui.js';

export function renderPistasZona(container, pistas) {
    try {
        if (!Array.isArray(pistas)) {
            throw new Error('Datos de pistas inválidos');
        }

        if (pistas.length === 0) {
            container.innerHTML = `
        <div class="card shadow-sm">
          <div class="card-header bg-white d-flex align-items-center gap-2 py-3">
            <a href="#" onclick="history.back(); return false;" class="text-dark">
              <span class="material-icons align-middle">arrow_back</span>
            </a>
            <span class="fw-medium">Pistas de la Zona</span>
          </div>
          <div class="card-body">
            <div class="alert alert-info mb-0">No hay pistas disponibles en esta zona.</div>
          </div>
        </div>
      `;
            return;
        }

        const pistasHTML = pistas.map(pista => `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <span class="fw-medium">${pista.nombre}</span>
          <span class="badge bg-primary ms-2">${pista.dificultad}</span>
        </div>
        <a href="#infoPista?id=${pista.id}" class="btn btn-sm btn-outline-primary">Ver</a>
      </li>
    `).join('');

        container.innerHTML = `
      <div class="card shadow-sm">
        <div class="card-header bg-white d-flex align-items-center gap-2 py-3">
          <a href="#" onclick="history.back(); return false;" class="text-dark">
            <span class="material-icons align-middle">arrow_back</span>
          </a>
          <span class="fw-medium">Pistas de la Zona</span>
        </div>
        <div class="card-body p-0">
          <ul class="list-group list-group-flush">
            ${pistasHTML}
          </ul>
        </div>
      </div>
    `;
    } catch (err) {
        showError(err.message || 'Error al mostrar las pistas de la zona');
    }
}
