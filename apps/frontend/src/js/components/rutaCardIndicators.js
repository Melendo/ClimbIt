import { escapeHtml } from './formHelpers.js';

const FALLBACK_COLOR = 'rgb(158, 158, 158)';
const PRESA_SVG_URL = '/assets/presa.svg';

export function renderPresaColorIcon({
  color = FALLBACK_COLOR,
  size = 30,
  inset = 2,
  withOutline = true,
  title = '',
  ariaLabel = '',
} = {}) {
  const safeSize = Number.isFinite(Number(size)) ? Number(size) : 30;
  const safeInset = Number.isFinite(Number(inset)) ? Number(inset) : 2;
  const safeTitle = escapeHtml(title || '');
  const safeAriaLabel = escapeHtml(ariaLabel || '');

  return `
    <div class="position-relative" style="width: ${safeSize}px; height: ${safeSize}px;"${safeTitle ? ` title="${safeTitle}"` : ''}${safeAriaLabel ? ` aria-label="${safeAriaLabel}"` : ''}>
      ${withOutline ? `<span style="position: absolute; inset: 0; background: #000000; -webkit-mask-image: url('${PRESA_SVG_URL}'); mask-image: url('${PRESA_SVG_URL}'); -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-position: center; mask-position: center; -webkit-mask-size: contain; mask-size: contain;"></span>` : ''}
      <span style="position: absolute; inset: ${safeInset}px; background: ${color}; -webkit-mask-image: url('${PRESA_SVG_URL}'); mask-image: url('${PRESA_SVG_URL}'); -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-position: center; mask-position: center; -webkit-mask-size: contain; mask-size: contain; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.25));"></span>
    </div>
  `;
}

export function renderRutaColorStateIndicator(ruta) {
  const status = ruta?.statusConfig || {
    icon: 'remove',
    color: '#6b7280',
    bg: '#e5e7eb',
    texto: 'Sin registrar',
  };
  const holdColor = ruta?.colorPresasRgb || FALLBACK_COLOR;
  const holdColorLabel = escapeHtml(ruta?.colorPresas || 'no definido');
  const dificultad = typeof ruta?.dificultad === 'string' ? ruta.dificultad.trim() : '';
  const dificultadLabel = escapeHtml(dificultad || 'Sin dificultad');

  return `
    <div class="position-absolute d-flex align-items-center gap-2" style="bottom: 10px; left: 10px; z-index: 3;">
      <span class="badge bg-primary shadow-sm text-truncate" style="font-size: 13px; max-width: 96px;">${dificultadLabel}</span>

      ${renderPresaColorIcon({
        color: holdColor,
        size: 30,
        inset: 2,
        withOutline: true,
        title: `Color de presas: ${holdColorLabel}`,
        ariaLabel: `Color de presas ${holdColorLabel}`,
      })}

      <div class="rounded-circle d-flex align-items-center justify-content-center shadow-sm" style="width: 30px; height: 30px; background: ${status.bg}; border: 1px solid rgba(255, 255, 255, 0.9);">
        <span class="material-icons" style="color: ${status.color}; font-size: 19px; transform: translateY(-1px);">${status.icon}</span>
      </div>
    </div>
  `;
}
