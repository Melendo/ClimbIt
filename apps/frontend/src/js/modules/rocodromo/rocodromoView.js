import { showError } from '../../core/ui.js';

// Vista para mostrar las zonas de un rocódromo
export function renderZonasRocodromo(container, zonas) {
    try {
        if (!Array.isArray(zonas)) {
            throw new Error('Datos de zonas inválidos');
        }

        if (zonas.length === 0) {
            container.innerHTML = `
        <div class="container">
          <h1>Zonas del Rocódromo</h1>
          <div class="alert alert-info">No hay zonas disponibles en este rocódromo.</div>
        </div>
      `;
            return;
        }

        const zonasHTML = zonas.map(zona => `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <span>Tipo: ${zona.tipo}</span>
        <a href="#mapaZona?id=${zona.id}" class="btn btn-sm btn-primary">Ver Pistas de Zona</a>
      </li>
    `).join('');

        container.innerHTML = `
      <div class="container">
        <h1>Zonas del Rocódromo</h1>
        <ul class="list-group">
          ${zonasHTML}
        </ul>
      </div>
    `;
    } catch (err) {
        showError(err.message || 'Error al mostrar las zonas del rocódromo');
    }
}
