const ESTADOS_BOTONES_CONFIG = [
  {
    key: 'flash',
    label: 'Flash',
    tooltip: 'Completado al primer intento',
    buttonBg: '#fffbeb',
    infoColor: '#d97706',
    circleBg: '#fef3c7',
    icon: 'bolt',
    iconColor: '#d97706',
  },
  {
    key: 'completado',
    label: 'Completado',
    tooltip: 'Has superado la via',
    buttonBg: '#f0fdf4',
    infoColor: '#16a34a',
    circleBg: '#dcfce7',
    icon: 'done',
    iconColor: '#16a34a',
  },
  {
    key: 'en-progreso',
    label: 'Proyecto',
    tooltip: 'Trabajando en esta via',
    buttonBg: '#eff6ff',
    infoColor: '#2563eb',
    circleBg: '#dbeafe',
    icon: 'sync',
    iconColor: '#2563eb',
  },
  {
    key: 'nada',
    label: 'Desmarcar',
    tooltip: 'Quitar registro',
    buttonBg: '#f3f4f6',
    infoColor: '#6b7280',
    circleBg: '#e5e7eb',
    icon: 'remove',
    iconColor: '#6b7280',
  },
];

const ESTADOS_TEXTO = {
  flash: 'Flash',
  completado: 'Completado',
  'en-progreso': 'Proyecto',
  nada: 'Sin registrar',
};

function createEstadoButtonMarkup(config) {
  return `
    <div class="col-6">
      <button class="btn estado-btn d-flex flex-column align-items-center justify-content-center gap-2 w-100 py-3 rounded-3 border-0 position-relative" data-estado="${config.key}" style="background: ${config.buttonBg};">
        <span class="material-icons info-btn position-absolute" data-tooltip="${config.tooltip}" style="top: 8px; right: 8px; font-size: 16px; color: ${config.infoColor}; cursor: pointer;">info_outline</span>
        <div class="d-flex align-items-center justify-content-center rounded-circle" style="width: 48px; height: 48px; background: ${config.circleBg};">
          <span class="material-icons" style="color: ${config.iconColor}; font-size: 28px;">${config.icon}</span>
        </div>
        <span class="fw-medium">${config.label}</span>
      </button>
    </div>
  `;
}

export function renderRutaEstadoButtons() {
  return ESTADOS_BOTONES_CONFIG.map((config) => createEstadoButtonMarkup(config)).join('');
}

export function setupRutaEstadoButtons(container, onEstadoChange) {
  if (!container || typeof onEstadoChange !== 'function') {
    return;
  }

  const estadoActual = container.querySelector('#estado-actual');
  const estadoTexto = container.querySelector('#estado-texto');
  const estadoBtns = container.querySelectorAll('.estado-btn');
  const infoBtns = container.querySelectorAll('.info-btn');

  estadoBtns.forEach((btn) => {
    btn.addEventListener('click', (event) => {
      if (event.target.classList.contains('info-btn')) return;

      const estado = btn.dataset.estado;
      estadoTexto.textContent = ESTADOS_TEXTO[estado] || 'Sin registrar';
      onEstadoChange(estado, estadoActual, estadoTexto);
    });
  });

  let activeTooltip = null;

  infoBtns.forEach((infoBtn) => {
    infoBtn.addEventListener('click', (event) => {
      event.stopPropagation();

      if (activeTooltip) {
        activeTooltip.remove();
        activeTooltip = null;
      }

      const tooltip = document.createElement('div');
      tooltip.className = 'position-absolute px-3 py-2 rounded-3 shadow-sm';
      tooltip.style.cssText = 'background: #1f2937; color: white; font-size: 0.8rem; z-index: 1000; top: 30px; right: 0; max-width: min(80vw, 220px); white-space: normal; word-break: break-word; text-align: left; animation: fadeIn 0.15s ease;';
      tooltip.textContent = infoBtn.dataset.tooltip;

      infoBtn.parentElement.appendChild(tooltip);
      activeTooltip = tooltip;

      setTimeout(() => {
        document.addEventListener('click', function closeTooltip() {
          if (activeTooltip) {
            activeTooltip.remove();
            activeTooltip = null;
          }
          document.removeEventListener('click', closeTooltip);
        }, { once: true });
      }, 10);

      setTimeout(() => {
        if (activeTooltip === tooltip) {
          tooltip.remove();
          activeTooltip = null;
        }
      }, 3000);
    });
  });
}
