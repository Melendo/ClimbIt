import { escapeHtml } from './formHelpers.js';

const WEEKDAY_LABELS = Object.freeze(['L', 'M', 'X', 'J', 'V', 'S', 'D']);

function toSafeCount(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return Math.round(parsed);
}

function toSafePercentage(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
}

function formatPct(value) {
  return `${toSafePercentage(value).toFixed(2)}%`;
}

function resolveHeatmapToneClass(count) {
  if (count >= 8) {
    return 'is-high';
  }

  if (count >= 4) {
    return 'is-mid';
  }

  if (count >= 1) {
    return 'is-low';
  }

  return 'is-zero';
}

function buildMonthlyActivityViewModel(actividadMensual = [], now = new Date()) {
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const monthLabel = now.toLocaleString('es-ES', {
    month: 'long',
    year: 'numeric',
  });
  const monthTitle = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;
  const totalHeatmapCells = Math.ceil((firstDayIndex + daysInMonth) / 7) * 7;

  const actividadPorDia = actividadMensual.reduce((acc, item) => {
    const dia = Number(item?.dia);
    const rutas = Number(item?.rutas);

    if (Number.isInteger(dia) && dia > 0 && dia <= daysInMonth) {
      acc[dia] = Number.isFinite(rutas) && rutas > 0 ? Math.round(rutas) : 0;
    }

    return acc;
  }, {});

  const heatmapCells = Array.from({ length: totalHeatmapCells }, (_, index) => {
    const dayNumber = index - firstDayIndex + 1;

    if (dayNumber < 1 || dayNumber > daysInMonth) {
      return null;
    }

    const count = actividadPorDia[dayNumber] || 0;
    return {
      day: dayNumber,
      count,
      toneClass: resolveHeatmapToneClass(count),
    };
  });

  const heatmapCounts = heatmapCells.map((cell) => (cell ? cell.count : 0));
  const totalMonthlyRoutes = heatmapCounts.reduce((acc, count) => acc + count, 0);
  const activeDays = heatmapCells.filter((cell) => cell && cell.count > 0).length;
  const avgRoutesPerActiveDay = activeDays ? totalMonthlyRoutes / activeDays : 0;
  const weeklyTotals = [];

  for (let i = 0; i < heatmapCounts.length; i += 7) {
    weeklyTotals.push(heatmapCounts.slice(i, i + 7).reduce((acc, count) => acc + count, 0));
  }

  return {
    monthTitle,
    weekdayLabels: WEEKDAY_LABELS,
    heatmapCells,
    hasActivity: actividadMensual.length > 0,
    totalMonthlyRoutes,
    activeDays,
    avgRoutesPerActiveDay,
    weeklyTotals,
  };
}

export function buildEscaladorStatsViewModel(estadisticas = {}, now = new Date()) {
  const totalRutas = toSafeCount(estadisticas.totalRutas);
  const totalFlash = toSafeCount(estadisticas.totalFlash);
  const totalBloques = toSafeCount(estadisticas.totalBloques);
  const totalVias = toSafeCount(estadisticas.totalVias);
  const totalRutasActivasRocodromo = toSafeCount(
    estadisticas.totalRutasActivasRocodromo
  );
  const rutasFlashPct = totalRutas > 0 ? (totalFlash / totalRutas) * 100 : 0;
  const bloquesPct = totalRutas > 0 ? (totalBloques / totalRutas) * 100 : 0;
  const viasPct = totalRutas > 0 ? (totalVias / totalRutas) * 100 : 0;
  const favoritaTextoRaw =
    typeof estadisticas.favoritaTexto === 'string' && estadisticas.favoritaTexto.trim()
      ? estadisticas.favoritaTexto.trim()
      : totalBloques >= totalVias
        ? 'Bloque'
        : 'Via';
  const actividadMensual = Array.isArray(estadisticas.actividadMensual)
    ? estadisticas.actividadMensual
    : [];
  const maxDificultadBloqueRaw =
    typeof estadisticas.maxDificultadBloque === 'string'
      ? estadisticas.maxDificultadBloque.trim()
      : '';
  const maxDificultadViaRaw =
    typeof estadisticas.maxDificultadVia === 'string'
      ? estadisticas.maxDificultadVia.trim()
      : '';

  return {
    totals: {
      totalRutas,
      totalFlash,
      totalBloques,
      totalVias,
      totalRutasActivasRocodromo,
      rutasFlashPct,
      bloquesPct,
      viasPct,
      favoritaTexto: escapeHtml(favoritaTextoRaw),
      maxDificultadBloque: escapeHtml(maxDificultadBloqueRaw),
      maxDificultadVia: escapeHtml(maxDificultadViaRaw),
    },
    monthly: buildMonthlyActivityViewModel(actividadMensual, now),
  };
}

export function renderRocodromoRoutesOverviewStatsCard(totals = {}) {
  const totalRutas = toSafeCount(totals.totalRutas);
  const totalRutasActivasRocodromo = toSafeCount(
    totals.totalRutasActivasRocodromo
  );
  const completadasSobreActivasPct =
    totalRutasActivasRocodromo > 0
      ? Math.min(100, (totalRutas / totalRutasActivasRocodromo) * 100)
      : 0;

  return `
    <div class="perfil-stats-card">
      <div class="perfil-stats-badges">
        <div class="perfil-stats-badge is-completed">
          <span class="perfil-stats-badge-value">${totalRutas}</span>
          <span class="perfil-stats-badge-label">Completado</span>
        </div>
        <div class="perfil-stats-badge">
          <span class="perfil-stats-badge-value">${totalRutasActivasRocodromo}</span>
          <span class="perfil-stats-badge-label">Rutas activas</span>
        </div>
      </div>
      <p class="perfil-stats-text">
        Has escalado un total de ${totalRutas} rutas de las ${totalRutasActivasRocodromo} que hay activas.
      </p>
      <div class="perfil-stats-bar">
        <span class="perfil-stats-bar-fill is-completed" style="width: ${formatPct(completadasSobreActivasPct)};"></span>
      </div>
      <div class="perfil-stats-bar-labels">
        <span>${formatPct(completadasSobreActivasPct)}</span>
      </div>
    </div>
  `;
}

export function renderStatsSection({ title, content }) {
  return `
    <div class="perfil-stats-section">
      <p class="perfil-stats-title">${escapeHtml(title || '')}</p>
      ${content}
    </div>
  `;
}

export function renderTotalRoutesStatsCard(totals = {}) {
  return `
    <div class="perfil-stats-card">
      <div class="perfil-stats-badges">
        <div class="perfil-stats-badge is-completed">
          <span class="perfil-stats-badge-value">${totals.totalRutas || 0}</span>
          <span class="perfil-stats-badge-label">Completado</span>
        </div>
        <div class="perfil-stats-badge is-flash">
          <span class="perfil-stats-badge-value">${totals.totalFlash || 0}</span>
          <span class="perfil-stats-badge-label">Flash</span>
        </div>
      </div>
      <p class="perfil-stats-text">
        Has escalado un total de ${totals.totalRutas || 0} rutas, de las cuales ${totals.totalFlash || 0} han sido a la primera.
      </p>
      <div class="perfil-stats-bar">
        <span class="perfil-stats-bar-fill is-completed" style="width: 100%;"></span>
        <span class="perfil-stats-bar-fill is-flash" style="width: ${formatPct(totals.rutasFlashPct)};"></span>
      </div>
      <div class="perfil-stats-bar-labels">
        <span>${formatPct(totals.rutasFlashPct)}</span>
      </div>
    </div>
  `;
}

export function renderRouteTypesStatsCard(totals = {}) {
  return `
    <div class="perfil-stats-card">
      <div class="perfil-stats-choices">
        <div class="perfil-stats-pill is-bloque">
          <span class="perfil-stats-pill-label">Bloques</span>
          <span class="perfil-stats-pill-value">${totals.totalBloques || 0}</span>
        </div>
        <div class="perfil-stats-pill is-via">
          <span class="perfil-stats-pill-label">Vias</span>
          <span class="perfil-stats-pill-value">${totals.totalVias || 0}</span>
        </div>
      </div>
      <p class="perfil-stats-text">${totals.favoritaTexto || 'Bloque'} es tu tipo de ruta más escalado.</p>
      <div class="perfil-stats-bar is-split">
        <span class="perfil-stats-bar-fill is-bloque" style="width: ${formatPct(totals.bloquesPct)};"></span>
        <span class="perfil-stats-bar-fill is-via" style="width: ${formatPct(totals.viasPct)};"></span>
      </div>
      <div class="perfil-stats-bar-labels">
        <span>${formatPct(totals.bloquesPct)}</span>
        <span>${formatPct(totals.viasPct)}</span>
      </div>
    </div>
  `;
}

export function renderMaxDifficultyStatsCard(totals = {}) {
  const maxDificultadBloque = totals.maxDificultadBloque || 'Sin datos';
  const maxDificultadVia = totals.maxDificultadVia || 'Sin datos';

  return `
    <div class="perfil-stats-card perfil-max-difficulty-card">
      <div class="perfil-max-difficulty-grid">
        <div class="perfil-max-difficulty-tile is-bloque">
          <span class="perfil-max-difficulty-label">Bloques</span>
          <span class="perfil-max-difficulty-chip">${maxDificultadBloque}</span>
        </div>
        <div class="perfil-max-difficulty-tile is-via">
          <span class="perfil-max-difficulty-label">Vias</span>
          <span class="perfil-max-difficulty-chip">${maxDificultadVia}</span>
        </div>
      </div>
    </div>
  `;
}

export function renderMonthlyActivityCards(monthly = {}) {
  const weeklyTotals = Array.isArray(monthly.weeklyTotals) ? monthly.weeklyTotals : [];
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

  const heatmapWeekdaysHtml = (monthly.weekdayLabels || [])
    .map((label) => `<span>${escapeHtml(label)}</span>`)
    .join('');

  const heatmapCellsHtml = (monthly.heatmapCells || [])
    .map((cell) => {
      if (!cell) {
        return '<div class="perfil-heatmap-day is-empty"></div>';
      }

      return `
        <div
          class="perfil-heatmap-day ${cell.toneClass}"
          data-heatmap-day="${cell.day}"
          data-count="${cell.count}"
          title="Dia ${cell.day}: ${cell.count} rutas"
          aria-label="Dia ${cell.day}: ${cell.count} rutas"
        ></div>
      `;
    })
    .join('');

  return `
    <div class="perfil-stats-card perfil-monthly-summary">
      <div class="perfil-monthly-metrics">
        <div class="perfil-monthly-metric">
          <span class="perfil-monthly-label">Rutas este mes</span>
          <span class="perfil-monthly-value">${monthly.totalMonthlyRoutes || 0}</span>
        </div>
        <div class="perfil-monthly-metric">
          <span class="perfil-monthly-label">Dias activo</span>
          <span class="perfil-monthly-value">${monthly.activeDays || 0}</span>
        </div>
        <div class="perfil-monthly-metric">
          <span class="perfil-monthly-label">Media por dia</span>
          <span class="perfil-monthly-value">${toSafePercentage(monthly.avgRoutesPerActiveDay).toFixed(1)}</span>
        </div>
      </div>
      <div class="perfil-monthly-chart" style="grid-template-columns: repeat(${weeklyTotals.length}, minmax(0, 1fr));">
        ${weeklyBarsHtml}
      </div>
    </div>
    <div class="perfil-stats-card perfil-heatmap-card" data-heatmap-card>
      <div class="perfil-heatmap-header">
        <span class="perfil-heatmap-month">${escapeHtml(monthly.monthTitle || '')}</span>
        <span class="perfil-heatmap-subtitle">${monthly.hasActivity ? 'Mapa de calor' : 'Actividad no disponible en esta version'}</span>
      </div>
      <div class="perfil-heatmap-weekdays">
        ${heatmapWeekdaysHtml}
      </div>
      <div class="perfil-heatmap-grid">
        ${heatmapCellsHtml}
      </div>
      <div class="perfil-heatmap-tooltip" role="status" aria-live="polite" data-heatmap-tooltip></div>
      <div class="perfil-heatmap-legend">
        <span class="perfil-heatmap-legend-item">
          <span class="perfil-heatmap-day is-low perfil-heatmap-legend-swatch"></span>
          <span>1-3 rutas</span>
        </span>
        <span class="perfil-heatmap-legend-item">
          <span class="perfil-heatmap-day is-mid perfil-heatmap-legend-swatch"></span>
          <span>4-7 rutas</span>
        </span>
        <span class="perfil-heatmap-legend-item">
          <span class="perfil-heatmap-day is-high perfil-heatmap-legend-swatch"></span>
          <span>8+ rutas</span>
        </span>
      </div>
    </div>
  `;
}

export function bindHeatmapInteractions(container) {
  const heatmapCard = container.querySelector('[data-heatmap-card]');
  if (!heatmapCard) {
    return () => {};
  }

  const tooltip = heatmapCard.querySelector('[data-heatmap-tooltip]');
  if (!tooltip) {
    return () => {};
  }

  const hideTooltip = () => {
    tooltip.classList.remove('is-visible');
  };

  const onHeatmapClick = (event) => {
    const dayCell = event.target.closest('[data-heatmap-day]');

    if (!dayCell) {
      hideTooltip();
      return;
    }

    const day = dayCell.dataset.heatmapDay;
    const count = dayCell.dataset.count;
    tooltip.textContent = `Dia ${day}: ${count} rutas`;

    const cardRect = heatmapCard.getBoundingClientRect();
    const cellRect = dayCell.getBoundingClientRect();
    const left = cellRect.left - cardRect.left + cellRect.width / 2;
    const top = cellRect.top - cardRect.top - 8;

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.classList.add('is-visible');
  };

  const onDocumentClick = (event) => {
    if (!heatmapCard.contains(event.target)) {
      hideTooltip();
    }
  };

  heatmapCard.addEventListener('click', onHeatmapClick);
  document.addEventListener('click', onDocumentClick);

  return () => {
    heatmapCard.removeEventListener('click', onHeatmapClick);
    document.removeEventListener('click', onDocumentClick);
  };
}
