const MAX_RATING_STARS = 5;

function clampStars(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.max(0, Math.min(MAX_RATING_STARS, numericValue));
}

function formatAverageRating(value) {
  return clampStars(value).toFixed(1);
}

function formatNumValoraciones(value) {
  const total = Number.isInteger(Number(value)) ? Number(value) : 0;
  return `${total} valoracion${total === 1 ? '' : 'es'}`;
}

function renderReadonlyStars(value) {
  const rounded = Math.round(clampStars(value));

  return Array.from({ length: MAX_RATING_STARS }, (_, index) => {
    const filled = index < rounded;
    return `<span class="material-icons" style="font-size: 28px; line-height: 1; color: ${filled ? '#f59e0b' : '#cbd5e1'};">${filled ? 'star' : 'star_border'}</span>`;
  }).join('');
}

function renderSelectableStars(canRate) {
  return Array.from({ length: MAX_RATING_STARS }, (_, index) => {
    const stars = index + 1;

    return `
      <button
        type="button"
        class="btn btn-link p-0 border-0 text-decoration-none ruta-rating-star"
        data-rating-stars="${stars}"
        aria-label="${stars} estrellas"
        aria-pressed="false"
        ${canRate ? '' : 'disabled'}
      >
        <span class="material-icons" style="font-size: 44px; line-height: 1; color: #cbd5e1;">star_border</span>
      </button>
    `;
  }).join('');
}

export function renderRutaRatingSection(ratingData = {}) {
  const averageRating = clampStars(ratingData?.averageRating);
  const numValoraciones = Number(ratingData?.numValoraciones) || 0;
  const canRate = Boolean(ratingData?.canRate);

  return `
    <div id="ruta-rating-section" class="bg-white mt-2 px-4 py-4">
      <div class="row g-4 align-items-end">
        <div class="col-12 col-md-6">
          <p class="text-muted small mb-2 text-uppercase" style="letter-spacing: 0.5px;">Valoraciones</p>
          <p id="ruta-rating-average" class="fw-semibold mb-2" style="font-size: clamp(3rem, 8vw, 4.5rem); line-height: 1; color: #111827;">${formatAverageRating(averageRating)}</p>
          <div id="ruta-rating-average-stars" class="d-flex align-items-center gap-1 mb-2" aria-label="Valoracion media de la ruta">
            ${renderReadonlyStars(averageRating)}
          </div>
          <p id="ruta-rating-count" class="mb-0 text-muted" style="font-size: 1.35rem; max-width: 100%; line-height: 1.2;">${formatNumValoraciones(numValoraciones)}</p>
        </div>

        <div class="col-12 col-md-6 d-flex flex-column">
          <p class="text-muted small mb-2 text-uppercase" style="letter-spacing: 0.5px;">Valora esta ruta</p>
          <div id="ruta-rating-selector" class="d-flex align-items-center gap-2 flex-wrap" role="radiogroup" aria-label="Seleccionar valoracion">
            ${renderSelectableStars(canRate)}
          </div>
          <p id="ruta-rating-selection-label" class="text-muted mb-2">Sin valoracion seleccionada</p>
            <button type="button" id="ruta-rating-save-btn" class="btn btn-primary d-none" ${canRate ? '' : 'disabled'}>Guardar valoracion</button>
          <small id="ruta-rating-help" class="text-muted mt-2${canRate ? ' d-none' : ''}">Solo puedes valorar cuando la ruta esta en estado completado o flash.</small>
        </div>
      </div>
    </div>
  `;
}

export function setupRutaRatingSection(container, options = {}) {
  if (!container) {
    return null;
  }

  const section = container.querySelector('#ruta-rating-section');
  if (!section) {
    return null;
  }

  const averageElement = section.querySelector('#ruta-rating-average');
  const averageStarsElement = section.querySelector('#ruta-rating-average-stars');
  const countElement = section.querySelector('#ruta-rating-count');
  const selectorElement = section.querySelector('#ruta-rating-selector');
  const selectionLabel = section.querySelector('#ruta-rating-selection-label');
  const saveButton = section.querySelector('#ruta-rating-save-btn');
  const helpElement = section.querySelector('#ruta-rating-help');
  const starButtons = Array.from(selectorElement?.querySelectorAll('.ruta-rating-star') || []);

  const onSave = typeof options?.onSave === 'function' ? options.onSave : null;
  let canRate = Boolean(options?.canRate);
  let selectedStars = 0;
  let isSubmitting = false;

  const setSelectionText = () => {
    if (!selectionLabel) return;

    if (!selectedStars) {
      selectionLabel.textContent = 'Sin valoracion seleccionada';
      return;
    }

    selectionLabel.textContent = `${selectedStars} estrella${selectedStars === 1 ? '' : 's'} seleccionada${selectedStars === 1 ? '' : 's'}`;
  };

  const paintSelectedStars = () => {
    starButtons.forEach((button, index) => {
      const isFilled = index < selectedStars;
      const icon = button.querySelector('.material-icons');

      button.setAttribute('aria-pressed', String(isFilled));
      if (!icon) return;

      icon.textContent = isFilled ? 'star' : 'star_border';
      icon.style.color = isFilled ? '#f59e0b' : '#cbd5e1';
    });
  };

  const updateControlState = () => {
    const controlsDisabled = !canRate || isSubmitting;

    starButtons.forEach((button) => {
      button.disabled = controlsDisabled;
    });

    if (saveButton) {
      saveButton.disabled = controlsDisabled || selectedStars < 1;
      saveButton.textContent = isSubmitting ? 'Guardando...' : 'Guardar valoracion';
      saveButton.classList.toggle('d-none', !canRate || selectedStars < 1);
    }

    if (helpElement) {
      helpElement.classList.toggle('d-none', canRate);
    }

    if (selectorElement) {
      selectorElement.classList.toggle('opacity-50', !canRate);
    }
  };

  const updateSummary = (summary = {}) => {
    const averageRating = clampStars(summary?.averageRating);
    const numValoraciones = Number(summary?.numValoraciones) || 0;

    if (averageElement) {
      averageElement.textContent = formatAverageRating(averageRating);
    }

    if (countElement) {
      countElement.textContent = formatNumValoraciones(numValoraciones);
    }

    if (averageStarsElement) {
      averageStarsElement.innerHTML = renderReadonlyStars(averageRating);
    }
  };

  starButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (!canRate || isSubmitting) return;

      selectedStars = Number(button.dataset.ratingStars) || 0;
      paintSelectedStars();
      setSelectionText();
      updateControlState();
    });
  });

  if (saveButton) {
    saveButton.addEventListener('click', async () => {
      if (!canRate || isSubmitting) return;

      if (selectedStars < 1) {
        if (typeof options?.onWarn === 'function') {
          options.onWarn('Selecciona una valoracion antes de guardar.');
        }
        return;
      }

      if (!onSave) {
        return;
      }

      isSubmitting = true;
      updateControlState();

      try {
        const result = await onSave(selectedStars);

        if (result?.summary) {
          updateSummary(result.summary);
        }

      } catch (error) {
        if (typeof options?.onError === 'function') {
          options.onError(error?.message || 'No se pudo guardar la valoracion.');
        }
      } finally {
        isSubmitting = false;
        updateControlState();
      }
    });
  }

  setSelectionText();
  paintSelectedStars();
  updateControlState();

  return {
    updateSummary,
    setCanRate(nextCanRate) {
      canRate = Boolean(nextCanRate);
      if (!canRate) {
        selectedStars = 0;
        paintSelectedStars();
        setSelectionText();
      }
      updateControlState();
    },
  };
}
