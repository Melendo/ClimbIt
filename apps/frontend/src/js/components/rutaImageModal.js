import { escapeHtml } from './formHelpers.js';

const ZOOM_LIMITS = {
  min: 1,
  max: 4,
  wheelStep: 0.25,
};

function cleanupBootstrapModalArtifacts() {
  const backdrops = document.querySelectorAll('.modal-backdrop');
  backdrops.forEach((backdrop) => backdrop.remove());

  document.body.classList.remove('modal-open');
  document.body.style.removeProperty('padding-right');
  document.body.style.removeProperty('overflow');
}

function getTouchDistance(touchA, touchB) {
  return Math.hypot(
    touchA.clientX - touchB.clientX,
    touchA.clientY - touchB.clientY,
  );
}

function getTouchMidpoint(touchA, touchB, rect) {
  return {
    x: ((touchA.clientX + touchB.clientX) / 2) - rect.left,
    y: ((touchA.clientY + touchB.clientY) / 2) - rect.top,
  };
}

export function renderRutaImageModal({
  modalId,
  title,
  imageSrc,
  imageAlt,
}) {
  const safeTitle = escapeHtml(title || 'Ruta');
  const safeSrc = escapeHtml(imageSrc || '/assets/placeholder.webp');
  const safeAlt = escapeHtml(imageAlt || `Imagen ampliada de la ruta ${safeTitle}`);

  return `
<div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}-label" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-xl modal-fullscreen-sm-down">
    <div class="modal-content ruta-image-modal-content">
      <div class="modal-header border-0 pb-1">
        <h5 class="modal-title" id="${modalId}-label">${safeTitle}</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
      </div>
      <div class="modal-body ruta-image-modal-body">
        <div class="ruta-image-modal-stage">
          <img
            src="${safeSrc}"
            alt="${safeAlt}"
            class="ruta-image-modal-img"
            id="${modalId}-img"
          />
        </div>
      </div>
    </div>
  </div>
</div>`;
}

export function setupRutaImageModal(container, { modalId }) {
  const imageModal = container.querySelector(`#${modalId}`);
  const modalImage = container.querySelector(`#${modalId}-img`);
  const modalBody = container.querySelector(`#${modalId} .ruta-image-modal-body`);

  if (!imageModal || !modalImage || !modalBody) {
    return;
  }

  const state = {
    zoomLevel: 1,
    translateX: 0,
    translateY: 0,
    isDragging: false,
    dragPointerId: null,
    lastPointerX: 0,
    lastPointerY: 0,
    pinchStartDistance: null,
    pinchStartZoom: 1,
    baseOffsetX: 0,
    baseOffsetY: 0,
    baseWidth: 0,
    baseHeight: 0,
  };
  const teardownController = new AbortController();

  const clampZoom = (value) => Math.max(ZOOM_LIMITS.min, Math.min(ZOOM_LIMITS.max, value));
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const isModalVisible = () => imageModal.classList.contains('show');

  const updateBaseMetrics = () => {
    const stageRect = modalBody.getBoundingClientRect();
    const imgRect = modalImage.getBoundingClientRect();
    state.baseOffsetX = imgRect.left - stageRect.left;
    state.baseOffsetY = imgRect.top - stageRect.top;
    state.baseWidth = imgRect.width;
    state.baseHeight = imgRect.height;
  };

  const constrainPan = () => {
    const stageRect = modalBody.getBoundingClientRect();
    const stageWidth = stageRect.width;
    const stageHeight = stageRect.height;
    const scaledWidth = state.baseWidth * state.zoomLevel;
    const scaledHeight = state.baseHeight * state.zoomLevel;

    const minEffectiveX = scaledWidth > stageWidth
      ? stageWidth - scaledWidth
      : (stageWidth - scaledWidth) / 2;
    const maxEffectiveX = scaledWidth > stageWidth
      ? 0
      : (stageWidth - scaledWidth) / 2;
    const minEffectiveY = scaledHeight > stageHeight
      ? stageHeight - scaledHeight
      : (stageHeight - scaledHeight) / 2;
    const maxEffectiveY = scaledHeight > stageHeight
      ? 0
      : (stageHeight - scaledHeight) / 2;

    const effectiveX = state.baseOffsetX + state.translateX;
    const effectiveY = state.baseOffsetY + state.translateY;
    state.translateX = clamp(effectiveX, minEffectiveX, maxEffectiveX) - state.baseOffsetX;
    state.translateY = clamp(effectiveY, minEffectiveY, maxEffectiveY) - state.baseOffsetY;
  };

  const applyTransform = () => {
    constrainPan();
    modalImage.style.transform = `translate3d(${state.translateX}px, ${state.translateY}px, 0) scale(${state.zoomLevel})`;
    modalBody.classList.toggle('is-zoomed', state.zoomLevel > 1);
    modalBody.classList.toggle('is-dragging', state.isDragging);
  };

  const setZoomAtPoint = (targetZoom, pointX, pointY) => {
    const newZoom = clampZoom(targetZoom);
    if (Math.abs(newZoom - state.zoomLevel) < 0.001) {
      return;
    }

    const imagePointX = (pointX - state.baseOffsetX - state.translateX) / state.zoomLevel;
    const imagePointY = (pointY - state.baseOffsetY - state.translateY) / state.zoomLevel;
    state.zoomLevel = newZoom;
    state.translateX = pointX - state.baseOffsetX - (imagePointX * state.zoomLevel);
    state.translateY = pointY - state.baseOffsetY - (imagePointY * state.zoomLevel);
    applyTransform();
  };

  const resetTransform = () => {
    state.zoomLevel = 1;
    state.translateX = 0;
    state.translateY = 0;
    state.isDragging = false;
    state.dragPointerId = null;
    modalImage.style.transformOrigin = '0 0';
    modalImage.style.transform = 'translate3d(0, 0, 0) scale(1)';
    updateBaseMetrics();
    applyTransform();
  };

  const resetPinchState = () => {
    state.pinchStartDistance = null;
    state.pinchStartZoom = state.zoomLevel;
  };

  const forceCloseAndCleanup = () => {
    if (!imageModal.isConnected || !isModalVisible()) {
      cleanupBootstrapModalArtifacts();
      return;
    }

    const modalInstance = window.bootstrap?.Modal?.getInstance(imageModal);
    if (modalInstance) {
      modalInstance.hide();
    } else {
      imageModal.classList.remove('show');
      imageModal.style.display = 'none';
      imageModal.setAttribute('aria-hidden', 'true');
    }

    cleanupBootstrapModalArtifacts();
  };

  const onNavigationExit = () => {
    forceCloseAndCleanup();
    resetPinchState();
    if (!teardownController.signal.aborted) {
      teardownController.abort();
    }
  };

  modalBody.addEventListener('wheel', (event) => {
    event.preventDefault();
    const rect = modalBody.getBoundingClientRect();
    const pointX = event.clientX - rect.left;
    const pointY = event.clientY - rect.top;
    const direction = event.deltaY < 0 ? ZOOM_LIMITS.wheelStep : -ZOOM_LIMITS.wheelStep;
    setZoomAtPoint(state.zoomLevel + direction, pointX, pointY);
  }, { passive: false });

  modalBody.addEventListener('pointerdown', (event) => {
    if (state.zoomLevel <= 1) {
      return;
    }
    state.isDragging = true;
    state.dragPointerId = event.pointerId;
    state.lastPointerX = event.clientX;
    state.lastPointerY = event.clientY;
    if (typeof modalBody.setPointerCapture === 'function') {
      modalBody.setPointerCapture(event.pointerId);
    }
    applyTransform();
  });

  modalBody.addEventListener('pointermove', (event) => {
    if (!state.isDragging || state.dragPointerId !== event.pointerId) {
      return;
    }
    const deltaX = event.clientX - state.lastPointerX;
    const deltaY = event.clientY - state.lastPointerY;
    state.lastPointerX = event.clientX;
    state.lastPointerY = event.clientY;
    state.translateX += deltaX;
    state.translateY += deltaY;
    applyTransform();
  });

  const stopDragging = (event) => {
    if (state.dragPointerId !== null && event.pointerId !== state.dragPointerId) {
      return;
    }
    state.isDragging = false;
    state.dragPointerId = null;
    applyTransform();
  };

  modalBody.addEventListener('pointerup', stopDragging);
  modalBody.addEventListener('pointercancel', stopDragging);
  modalBody.addEventListener('pointerleave', stopDragging);

  modalBody.addEventListener('touchstart', (event) => {
    if (event.touches.length === 2) {
      state.pinchStartDistance = getTouchDistance(event.touches[0], event.touches[1]);
      state.pinchStartZoom = state.zoomLevel;
    }
  }, { passive: true });

  modalBody.addEventListener('touchmove', (event) => {
    if (event.touches.length !== 2 || !state.pinchStartDistance) {
      return;
    }
    event.preventDefault();
    state.isDragging = false;
    state.dragPointerId = null;
    const currentDistance = getTouchDistance(event.touches[0], event.touches[1]);
    const ratio = currentDistance / state.pinchStartDistance;
    const rect = modalBody.getBoundingClientRect();
    const midpoint = getTouchMidpoint(event.touches[0], event.touches[1], rect);
    setZoomAtPoint(state.pinchStartZoom * ratio, midpoint.x, midpoint.y);
  }, { passive: false });

  modalBody.addEventListener('touchend', resetPinchState, { passive: true });
  modalBody.addEventListener('touchcancel', resetPinchState, { passive: true });

  window.addEventListener('resize', () => {
    if (!isModalVisible()) {
      return;
    }
    updateBaseMetrics();
    applyTransform();
  }, { signal: teardownController.signal });

  imageModal.addEventListener('shown.bs.modal', () => {
    requestAnimationFrame(() => {
      resetTransform();
    });
  });
  imageModal.addEventListener('hide.bs.modal', () => {
    cleanupBootstrapModalArtifacts();
  });
  imageModal.addEventListener('hidden.bs.modal', () => {
    resetTransform();
    resetPinchState();
    cleanupBootstrapModalArtifacts();
  });

  // En navegadores Chromium móviles, volver atrás puede cambiar el hash
  // antes de que Bootstrap complete el cierre y deje el backdrop bloqueando.
  window.addEventListener('hashchange', onNavigationExit, { signal: teardownController.signal });
  window.addEventListener('popstate', onNavigationExit, { signal: teardownController.signal });
  window.addEventListener('pagehide', onNavigationExit, { signal: teardownController.signal });

  resetTransform();
}
