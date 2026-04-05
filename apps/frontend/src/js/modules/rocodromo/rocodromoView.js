import { renderNavbar } from '../../components/navbar.js';
import { renderSubscribeButton, initSubscribeButtons } from '../../components/subscribeButton.js';
import { renderRocodromoCard } from '../../components/rocodromoCard.js';
// Función auxiliar para mostrar un valor o un texto de fallback si el valor es nulo
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
      .map((rocodromo) => renderRocodromoCard(rocodromo, { estaSuscrito: true }))
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
      return renderRocodromoCard(rocodromo, { estaSuscrito });
    }).join('');
  }

  container.innerHTML = `
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
`;

  container.innerHTML = `
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
`;

  initSubscribeButtons(container);
}

// Vista para crear un nuevo rocódromo
export function renderCrearRocodromo(container, callbacks) {
  container.innerHTML = `
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
