// Componente de modal de confirmación reutilizable

/**
 * Muestra un modal de confirmación usando Bootstrap
 * @param {Object} options - Opciones del modal
 * @param {string} options.title - Título del modal
 * @param {string} options.message - Mensaje del modal
 * @param {string} options.confirmText - Texto del botón de confirmar (default: 'Confirmar')
 * @param {string} options.cancelText - Texto del botón de cancelar (default: 'Cancelar')
 * @param {string} options.confirmClass - Clase CSS del botón de confirmar (default: 'btn-danger')
 * @returns {Promise<boolean>} - Resuelve true si confirma, false si cancela
 */
export function showConfirmModal(options = {}) {
    const {
        title = 'Confirmar acción',
        message = '¿Estás seguro de que deseas continuar?',
        confirmText = 'Confirmar',
        cancelText = 'Cancelar',
        confirmClass = 'btn-danger'
    } = options;

    return new Promise((resolve) => {
        // Remover modal existente si hay uno
        const existingModal = document.getElementById('confirmModal');
        if (existingModal) {
            existingModal.remove();
        }
        const existingBackdrop = document.querySelector('.modal-backdrop');
        if (existingBackdrop) {
            existingBackdrop.remove();
        }

        // Crear el HTML del modal
        const modalHTML = `
            <div class="modal fade" id="confirmModal" tabindex="-1" aria-labelledby="confirmModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="confirmModalLabel">${title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                        </div>
                        <div class="modal-body">
                            ${message}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" id="modalCancelBtn">${cancelText}</button>
                            <button type="button" class="btn ${confirmClass}" id="modalConfirmBtn">${confirmText}</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Insertar el modal en el DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modalElement = document.getElementById('confirmModal');
        const modal = new window.bootstrap.Modal(modalElement);

        // Event listeners
        const confirmBtn = document.getElementById('modalConfirmBtn');
        const cancelBtn = document.getElementById('modalCancelBtn');

        const cleanup = () => {
            modal.hide();
            modalElement.remove();
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) backdrop.remove();
            document.body.classList.remove('modal-open');
            document.body.style.removeProperty('padding-right');
            document.body.style.removeProperty('overflow');
        };

        confirmBtn.addEventListener('click', () => {
            cleanup();
            resolve(true);
        });

        cancelBtn.addEventListener('click', () => {
            cleanup();
            resolve(false);
        });

        modalElement.addEventListener('hidden.bs.modal', () => {
            cleanup();
            resolve(false);
        });

        // Mostrar el modal
        modal.show();
    });
}
