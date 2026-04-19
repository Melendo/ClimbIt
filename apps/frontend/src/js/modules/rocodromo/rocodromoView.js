import { renderNavbar } from '../../components/navbar.js';
import { renderSubscribeButton, initSubscribeButtons } from '../../components/subscribeButton.js';
import { renderRocodromoCard } from '../../components/rocodromoCard.js';
import { renderSectionDivider } from '../../components/sectionDivider.js';
import {
  bindHeatmapInteractions,
  buildEscaladorStatsViewModel,
  renderMaxDifficultyStatsCard,
  renderRocodromoRoutesOverviewStatsCard,
  renderRouteTypesStatsCard,
  renderStatsSection,
  renderTotalRoutesStatsCard,
} from '../../components/escaladorStats.js';
import { renderEditableField, initEditableField } from '../../components/editableField.js';
// Función auxiliar para mostrar un valor o un texto de fallback si el valor es nulo
function renderValueOrFallback(value, fallback = 'No disponible') {
  if (value === null || value === undefined) return fallback;
  const normalized = String(value).trim();
  return normalized || fallback;
}

// Vista para mostrar la información completa de un rocódromo
export function renderInfoRocodromo(container, rocodromo, estaSuscrito = false, canManage = false) {
  const id = rocodromo?.id;
  const nombre = renderValueOrFallback(rocodromo?.nombre, 'Rocódromo sin nombre');
  const ubicacion = renderValueOrFallback(rocodromo?.ubicacion);
  const descripcion = renderValueOrFallback(rocodromo?.descripcion);
  const horarios = renderValueOrFallback(rocodromo?.horarios);
  const logoSrc = rocodromo?.logoSrc || '/assets/rocodromoDefecto.jpg';

  container.innerHTML = `
    <div class="d-flex flex-column" style="height: 100dvh; overflow: hidden;">
    <div class="card-header bg-white d-flex align-items-center justify-content-between gap-2 py-3">
      <div class="d-flex align-items-center gap-2">
        <a href="#misRocodromos" class="text-dark text-decoration-none">
          <span class="material-icons align-middle">arrow_back</span>
        </a>
        <span class="fw-medium">Información del rocódromo</span>
      </div>
      <div class="d-flex align-items-center gap-2">
        ${canManage ? `
          <a href="#modificarRocodromo?id=${id}" class="btn btn-light d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;" aria-label="Modificar rocódromo" title="Modificar rocódromo">
            <span class="material-icons" style="font-size: 20px;">edit</span>
          </a>
        ` : ''}
        <div class="d-flex align-items-center justify-content-center">
          ${renderSubscribeButton(id, estaSuscrito, { size: 'md', position: 'inline' })}
        </div>
      </div>
    </div>

    <div class="card-body flex-grow-1 overflow-auto">
      <div class="d-flex flex-column align-items-center mb-4">
        <div class="position-relative" style="width: 140px; height: 140px;">
          <img
            src="${logoSrc}"
            alt="Logo de ${nombre}"
            class="rounded-4 border"
            style="width: 140px; height: 140px; object-fit: cover;"
          >
          ${canManage ? `
            <button type="button" id="btn-actualizar-logo-roco" class="btn btn-dark btn-sm position-absolute bottom-0 end-0 d-flex align-items-center justify-content-center" style="width: 36px; height: 36px; border-radius: 999px;" aria-label="Actualizar logo" title="Actualizar logo">
              <span class="material-icons" style="font-size: 18px; line-height: 1;">photo_camera</span>
            </button>
            <input type="file" id="input-logo-roco" class="d-none" accept="image/*" />
          ` : ''}
        </div>
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

export function renderModificarRocodromo(container, callbacks, initialValues = {}) {
  const renderRocodromoField = ({
    prefix,
    label,
    value,
    placeholder,
    maxLength,
    inputTag = 'input',
    rows,
  }) => renderEditableField({
    prefix,
    wrapperClass: 'w-100',
    titleHtml: `<label for="roco-${prefix}-input" class="form-label">${label}</label>`,
    viewContent: '',
    inputValue: String(value || ''),
    inputTag,
    inputClasses: 'form-control',
    inputAttributes: {
      name: prefix,
      autocomplete: 'off',
      autocapitalize: 'off',
      autocorrect: 'off',
      spellcheck: 'false',
    },
    placeholder,
    ariaLabel: label,
    maxLength,
    rows,
    domPrefix: 'roco',
    dataAttrPrefix: 'data-roco',
    showView: false,
    showEditButton: false,
    showFieldActions: false,
    startInEditMode: true,
    feedbackHtml: '<div class="invalid-feedback"></div>',
    feedbackInInputWrap: true,
  });

  container.innerHTML = `
    <div class="d-flex flex-column" style="height: 100dvh; overflow: hidden;">
      <div class="card-header bg-white d-flex align-items-center gap-2 py-3">
        <a href="#" onclick="history.back(); return false;" class="text-dark text-decoration-none">
          <span class="material-icons align-middle">arrow_back</span>
        </a>
        <span class="fw-medium">Modificar rocódromo</span>
      </div>
      <div class="card-body flex-grow-1 overflow-auto bg-light">
        <form id="form-modificar-rocodromo" novalidate>
          <div class="mb-3">
            ${renderRocodromoField({
              prefix: 'nombre',
              label: 'Nombre',
              value: initialValues?.nombre,
              placeholder: 'Ej: ClimbIt Center',
              maxLength: 100,
            })}
          </div>

          <div class="mb-3">
            ${renderRocodromoField({
              prefix: 'ubicacion',
              label: 'Ubicación',
              value: initialValues?.ubicacion,
              placeholder: 'Ej: Calle Principal 123, Madrid',
              maxLength: 255,
            })}
          </div>

          <div class="mb-3">
            ${renderRocodromoField({
              prefix: 'descripcion',
              label: 'Descripción',
              value: initialValues?.descripcion,
              placeholder: 'Describe el rocódromo',
              maxLength: 255,
              inputTag: 'textarea',
              rows: 4,
            })}
          </div>

          <div class="mb-3">
            ${renderRocodromoField({
              prefix: 'horarios',
              label: 'Horario',
              value: initialValues?.horarios,
              placeholder: 'Ej: L-V 09:00-22:00',
              maxLength: 255,
              inputTag: 'textarea',
              rows: 3,
            })}
          </div>

          <div id="form-alert" class="alert d-none" role="alert"></div>

          <button type="submit" id="modificar-roco-submit" class="btn btn-primary w-100">Guardar cambios</button>
        </form>
      </div>
    </div>
  `;

  const form = container.querySelector('#form-modificar-rocodromo');
  const nombreInput = container.querySelector('#roco-nombre-input');
  const ubicacionInput = container.querySelector('#roco-ubicacion-input');
  const descripcionInput = container.querySelector('#roco-descripcion-input');
  const horariosInput = container.querySelector('#roco-horarios-input');
  const alertBox = container.querySelector('#form-alert');
  const submitButton = container.querySelector('#modificar-roco-submit');

  initEditableField(container, {
    prefix: 'nombre',
    initialValue: String(initialValues?.nombre || ''),
    maxLength: 100,
    domPrefix: 'roco',
    dataAttrPrefix: 'data-roco',
  });
  initEditableField(container, {
    prefix: 'ubicacion',
    initialValue: String(initialValues?.ubicacion || ''),
    maxLength: 255,
    domPrefix: 'roco',
    dataAttrPrefix: 'data-roco',
  });
  initEditableField(container, {
    prefix: 'descripcion',
    initialValue: String(initialValues?.descripcion || ''),
    maxLength: 255,
    domPrefix: 'roco',
    dataAttrPrefix: 'data-roco',
  });
  initEditableField(container, {
    prefix: 'horarios',
    initialValue: String(initialValues?.horarios || ''),
    maxLength: 255,
    domPrefix: 'roco',
    dataAttrPrefix: 'data-roco',
  });

  [nombreInput, ubicacionInput, descripcionInput, horariosInput].forEach((el) => {
    el.addEventListener('input', () => callbacks.onFieldChange(el, alertBox));
    el.addEventListener('change', () => callbacks.onFieldChange(el, alertBox));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    callbacks.onSubmit({
      nombre: nombreInput.value,
      ubicacion: ubicacionInput.value,
      descripcion: descripcionInput.value,
      horarios: horariosInput.value,
    }, {
      nombreInput,
      ubicacionInput,
      descripcionInput,
      horariosInput,
      alertBox,
      submitButton,
    });
  });
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

export function renderRocodromoEstadisticas(container, data) {
  const { rocodromo = {}, escalador = {}, estadisticas = {} } = data;
  if (typeof container.__rocodromoStatsCleanup === 'function') {
    container.__rocodromoStatsCleanup();
    container.__rocodromoStatsCleanup = null;
  }

  const statsViewModel = buildEscaladorStatsViewModel(estadisticas);
  const rocodromoNombre = renderValueOrFallback(rocodromo?.nombre, 'Rocodromo');
  const escaladorApodo = renderValueOrFallback(escalador?.apodo, 'Escalador');
  const logoSrc = rocodromo?.logoSrc || '/assets/rocodromoDefecto.jpg';
  const avatarSrc = escalador?.fotoSrc || '/assets/johnDoe.png';

  container.innerHTML = `
    <div class="d-flex flex-column" style="height: 100dvh; overflow: hidden;">
      <div class="card-header bg-white d-flex align-items-center gap-2 py-3">
        <a href="#mapaZona?id=${rocodromo.id}" class="text-dark text-decoration-none" aria-label="Volver al mapa">
          <span class="material-icons align-middle">arrow_back</span>
        </a>
        <span class="fw-medium">Estadisticas de Rocodromo</span>
      </div>

      <div class="card-body flex-grow-1 overflow-auto bg-light rocodromo-stats-page">
        <div class="rocodromo-stats-hero">
          <div class="rocodromo-stats-avatars" aria-hidden="true">
            <img src="${logoSrc}" alt="Logo de ${rocodromoNombre}" class="rocodromo-stats-avatar is-roco" />
            <img src="${avatarSrc}" alt="Foto de perfil de ${escaladorApodo}" class="rocodromo-stats-avatar is-escalador" />
          </div>
          <p class="rocodromo-stats-hero-text text-center mb-0">
            <strong>${rocodromoNombre}<br />X<br />${escaladorApodo}</strong>
          </p>
        </div>

        <div class="mt-4">
          ${renderSectionDivider({ label: 'Estadisticas' })}
          <div class="perfil-estadisticas-view mt-3 px-0">
            ${renderStatsSection({
              title: 'Total de Rutas Escaladas',
              content: renderRocodromoRoutesOverviewStatsCard(statsViewModel.totals),
            })}
            ${renderStatsSection({
              title: 'Ratio de Flash',
              content: renderTotalRoutesStatsCard(statsViewModel.totals),
            })}
            ${renderStatsSection({
              title: 'Tipos de Rutas Escaladas',
              content: renderRouteTypesStatsCard(statsViewModel.totals),
            })}
            ${renderStatsSection({
              title: 'DIFICULTAD MÁXIMA ESCALADA',
              content: renderMaxDifficultyStatsCard(statsViewModel.totals),
            })}
          </div>
        </div>
      </div>
    </div>
  `;

  container.__rocodromoStatsCleanup = bindHeatmapInteractions(container);
}
