// Modal para seleccionar una foto de perfil disponible

function buildPhotoOptionHtml(photo, checked) {
  const checkedAttr = checked ? 'checked' : '';
  const selectedClass = checked ? 'is-selected' : '';

  return `
        <label class="perfil-photo-option ${selectedClass}" data-photo-option>
            <input
                type="radio"
                name="perfil-photo-choice"
                value="${photo.id}"
                class="perfil-photo-radio"
                ${checkedAttr}
            />
            <img src="${photo.src}" alt="Foto de perfil ${photo.id}" class="perfil-photo-option-image" />
        </label>
    `;
}

export function showProfilePhotoModal({
  photos = [],
  currentPhotoId = null,
} = {}) {
  return new Promise((resolve) => {
    const existingModal = document.getElementById('profilePhotoModal');
    if (existingModal) {
      existingModal.remove();
    }

    const existingBackdrop = document.querySelector('.modal-backdrop');
    if (existingBackdrop) {
      existingBackdrop.remove();
    }

    const normalizedCurrentId = Number(currentPhotoId);
    const fallbackPhoto = photos[0] || null;
    const initiallySelectedPhoto =
      photos.find((photo) => Number(photo.id) === normalizedCurrentId) ||
      fallbackPhoto;
    const initialSelectedId = initiallySelectedPhoto
      ? Number(initiallySelectedPhoto.id)
      : null;
    const optionsHtml = photos
      .map((photo) =>
        buildPhotoOptionHtml(photo, Number(photo.id) === initialSelectedId)
      )
      .join('');

    const modalHTML = `
            <div class="modal fade" id="profilePhotoModal" tabindex="-1" aria-labelledby="profilePhotoModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-fullscreen-sm-down">
                    <div class="modal-content perfil-photo-modal-content">
                        <div class="modal-header border-0 perfil-photo-modal-header">
                            <h5 class="modal-title w-100 text-center" id="profilePhotoModalLabel">Cambiar foto de perfil</h5>
                            <button type="button" class="btn-close position-absolute end-0 me-3" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                        </div>
                        <div class="perfil-photo-section-divider"></div>
                        <div class="modal-body pt-0 perfil-photo-modal-body">
                            <div class="d-flex justify-content-center py-3 perfil-photo-preview-section">
                                <img
                                    id="perfil-photo-preview"
                                    src="${initiallySelectedPhoto ? initiallySelectedPhoto.src : ''}"
                                    alt="Vista previa de foto seleccionada"
                                    class="perfil-photo-preview ${initiallySelectedPhoto ? '' : 'd-none'}"
                                />
                            </div>

                            <div class="perfil-photo-options-wrap border rounded p-3">
                                ${optionsHtml || '<p class="text-muted text-center mb-0">No hay fotos disponibles.</p>'}
                            </div>
                        </div>
                        <div class="perfil-photo-section-divider"></div>
                        <div class="modal-footer border-0 justify-content-between">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="confirm-profile-photo-btn" ${photos.length ? '' : 'disabled'}>Confirmar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modalElement = document.getElementById('profilePhotoModal');
    const modalInstance = new window.bootstrap.Modal(modalElement);
    const previewEl = modalElement.querySelector('#perfil-photo-preview');
    const confirmBtn = modalElement.querySelector('#confirm-profile-photo-btn');
    const optionEls = modalElement.querySelectorAll('[data-photo-option]');

    let selectedId = initialSelectedId;
    let result = null;
    let cleaned = false;

    const syncSelectedStyles = () => {
      optionEls.forEach((optionEl) => {
        const radio = optionEl.querySelector('input[type="radio"]');
        optionEl.classList.toggle('is-selected', Boolean(radio?.checked));
      });
    };

    optionEls.forEach((optionEl) => {
      const radio = optionEl.querySelector('input[type="radio"]');
      const image = optionEl.querySelector('img');

      if (!radio || !image) {
        return;
      }

      radio.addEventListener('change', () => {
        selectedId = Number(radio.value);
        previewEl.src = image.src;
        previewEl.classList.remove('d-none');
        syncSelectedStyles();
      });
    });

    const cleanup = () => {
      if (cleaned) {
        return;
      }

      cleaned = true;
      modalInstance.dispose();
      modalElement.remove();

      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }

      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('padding-right');
      document.body.style.removeProperty('overflow');
    };

    modalElement.addEventListener('hidden.bs.modal', () => {
      cleanup();
      resolve(result);
    });

    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        if (!Number.isInteger(selectedId) || selectedId < 1) {
          return;
        }

        result = selectedId;
        modalInstance.hide();
      });
    }

    modalInstance.show();
  });
}
