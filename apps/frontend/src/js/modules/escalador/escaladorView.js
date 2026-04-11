import { renderNavbar } from '../../components/navbar.js';
import { showConfirmModal } from '../../components/modal.js';
import { escapeHtml } from '../../components/formHelpers.js';
import { renderEditableField, initEditableField } from '../../components/editableField.js';

// Vista del perfil del escalador
export function renderPerfil(container, escalador, callbacks) {
  const { apodo, descripcion, fotoSrc } = escalador;
  const avatar = fotoSrc || '/assets/johnDoe.png';
  const apodoLimpio = typeof apodo === 'string' ? apodo.trim() : '';
  const descripcionLimpia =
    typeof descripcion === 'string' ? descripcion.trim() : '';
  const descripcionVisible =
    descripcionLimpia && descripcionLimpia.toLowerCase() !== 'null'
      ? escapeHtml(descripcionLimpia)
      : '';

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
              <a class="dropdown-item d-flex align-items-center gap-2" href="#" data-menu-placeholder="editar-perfil">
                <span class="material-icons" style="font-size: 18px;">person</span>
                <span>Editar perfil</span>
              </a>
            </li>
            <li>
              <a class="dropdown-item d-flex align-items-center gap-2" href="#" data-menu-placeholder="cambiar-contrasena">
                <span class="material-icons" style="font-size: 18px;">lock</span>
                <span>Cambiar contraseña</span>
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
              class="rounded-circle" 
              style="width: 100px; height: 100px; object-fit: cover;"
            />
            <button
              type="button"
              id="open-change-photo-btn"
              class="btn btn-primary rounded-circle d-flex align-items-center justify-content-center perfil-photo-edit-btn"
              aria-label="Cambiar foto de perfil"
              title="Cambiar foto de perfil"
            >
              <span class="material-icons" style="font-size: 18px;">photo_camera</span>
            </button>
          </div>
          ${renderEditableField({
            prefix: 'apodo',
            wrapperClass: 'perfil-apodo-wrap',
            viewContent: `<h5 class="fw-bold mb-1">${apodo}</h5>`,
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
          ${renderEditableField({
            prefix: 'descripcion',
            wrapperClass: 'perfil-descripcion-wrap mt-2',
            viewContent: `<div class="text-center">${descripcionVisible
              ? `<p class="text-muted mb-0">${descripcionVisible}</p>`
              : '<p class="text-muted mb-0 small fst-italic">Sin descripcion...</p>'}</div>`,
            inputValue: escapeHtml(descripcionLimpia),
            inputTag: 'textarea',
            placeholder: 'Anade una descripcion',
            ariaLabel: 'Descripcion',
            maxLength: 255,
            rows: 7,
          })}
        </div>
      </div>

      <!-- Menú de navegación inferior -->
      ${renderNavbar()}
    `;

  const menuPlaceholders = container.querySelectorAll(
    '[data-menu-placeholder]'
  );
  menuPlaceholders.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
    });
  });

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
