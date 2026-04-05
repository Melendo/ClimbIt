import panzoom from 'panzoom';

const SVG_NS = 'http://www.w3.org/2000/svg';
const DEFAULT_SVG_SIZE = 1000;
const DEFAULT_CLICK_THRESHOLD = 10;

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
        enablePointSelection = false,
        getMarkerData = (item) => ({
            x: toNumberOrNull(item?.posX),
            y: toNumberOrNull(item?.posY),
            color: item?.statusConfig?.color || '#6b7280',
            payload: item,
        }),
        onMarkerClick = null,
        onMapPointSelect = null,
    } = options || {};

    if (!viewport) {
        throw new Error('createSvgPanzoomMap requiere un viewport valido');
    }

    let panzoomInstance = null;
    let selectionLayer = null;
    let selectedPoint = null;

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
        pointGroup.setAttribute('transform', `translate(${selectedPoint.x}, ${selectedPoint.y})`);

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
        if (!panzoomInstance) return;

        panzoomInstance.moveTo(0, 0);
        panzoomInstance.zoomAbs(0, 0, 1);
    };

    const dispose = () => {
        if (!panzoomInstance) return;

        panzoomInstance.dispose();
        panzoomInstance = null;
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

            svgElement.removeAttribute('width');
            svgElement.removeAttribute('height');
            svgElement.classList.add('roco-svg');

            const markerLayer = document.createElementNS(SVG_NS, 'g');
            markerLayer.setAttribute('id', 'rutas-layer');

            selectionLayer = document.createElementNS(SVG_NS, 'g');
            selectionLayer.setAttribute('id', 'point-selection-layer');

            let movedByPan = false;
            let mapStartX = 0;
            let mapStartY = 0;

            const getMapPointFromEvent = (event) => {
                const ctm = svgElement.getScreenCTM();
                if (!ctm) return null;

                const point = svgElement.createSVGPoint();
                point.x = event.clientX;
                point.y = event.clientY;

                const transformedPoint = point.matrixTransform(ctm.inverse());
                return normalizePoint(transformedPoint);
            };

            const updateMarkerScale = (currentScale = 1) => {
                const safeScale = currentScale > 0 ? currentScale : 1;
                const hybridScale = 1 / Math.pow(safeScale, 0.5);

                markerLayer.querySelectorAll('.ruta-visual').forEach((visualGroup) => {
                    visualGroup.setAttribute('transform', `scale(${hybridScale})`);
                });

                selectionLayer.querySelectorAll('.selected-point-visual').forEach((visualGroup) => {
                    visualGroup.setAttribute('transform', `scale(${hybridScale})`);
                });
            };

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

                const touchHitbox = document.createElementNS(SVG_NS, 'circle');
                touchHitbox.setAttribute('cx', '0');
                touchHitbox.setAttribute('cy', '0');
                touchHitbox.setAttribute('r', '50');
                touchHitbox.setAttribute('class', 'ruta-hitbox');

                const markerCircle = document.createElementNS(SVG_NS, 'circle');
                markerCircle.setAttribute('cx', '0');
                markerCircle.setAttribute('cy', '0');
                markerCircle.setAttribute('r', '20');
                markerCircle.setAttribute('class', 'ruta-dot');
                markerCircle.setAttribute('fill', marker.color || '#6b7280');

                let startX = 0;
                let startY = 0;

                markerGroup.addEventListener('pointerdown', (event) => {
                    startX = event.clientX;
                    startY = event.clientY;
                    movedByPan = false;
                });

                markerGroup.addEventListener('pointerup', (event) => {
                    const deltaX = Math.abs(event.clientX - startX);
                    const deltaY = Math.abs(event.clientY - startY);
                    const isClick = deltaX <= clickThreshold && deltaY <= clickThreshold;

                    if (isClick && !movedByPan && typeof onMarkerClick === 'function') {
                        onMarkerClick(marker.payload, marker);
                    }
                });

                markerVisual.appendChild(touchHitbox);
                markerVisual.appendChild(markerCircle);
                markerGroup.appendChild(markerVisual);
                markerLayer.appendChild(markerGroup);
            });

            svgElement.appendChild(markerLayer);
            svgElement.appendChild(selectionLayer);
            renderSelectedPoint();

            if (enablePointSelection) {
                svgElement.addEventListener('pointerdown', (event) => {
                    const isMarkerTarget = typeof event.target.closest === 'function' && event.target.closest('.ruta-marker');
                    if (isMarkerTarget) return;

                    mapStartX = event.clientX;
                    mapStartY = event.clientY;
                    movedByPan = false;
                });

                svgElement.addEventListener('pointerup', (event) => {
                    const isMarkerTarget = typeof event.target.closest === 'function' && event.target.closest('.ruta-marker');
                    if (isMarkerTarget) return;

                    const deltaX = Math.abs(event.clientX - mapStartX);
                    const deltaY = Math.abs(event.clientY - mapStartY);
                    const isClick = deltaX <= clickThreshold && deltaY <= clickThreshold;

                    if (!isClick || movedByPan) {
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

            panzoomInstance = panzoom(svgElement, {
                maxZoom: 6,
                minZoom: 0.8,
                zoomSpeed: 0.08,
                smoothScroll: false,
                bounds: true,
                boundsPadding: 0.1,
            });

            const clampPanToViewport = () => {
                const transform = panzoomInstance.getTransform();
                const viewportRect = viewport.getBoundingClientRect();

                const scaledWidth = viewportRect.width * transform.scale;
                const scaledHeight = viewportRect.height * transform.scale;

                let minX = viewportRect.width - scaledWidth;
                let maxX = 0;
                let minY = viewportRect.height - scaledHeight;
                let maxY = 0;

                if (scaledWidth <= viewportRect.width) {
                    minX = maxX = (viewportRect.width - scaledWidth) / 2;
                }

                if (scaledHeight <= viewportRect.height) {
                    minY = maxY = (viewportRect.height - scaledHeight) / 2;
                }

                const nextX = clamp(transform.x, minX, maxX);
                const nextY = clamp(transform.y, minY, maxY);

                if (nextX !== transform.x || nextY !== transform.y) {
                    panzoomInstance.moveTo(nextX, nextY);
                }
            };

            updateMarkerScale(panzoomInstance.getTransform().scale);
            clampPanToViewport();

            panzoomInstance.on('pan', () => {
                movedByPan = true;
                clampPanToViewport();
            });

            panzoomInstance.on('zoom', () => {
                movedByPan = true;
                const { scale } = panzoomInstance.getTransform();
                updateMarkerScale(scale);
                clampPanToViewport();
            });
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
