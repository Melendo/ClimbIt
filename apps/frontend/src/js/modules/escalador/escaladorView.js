import { renderNavbar } from '../../components/navbar.js';
import { showConfirmModal } from '../../components/modal.js';
import { escapeHtml } from '../../components/formHelpers.js';
import {
  renderEditableField,
  initEditableField,
} from '../../components/editableField.js';
import { renderSectionDivider } from '../../components/sectionDivider.js';
import {
  bindHeatmapInteractions,
  buildEscaladorStatsViewModel,
  renderMonthlyActivityCards,
  renderRouteTypesStatsCard,
  renderStatsSection,
  renderTotalRoutesStatsCard,
} from '../../components/escaladorStats.js';

function renderPerfilFieldTitle(text) {
  return `<p class="text-muted small text-uppercase fw-semibold mb-1 perfil-field-title">${text}</p>`;
}

function renderPerfilStats(statsViewModel) {
  return `
    <div class="perfil-estadisticas-wrap mt-4">
      ${renderSectionDivider({ label: 'Estadisticas' })}
      <div class="perfil-estadisticas-view mt-3">
        ${renderStatsSection({
          title: 'Actividad mensual',
          content: renderMonthlyActivityCards(statsViewModel.monthly),
        })}
        ${renderStatsSection({
          title: 'Total de Rutas Escaladas',
          content: renderTotalRoutesStatsCard(statsViewModel.totals),
        })}
        ${renderStatsSection({
          title: 'Tipos de Rutas Escaladas',
          content: renderRouteTypesStatsCard(statsViewModel.totals),
        })}
      </div>
    </div>
  `;
}

// Vista del perfil del escalador
export function renderPerfil(container, escalador, callbacks) {
  const { apodo, descripcion, fotoSrc, estadisticas = {} } = escalador;
  if (typeof container.__perfilStatsCleanup === 'function') {
    container.__perfilStatsCleanup();
    container.__perfilStatsCleanup = null;
  }

  const avatar = fotoSrc || '/assets/johnDoe.png';
  const apodoLimpio = typeof apodo === 'string' ? apodo.trim() : '';
  const descripcionLimpia =
    typeof descripcion === 'string' ? descripcion.trim() : '';
  const descripcionVisible =
    descripcionLimpia && descripcionLimpia.toLowerCase() !== 'null'
      ? escapeHtml(descripcionLimpia)
      : '';
  const statsViewModel = buildEscaladorStatsViewModel(estadisticas);

  container.innerHTML = `
      <!-- Cabecera -->
      <div class="card-header bg-white d-flex align-items-center justify-content-center gap-2 py-3 position-relative perfil-header">
        <div class="d-flex align-items-center gap-2">
          <img src="/icons/apple-touch-icon.png" alt="Logo de ClimbIt" style="width: 32px; height: 32px; object-fit: contain;" />
          <span class="fw-bold" style="font-size: 1.5rem;">ClimbIt</span>
        </div>

        <div class="dropdown position-absolute top-50 end-0 translate-middle-y pe-3">
          <button
            class="btn text-muted p-0 border-0 d-flex align-items-center"
            type="button"
            id="perfil-actions-btn"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            aria-label="Abrir ajustes de cuenta"
          >
            <span class="material-icons">more_vert</span>
          </button>

          <ul class="dropdown-menu dropdown-menu-end perfil-header-dropdown-menu" aria-labelledby="perfil-actions-btn">
            <li>
              <a class="dropdown-item d-flex align-items-center gap-2" href="#editarPerfil">
                <span class="material-icons" style="font-size: 18px;">person</span>
                <span>Editar perfil</span>
              </a>
            </li>
            <li>
              <a class="dropdown-item d-flex align-items-center gap-2" href="#" data-menu-placeholder="tutorial" id="header-tutorial-btn">
                <span class="material-icons" style="font-size: 18px;">school</span>
                <span>Tutorial</span>
              </a>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
              <a class="dropdown-item d-flex align-items-center gap-2 text-danger" href="#" id="header-logout-btn">
                <span class="material-icons" style="font-size: 18px;">logout</span>
                <span>Cerrar sesión</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Contenido del perfil -->
      <div class="card-body flex-grow-1 overflow-auto">
        
        <!-- Sección de información del perfil -->
        <div class="text-center mb-4">
          <div class="position-relative d-inline-block mb-3">
            <img 
              src="${avatar}" 
              alt="Foto de perfil" 
              class="rounded-circle perfil-avatar" 
            />
          </div>
          <div class="perfil-apodo-wrap">
            <div class="perfil-apodo-view w-100">
              <div class="perfil-apodo-view-content">
                <h5 class="fw-bold mb-0">${escapeHtml(apodoLimpio) || 'Sin apodo'}</h5>
              </div>
            </div>
          </div>

          <div class="perfil-descripcion-wrap">
            ${renderSectionDivider({ label: 'Descripcion' })}
            <div class="perfil-descripcion-view w-100">
              <div class="perfil-descripcion-view-content text-center">
                ${
                  descripcionVisible
                    ? `<p class="text-muted mb-0">${descripcionVisible}</p>`
                    : '<p class="text-muted mb-0 small fst-italic">Sin descripcion...</p>'
                }
              </div>
            </div>
          </div>

          ${renderPerfilStats(statsViewModel)}
        </div>
      </div>

      <!-- Menú de navegación inferior -->
      ${renderNavbar()}
    `;

  container.__perfilStatsCleanup = bindHeatmapInteractions(container);

  const menuPlaceholders = container.querySelectorAll(
    '[data-menu-placeholder]'
  );
  menuPlaceholders.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
    });
  });

  const headerTutorialBtn = container.querySelector('#header-tutorial-btn');
  if (headerTutorialBtn && typeof callbacks.onOpenTutorial === 'function') {
    headerTutorialBtn.addEventListener('click', (e) => {
      e.preventDefault();
      callbacks.onOpenTutorial();
    });
  }

  const headerLogoutBtn = container.querySelector('#header-logout-btn');
  headerLogoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const confirmed = await showConfirmModal({
      title: 'Cerrar sesión',
      message: '¿Estás seguro de que quieres cerrar sesión?',
      confirmText: 'Cerrar sesión',
      cancelText: 'Cancelar',
      confirmClass: 'btn-danger',
    });

    if (confirmed) {
      callbacks.onLogout();
    }
  });

  // La vista de perfil ya no permite editar campos directamente.
}

// Vista de editar perfil
export function renderEditarPerfil(container, escalador, callbacks) {
  if (typeof container.__perfilStatsCleanup === 'function') {
    container.__perfilStatsCleanup();
    container.__perfilStatsCleanup = null;
  }

  const { apodo, descripcion, fotoSrc, correo } = escalador;
  const avatar = fotoSrc || '/assets/johnDoe.png';
  const apodoLimpio = typeof apodo === 'string' ? apodo.trim() : '';
  const descripcionLimpia =
    typeof descripcion === 'string' ? descripcion.trim() : '';
  const correoLimpio = typeof correo === 'string' ? correo.trim() : '';
  const descripcionVisible =
    descripcionLimpia && descripcionLimpia.toLowerCase() !== 'null'
      ? escapeHtml(descripcionLimpia)
      : '';

  container.innerHTML = `
      <div class="card-header bg-white d-flex align-items-center gap-2 py-3">
        <a href="#" onclick="history.back(); return false;" class="text-dark text-decoration-none">
          <span class="material-icons align-middle">arrow_back</span>
        </a>
        <span class="fw-medium">Editar informacion de perfil</span>
      </div>

      <div class="card-body flex-grow-1 overflow-auto">
        <div class="perfil-edit-section p-3">
          <div class="perfil-foto-wrap perfil-field-block">
            ${renderPerfilFieldTitle('Foto de perfil')}
            <div class="perfil-foto-view w-100">
              <div class="perfil-foto-view-content">
                <div class="position-relative d-inline-block mb-3 align-self-center">
                  <img 
                    src="${avatar}" 
                    alt="Foto de perfil" 
                    class="rounded-circle perfil-avatar" 
                  />
                  <button
                    type="button"
                    id="open-change-photo-btn"
                    class="perfil-photo-edit-btn rounded-circle d-flex align-items-center justify-content-center"
                    aria-label="Cambiar foto de perfil"
                    title="Cambiar foto de perfil"
                  >
                    <span class="material-icons" style="font-size: 18px;">photo_camera</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          ${renderEditableField({
            prefix: 'apodo',
            wrapperClass: 'perfil-apodo-wrap perfil-field-block',
            titleHtml: renderPerfilFieldTitle('Apodo'),
            viewContent: `
              <h5 class="fw-bold mb-0 text-center">${escapeHtml(apodoLimpio) || 'Sin apodo'}</h5>
            `,
            inputValue: escapeHtml(apodoLimpio),
            inputTag: 'input',
            placeholder: 'Edita tu apodo',
            ariaLabel: 'Apodo',
            maxLength: 20,
            inputAttributes: {
              autocomplete: 'off',
              autocapitalize: 'off',
              autocorrect: 'off',
              spellcheck: 'false',
            },
          })}

          <div class="perfil-correo-wrap perfil-field-block">
            ${renderPerfilFieldTitle('Correo electronico')}
            <div class="perfil-correo-view w-100">
              <div class="perfil-correo-view-content">
                <p class="fw-semibold mb-0 text-center">${escapeHtml(correoLimpio) || 'Sin correo'}</p>
              </div>
            </div>
          </div>

          ${renderEditableField({
            prefix: 'descripcion',
            wrapperClass: 'perfil-descripcion-wrap perfil-field-block',
            titleHtml: renderPerfilFieldTitle('Descripcion'),
            viewContent: `
              <div class="text-center">${
                descripcionVisible
                  ? `<p class="text-muted mb-0 text-center">${descripcionVisible}</p>`
                  : '<p class="text-muted mb-0 small fst-italic text-center">Sin descripcion...</p>'
              }</div>
            `,
            inputValue: escapeHtml(descripcionLimpia),
            inputTag: 'textarea',
            placeholder: 'Anade una descripcion',
            ariaLabel: 'Descripcion',
            maxLength: 255,
            rows: 7,
          })}
        </div>
      </div>
    `;

  const openChangePhotoBtn = container.querySelector('#open-change-photo-btn');
  openChangePhotoBtn.addEventListener('click', () => {
    callbacks.onOpenChangePhoto();
  });

  let apodoField = null;
  let descripcionField = null;

  apodoField = initEditableField(container, {
    prefix: 'apodo',
    initialValue: apodoLimpio,
    maxLength: 20,
    onSave: callbacks?.onUpdateApodo,
    onOpen: () => descripcionField?.close(),
    disableWhenEmpty: true,
  });

  descripcionField = initEditableField(container, {
    prefix: 'descripcion',
    initialValue: descripcionLimpia,
    maxLength: 255,
    onSave: callbacks?.onUpdateDescripcion,
    onOpen: () => apodoField?.close(),
    disableWhenEmpty: false,
  });
}
