import { renderSubscribeButton } from './subscribeButton.js';

const ROCODROMO_LOGO_PLACEHOLDER = '/assets/rocodromoDefecto.jpg';

export function renderRocodromoCard(rocodromo, { estaSuscrito = false } = {}) {
  const id = rocodromo?.id;
  const nombre = rocodromo?.nombre || 'Rocodromo sin nombre';
  const ubicacion = rocodromo?.ubicacion || 'Ubicacion no disponible';
  const logoSrc = rocodromo?.logoSrc || ROCODROMO_LOGO_PLACEHOLDER;

  return `
    <div class="border rounded-3 bg-white p-2 p-md-3 position-relative">
      ${renderSubscribeButton(id, estaSuscrito, { position: 'absolute' })}

      <a
        href="#infoRoco?id=${id}"
        class="btn btn-sm position-absolute bottom-0 end-0 mb-2 me-2 d-flex align-items-center justify-content-center"
        style="background-color: #1d4ed8; border-color: #1d4ed8; color: #ffffff;"
        title="Mas informacion"
        aria-label="Mas informacion"
      >
        <span class="material-icons" style="font-size: 18px; line-height: 1;">info</span>
      </a>

      <div class="d-flex align-items-center gap-3">
        <a href="#mapaZona?id=${id}" class="text-decoration-none flex-shrink-0">
          <img
            src="${logoSrc}"
            alt="${nombre}"
            class="rounded-3"
            style="width: 72px; height: 72px; object-fit: cover;"
          >
        </a>

        <div class="d-flex flex-column flex-grow-1 min-w-0 pe-5">
          <a href="#mapaZona?id=${id}" class="d-block text-decoration-none text-dark fw-semibold text-truncate">${nombre}</a>
          <a href="#mapaZona?id=${id}" class="d-block text-decoration-none text-muted text-truncate">
            <small>${ubicacion}</small>
          </a>
        </div>
      </div>
    </div>
  `;
}
