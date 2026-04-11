import { renderNavbar } from '../../components/navbar.js';
import { showConfirmModal } from '../../components/modal.js';
import { escapeHtml } from '../../components/formHelpers.js';
import { renderEditableField, initEditableField } from '../../components/editableField.js';
import { renderSectionDivider } from '../../components/sectionDivider.js';

function renderPerfilFieldTitle(text) {
  return `<p class="text-muted small text-uppercase fw-semibold mb-1 perfil-field-title">${text}</p>`;
}

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
  const totalRutas = 18;
  const totalFlash = 5;
  const totalBloques = 8;
  const totalVias = 10;
  const rutasFlashPct = totalRutas > 0 ? (totalFlash / totalRutas) * 100 : 0;
  const bloquesPct = totalRutas > 0 ? (totalBloques / totalRutas) * 100 : 0;
  const viasPct = totalRutas > 0 ? (totalVias / totalRutas) * 100 : 0;
  const favoritaTexto = totalBloques >= totalVias ? 'Bloque' : 'Via';
  const formatPct = (value) => `${value.toFixed(2)}%`;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const monthLabel = now.toLocaleString('es-ES', {
    month: 'long',
    year: 'numeric',
  });
  const monthTitle =
    monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;
  const totalHeatmapCells =
    Math.ceil((firstDayIndex + daysInMonth) / 7) * 7;
  const weekdayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const baseSeed = currentYear * 10000 + (currentMonth + 1) * 100;
  const getHeatmapCount = (day) => {
    const seed = baseSeed + day;
    const raw = (seed * 9301 + 49297) % 233280;
    return Math.floor((raw / 233280) * 7);
  };
  const heatmapCells = Array.from({ length: totalHeatmapCells }, (_, index) => {
    const dayNumber = index - firstDayIndex + 1;

    if (dayNumber < 1 || dayNumber > daysInMonth) {
      return null;
    }

    return {
      day: dayNumber,
      count: getHeatmapCount(dayNumber),
    };
  });
  const heatmapCounts = heatmapCells.map((cell) => (cell ? cell.count : 0));
  const totalMonthlyRoutes = heatmapCounts.reduce(
    (acc, count) => acc + count,
    0
  );
  const activeDays = heatmapCells.filter(
    (cell) => cell && cell.count > 0
  ).length;
  const avgRoutesPerActiveDay = activeDays
    ? totalMonthlyRoutes / activeDays
    : 0;
  const weeklyTotals = [];
  for (let i = 0; i < heatmapCounts.length; i += 7) {
    weeklyTotals.push(
      heatmapCounts.slice(i, i + 7).reduce((acc, count) => acc + count, 0)
    );
  }
  const maxWeeklyTotal = Math.max(1, ...weeklyTotals);
  const weeklyBarsHtml = weeklyTotals
    .map((total, index) => {
      const heightPct = (total / maxWeeklyTotal) * 100;
      return `
        <div class="perfil-monthly-bar">
          <span class="perfil-monthly-bar-fill" style="height: ${heightPct}%;"></span>
          <span class="perfil-monthly-bar-label">S${index + 1}</span>
        </div>
      `;
    })
    .join('');
  const heatmapWeekdaysHtml = weekdayLabels
    .map((label) => `<span>${label}</span>`)
    .join('');
  const heatmapCellsHtml = heatmapCells
    .map((cell) => {
      if (!cell) {
        return '<div class="perfil-heatmap-day is-empty"></div>';
      }

      let toneClass = 'is-zero';
      if (cell.count >= 5) {
        toneClass = 'is-high';
      } else if (cell.count >= 3) {
        toneClass = 'is-mid';
      } else if (cell.count >= 1) {
        toneClass = 'is-low';
      }

      return `
        <div
          class="perfil-heatmap-day ${toneClass}"
          data-day="${cell.day}"
          data-count="${cell.count}"
          title="Dia ${cell.day}: ${cell.count} rutas"
          aria-label="Dia ${cell.day}: ${cell.count} rutas"
        ></div>
      `;
    })
    .join('');

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
                ${descripcionVisible
                  ? `<p class="text-muted mb-0">${descripcionVisible}</p>`
                  : '<p class="text-muted mb-0 small fst-italic">Sin descripcion...</p>'}
              </div>
            </div>
          </div>

          <div class="perfil-estadisticas-wrap mt-4">
            ${renderSectionDivider({ label: 'Estadisticas' })}
            <div class="perfil-estadisticas-view mt-3">
              <div class="perfil-stats-section">
                <p class="perfil-stats-title">Total de Rutas Escaladas</p>
                <div class="perfil-stats-card">
                  <div class="perfil-stats-badges">
                    <div class="perfil-stats-badge is-completed">
                      <span class="perfil-stats-badge-value">${totalRutas}</span>
                      <span class="perfil-stats-badge-label">Completado</span>
                    </div>
                    <div class="perfil-stats-badge is-flash">
                      <span class="perfil-stats-badge-value">${totalFlash}</span>
                      <span class="perfil-stats-badge-label">Flash</span>
                    </div>
                  </div>
                  <p class="perfil-stats-text">
                    Has escalado un total de ${totalRutas} rutas, de las cuales ${totalFlash} han sido a la primera.
                  </p>
                  <div class="perfil-stats-bar">
                    <span class="perfil-stats-bar-fill is-completed" style="width: 100%;"></span>
                    <span class="perfil-stats-bar-fill is-flash" style="width: ${formatPct(rutasFlashPct)};"></span>
                  </div>
                  <div class="perfil-stats-bar-labels">
                    <span>${formatPct(rutasFlashPct)}</span>
                  </div>
                </div>
              </div>

              <div class="perfil-stats-section">
                <p class="perfil-stats-title">Tipos de Rutas Escaladas</p>
                <div class="perfil-stats-card">
                  <div class="perfil-stats-choices">
                    <div class="perfil-stats-pill is-bloque">
                      <span class="perfil-stats-pill-label">Bloques</span>
                      <span class="perfil-stats-pill-value">${totalBloques}</span>
                    </div>
                    <div class="perfil-stats-pill is-via">
                      <span class="perfil-stats-pill-label">Vias</span>
                      <span class="perfil-stats-pill-value">${totalVias}</span>
                    </div>
                  </div>
                  <p class="perfil-stats-text">Tu tipo de ruta favorita es el ${favoritaTexto}.</p>
                  <div class="perfil-stats-bar is-split">
                    <span class="perfil-stats-bar-fill is-bloque" style="width: ${formatPct(bloquesPct)};"></span>
                    <span class="perfil-stats-bar-fill is-via" style="width: ${formatPct(viasPct)};"></span>
                  </div>
                  <div class="perfil-stats-bar-labels">
                    <span>${formatPct(bloquesPct)}</span>
                    <span>${formatPct(viasPct)}</span>
                  </div>
                </div>
              </div>

              <div class="perfil-stats-section">
                <p class="perfil-stats-title">Actividad mensual</p>
                <div class="perfil-stats-card perfil-heatmap-card">
                  <div class="perfil-heatmap-header">
                    <span class="perfil-heatmap-month">${monthTitle}</span>
                    <span class="perfil-heatmap-subtitle">Mapa de calor</span>
                  </div>
                  <div class="perfil-heatmap-weekdays">
                    ${heatmapWeekdaysHtml}
                  </div>
                  <div class="perfil-heatmap-grid">
                    ${heatmapCellsHtml}
                  </div>
                  <div class="perfil-heatmap-tooltip" role="status" aria-live="polite"></div>
                  <div class="perfil-heatmap-legend">
                    <span class="perfil-heatmap-legend-item">
                      <span class="perfil-heatmap-day is-low perfil-heatmap-legend-swatch"></span>
                      <span>1-3 rutas</span>
                    </span>
                    <span class="perfil-heatmap-legend-item">
                      <span class="perfil-heatmap-day is-mid perfil-heatmap-legend-swatch"></span>
                      <span>3-5 rutas</span>
                    </span>
                    <span class="perfil-heatmap-legend-item">
                      <span class="perfil-heatmap-day is-high perfil-heatmap-legend-swatch"></span>
                      <span>5+ rutas</span>
                    </span>
                  </div>
                </div>
                <div class="perfil-stats-card perfil-monthly-summary">
                  <div class="perfil-monthly-metrics">
                    <div class="perfil-monthly-metric">
                      <span class="perfil-monthly-label">Rutas del mes</span>
                      <span class="perfil-monthly-value">${totalMonthlyRoutes}</span>
                    </div>
                    <div class="perfil-monthly-metric">
                      <span class="perfil-monthly-label">Dias activos</span>
                      <span class="perfil-monthly-value">${activeDays}</span>
                    </div>
                    <div class="perfil-monthly-metric">
                      <span class="perfil-monthly-label">Media por dia</span>
                      <span class="perfil-monthly-value">${avgRoutesPerActiveDay.toFixed(1)}</span>
                    </div>
                  </div>
                  <div class="perfil-monthly-chart" style="grid-template-columns: repeat(${weeklyTotals.length}, minmax(0, 1fr));">
                    ${weeklyBarsHtml}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Menú de navegación inferior -->
      ${renderNavbar()}
    `;

  const heatmapCard = container.querySelector('.perfil-heatmap-card');
  if (heatmapCard) {
    const tooltip = heatmapCard.querySelector('.perfil-heatmap-tooltip');
    heatmapCard.addEventListener('click', (event) => {
      const dayCell = event.target.closest('.perfil-heatmap-day[data-day]');

      if (!dayCell) {
        tooltip.classList.remove('is-visible');
        return;
      }

      const day = dayCell.dataset.day;
      const count = dayCell.dataset.count;
      tooltip.textContent = `Dia ${day}: ${count} rutas`;

      const cardRect = heatmapCard.getBoundingClientRect();
      const cellRect = dayCell.getBoundingClientRect();
      const left = cellRect.left - cardRect.left + cellRect.width / 2;
      const top = cellRect.top - cardRect.top - 8;

      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
      tooltip.classList.add('is-visible');
    });
  }

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

  // La vista de perfil ya no permite editar campos directamente.
}

// Vista de editar perfil
export function renderEditarPerfil(container, escalador, callbacks) {
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
                    class="btn btn-primary rounded-circle d-flex align-items-center justify-content-center perfil-photo-edit-btn"
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
              <div class="text-center">${descripcionVisible
                ? `<p class="text-muted mb-0 text-center">${descripcionVisible}</p>`
                : '<p class="text-muted mb-0 small fst-italic text-center">Sin descripcion...</p>'}</div>
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
