import { showError } from '../../core/ui.js';

// Vista para mostrar las zonas de un rocódromo
export function renderZonasRocodromo(container, zonas) {
    try {
        if (!Array.isArray(zonas)) {
            throw new Error('Datos de zonas inválidos');
        }

        if (zonas.length === 0) {
            container.innerHTML = `
        <div class="card shadow-sm">
          <div class="card-header bg-white d-flex align-items-center gap-2 py-3">
            <a href="#" onclick="history.back(); return false;" class="text-dark">
              <span class="material-icons align-middle">arrow_back</span>
            </a>
            <span class="fw-medium">Zonas del Rocódromo</span>
          </div>
          <div class="card-body">
            <div class="alert alert-info mb-0">No hay zonas disponibles en este rocódromo.</div>
          </div>
        </div>
      `;
            return;
        }

        const zonasHTML = zonas.map(zona => `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <span>Tipo: ${zona.tipo}</span>
        <a href="#mapaZona?id=${zona.id}" class="btn btn-sm btn-primary">Ver Pistas</a>
      </li>
    `).join('');

        container.innerHTML = `
      <div class="card shadow-sm">
        <div class="card-header bg-white d-flex align-items-center gap-2 py-3">
          <a href="#" onclick="history.back(); return false;" class="text-dark">
            <span class="material-icons align-middle">arrow_back</span>
          </a>
          <span class="fw-medium">Zonas del Rocódromo</span>
        </div>
        <div class="card-body p-0">
          <ul class="list-group list-group-flush">
            ${zonasHTML}
          </ul>
        </div>
      </div>
    `;
    } catch (err) {
        showError(err.message || 'Error al mostrar las zonas del rocódromo');
    }
}
