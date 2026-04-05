import { showConfirmModal } from './modal.js';

/**
 * Crea el HTML de un botón de suscribirse/desuscribirse
 * @param {number} idRocodromo - ID del rocódromo
 * @param {boolean} estaSuscrito - Si el usuario está suscrito
 * @param {Object} options - Opciones de estilo
 * @param {string} options.size - Tamaño del botón (sm, md, lg). Default: 'md'
 * @param {string} options.position - Posición del botón (absolute, inline). Default: 'absolute'
 * @returns {string} HTML del botón
 */
export function renderSubscribeButton(idRocodromo, estaSuscrito = false, options = {}) {
  const { size = 'md', position = 'absolute' } = options;
  
  const actionClass = estaSuscrito ? 'btn-warning btn-desuscribirse' : 'btn-outline-secondary btn-suscribirse';
  const actionText = estaSuscrito ? 'Quitar de favoritos' : 'Marcar como favorito';
  const actionIcon = estaSuscrito ? 'star' : 'star_border';

  let buttonClasses = `btn ${actionClass} d-flex align-items-center justify-content-center`;
  let styles = '';

  // Determinar tamaño y estilos según opciones
  if (position === 'absolute') {
    buttonClasses += ' btn-sm position-absolute top-0 end-0 mt-2 me-2';
    styles = '';
  } else if (size === 'sm') {
    buttonClasses += ' btn-sm';
    styles = '';
  } else if (size === 'lg') {
    buttonClasses += ' btn-lg';
    styles = 'width: 50px; height: 50px;';
  } else {
    // default size 'md'
    styles = 'width: 40px; height: 40px;';
  }

  return `
    <button
      class="${buttonClasses}"
      data-id="${idRocodromo}"
      title="${actionText}"
      aria-label="${actionText}"
      ${styles ? `style="${styles}"` : ''}
    >
      <span class="material-icons" style="font-size: 18px; line-height: 1;">${actionIcon}</span>
    </button>
  `;
}

/**
 * Inicializa los event listeners para los botones de suscribirse
 * @param {HTMLElement} container - Elemento contenedor donde buscar los botones
 */
export function initSubscribeButtons(container) {
  const buttons = container.querySelectorAll('.btn-suscribirse, .btn-desuscribirse');

  buttons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const idRocodromo = parseInt(btn.dataset.id);

      if (btn.classList.contains('btn-desuscribirse')) {
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
      } else {
        await window.suscribirseRocodromo(idRocodromo);
      }
    });
  });
}
