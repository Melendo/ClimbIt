const MAX_RATING_STARS = 5;

function clampHalfStars(value) {
  return Math.round(clampStars(value) * 2) / 2;
}

function clampStars(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.max(0, Math.min(MAX_RATING_STARS, numericValue));
}

function formatAverageRating(value) {
  return clampHalfStars(value).toFixed(1);
}

function formatNumValoraciones(value) {
  const total = Number.isInteger(Number(value)) ? Number(value) : 0;
  return `${total} valoracion${total === 1 ? '' : 'es'}`;
}

function renderReadonlyStars(value) {
  const rating = clampHalfStars(value);

  return Array.from({ length: MAX_RATING_STARS }, (_, index) => {
    const starValue = index + 1;
    const isFull = rating >= starValue;
    const isHalf = !isFull && rating >= starValue - 0.5;
    const icon = isFull ? 'star' : isHalf ? 'star_half' : 'star_border';

    return `<span class="material-icons" style="font-size: 28px; line-height: 1; color: ${isFull || isHalf ? '#f59e0b' : '#cbd5e1'};">${icon}</span>`;
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
      <div class="row g-4 align-items-start">
        <div class="col-12 col-md-6">
          <p class="text-muted small mb-2 text-uppercase" style="letter-spacing: 0.5px;">Valoraciones</p>
          <div class="d-flex align-items-start flex-wrap gap-3">
            <p id="ruta-rating-average" class="fw-semibold mb-0" style="font-size: clamp(3rem, 8vw, 4.5rem); line-height: 0.9; color: #111827;">${formatAverageRating(averageRating)}</p>
            <div class="d-flex flex-column align-items-start gap-1 pt-1">
              <div id="ruta-rating-average-stars" class="d-flex align-items-center gap-1" aria-label="Valoracion media de la ruta">
                ${renderReadonlyStars(averageRating)}
              </div>
              <p id="ruta-rating-count" class="mb-0 text-muted" style="font-size: 0.95rem; line-height: 1.15;">${formatNumValoraciones(numValoraciones)}</p>
            </div>
          </div>
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
  const averageStarsElement = section.querySelector(
    '#ruta-rating-average-stars'
  );
  const countElement = section.querySelector('#ruta-rating-count');
  const selectorElement = section.querySelector('#ruta-rating-selector');
  const selectionLabel = section.querySelector('#ruta-rating-selection-label');
  const saveButton = section.querySelector('#ruta-rating-save-btn');
  const helpElement = section.querySelector('#ruta-rating-help');
  const starButtons = Array.from(
    selectorElement?.querySelectorAll('.ruta-rating-star') || []
  );

  const onSave = typeof options?.onSave === 'function' ? options.onSave : null;
  let canRate = Boolean(options?.canRate);
  let selectedStars = 0;
  let isSubmitting = false;

  const normalizeSelection = (value) => clampHalfStars(value);

  const getStarFillState = (starIndex, rating) => {
    const starValue = starIndex + 1;

    if (rating >= starValue) {
      return 'full';
    }

    if (rating >= starValue - 0.5) {
      return 'half';
    }

    return 'empty';
  };

  const setSelectionText = () => {
    if (!selectionLabel) return;

    if (!selectedStars) {
      selectionLabel.textContent = 'Sin valoracion seleccionada';
      return;
    }

    const formattedValue = Number.isInteger(selectedStars)
      ? String(selectedStars)
      : selectedStars.toFixed(1).replace('.', ',');

    selectionLabel.textContent = `${formattedValue} estrella${selectedStars === 1 ? '' : 's'} seleccionada${selectedStars === 1 ? '' : 's'}`;
  };

  const paintSelectedStars = () => {
    starButtons.forEach((button, index) => {
      const fillState = getStarFillState(index, selectedStars);
      const icon = button.querySelector('.material-icons');

      button.setAttribute('aria-pressed', String(fillState !== 'empty'));
      if (!icon) return;

      icon.textContent =
        fillState === 'full'
          ? 'star'
          : fillState === 'half'
            ? 'star_half'
            : 'star_border';
      icon.style.color = fillState === 'empty' ? '#cbd5e1' : '#f59e0b';
    });
  };

  const updateControlState = () => {
    const controlsDisabled = !canRate || isSubmitting;

    starButtons.forEach((button) => {
      button.disabled = controlsDisabled;
    });

    if (saveButton) {
      saveButton.disabled = controlsDisabled || selectedStars < 1;
      saveButton.textContent = isSubmitting
        ? 'Guardando...'
        : 'Guardar valoracion';
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
    button.addEventListener('click', (event) => {
      if (!canRate || isSubmitting) return;

      const rating = Number(button.dataset.ratingStars) || 0;
      const isPointerClick =
        Number(event.clientX) > 0 || Number(event.clientY) > 0;
      let isHalfSelection = false;

      if (isPointerClick) {
        const buttonRect = button.getBoundingClientRect();
        const clickX = event.clientX - buttonRect.left;
        isHalfSelection = clickX < buttonRect.width / 2;
      }

      selectedStars = normalizeSelection(
        isHalfSelection ? rating - 0.5 : rating
      );
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
          options.onError(
            error?.message || 'No se pudo guardar la valoracion.'
          );
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
