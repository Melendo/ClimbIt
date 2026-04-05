import { renderNavbar } from '../../components/navbar.js';
import { renderSubscribeButton, initSubscribeButtons } from '../../components/subscribeButton.js';

function renderRocodromoListItem(rocodromo, { estaSuscrito = false } = {}) {
  const ubicacion = rocodromo?.ubicacion || 'Ubicación no disponible';

  return `
    <div class="border rounded-3 bg-white p-2 p-md-3 position-relative">
      ${renderSubscribeButton(rocodromo.id, estaSuscrito, { position: 'absolute' })}

      <a
        href="#infoRoco?id=${rocodromo.id}"
        class="btn btn-sm position-absolute bottom-0 end-0 mb-2 me-2 d-flex align-items-center justify-content-center"
        style="background-color: #1d4ed8; border-color: #1d4ed8; color: #ffffff;"
        title="Más información"
        aria-label="Más información"
      >
        <span class="material-icons" style="font-size: 18px; line-height: 1;">info</span>
      </a>

      <div class="d-flex align-items-center gap-3">
        <a href="#mapaZona?id=${rocodromo.id}" class="text-decoration-none flex-shrink-0">
          <img
            src="${rocodromo.logoSrc || '/assets/rocodromoDefecto.jpg'}"
            alt="${rocodromo.nombre}"
            class="rounded-3"
            style="width: 72px; height: 72px; object-fit: cover;"
          >
        </a>

        <div class="d-flex flex-column flex-grow-1 min-w-0 pe-5">
          <a href="#mapaZona?id=${rocodromo.id}" class="d-block text-decoration-none text-dark fw-semibold text-truncate">${rocodromo.nombre}</a>
          <small class="d-block text-muted text-truncate">${ubicacion}</small>
        </div>
      </div>
    </div>
  `;
}

function renderValueOrFallback(value, fallback = 'No disponible') {
  if (value === null || value === undefined) return fallback;
  const normalized = String(value).trim();
  return normalized || fallback;
}

// Vista para mostrar la información completa de un rocódromo
export function renderInfoRocodromo(container, rocodromo, estaSuscrito = false) {
  const id = rocodromo?.id;
  const nombre = renderValueOrFallback(rocodromo?.nombre, 'Rocódromo sin nombre');
  const ubicacion = renderValueOrFallback(rocodromo?.ubicacion);
  const descripcion = renderValueOrFallback(rocodromo?.descripcion);
  const horarios = renderValueOrFallback(rocodromo?.horarios);
  const logoSrc = rocodromo?.logoSrc || '/assets/rocodromoDefecto.jpg';

  container.innerHTML = `
  <div class="card shadow-sm d-flex flex-column" style="min-height: 100dvh;">
    <div class="card-header bg-white d-flex align-items-center justify-content-between gap-2 py-3">
      <div class="d-flex align-items-center gap-2">
        <a href="#misRocodromos" class="text-dark text-decoration-none">
          <span class="material-icons align-middle">arrow_back</span>
        </a>
        <span class="fw-medium">Información del rocódromo</span>
      </div>
      ${renderSubscribeButton(id, estaSuscrito, { size: 'md' })}
    </div>

    <div class="card-body flex-grow-1 overflow-auto">
      <div class="d-flex flex-column align-items-center mb-4">
        <img
          src="${logoSrc}"
          alt="Logo de ${nombre}"
          class="rounded-4 border"
          style="width: 140px; height: 140px; object-fit: cover;"
        >
        <h4 class="mt-3 mb-1 text-center">${nombre}</h4>
        <p class="text-muted mb-0 text-center">${ubicacion}</p>
      </div>

      <div class="list-group list-group-flush border rounded-3 overflow-hidden">
        <div class="list-group-item">
          <p class="text-muted small text-uppercase fw-semibold mb-1">Descripción</p>
          <p class="mb-0">${descripcion}</p>
        </div>
        <div class="list-group-item">
          <p class="text-muted small text-uppercase fw-semibold mb-1">Horarios</p>
          <p class="mb-0">${horarios}</p>
        </div>
      </div>

      <div class="d-grid mt-4">
        <a href="#mapaZona?id=${id}" class="btn btn-primary">Ver mapa del rocódromo</a>
      </div>
    </div>

    ${renderNavbar()}
  </div>
`;

  // Inicializar event listeners para botones de suscripción
  initSubscribeButtons(container);
}

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
    rocodromosHTML = rocodromos
      .map((rocodromo) => renderRocodromoListItem(rocodromo, { estaSuscrito: true }))
      .join('');

    // Añadir botón de buscar rocódromos al final.
    rocodromosHTML += `
          <div class="d-flex justify-content-center mt-3">
            <a href="#buscarRocodromos" class="btn btn-outline-primary">
              <span class="material-icons align-middle me-1">search</span>
              Buscar más rocódromos
            </a>
          </div>`;
  }

  const content = `
  <div class="card shadow-sm d-flex flex-column" style="min-height: 100dvh;">
    
    <!-- Cabecera: Logo de la app -->
    <div class="card-header bg-white d-flex align-items-center justify-content-center gap-2 py-3">
      <img src="/icons/apple-touch-icon.png" alt="Logo de ClimbIt" style="width: 32px; height: 32px; object-fit: contain;" />
      <span class="fw-bold" style="font-size: 1.5rem;">ClimbIt</span>
    </div>

    <!-- Listado de rocódromos (scrollable) -->
    <div class="card-body flex-grow-1 overflow-auto">
      <h6 class="text-muted mb-3">Mis rocódromos</h6>
      <div class="d-flex flex-column gap-2">
        ${rocodromosHTML}
      </div>
    </div>

    <!-- Menú de navegación inferior -->
    ${renderNavbar()}

  </div>
`;

  container.innerHTML = content;
  initSubscribeButtons(container);
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
    rocodromosHTML = rocodromos.map((rocodromo) => {
      const estaSuscrito = suscritosIds.includes(rocodromo.id);
      return renderRocodromoListItem(rocodromo, { estaSuscrito });
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

    <!-- Listado de rocódromos (scrollable) -->
    <div class="card-body flex-grow-1 overflow-auto">
      <h6 class="text-muted mb-3">Rocódromos disponibles</h6>
      <div class="d-flex flex-column gap-2">
        ${rocodromosHTML}
      </div>
    </div>

  </div>
`;

  container.innerHTML = `
  <div class="card shadow-sm d-flex flex-column" style="min-height: 100dvh;">
    
    <!-- Cabecera: Botón volver + Título -->
    <div class="card-header bg-white d-flex align-items-center gap-2 py-3">
      <a href="#" onclick="history.back(); return false;" class="text-dark">
        <span class="material-icons align-middle">arrow_back</span>
      </a>
      <span class="fw-medium">Buscar rocódromos</span>
    </div>

    <!-- Listado de rocódromos (scrollable) -->
    <div class="card-body flex-grow-1 overflow-auto">
      <h6 class="text-muted mb-3">Rocódromos disponibles</h6>
      <div class="d-flex flex-column gap-2">
        ${rocodromosHTML}
      </div>
    </div>

  </div>
`;

  initSubscribeButtons(container);
}

// Vista para mostrar el mapa de un rocódromo con sus zonas y rutas
export function renderMapaRocodromo(container, data) {
  const { rocodromo, zonas } = data;
  const nombreRocodromo = rocodromo?.nombre || 'Rocódromo';

  // Generar cards de zonas con sus rutas
  let zonasHTML = '';

  if (!Array.isArray(zonas) || zonas.length === 0) {
    zonasHTML = `
          <div class="col-12">
            <div class="alert alert-info">No hay zonas disponibles en este rocódromo.</div>
          </div>`;
  } else {
    zonasHTML = zonas.flatMap(zona => {
      if (!zona.rutas || zona.rutas.length === 0) {
        return [`
                  <div class="col-6 col-md-4">
                    <div class="zona-card position-relative rounded overflow-hidden" style="aspect-ratio: 1;">
                      <img src="/assets/placeholder.jpg" alt="Zona ${zona.id}" class="w-100 h-100" style="object-fit: cover;">
                      <div class="zona-card-overlay position-absolute bottom-0 start-0 end-0 p-2 text-white">
                        <small class="d-block fw-medium">Zona ${zona.tipo || zona.id}</small>
                        <small class="text-white-50">Sin rutas</small>
                      </div>
                    </div>
                  </div>
                `];
      }
      return zona.rutas.map(ruta => `
              <div class="col-6 col-md-4">
                <a href="#infoRuta?id=${ruta.id}" class="text-decoration-none">
                  <div class="zona-card position-relative rounded overflow-hidden" style="aspect-ratio: 1;">
                    <img src="${ruta.imagenSrc || '/assets/placeholder.jpg'}" alt="${ruta.nombre}" class="w-100 h-100" style="object-fit: cover;">
                    <div class="zona-card-overlay position-absolute bottom-0 start-0 end-0 p-2 text-white">
                      <small class="d-block fw-medium">${zona.tipo || 'Zona ' + zona.id}</small>
                      <div class="d-flex align-items-center gap-1">
                        <span class="badge bg-primary">${ruta.dificultad}</span>
                        <small class="text-truncate">${ruta.nombre}</small>
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
      <img src="${rocodromo.logoSrc || '/assets/rocodromoDefecto.jpg'}" alt="Icono rocódromo" class="rounded-circle" style="width: 32px; height: 32px; object-fit: cover;">
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

    <!-- Grid de zonas/rutas (scrollable) -->
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
    <a href="#mapaZona?id=${zona.id}" class="btn btn-sm btn-primary">Ver Rutas</a>
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
