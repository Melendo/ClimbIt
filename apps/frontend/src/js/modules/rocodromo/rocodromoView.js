import { renderNavbar } from '../../components/navbar.js';

// Vista para mostrar la lista de todos los rocódromos
export function renderListaRocodromos(container, rocodromos) {
    let rocodromosHTML = '';

    if (!Array.isArray(rocodromos) || rocodromos.length === 0) {
        rocodromosHTML = `
          <div class="col-12">
            <div class="alert alert-info">No hay rocódromos disponibles.</div>
          </div>`;
    } else {
        rocodromosHTML = rocodromos.map(rocodromo => `
          <div class="col-6 col-md-4">
            <a href="#mapaRocodromo?id=${rocodromo.id}" class="text-decoration-none">
              <div class="zona-card position-relative rounded overflow-hidden" style="aspect-ratio: 1;">
                <img src="/assets/rocodromoDefecto.jpg" alt="${rocodromo.nombre}" class="w-100 h-100" style="object-fit: cover;">
                <div class="zona-card-overlay position-absolute bottom-0 start-0 end-0 p-2 text-white">
                  <small class="d-block fw-medium">${rocodromo.nombre}</small>
                  <small class="text-white-50">${rocodromo.direccion || 'Sin dirección'}</small>
                </div>
              </div>
            </a>
          </div>
        `).join('');
    }

    container.innerHTML = `
  <div class="card shadow-sm d-flex flex-column" style="min-height: 100vh;">
    
    <!-- Cabecera: Logo de la app -->
    <div class="card-header bg-white d-flex align-items-center justify-content-center gap-2 py-3">
      <span class="material-icons text-primary" style="font-size: 32px;">terrain</span>
      <span class="fw-bold" style="font-size: 1.5rem;">ClimbIt</span>
    </div>

    <!-- Grid de rocódromos (scrollable) -->
    <div class="card-body flex-grow-1 overflow-auto">
      <h6 class="text-muted mb-3">Rocódromos disponibles</h6>
      <div class="row g-2">
        ${rocodromosHTML}
      </div>
    </div>

    <!-- Menú de navegación inferior -->
    ${renderNavbar()}

  </div>
`;
}

// Vista para mostrar el mapa de un rocódromo con sus zonas y pistas
export function renderMapaRocodromo(container, data) {
    const { rocodromo, zonas } = data;
    const nombreRocodromo = rocodromo?.nombre || 'Rocódromo';

    // Generar cards de zonas con sus pistas
    let zonasHTML = '';
    
    if (!Array.isArray(zonas) || zonas.length === 0) {
        zonasHTML = `
          <div class="col-12">
            <div class="alert alert-info">No hay zonas disponibles en este rocódromo.</div>
          </div>`;
    } else {
        zonasHTML = zonas.flatMap(zona => {
            if (!zona.pistas || zona.pistas.length === 0) {
                return [`
                  <div class="col-6 col-md-4">
                    <div class="zona-card position-relative rounded overflow-hidden" style="aspect-ratio: 1;">
                      <img src="/assets/placeholder.jpg" alt="Zona ${zona.id}" class="w-100 h-100" style="object-fit: cover;">
                      <div class="zona-card-overlay position-absolute bottom-0 start-0 end-0 p-2 text-white">
                        <small class="d-block fw-medium">Zona ${zona.tipo || zona.id}</small>
                        <small class="text-white-50">Sin pistas</small>
                      </div>
                    </div>
                  </div>
                `];
            }
            return zona.pistas.map(pista => `
              <div class="col-6 col-md-4">
                <a href="#infoPista?id=${pista.id}" class="text-decoration-none">
                  <div class="zona-card position-relative rounded overflow-hidden" style="aspect-ratio: 1;">
                    <img src="/assets/placeholder.jpg" alt="${pista.nombre}" class="w-100 h-100" style="object-fit: cover;">
                    <div class="zona-card-overlay position-absolute bottom-0 start-0 end-0 p-2 text-white">
                      <small class="d-block fw-medium">${zona.tipo || 'Zona ' + zona.id}</small>
                      <div class="d-flex align-items-center gap-1">
                        <span class="badge bg-primary">${pista.dificultad}</span>
                        <small class="text-truncate">${pista.nombre}</small>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            `);
        }).join('');
    }

    container.innerHTML = `
  <div class="card shadow-sm d-flex flex-column">
    
    <!-- Cabecera: Icono + Nombre del rocódromo -->
    <div class="card-header bg-white d-flex align-items-center gap-2 py-3">
      <a href="#" onclick="history.back(); return false;" class="text-dark">
        <span class="material-icons align-middle">arrow_back</span>
      </a>
      <img src="/assets/rocodromoDefecto.jpg" alt="Icono rocódromo" class="rounded-circle" style="width: 32px; height: 32px; object-fit: cover;">
      <span class="fw-medium">${nombreRocodromo}</span>
    </div>

    <!-- Mapa del rocódromo -->
    <div class="mapa-rocodromo" style="height: 200px; overflow: hidden;">
      <img 
        src="/assets/mapaDefecto.jpg" 
        alt="Mapa del rocódromo ${nombreRocodromo}" 
        class="w-100 h-100" 
        style="object-fit: cover;"
      />
    </div>

    <!-- Grid de zonas/pistas (scrollable) -->
    <div class="card-body flex-grow-1 overflow-auto" style="max-height: calc(100vh - 350px);">
      <div class="row g-2">
        ${zonasHTML}
      </div>
    </div>

    <!-- Menú de navegación inferior -->
    ${renderNavbar()}

  </div>
`;
}

// Vista legacy para mostrar las zonas de un rocódromo (lista simple)
export function renderZonasRocodromo(container, zonas) {
    if (!Array.isArray(zonas)) {
        zonas = [];
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
}
