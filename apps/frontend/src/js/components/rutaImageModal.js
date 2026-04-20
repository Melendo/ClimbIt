import { escapeHtml } from './formHelpers.js';

export function renderRutaImageModal({
  modalId,
  title,
  imageSrc,
  imageAlt,
}) {
  const safeTitle = escapeHtml(title || 'Ruta');
  const safeSrc = escapeHtml(imageSrc || '/assets/placeholder.jpg');
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

  let zoomLevel = 1;
  let translateX = 0;
  let translateY = 0;
  let isDragging = false;
  let dragPointerId = null;
  let lastPointerX = 0;
  let lastPointerY = 0;
  let pinchStartDistance = null;
  let pinchStartZoom = 1;
  let baseOffsetX = 0;
  let baseOffsetY = 0;
  let baseWidth = 0;
  let baseHeight = 0;
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 4;
  const STEP = 0.25;

  const clampZoom = (value) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value));
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const touchDistance = (touchA, touchB) => Math.hypot(
    touchA.clientX - touchB.clientX,
    touchA.clientY - touchB.clientY,
  );
  const touchMidpoint = (touchA, touchB, rect) => ({
    x: ((touchA.clientX + touchB.clientX) / 2) - rect.left,
    y: ((touchA.clientY + touchB.clientY) / 2) - rect.top,
  });

  const updateBaseMetrics = () => {
    const stageRect = modalBody.getBoundingClientRect();
    const imgRect = modalImage.getBoundingClientRect();
    baseOffsetX = imgRect.left - stageRect.left;
    baseOffsetY = imgRect.top - stageRect.top;
    baseWidth = imgRect.width;
    baseHeight = imgRect.height;
  };

  const constrainPan = () => {
    const stageRect = modalBody.getBoundingClientRect();
    const stageWidth = stageRect.width;
    const stageHeight = stageRect.height;
    const scaledWidth = baseWidth * zoomLevel;
    const scaledHeight = baseHeight * zoomLevel;

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

    const effectiveX = baseOffsetX + translateX;
    const effectiveY = baseOffsetY + translateY;
    translateX = clamp(effectiveX, minEffectiveX, maxEffectiveX) - baseOffsetX;
    translateY = clamp(effectiveY, minEffectiveY, maxEffectiveY) - baseOffsetY;
  };

  const applyTransform = () => {
    constrainPan();
    modalImage.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${zoomLevel})`;
    modalBody.classList.toggle('is-zoomed', zoomLevel > 1);
    modalBody.classList.toggle('is-dragging', isDragging);
  };

  const setZoomAtPoint = (targetZoom, pointX, pointY) => {
    const newZoom = clampZoom(targetZoom);
    if (Math.abs(newZoom - zoomLevel) < 0.001) {
      return;
    }

    const imagePointX = (pointX - baseOffsetX - translateX) / zoomLevel;
    const imagePointY = (pointY - baseOffsetY - translateY) / zoomLevel;
    zoomLevel = newZoom;
    translateX = pointX - baseOffsetX - (imagePointX * zoomLevel);
    translateY = pointY - baseOffsetY - (imagePointY * zoomLevel);
    applyTransform();
  };

  const resetTransform = () => {
    zoomLevel = 1;
    translateX = 0;
    translateY = 0;
    isDragging = false;
    dragPointerId = null;
    modalImage.style.transformOrigin = '0 0';
    modalImage.style.transform = 'translate3d(0, 0, 0) scale(1)';
    updateBaseMetrics();
    applyTransform();
  };

  modalBody.addEventListener('wheel', (event) => {
    event.preventDefault();
    const rect = modalBody.getBoundingClientRect();
    const pointX = event.clientX - rect.left;
    const pointY = event.clientY - rect.top;
    const direction = event.deltaY < 0 ? STEP : -STEP;
    setZoomAtPoint(zoomLevel + direction, pointX, pointY);
  }, { passive: false });

  modalBody.addEventListener('pointerdown', (event) => {
    if (zoomLevel <= 1) {
      return;
    }
    isDragging = true;
    dragPointerId = event.pointerId;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    if (typeof modalBody.setPointerCapture === 'function') {
      modalBody.setPointerCapture(event.pointerId);
    }
    applyTransform();
  });

  modalBody.addEventListener('pointermove', (event) => {
    if (!isDragging || dragPointerId !== event.pointerId) {
      return;
    }
    const deltaX = event.clientX - lastPointerX;
    const deltaY = event.clientY - lastPointerY;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    translateX += deltaX;
    translateY += deltaY;
    applyTransform();
  });

  const stopDragging = (event) => {
    if (dragPointerId !== null && event.pointerId !== dragPointerId) {
      return;
    }
    isDragging = false;
    dragPointerId = null;
    applyTransform();
  };

  modalBody.addEventListener('pointerup', stopDragging);
  modalBody.addEventListener('pointercancel', stopDragging);
  modalBody.addEventListener('pointerleave', stopDragging);

  modalBody.addEventListener('touchstart', (event) => {
    if (event.touches.length === 2) {
      pinchStartDistance = touchDistance(event.touches[0], event.touches[1]);
      pinchStartZoom = zoomLevel;
    }
  }, { passive: true });

  modalBody.addEventListener('touchmove', (event) => {
    if (event.touches.length !== 2 || !pinchStartDistance) {
      return;
    }
    event.preventDefault();
    isDragging = false;
    dragPointerId = null;
    const currentDistance = touchDistance(event.touches[0], event.touches[1]);
    const ratio = currentDistance / pinchStartDistance;
    const rect = modalBody.getBoundingClientRect();
    const midPoint = touchMidpoint(event.touches[0], event.touches[1], rect);
    setZoomAtPoint(pinchStartZoom * ratio, midPoint.x, midPoint.y);
  }, { passive: false });

  const resetPinchState = () => {
    pinchStartDistance = null;
    pinchStartZoom = zoomLevel;
  };

  modalBody.addEventListener('touchend', resetPinchState, { passive: true });
  modalBody.addEventListener('touchcancel', resetPinchState, { passive: true });

  imageModal.addEventListener('shown.bs.modal', () => {
    requestAnimationFrame(() => {
      resetTransform();
    });
  });
  imageModal.addEventListener('hidden.bs.modal', () => {
    resetTransform();
    resetPinchState();
  });

  resetTransform();
}
