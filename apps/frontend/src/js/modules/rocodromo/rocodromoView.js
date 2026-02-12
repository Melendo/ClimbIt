import { renderNavbar } from '../../components/navbar.js';
import { showConfirmModal } from '../../components/modal.js';

// Vista para mostrar "Mis Rocódromos" (rocódromos suscritos del usuario)
export function renderMisRocodromos(container, rocodromos) {
  let rocodromosHTML = '';

  if (!Array.isArray(rocodromos) || rocodromos.length === 0) {
    rocodromosHTML = `
          <div class="col-12 d-flex flex-column align-items-center justify-content-start pt-3">
            <div class="alert alert-info text-center mb-3">No estás suscrito a ningún rocódromo.</div>
            <a href="#buscarRocodromos" class="btn btn-primary">
              <span class="material-icons align-middle me-1">search</span>
              Buscar rocódromos
            </a>
          </div>`;
  } else {
    rocodromosHTML = rocodromos.map(rocodromo => `
          <div class="col-6 col-md-4">
            <div class="zona-card position-relative rounded overflow-hidden" style="aspect-ratio: 1;">
              <a href="#mapaZona?id=${rocodromo.id}" class="text-decoration-none">
                <img src="/assets/rocodromoDefecto.jpg" alt="${rocodromo.nombre}" class="w-100 h-100" style="object-fit: cover;">
                <div class="zona-card-overlay position-absolute bottom-0 start-0 end-0 p-2 text-white">
                  <small class="d-block fw-medium">${rocodromo.nombre}</small>
                </div>
              </a>
              <button class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 btn-desuscribirse" 
                      data-id="${rocodromo.id}" 
                      title="Desuscribirse">
                <span class="material-icons" style="font-size: 16px;">favorite</span>
              </button>
            </div>
          </div>
        `).join('');

    // Añadir botón de buscar rocódromos al final
    rocodromosHTML += `
          <div class="col-12 d-flex justify-content-center mt-3">
            <a href="#buscarRocodromos" class="btn btn-outline-primary">
              <span class="material-icons align-middle me-1">search</span>
              Buscar más rocódromos
            </a>
          </div>`;
  }

  container.innerHTML = `
  <div class="card shadow-sm d-flex flex-column" style="min-height: 100dvh;">
    
    <!-- Cabecera: Logo de la app -->
    <div class="card-header bg-white d-flex align-items-center justify-content-center gap-2 py-3">
      <span class="material-icons text-primary" style="font-size: 32px;">terrain</span>
      <span class="fw-bold" style="font-size: 1.5rem;">ClimbIt</span>
    </div>

    <!-- Grid de rocódromos (scrollable) -->
    <div class="card-body flex-grow-1 overflow-auto">
      <h6 class="text-muted mb-3">Mis rocódromos</h6>
      <div class="row g-2">
        ${rocodromosHTML}
      </div>
    </div>

    <!-- Menú de navegación inferior -->
    ${renderNavbar()}

  </div>
`;

  // Añadir event listeners para los botones de desuscribirse
  container.querySelectorAll('.btn-desuscribirse').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const idRocodromo = parseInt(btn.dataset.id);
      const confirmed = await showConfirmModal({
        title: 'Desuscribirse del rocódromo',
        message: '¿Estás seguro de que deseas desuscribirte de este rocódromo?',
        confirmText: 'Desuscribirse',
        cancelText: 'Cancelar',
        confirmClass: 'btn-danger'
      });
      if (confirmed) {
        await window.desuscribirseRocodromo(idRocodromo);
      }
    });
  });
}

// Vista para buscar rocódromos (todos los disponibles, sin navbar)
export function renderBuscarRocodromos(container, rocodromos, suscritosIds = []) {
  let rocodromosHTML = '';

  if (!Array.isArray(rocodromos) || rocodromos.length === 0) {
    rocodromosHTML = `
          <div class="col-12">
            <div class="alert alert-info">No hay rocódromos disponibles.</div>
          </div>`;
  } else {
    rocodromosHTML = rocodromos.map(rocodromo => {
      const estaSuscrito = suscritosIds.includes(rocodromo.id);
      return `
          <div class="col-6 col-md-4">
            <div class="zona-card position-relative rounded overflow-hidden" style="aspect-ratio: 1;">
              <a href="#mapaZona?id=${rocodromo.id}" class="text-decoration-none">
                <img src="/assets/rocodromoDefecto.jpg" alt="${rocodromo.nombre}" class="w-100 h-100" style="object-fit: cover;">
                <div class="zona-card-overlay position-absolute bottom-0 start-0 end-0 p-2 text-white">
                  <small class="d-block fw-medium">${rocodromo.nombre}</small>
                </div>
              </a>
              <button class="btn ${estaSuscrito ? 'btn-danger btn-desuscribirse' : 'btn-outline-light btn-suscribirse'} btn-sm position-absolute top-0 end-0 m-1" 
                      data-id="${rocodromo.id}" 
                      title="${estaSuscrito ? 'Desuscribirse' : 'Suscribirse'}">
                <span class="material-icons" style="font-size: 16px;">${estaSuscrito ? 'favorite' : 'favorite_border'}</span>
              </button>
            </div>
          </div>
        `;
    }).join('');
  }

  container.innerHTML = `
  <div class="card shadow-sm d-flex flex-column" style="min-height: 100dvh;">
    
    <!-- Cabecera: Botón volver + Título -->
    <div class="card-header bg-white d-flex align-items-center gap-2 py-3">
      <a href="#" onclick="history.back(); return false;" class="text-dark">
        <span class="material-icons align-middle">arrow_back</span>
      </a>
      <span class="fw-medium">Buscar rocódromos</span>
    </div>

    <!-- Grid de rocódromos (scrollable) -->
    <div class="card-body flex-grow-1 overflow-auto">
      <h6 class="text-muted mb-3">Rocódromos disponibles</h6>
      <div class="row g-2">
        ${rocodromosHTML}
      </div>
    </div>

  </div>
`;

  // Añadir event listeners para los botones de suscribirse
  container.querySelectorAll('.btn-suscribirse').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const idRocodromo = parseInt(btn.dataset.id);
      await window.suscribirseRocodromo(idRocodromo);
    });
  });

  // Añadir event listeners para los botones de desuscribirse
  container.querySelectorAll('.btn-desuscribirse').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const idRocodromo = parseInt(btn.dataset.id);
      const confirmed = await showConfirmModal({
        title: 'Desuscribirse del rocódromo',
        message: '¿Estás seguro de que deseas desuscribirte de este rocódromo?',
        confirmText: 'Desuscribirse',
        cancelText: 'Cancelar',
        confirmClass: 'btn-danger'
      });
      if (confirmed) {
        await window.desuscribirseRocodromo(idRocodromo);
      }
    });
  });
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
  <div class="card shadow-sm d-flex flex-column" style="min-height: 100dvh;">
    
    <!-- Cabecera: Icono + Nombre del rocódromo -->
    <div class="card-header bg-white d-flex align-items-center gap-2 py-3">
      <a href="#misRocodromos" class="text-dark text-decoration-none">
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

// Vista para crear un nuevo rocódromo
export function renderCrearRocodromo(container, callbacks) {
  container.innerHTML = `
  <div class="card shadow-sm">
    <div class="card-header bg-white d-flex align-items-center gap-2 py-3">
      <a href="#" onclick="history.back(); return false;" class="text-dark">
        <span class="material-icons align-middle">arrow_back</span>
      </a>
      <span class="fw-medium">Nuevo Rocódromo</span>
    </div>
    <div class="card-body">
      <form id="form-crear-rocodromo" novalidate>
        <div class="mb-3">
          <label for="nombre" class="form-label">Nombre</label>
          <input
            type="text"
            class="form-control"
            name="nombre"
            id="nombre"
            required
            placeholder="Ej: ClimbIt Center"
          />
          <div class="invalid-feedback"></div>
        </div>
        <div class="mb-3">
          <label for="ubicacion" class="form-label">Ubicación</label>
          <input
            type="text"
            class="form-control"
            name="ubicacion"
            id="ubicacion"
            required
            placeholder="Ej: Calle Principal 123, Madrid"
          />
          <div class="invalid-feedback"></div>
        </div>
        <div id="form-alert" class="alert d-none" role="alert"></div>
        <button type="submit" class="btn btn-primary w-100">Crear Rocódromo</button>
      </form>
    </div>
  </div>`;

  const form = container.querySelector('#form-crear-rocodromo');
  const nombreInput = container.querySelector('#nombre');
  const ubicacionInput = container.querySelector('#ubicacion');
  const alertBox = container.querySelector('#form-alert');

  // Limpiar errores al escribir
  [nombreInput, ubicacionInput].forEach((el) => {
    el.addEventListener('input', () => {
      el.classList.remove('is-invalid');
      alertBox.classList.add('d-none');
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const values = {
      nombre: nombreInput.value.trim(),
      ubicacion: ubicacionInput.value.trim(),
    };
    callbacks.onSubmit(values, {
      nombreInput,
      ubicacionInput,
      alertBox
    });
  });
}
