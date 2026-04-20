import { renderRutaEstadoButtons, setupRutaEstadoButtons } from '../../components/rutaEstadoButtons.js';
import {
  renderRutaRatingSection,
  setupRutaRatingSection,
} from '../../components/rutaRating.js';
import { escapeHtml } from '../../components/formHelpers.js';
import { renderPresaColorIcon } from '../../components/rutaCardIndicators.js';
import { renderRutaImageModal, setupRutaImageModal } from '../../components/rutaImageModal.js';

function toDateInputValue(value) {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Vista para la creación de rutas
export function renderCrearRuta(container, callbacks, viewData = {}) {
  const {
    idRocodromo,
    idZona,
    nombreRocodromo = 'Rocódromo',
    nombreZona = 'Zona',
    contextError = '',
    mode = 'create',
    initialValues = {},
    colorPresasOptions = [],
  } = viewData;
  
  const isEditMode = mode === 'edit';
  const cardBadgeText = isEditMode ? 'Modificar ruta' : 'Nueva ruta';
  const submitText = isEditMode ? 'Guardar cambios' : 'Crear ruta';
  
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
      <span class="badge text-bg-light ms-auto">${cardBadgeText}</span>
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

        <div class="mb-3">
          <label for="colorPresas" class="form-label">Color de presas</label>
          <select class="form-select" name="colorPresas" id="colorPresas"></select>
          <div class="invalid-feedback"></div>
        </div>

        <div class="mb-3">
          <label for="dificultad" class="form-label">Dificultad</label>
          <select class="form-select" name="dificultad" id="dificultad"></select>
          <div class="invalid-feedback"></div>
        </div>

        <div class="mb-3">
          <label for="imagen" class="form-label">Foto ruta</label>
          <input type="file" class="form-control" name="imagen" id="imagen" accept="image/*" />
          <div class="invalid-feedback"></div>
        </div>

        <details class="mb-3 border rounded-3 bg-white shadow-sm overflow-hidden">
          <summary class="d-flex align-items-center justify-content-between gap-2 px-3 py-2 fw-semibold text-dark" style="cursor: pointer; list-style: none;">
            <span>Campos adicionales</span>
            <span class="material-icons text-muted">expand_more</span>
          </summary>
          <div class="px-3 pb-3 pt-1">
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

            <div class="row g-2">
              <div class="col-6">
                <label for="fechaCreacion" class="form-label">Fecha de creación</label>
                <input type="date" class="form-control" name="fechaCreacion" id="fechaCreacion" />
                <div class="invalid-feedback"></div>
              </div>
              <div class="col-6">
                <label for="fechaRetirada" class="form-label">Fecha de retirada</label>
                <input type="date" class="form-control" name="fechaRetirada" id="fechaRetirada" />
                <div class="invalid-feedback"></div>
              </div>
            </div>
          </div>
        </details>

        <div id="form-alert" class="alert d-none" role="alert"></div>
  
        <button type="submit" id="crear-ruta-submit" class="btn btn-primary w-100" ${contextError ? 'disabled' : ''}>${submitText}</button>
      </form>
    </div>
  </div>`;
  
  const form = container.querySelector('#form-crear-ruta');
  const nombreInput = container.querySelector('#nombre');
  const dificultadSelect = container.querySelector('#dificultad');
  const colorPresasSelect = container.querySelector('#colorPresas');
  const tipoBoulderInput = container.querySelector('#tipo-boulder');
  const tipoViaInput = container.querySelector('#tipo-via');
  const fechaCreacionInput = container.querySelector('#fechaCreacion');
  const fechaRetiradaInput = container.querySelector('#fechaRetirada');
  const imagenInput = container.querySelector('#imagen');
  const mapaViewport = container.querySelector('#crearRutaMapaViewport');
  const coordsBadge = container.querySelector('#coordenadasSeleccionadas');
  const submitButton = container.querySelector('#crear-ruta-submit');
  const alertBox = container.querySelector('#form-alert');
  
  const setDificultadOptions = (options = [], placeholder = 'Sin dificultad') => {
    const safeOptions = Array.isArray(options) ? options : [];
    
    dificultadSelect.innerHTML = [
      `<option value="">${escapeHtml(placeholder)}</option>`,
      ...safeOptions.map((option) => {
        const value = escapeHtml(option?.value ?? '');
        const label = escapeHtml(option?.label ?? option?.value ?? '');
        return `<option value="${value}">${label}</option>`;
      }),
    ].join('');
  };

  const setColorPresasOptions = (options = [], placeholder = 'Sin color de presas') => {
    const safeOptions = Array.isArray(options) ? options : [];

    colorPresasSelect.innerHTML = [
      `<option value="">${escapeHtml(placeholder)}</option>`,
      ...safeOptions.map((option) => {
        const value = escapeHtml(option?.value ?? '');
        const label = escapeHtml(option?.label ?? option?.value ?? '');
        return `<option value="${value}">${label}</option>`;
      }),
    ].join('');
  };
  
  if (typeof initialValues.nombre === 'string') {
    nombreInput.value = initialValues.nombre;
  }

  setColorPresasOptions(colorPresasOptions, 'Sin color de presas');
  if (typeof initialValues.colorPresas === 'string') {
    colorPresasSelect.value = initialValues.colorPresas;
  }
  
  if (initialValues.tipo === 'boulder') {
    tipoBoulderInput.checked = true;
  } else if (initialValues.tipo === 'via') {
    tipoViaInput.checked = true;
  }
  
  fechaCreacionInput.value = toDateInputValue(initialValues.fechaCreacion);
  fechaRetiradaInput.value = toDateInputValue(initialValues.fechaRetirada);
  
  if (!fechaCreacionInput.value) {
    // Establecer fecha de creación por defecto al día actual
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    fechaCreacionInput.value = `${year}-${month}-${day}`;
  }
  
  dificultadSelect.disabled = true;
  setDificultadOptions([], 'Selecciona tipo de ruta');
  
  [nombreInput, dificultadSelect, colorPresasSelect, tipoBoulderInput, tipoViaInput, fechaCreacionInput, fechaRetiradaInput, imagenInput].forEach((el) => {
    el.addEventListener('input', () => callbacks.onFieldChange(el, alertBox));
    el.addEventListener('change', () => callbacks.onFieldChange(el, alertBox));
  });
  
  const handleTipoChange = () => {
    if (typeof callbacks.onTipoChange !== 'function') return;
    
    const selectedTipo = tipoBoulderInput.checked ? 'boulder' : tipoViaInput.checked ? 'via' : '';
    callbacks.onTipoChange(selectedTipo, {
      dificultadSelect,
      setDificultadOptions,
      alertBox,
    });
  };
  
  tipoBoulderInput.addEventListener('change', handleTipoChange);
  tipoViaInput.addEventListener('change', handleTipoChange);
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const values = {
      idRocodromo,
      idZona,
      nombre: nombreInput.value,
      dificultad: dificultadSelect.value,
      colorPresas: colorPresasSelect.value,
      tipo: tipoBoulderInput.checked ? 'boulder' : tipoViaInput.checked ? 'via' : '',
      fechaCreacion: fechaCreacionInput.value,
      fechaRetirada: fechaRetiradaInput.value,
      imagen: imagenInput.files?.[0] || null,
    };
    
    callbacks.onSubmit(values, {
      nombreInput,
      dificultadSelect,
      colorPresasSelect,
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
      dificultadSelect,
      tipoBoulderInput,
      tipoViaInput,
      setDificultadOptions,
      initialValues,
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
  const colorPresasRgb = ruta?.colorPresasRgb || 'rgb(158, 158, 158)';
  const fechaCreacionLabel = formatDateOnly(fechaCreacion);
  const fechaRetiradaLabel = formatDateOnly(fechaRetirada);
  const activoLabel = activo ? 'Activa' : 'Inactiva';
  const activoBadgeClass = activo ? 'text-bg-success' : 'text-bg-secondary';
  const canManage = Boolean(ruta?.canManage);
  const backHref = ruta?.backHref || '#misRocodromos';
  const rutaNombre = nombre || 'Sin nombre';
  const rutaNombreSafe = escapeHtml(rutaNombre);
  const rutaImageSrc = ruta?.imagenSrc || '/assets/placeholder.webp';
  const rutaImageModalId = `ruta-image-modal-${ruta?.id || 'detalle'}`;
  const ratingSummary = {
    averageRating: Number(ruta?.ratingSummary?.averageRating) || 0,
    numValoraciones: Number(ruta?.ratingSummary?.numValoraciones) || 0,
    canRate: Boolean(ruta?.canRateRating),
  };
  
  container.innerHTML = `
<div class="d-flex flex-column" style="min-height: 100dvh; background: #f8f9fa;">
  
  <!-- Imagen hero con overlay -->
  <div class="position-relative" style="height: 45dvh; min-height: 280px;">
    <img 
      src="${rutaImageSrc}" 
      alt="Imagen de la ruta ${rutaNombreSafe}" 
      class="w-100 h-100" 
      style="object-fit: cover;"
    />
    <div class="position-absolute top-0 start-0 end-0 bottom-0" style="background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.5) 100%);"></div>
    
    <!-- Botón volver -->
    <a href="${backHref}" class="position-absolute top-0 start-0 m-3 text-white d-flex align-items-center justify-content-center rounded-circle text-decoration-none" style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); backdrop-filter: blur(4px);">
      <span class="material-icons">arrow_back</span>
    </a>
  
    ${canManage ? `
    <div class="position-absolute top-0 end-0 m-3 d-flex gap-2" style="z-index: 3;">
      <button type="button" id="btn-modificar-ruta" class="btn btn-light d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; background: rgba(255,255,255,0.85);" aria-label="Modificar ruta" title="Modificar ruta">
        <span class="material-icons" style="font-size: 20px;">edit</span>
      </button>
      <button type="button" id="eliminar-ruta-btn" class="btn btn-danger d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;" aria-label="Eliminar ruta" title="Eliminar ruta">
        <span class="material-icons" style="font-size: 20px;">delete</span>
      </button>
    </div>` : ''}

    <button
      type="button"
      class="btn btn-dark d-flex align-items-center justify-content-center position-absolute bottom-0 end-0 m-3"
      aria-label="Ampliar foto de la ruta"
      title="Ampliar foto"
      data-bs-toggle="modal"
      data-bs-target="#${rutaImageModalId}"
      style="z-index: 3; width: 40px; height: 40px; background: rgba(0,0,0,0.48); border-color: rgba(255,255,255,0.35);"
    >
      <span class="material-icons" style="font-size: 20px;">zoom_in</span>
    </button>
    
    <!-- Info sobre la imagen -->
    <div class="position-absolute bottom-0 start-0 end-0 p-4 text-white">
      ${hasDificultad ? `<span class="badge mb-2" style="background: rgba(255,255,255,0.2); backdrop-filter: blur(4px); font-size: 0.9rem; padding: 6px 12px;">${dificultad}</span>` : ''}
      <h1 class="fs-4 fw-semibold mb-0">${rutaNombreSafe}</h1>
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

    ${renderRutaRatingSection(ratingSummary)}
  
    <!-- Detalles de la ruta -->
    <div class="bg-white mt-2 px-4 py-4">
      <p class="text-muted small mb-3 text-uppercase" style="letter-spacing: 0.5px;">Detalles de la ruta</p>
  
      <div class="row g-3">
        <div class="col-6">
          <div class="small text-muted text-uppercase">Tipo de ruta</div>
          <div class="mt-1">
            <span class="badge bg-primary">${tipoLabel}</span>
          </div>
        </div>
        <div class="col-6">
          <div class="small text-muted text-uppercase">Estado de ruta</div>
          <div class="mt-1">
            <span class="badge ${activoBadgeClass}">${activoLabel}</span>
          </div>
        </div>
        <div class="col-6">
          <div class="small text-muted text-uppercase">Color de presas</div>
          <div class="d-inline-flex align-items-center justify-content-center rounded-3 mt-1" style="width: 38px; height: 38px; background: #f3f4f6;">
            ${renderPresaColorIcon({
              color: colorPresasRgb,
              size: 28,
              inset: 2,
              withOutline: true,
              title: `Color de presas: ${colorPresasLabel}`,
              ariaLabel: `Color de presas ${colorPresasLabel}`,
            })}
          </div>
        </div>
        <div class="col-6">
          <div class="small text-muted text-uppercase">Dificultad</div>
          <div class="mt-1">
            <span class="badge bg-primary shadow-sm border border-light">${escapeHtml(dificultadLabel)}</span>
          </div>
        </div>
        <div class="col-6">
          <div class="small text-muted text-uppercase">Fecha de creación</div>
          <div class="fw-medium">${fechaCreacionLabel}</div>
        </div>
        <div class="col-6">
          <div class="small text-muted text-uppercase">Fecha de retirada</div>
          <div class="fw-medium">${fechaRetiradaLabel}</div>
        </div>
      </div>
    </div>
  
  </div>
</div>

${renderRutaImageModal({
  modalId: rutaImageModalId,
  title: rutaNombre,
  imageSrc: rutaImageSrc,
  imageAlt: `Imagen ampliada de la ruta ${rutaNombre}`,
})}`;
  
  setupRutaEstadoButtons(container, callbacks.onEstadoChange);
  const ratingSectionController = setupRutaRatingSection(container, {
    canRate: ratingSummary.canRate,
    onSave: callbacks.onRatingSave,
    onWarn: callbacks.onRatingWarn,
    onError: callbacks.onRatingError,
  });

  if (ratingSectionController && typeof callbacks.onRatingReady === 'function') {
    callbacks.onRatingReady(ratingSectionController);
  }
  
  const editButton = container.querySelector('#btn-modificar-ruta');
  if (editButton && typeof callbacks.onEdit === 'function') {
    editButton.addEventListener('click', callbacks.onEdit);
  }
    const eliminarRutaBtn = container.querySelector('#eliminar-ruta-btn');
    if (eliminarRutaBtn && typeof callbacks.onDeleteRoute === 'function') {
      eliminarRutaBtn.addEventListener('click', () => {
        callbacks.onDeleteRoute(ruta, eliminarRutaBtn);
      });
    }

  setupRutaImageModal(container, { modalId: rutaImageModalId });
  }

  
  // Función auxiliar para formatear una fecha a día, mes y año o mostrar un texto de fallback si no es válida
  function formatDateOnly(value) {
    if (!value) return 'No definida';

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'No definida';

    return parsed.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
  
  // Función auxiliar para formatear el tipo de ruta a un texto legible
  function formatTipo(tipo) {
    if (!tipo) return 'No definido';
    if (tipo === 'via') return 'Vía';
    if (tipo === 'boulder') return 'Bloque';
    return tipo;
  }
  