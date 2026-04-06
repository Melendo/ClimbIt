// Escala de grados (falta traerla con peticion al backend)
import { renderRutaEstadoButtons, setupRutaEstadoButtons } from '../../components/rutaEstadoButtons.js';

const GRADOS_FRANCESES = [
  '3',
  '4',
  '5a', '5a+', '5b', '5b+', '5c', '5c+',
  '6a', '6a+', '6b', '6b+', '6c', '6c+',
  '7a', '7a+', '7b', '7b+', '7c', '7c+',
  '8a', '8a+', '8b', '8b+', '8c', '8c+',
  '9a', '9a+', '9b', '9b+', '9c', '9c+',
];

// Vista para la creación de rutas
export function renderCrearRuta(container, callbacks, viewData = {}) {
  const {
    idRocodromo,
    idZona,
    nombreRocodromo = 'Rocódromo',
    nombreZona = 'Zona',
    contextError = '',
  } = viewData;

  const backHref = (idRocodromo && idZona)
    ? `#mapaZona?id=${idRocodromo}&zona=${idZona}`
    : '#misRocodromos';

  container.innerHTML = `
  <div class="d-flex flex-column crear-ruta-card" style="height: 100dvh; overflow: hidden;">
    <div class="card-header bg-white d-flex align-items-center gap-2 py-3">
      <a href="${backHref}" class="text-dark text-decoration-none">
        <span class="material-icons align-middle">arrow_back</span>
      </a>
      <div class="d-flex flex-column lh-sm">
        <span class="fw-semibold">${nombreRocodromo}</span>
        <small class="text-muted">Zona ${nombreZona}</small>
      </div>
      <span class="badge text-bg-light ms-auto">Nueva ruta</span>
    </div>

    <div class="crear-ruta-mapa-wrap position-relative bg-dark flex-shrink-0">
      <div id="crearRutaMapaViewport" class="mapa-svg-viewport w-100 h-100" aria-label="Seleccion de posicion de ruta">
        <div class="d-flex justify-content-center align-items-center h-100 text-white-50">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Cargando mapa...</span>
          </div>
        </div>
      </div>
      <div class="position-absolute bottom-0 start-0 p-2 crear-ruta-mapa-overlay" style="z-index: 2;">
        <small class="badge text-bg-dark bg-opacity-75 text-wrap text-start shadow-sm border-0">Seleccione el inicio de la ruta</small>
      </div>
      <div class="position-absolute bottom-0 start-0 end-0 px-3 py-2 crear-ruta-mapa-overlay">
        <div class="d-flex justify-content-end align-items-center gap-2 flex-wrap">
          <span id="coordenadasSeleccionadas" class="badge text-bg-light">Sin punto</span>
        </div>
      </div>
    </div>

    <div class="card-body flex-grow-1 overflow-auto bg-light">
      ${contextError ? `<div id="crear-ruta-context-error" class="alert alert-warning">${contextError}</div>` : ''}
      <form id="form-crear-ruta" novalidate>
        <div class="mb-3" id="tipo-wrapper">
          <label class="form-label d-block">Tipo</label>
          <div id="tipo-segmented" class="btn-group w-100" role="group" aria-label="Selecciona tipo">
            <input type="radio" class="btn-check" name="tipo" id="tipo-boulder" value="boulder" required>
            <label class="btn btn-outline-primary w-50 rounded-start" for="tipo-boulder">Boulder</label>
            
            <input type="radio" class="btn-check" name="tipo" id="tipo-via" value="via" required>
            <label class="btn btn-outline-primary w-50 rounded-end" for="tipo-via">Vía</label>
          </div>
          <div class="invalid-feedback d-block"></div>
        </div>

        <p class="text-muted small fw-semibold text-uppercase mb-2">Opcionales</p>

        <div class="mb-3">
          <label for="nombre" class="form-label">Nombre</label>
          <input
            type="text"
            class="form-control"
            name="nombre"
            id="nombre"
            maxlength="100"
            placeholder="Ej: Placa central"
          />
          <div class="invalid-feedback"></div>
        </div>

        <div class="mb-3">
          <label for="dificultad" class="form-label">Dificultad</label>
          <select class="form-select" name="dificultad" id="dificultad"></select>
          <div class="invalid-feedback"></div>
        </div>

        <div class="row g-2">
          <div class="col-6">
            <label for="fechaCreacion" class="form-label">Fecha de creación</label>
            <input type="datetime-local" class="form-control" name="fechaCreacion" id="fechaCreacion" />
            <div class="invalid-feedback"></div>
          </div>
          <div class="col-6">
            <label for="fechaRetirada" class="form-label">Fecha de retirada</label>
            <input type="datetime-local" class="form-control" name="fechaRetirada" id="fechaRetirada" />
            <div class="invalid-feedback"></div>
          </div>
        </div>

        <div class="mb-3">
          <label for="imagen" class="form-label">Imagen (opcional)</label>
          <input type="file" class="form-control" name="imagen" id="imagen" accept="image/*" />
          <div class="invalid-feedback"></div>
        </div>

        <div id="form-alert" class="alert d-none" role="alert"></div>

        <button type="submit" id="crear-ruta-submit" class="btn btn-primary w-100" ${contextError ? 'disabled' : ''}>Crear ruta</button>
      </form>
    </div>
  </div>`;

  const form = container.querySelector('#form-crear-ruta');
  const nombreInput = container.querySelector('#nombre');
  const dificultadSelect = container.querySelector('#dificultad');
  const tipoBoulderInput = container.querySelector('#tipo-boulder');
  const tipoViaInput = container.querySelector('#tipo-via');
  const fechaCreacionInput = container.querySelector('#fechaCreacion');
  const fechaRetiradaInput = container.querySelector('#fechaRetirada');
  const imagenInput = container.querySelector('#imagen');
  const mapaViewport = container.querySelector('#crearRutaMapaViewport');
  const coordsBadge = container.querySelector('#coordenadasSeleccionadas');
  const submitButton = container.querySelector('#crear-ruta-submit');
  const alertBox = container.querySelector('#form-alert');

  // Establecer fecha de creación por defecto a ahora
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  fechaCreacionInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;

  dificultadSelect.innerHTML = [
    '<option value="">Sin dificultad</option>',
    ...GRADOS_FRANCESES.map((grado) => `<option value="${grado}">${grado}</option>`),
  ].join('');

  [nombreInput, dificultadSelect, tipoBoulderInput, tipoViaInput, fechaCreacionInput, fechaRetiradaInput, imagenInput].forEach((el) => {
    el.addEventListener('input', () => callbacks.onFieldChange(el, alertBox));
    el.addEventListener('change', () => callbacks.onFieldChange(el, alertBox));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const values = {
      idRocodromo,
      idZona,
      nombre: nombreInput.value,
      dificultad: dificultadSelect.value,
      tipo: tipoBoulderInput.checked ? 'boulder' : tipoViaInput.checked ? 'via' : '',
      fechaCreacion: fechaCreacionInput.value,
      fechaRetirada: fechaRetiradaInput.value,
      imagen: imagenInput.files?.[0] || null,
    };

    callbacks.onSubmit(values, {
      nombreInput,
      dificultadSelect,
      tipoBoulderInput,
      tipoViaInput,
      fechaCreacionInput,
      fechaRetiradaInput,
      imagenInput,
      alertBox,
      submitButton,
      coordsBadge,
    });
  });

  if (typeof callbacks.onViewReady === 'function') {
    callbacks.onViewReady({
      mapaViewport,
      coordsBadge,
      submitButton,
      alertBox,
    });
  }
}

// Función para renderizar la vista de información de una ruta
export function renderInfoRuta(container, ruta, callbacks) {
  const {
    nombre,
    dificultad,
    tipo,
    colorPresas,
    fechaCreacion,
    fechaRetirada,
    activo,
  } = ruta || {};

  const hasDificultad = typeof dificultad === 'string'
    ? dificultad.trim().length > 0
    : Boolean(dificultad);
  const tipoLabel = formatTipo(tipo);
  const dificultadLabel = dificultad || 'Sin dificultad';
  const colorPresasLabel = colorPresas || 'No definido';
  const fechaCreacionLabel = formatDateTime(fechaCreacion);
  const fechaRetiradaLabel = formatDateTime(fechaRetirada);
  const activoLabel = activo ? 'Activa' : 'Retirada';
  const activoBadgeClass = activo ? 'text-bg-success' : 'text-bg-secondary';
  const canManage = Boolean(ruta?.canManage);

  container.innerHTML = `
<div class="d-flex flex-column" style="min-height: 100dvh; background: #f8f9fa;">
  
  <!-- Imagen hero con overlay -->
  <div class="position-relative" style="height: 45dvh; min-height: 280px;">
    <img 
      src="${ruta?.imagenSrc || '/assets/placeholder.jpg'}" 
      alt="Imagen de la ruta ${nombre || ''}" 
      class="w-100 h-100" 
      style="object-fit: cover;"
    />
    <div class="position-absolute top-0 start-0 end-0 bottom-0" style="background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.5) 100%);"></div>
    
    <!-- Botón volver -->
    <a href="#" onclick="history.back(); return false;" class="position-absolute top-0 start-0 m-3 text-white d-flex align-items-center justify-content-center rounded-circle text-decoration-none" style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); backdrop-filter: blur(4px);">
      <span class="material-icons">arrow_back</span>
    </a>

    ${canManage ? `
    <div class="position-absolute bottom-0 end-0 m-3 d-flex gap-2" style="z-index: 3;">
      <button type="button" class="btn btn-light d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; background: rgba(255,255,255,0.85);" aria-label="Modificar ruta" title="Modificar ruta">
        <span class="material-icons" style="font-size: 20px;">edit</span>
      </button>
      <button type="button" class="btn btn-danger d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;" aria-label="Eliminar ruta" title="Eliminar ruta">
        <span class="material-icons" style="font-size: 20px;">delete</span>
      </button>
    </div>` : ''}
    
    <!-- Info sobre la imagen -->
    <div class="position-absolute bottom-0 start-0 end-0 p-4 text-white">
      ${hasDificultad ? `<span class="badge mb-2" style="background: rgba(255,255,255,0.2); backdrop-filter: blur(4px); font-size: 0.9rem; padding: 6px 12px;">${dificultad}</span>` : ''}
      <h1 class="fs-4 fw-semibold mb-0">${nombre || 'Sin nombre'}</h1>
    </div>
  </div>

  <!-- Contenido principal -->
  <div class="flex-grow-1 d-flex flex-column">
    
    <!-- Tu progreso y acciones -->
    <div class="bg-white px-4 py-4 border-bottom">
      <div class="d-flex align-items-center justify-content-between mb-3">
        <div>
          <p class="text-muted small mb-1 text-uppercase" style="letter-spacing: 0.5px;">Tu progreso</p>
          <p class="mb-0 fw-medium" id="estado-texto">Sin registrar</p>
        </div>
        <div id="estado-actual" class="d-flex align-items-center justify-content-center rounded-circle" style="width: 48px; height: 48px; background: #e5e7eb;">
          <span class="material-icons" style="color: #6b7280; font-size: 28px;">remove</span>
        </div>
      </div>

      <p class="text-muted small mb-3 text-uppercase" style="letter-spacing: 0.5px;">Marcar como</p>
      <div class="row g-2">
        ${renderRutaEstadoButtons()}
      </div>
    </div>

    <!-- Detalles de la ruta -->
    <div class="bg-white mt-2 px-4 py-4">
      <p class="text-muted small mb-3 text-uppercase" style="letter-spacing: 0.5px;">Detalles de la ruta</p>

      <div class="d-flex align-items-center gap-2 mb-3 flex-wrap">
        <span class="badge bg-primary">${tipoLabel}</span>
        <span class="badge text-bg-light">${dificultadLabel}</span>
        <span class="badge ${activoBadgeClass}">${activoLabel}</span>
      </div>

      <div class="row g-3">
        <div class="col-12">
          <div class="small text-muted text-uppercase">Color de presas</div>
          <div class="fw-medium">${colorPresasLabel}</div>
        </div>
        <div class="col-12">
          <div class="small text-muted text-uppercase">Fecha de creación</div>
          <div class="fw-medium">${fechaCreacionLabel}</div>
        </div>
        <div class="col-12">
          <div class="small text-muted text-uppercase">Fecha de retirada</div>
          <div class="fw-medium">${fechaRetiradaLabel}</div>
        </div>
      </div>
    </div>

  </div>
</div>`;

  setupRutaEstadoButtons(container, callbacks.onEstadoChange);
}

// Función auxiliar para formatear una fecha/hora a un formato legible o mostrar un texto de fallback si no es válida
function formatDateTime(value) {
  if (!value) return 'No definida';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'No definida';

  return parsed.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Función auxiliar para formatear el tipo de ruta a un texto legible
function formatTipo(tipo) {
  if (!tipo) return 'No definido';
  if (tipo === 'via') return 'Via';
  if (tipo === 'boulder') return 'Boulder';
  return tipo;
}
