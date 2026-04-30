const SVG_NS = 'http://www.w3.org/2000/svg';
const DEFAULT_SVG_SIZE = 1000;
const DEFAULT_CLICK_THRESHOLD = 10;
const DEFAULT_DETAIL_ZOOM_THRESHOLD = 1.8;
const DEFAULT_DETAIL_ZOOM_HYSTERESIS = 0.2;
const DEFAULT_MARKER_HITBOX_RADIUS = 11;

const svgCache = new Map();

/**
 * Crea un mapa SVG interactivo reusable con pan y zoom.
 * @param {Object} options
 * @param {HTMLElement} options.viewport Contenedor donde se inyecta el SVG
 * @param {string} [options.svgAssetUrl] Ruta del SVG base
 * @param {number} [options.svgSize] Tamaño de referencia del viewBox
 * @param {number} [options.clickThreshold] Umbral para distinguir click de drag
 * @param {Function} [options.getMarkerData] Mapea item -> { x, y, color, payload }
 * @param {Function} [options.onMarkerClick] Callback al pulsar un marcador
 * @returns {{renderMarkers: Function, reset: Function, dispose: Function}}
 */
export function createSvgPanzoomMap(options) {
  const {
    viewport,
    svgAssetUrl = '/assets/Roco.svg',
    backgroundImageUrl = null,
    svgContent = null,
    svgSize = DEFAULT_SVG_SIZE,
    clickThreshold = DEFAULT_CLICK_THRESHOLD,
    detailZoomThreshold = DEFAULT_DETAIL_ZOOM_THRESHOLD,
    allowMarkerPointSelection = false,
    enablePointSelection = false,
    getMarkerData = (item) => {
      // Detectar si es Flash: usar verde en lugar del amarillo
      const isFlash = item?.statusConfig?.icon === 'bolt';
      const displayColor = isFlash
        ? '#16a34a'
        : item?.statusConfig?.color || '#6b7280';
      return {
        x: toNumberOrNull(item?.posX),
        y: toNumberOrNull(item?.posY),
        color: displayColor,
        holdColor: item?.colorPresasRgb || null,
        stateIcon: isFlash ? 'bolt' : null,
        payload: item,
      };
    },
    onMarkerClick = null,
    onMapPointSelect = null,
  } = options || {};

  if (!viewport) {
    throw new Error('createSvgPanzoomMap requiere un viewport valido');
  }

  let viewBoxController = null;
  let selectionLayer = null;
  let selectedPoint = null;
  let markersDetailedMode = null;

  const normalizePoint = (point) => {
    const x = toNumberOrNull(point?.x);
    const y = toNumberOrNull(point?.y);

    if (x === null || y === null) {
      return null;
    }

    return {
      x: Math.round(clamp(x, 0, svgSize)),
      y: Math.round(clamp(y, 0, svgSize)),
    };
  };

  const renderSelectedPoint = () => {
    if (!selectionLayer) return;

    selectionLayer.replaceChildren();

    if (!selectedPoint) return;

    const pointGroup = document.createElementNS(SVG_NS, 'g');
    pointGroup.setAttribute('class', 'selected-point-marker');
    pointGroup.setAttribute(
      'transform',
      `translate(${selectedPoint.x}, ${selectedPoint.y})`
    );

    const visualGroup = document.createElementNS(SVG_NS, 'g');
    visualGroup.setAttribute('class', 'selected-point-visual');

    const outerCircle = document.createElementNS(SVG_NS, 'circle');
    outerCircle.setAttribute('cx', '0');
    outerCircle.setAttribute('cy', '0');
    outerCircle.setAttribute('r', '34');
    outerCircle.setAttribute('class', 'selected-point-ring');

    const innerCircle = document.createElementNS(SVG_NS, 'circle');
    innerCircle.setAttribute('cx', '0');
    innerCircle.setAttribute('cy', '0');
    innerCircle.setAttribute('r', '12');
    innerCircle.setAttribute('class', 'selected-point-dot');

    visualGroup.appendChild(outerCircle);
    visualGroup.appendChild(innerCircle);
    pointGroup.appendChild(visualGroup);
    selectionLayer.appendChild(pointGroup);
  };

  const setSelectedPoint = (point) => {
    selectedPoint = normalizePoint(point);
    renderSelectedPoint();
    return selectedPoint;
  };

  const clearSelectedPoint = () => {
    selectedPoint = null;
    renderSelectedPoint();
  };

  const getSelectedPoint = () => selectedPoint;

  const reset = () => {
    if (!viewBoxController) return;
    viewBoxController.reset();
  };

  const dispose = () => {
    if (!viewBoxController) return;

    viewBoxController.dispose();
    viewBoxController = null;
  };

  const renderMarkers = async (items = []) => {
    try {
      const rawSvg = svgContent
        ? svgContent
        : backgroundImageUrl
          ? buildSvgWithBackground(backgroundImageUrl, svgSize)
          : await loadSvg(svgAssetUrl);
      const svgDoc = new DOMParser().parseFromString(rawSvg, 'image/svg+xml');
      const svgElement = svgDoc.documentElement;

      if (!svgElement || svgElement.nodeName.toLowerCase() !== 'svg') {
        throw new Error('El archivo SVG base no tiene un nodo SVG valido');
      }

      if (!svgElement.getAttribute('viewBox')) {
        svgElement.setAttribute('viewBox', `0 0 ${svgSize} ${svgSize}`);
      }

      svgElement.removeAttribute('width');
      svgElement.removeAttribute('height');
      svgElement.classList.add('roco-svg');

      const markerLayer = document.createElementNS(SVG_NS, 'g');
      markerLayer.setAttribute('id', 'rutas-layer');

      selectionLayer = document.createElementNS(SVG_NS, 'g');
      selectionLayer.setAttribute('id', 'point-selection-layer');

      let mapStartX = 0;
      let mapStartY = 0;

      const getMapPointFromEvent = (event) => {
        const viewBox = parseViewBoxAttribute(svgElement, svgSize);
        const point = mapClientToSvgPoint(
          svgElement,
          event.clientX,
          event.clientY,
          viewBox
        );
        return normalizePoint(point);
      };

      const updateMarkerScale = (currentScale = 1) => {
        const safeScale = currentScale > 0 ? currentScale : 1;
        const hybridScale = 1 / Math.pow(safeScale, 0.5);

        markerLayer.querySelectorAll('.ruta-visual').forEach((visualGroup) => {
          visualGroup.setAttribute('transform', `scale(${hybridScale})`);
        });

        selectionLayer
          .querySelectorAll('.selected-point-visual')
          .forEach((visualGroup) => {
            visualGroup.setAttribute('transform', `scale(${hybridScale})`);
          });
      };

      const getMarkerDetailMode = (currentScale = 1) => {
        const safeScale = currentScale > 0 ? currentScale : 1;

        if (markersDetailedMode === true) {
          return (
            safeScale >= detailZoomThreshold - DEFAULT_DETAIL_ZOOM_HYSTERESIS
          );
        }

        if (markersDetailedMode === false) {
          return (
            safeScale >= detailZoomThreshold + DEFAULT_DETAIL_ZOOM_HYSTERESIS
          );
        }

        return safeScale >= detailZoomThreshold;
      };

      const updateMarkerDetailMode = (currentScale = 1) => {
        const nextDetailedMode = getMarkerDetailMode(currentScale);

        if (markersDetailedMode === nextDetailedMode) {
          return;
        }

        markersDetailedMode = nextDetailedMode;
        markerLayer.querySelectorAll('.ruta-marker').forEach((markerGroup) => {
          markerGroup.classList.toggle('is-detailed', markersDetailedMode);
        });
      };

      markersDetailedMode = null;

      items.forEach((item) => {
        const marker = getMarkerData(item) || {};
        const x = toNumberOrNull(marker.x);
        const y = toNumberOrNull(marker.y);

        if (x === null || y === null) {
          return;
        }

        const markerGroup = document.createElementNS(SVG_NS, 'g');
        markerGroup.setAttribute('class', 'ruta-marker');
        markerGroup.setAttribute(
          'transform',
          `translate(${clamp(x, 0, svgSize)}, ${clamp(y, 0, svgSize)})`
        );

        const markerVisual = document.createElementNS(SVG_NS, 'g');
        markerVisual.setAttribute('class', 'ruta-visual');

        const markerVisualContent = document.createElementNS(SVG_NS, 'g');
        markerVisualContent.setAttribute(
          'class',
          'ruta-visual-content ruta-visual-content-detailed'
        );

        const markerSimpleVisual = document.createElementNS(SVG_NS, 'g');
        markerSimpleVisual.setAttribute(
          'class',
          'ruta-visual ruta-visual-simple'
        );

        const markerSimpleContent = document.createElementNS(SVG_NS, 'g');
        markerSimpleContent.setAttribute(
          'class',
          'ruta-visual-content ruta-visual-content-simple'
        );

        const touchHitbox = document.createElementNS(SVG_NS, 'circle');
        touchHitbox.setAttribute('cx', '0');
        touchHitbox.setAttribute('cy', '0');
        touchHitbox.setAttribute('r', String(DEFAULT_MARKER_HITBOX_RADIUS));
        touchHitbox.setAttribute('class', 'ruta-hitbox');

        const holdColor =
          typeof marker.holdColor === 'string' ? marker.holdColor.trim() : '';

        if (holdColor.length > 0) {
          const holdRingRadius = 33;
          const holdRingAxisGap = 8;
          const holdRingQuarterLength = (2 * Math.PI * holdRingRadius) / 4;
          const holdRingDashLength = Math.max(
            1,
            holdRingQuarterLength - holdRingAxisGap
          );

          const holdColorRing = document.createElementNS(SVG_NS, 'circle');
          holdColorRing.setAttribute('cx', '0');
          holdColorRing.setAttribute('cy', '0');
          holdColorRing.setAttribute('r', String(holdRingRadius));
          holdColorRing.setAttribute('fill', 'none');
          holdColorRing.setAttribute('stroke', holdColor);
          holdColorRing.setAttribute('stroke-width', '6');
          holdColorRing.setAttribute('stroke-linecap', 'butt');
          holdColorRing.setAttribute(
            'stroke-dasharray',
            `${holdRingDashLength} ${holdRingAxisGap}`
          );
          markerVisualContent.appendChild(holdColorRing);
        }

        const simpleColorCircle = document.createElementNS(SVG_NS, 'circle');
        simpleColorCircle.setAttribute('cx', '0');
        simpleColorCircle.setAttribute('cy', '0');
        simpleColorCircle.setAttribute('r', '14');
        simpleColorCircle.setAttribute('class', 'ruta-color-dot');
        simpleColorCircle.setAttribute('fill', holdColor || '#9ca3af');

        const markerCircle = document.createElementNS(SVG_NS, 'circle');
        markerCircle.setAttribute('cx', '0');
        markerCircle.setAttribute('cy', '0');
        markerCircle.setAttribute('r', '24');
        markerCircle.setAttribute('class', 'ruta-dot');
        markerCircle.setAttribute('fill', marker.color || '#6b7280');

        let detailedFlashBolt = null;
        if (marker.stateIcon === 'bolt') {
          detailedFlashBolt = document.createElementNS(SVG_NS, 'polygon');
          detailedFlashBolt.setAttribute('class', 'flash-bolt-icon');
          // Solo se muestra en modo detallado: se dibuja en la capa detailed.
          detailedFlashBolt.setAttribute(
            'points',
            '-3,-14 5,-14 1,-2 10,-2 -5,15 -1,3 -10,3'
          );
          detailedFlashBolt.setAttribute('fill', '#faca2a');
          detailedFlashBolt.setAttribute('stroke', '#333333');
          detailedFlashBolt.setAttribute('stroke-width', '1.2');
          detailedFlashBolt.setAttribute('stroke-linejoin', 'round');
          detailedFlashBolt.setAttribute('pointer-events', 'none');
        }

        let startX = 0;
        let startY = 0;
        let lastMarkerActivationAt = 0;

        const triggerMarkerClick = () => {
          if (typeof onMarkerClick !== 'function') {
            return;
          }

          const now = Date.now();
          if (now - lastMarkerActivationAt < 320) {
            return;
          }

          lastMarkerActivationAt = now;
          onMarkerClick(marker.payload, marker);
        };

        markerGroup.addEventListener('pointerdown', (event) => {
          startX = event.clientX;
          startY = event.clientY;

          if (typeof markerGroup.setPointerCapture === 'function') {
            try {
              markerGroup.setPointerCapture(event.pointerId);
            } catch {
              // Algunos navegadores pueden no permitir captura en SVG.
            }
          }
        });

        markerGroup.addEventListener('pointerup', (event) => {
          const deltaX = Math.abs(event.clientX - startX);
          const deltaY = Math.abs(event.clientY - startY);
          const isClick = deltaX <= clickThreshold && deltaY <= clickThreshold;

          if (isClick) {
            if (typeof onMarkerClick === 'function') {
              event.preventDefault();
              event.stopPropagation();
              triggerMarkerClick();
            }
          }
        });

        markerGroup.addEventListener('click', (event) => {
          if (typeof onMarkerClick !== 'function') {
            return;
          }

          event.preventDefault();
          event.stopPropagation();
          triggerMarkerClick();
        });

        markerSimpleContent.appendChild(simpleColorCircle);

        markerSimpleVisual.appendChild(markerSimpleContent);

        markerVisualContent.appendChild(markerCircle);
        if (detailedFlashBolt) {
          markerVisualContent.appendChild(detailedFlashBolt);
        }
        markerVisual.appendChild(markerVisualContent);

        markerGroup.appendChild(markerVisual);
        markerGroup.appendChild(markerSimpleVisual);
        markerGroup.appendChild(touchHitbox);
        markerLayer.appendChild(markerGroup);
      });

      svgElement.appendChild(markerLayer);
      svgElement.appendChild(selectionLayer);
      renderSelectedPoint();

      if (enablePointSelection) {
        svgElement.addEventListener('pointerdown', (event) => {
          const isMarkerTarget =
            typeof event.target.closest === 'function' &&
            event.target.closest('.ruta-marker');
          if (isMarkerTarget && !allowMarkerPointSelection) return;

          mapStartX = event.clientX;
          mapStartY = event.clientY;
        });

        svgElement.addEventListener('pointerup', (event) => {
          const isMarkerTarget =
            typeof event.target.closest === 'function' &&
            event.target.closest('.ruta-marker');
          if (isMarkerTarget && !allowMarkerPointSelection) return;

          const deltaX = Math.abs(event.clientX - mapStartX);
          const deltaY = Math.abs(event.clientY - mapStartY);
          const isClick = deltaX <= clickThreshold && deltaY <= clickThreshold;

          if (!isClick) {
            return;
          }

          const nextPoint = getMapPointFromEvent(event);
          if (!nextPoint) {
            return;
          }

          selectedPoint = nextPoint;
          renderSelectedPoint();

          if (typeof onMapPointSelect === 'function') {
            onMapPointSelect(selectedPoint);
          }
        });
      }

      dispose();

      viewport.replaceChildren(svgElement);

      viewBoxController = createViewBoxPanZoom(svgElement, {
        minZoom: 0.8,
        maxZoom: 6,
        zoomSpeed: 0.08,
      });

      const syncMarkerVisualState = () => {
        const { scale } = viewBoxController.getTransform();
        updateMarkerScale(scale);
        updateMarkerDetailMode(scale);
      };

      syncMarkerVisualState();
      viewBoxController.on('pan', syncMarkerVisualState);
      viewBoxController.on('zoom', syncMarkerVisualState);
    } catch (err) {
      console.error('Error al renderizar mapa interactivo:', err);
      viewport.innerHTML = `
                <div class="d-flex justify-content-center align-items-center h-100 text-white-50 px-3 text-center">
                    No se pudo cargar el mapa del rocódromo.
                </div>
            `;
    }
  };

  return {
    renderMarkers,
    reset,
    dispose,
    setSelectedPoint,
    getSelectedPoint,
    clearSelectedPoint,
  };
}

// Función auxiliar para limitar un valor dentro de un rango mínimo y máximo
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Función auxiliar para convertir un valor a número o devolver null si no es válido
function toNumberOrNull(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseViewBoxAttribute(svgElement, fallbackSize = DEFAULT_SVG_SIZE) {
  const vbAttr = svgElement.getAttribute('viewBox');
  if (!vbAttr) {
    return { x: 0, y: 0, width: fallbackSize, height: fallbackSize };
  }

  const parts = vbAttr.trim().split(/[,\s]+/).map(Number);
  if (parts.length !== 4 || !parts.every(Number.isFinite)) {
    return { x: 0, y: 0, width: fallbackSize, height: fallbackSize };
  }

  return {
    x: parts[0],
    y: parts[1],
    width: parts[2] > 0 ? parts[2] : fallbackSize,
    height: parts[3] > 0 ? parts[3] : fallbackSize,
  };
}

function mapClientToSvgPoint(svgElement, clientX, clientY, viewBox) {
  const rect = svgElement.getBoundingClientRect();
  if (!rect || rect.width <= 0 || rect.height <= 0) {
    return null;
  }

  const preserve =
    (svgElement.getAttribute('preserveAspectRatio') || 'xMidYMid meet')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  const align = preserve[0] || 'xMidYMid';
  const meetOrSlice = preserve[1] || 'meet';

  if (align === 'none') {
    const relX = (clientX - rect.left) / rect.width;
    const relY = (clientY - rect.top) / rect.height;
    return {
      x: viewBox.x + relX * viewBox.width,
      y: viewBox.y + relY * viewBox.height,
    };
  }

  const scaleX = rect.width / viewBox.width;
  const scaleY = rect.height / viewBox.height;
  const contentScale =
    meetOrSlice === 'slice' ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY);

  const renderedWidth = viewBox.width * contentScale;
  const renderedHeight = viewBox.height * contentScale;

  let offsetX = 0;
  let offsetY = 0;

  if (align.includes('xMid')) {
    offsetX = (rect.width - renderedWidth) / 2;
  } else if (align.includes('xMax')) {
    offsetX = rect.width - renderedWidth;
  }

  if (align.includes('YMid')) {
    offsetY = (rect.height - renderedHeight) / 2;
  } else if (align.includes('YMax')) {
    offsetY = rect.height - renderedHeight;
  }

  return {
    x: viewBox.x + (clientX - rect.left - offsetX) / contentScale,
    y: viewBox.y + (clientY - rect.top - offsetY) / contentScale,
  };
}

function createViewBoxPanZoom(svgElement, options = {}) {
  const minZoom = Number.isFinite(options.minZoom) ? options.minZoom : 0.8;
  const maxZoom = Number.isFinite(options.maxZoom) ? options.maxZoom : 6;
  const zoomSpeed = Number.isFinite(options.zoomSpeed) ? options.zoomSpeed : 0.08;

  const listeners = {
    pan: new Set(),
    zoom: new Set(),
  };

  const baseViewBox = parseViewBoxAttribute(svgElement, DEFAULT_SVG_SIZE);
  const state = {
    x: baseViewBox.x,
    y: baseViewBox.y,
    width: baseViewBox.width,
    height: baseViewBox.height,
    scale: 1,
  };

  const emit = (eventName) => {
    if (!listeners[eventName]) return;
    listeners[eventName].forEach((handler) => {
      try {
        handler();
      } catch {
        // Ignorar errores en listeners para no romper la interacción.
      }
    });
  };

  const applyViewBox = () => {
    svgElement.setAttribute(
      'viewBox',
      `${state.x} ${state.y} ${state.width} ${state.height}`
    );
  };

  const clampViewBoxPosition = (nextX, nextY, width, height) => {
    const minX = baseViewBox.x;
    const maxX = baseViewBox.x + baseViewBox.width - width;
    const minY = baseViewBox.y;
    const maxY = baseViewBox.y + baseViewBox.height - height;

    return {
      x: clamp(nextX, minX, maxX),
      y: clamp(nextY, minY, maxY),
    };
  };

  const clientPointToSvg = (clientX, clientY) => {
    return mapClientToSvgPoint(svgElement, clientX, clientY, {
      x: state.x,
      y: state.y,
      width: state.width,
      height: state.height,
    });
  };

  const setScale = (nextScale, anchorClient = null) => {
    const clampedScale = clamp(nextScale, minZoom, maxZoom);
    const nextWidth = baseViewBox.width / clampedScale;
    const nextHeight = baseViewBox.height / clampedScale;

    let anchor = null;
    if (anchorClient && Number.isFinite(anchorClient.clientX) && Number.isFinite(anchorClient.clientY)) {
      anchor = clientPointToSvg(anchorClient.clientX, anchorClient.clientY);
    }

    if (!anchor) {
      anchor = {
        x: state.x + state.width / 2,
        y: state.y + state.height / 2,
      };
    }

    const anchorRatioX = state.width > 0 ? (anchor.x - state.x) / state.width : 0.5;
    const anchorRatioY = state.height > 0 ? (anchor.y - state.y) / state.height : 0.5;

    const unclampedX = anchor.x - anchorRatioX * nextWidth;
    const unclampedY = anchor.y - anchorRatioY * nextHeight;
    const clampedPosition = clampViewBoxPosition(
      unclampedX,
      unclampedY,
      nextWidth,
      nextHeight
    );

    const changed =
      clampedScale !== state.scale ||
      clampedPosition.x !== state.x ||
      clampedPosition.y !== state.y;

    state.scale = clampedScale;
    state.width = nextWidth;
    state.height = nextHeight;
    state.x = clampedPosition.x;
    state.y = clampedPosition.y;

    if (changed) {
      applyViewBox();
      emit('zoom');
    }
  };

  const panByClientDelta = (deltaClientX, deltaClientY) => {
    const rect = svgElement.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) {
      return;
    }

    const deltaSvgX = (deltaClientX / rect.width) * state.width;
    const deltaSvgY = (deltaClientY / rect.height) * state.height;

    const clampedPosition = clampViewBoxPosition(
      state.x - deltaSvgX,
      state.y - deltaSvgY,
      state.width,
      state.height
    );

    if (clampedPosition.x === state.x && clampedPosition.y === state.y) {
      return;
    }

    state.x = clampedPosition.x;
    state.y = clampedPosition.y;
    applyViewBox();
    emit('pan');
  };

  const interactionState = {
    pointerId: null,
    lastX: 0,
    lastY: 0,
    pinchStartDistance: null,
    pinchStartScale: null,
  };

  const getTouchDistance = (touchA, touchB) => {
    return Math.hypot(touchB.clientX - touchA.clientX, touchB.clientY - touchA.clientY);
  };

  const handlePointerDown = (event) => {
    if (interactionState.pointerId !== null) {
      return;
    }

    const isMarkerTarget =
      typeof event.target?.closest === 'function' &&
      event.target.closest('.ruta-marker');
    if (isMarkerTarget) {
      return;
    }

    interactionState.pointerId = event.pointerId;
    interactionState.lastX = event.clientX;
    interactionState.lastY = event.clientY;
  };

  const handlePointerMove = (event) => {
    if (interactionState.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - interactionState.lastX;
    const deltaY = event.clientY - interactionState.lastY;
    interactionState.lastX = event.clientX;
    interactionState.lastY = event.clientY;

    if (deltaX === 0 && deltaY === 0) {
      return;
    }

    panByClientDelta(deltaX, deltaY);
  };

  const handlePointerUp = (event) => {
    if (interactionState.pointerId === event.pointerId) {
      interactionState.pointerId = null;
    }
  };

  const handleWheel = (event) => {
    event.preventDefault();
    const factor = Math.exp(-event.deltaY * zoomSpeed * 0.01);
    setScale(state.scale * factor, {
      clientX: event.clientX,
      clientY: event.clientY,
    });
  };

  const handleTouchStart = (event) => {
    if (event.touches.length !== 2) {
      interactionState.pinchStartDistance = null;
      interactionState.pinchStartScale = null;
      return;
    }

    interactionState.pinchStartDistance = getTouchDistance(
      event.touches[0],
      event.touches[1]
    );
    interactionState.pinchStartScale = state.scale;
  };

  const handleTouchMove = (event) => {
    if (event.touches.length !== 2) {
      return;
    }

    if (!interactionState.pinchStartDistance || !interactionState.pinchStartScale) {
      return;
    }

    event.preventDefault();

    const nextDistance = getTouchDistance(event.touches[0], event.touches[1]);
    if (!Number.isFinite(nextDistance) || nextDistance <= 0) {
      return;
    }

    const ratio = nextDistance / interactionState.pinchStartDistance;
    const midpointX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
    const midpointY = (event.touches[0].clientY + event.touches[1].clientY) / 2;

    setScale(interactionState.pinchStartScale * ratio, {
      clientX: midpointX,
      clientY: midpointY,
    });
  };

  const handleTouchEnd = (event) => {
    if (event.touches.length < 2) {
      interactionState.pinchStartDistance = null;
      interactionState.pinchStartScale = null;
    }
  };

  svgElement.addEventListener('pointerdown', handlePointerDown);
  svgElement.addEventListener('pointermove', handlePointerMove);
  svgElement.addEventListener('pointerup', handlePointerUp);
  svgElement.addEventListener('pointercancel', handlePointerUp);
  svgElement.addEventListener('wheel', handleWheel, { passive: false });
  svgElement.addEventListener('touchstart', handleTouchStart, { passive: true });
  svgElement.addEventListener('touchmove', handleTouchMove, { passive: false });
  svgElement.addEventListener('touchend', handleTouchEnd);
  svgElement.addEventListener('touchcancel', handleTouchEnd);

  const reset = () => {
    state.x = baseViewBox.x;
    state.y = baseViewBox.y;
    state.width = baseViewBox.width;
    state.height = baseViewBox.height;
    state.scale = 1;
    applyViewBox();
    emit('pan');
    emit('zoom');
  };

  return {
    moveTo(nextX, nextY) {
      const clampedPosition = clampViewBoxPosition(
        toNumberOrNull(nextX) ?? state.x,
        toNumberOrNull(nextY) ?? state.y,
        state.width,
        state.height
      );

      if (clampedPosition.x === state.x && clampedPosition.y === state.y) {
        return;
      }

      state.x = clampedPosition.x;
      state.y = clampedPosition.y;
      applyViewBox();
      emit('pan');
    },
    zoomAbs(clientX, clientY, nextScale) {
      setScale(toNumberOrNull(nextScale) ?? state.scale, { clientX, clientY });
    },
    getTransform() {
      return {
        x: state.x,
        y: state.y,
        scale: state.scale,
      };
    },
    on(eventName, handler) {
      if (!listeners[eventName] || typeof handler !== 'function') {
        return;
      }
      listeners[eventName].add(handler);
    },
    reset,
    dispose() {
      svgElement.removeEventListener('pointerdown', handlePointerDown);
      svgElement.removeEventListener('pointermove', handlePointerMove);
      svgElement.removeEventListener('pointerup', handlePointerUp);
      svgElement.removeEventListener('pointercancel', handlePointerUp);
      svgElement.removeEventListener('wheel', handleWheel);
      svgElement.removeEventListener('touchstart', handleTouchStart);
      svgElement.removeEventListener('touchmove', handleTouchMove);
      svgElement.removeEventListener('touchend', handleTouchEnd);
      svgElement.removeEventListener('touchcancel', handleTouchEnd);

      listeners.pan.clear();
      listeners.zoom.clear();
    },
  };
}
// Función auxiliar para cargar un SVG desde una URL con caching
async function loadSvg(svgAssetUrl) {
  if (!svgCache.has(svgAssetUrl)) {
    const response = await fetch(svgAssetUrl);
    if (!response.ok) {
      throw new Error('No se pudo cargar el mapa SVG del rocódromo');
    }

    const rawSvg = await response.text();
    svgCache.set(svgAssetUrl, rawSvg);
  }

  return svgCache.get(svgAssetUrl);
}

// Función auxiliar para construir un SVG con una imagen de fondo
function buildSvgWithBackground(backgroundImageUrl, svgSize) {
  return `
        <svg xmlns="${SVG_NS}" viewBox="0 0 ${svgSize} ${svgSize}" preserveAspectRatio="xMidYMid slice">
            <image href="${backgroundImageUrl}" x="0" y="0" width="${svgSize}" height="${svgSize}" preserveAspectRatio="xMidYMid slice" />
        </svg>
    `;
}
