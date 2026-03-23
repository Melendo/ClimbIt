import { renderMapaZona, renderCrearZona } from './zonaView.js';
import panzoom from 'panzoom';
import { fetchClient } from '../../core/client.js';
import { showLoading, showError } from '../../core/ui.js';

/**
 * Controlador para la vista de mapa de zona
 * Muestra el mapa del rocódromo y permite seleccionar una zona para ver sus rutas
 * @param {HTMLElement} container Contenedor donde renderizar la vista
 * @param {number} idRocodromo ID del rocódromo
 */
const ESTADOS_CONFIG = {
    'flash': { icon: 'bolt', color: '#ffba0c', bg: '#fef3c7' },
    'completado': { icon: 'done', color: '#16a34a', bg: '#dcfce7' },
    'proyecto': { icon: 'sync', color: '#2563eb', bg: '#dbeafe' },
    'S/N': { icon: 'remove', color: '#6b7280', bg: '#e5e7eb' }
};

// Variable para el comportamiento de los svg
const SVG_NS = 'http://www.w3.org/2000/svg';

// Tamaño del svg es 0 0 1000 1000
const SVG_SIZE = 1000;

// Umbral de movimiento para distinguir entre click y pan/drag
const CLICK_THRESHOLD = 10;

let rocoSvgCache = null;
let mapaPanzoomInstance = null;

function resetMapaZoom() {
    if (!mapaPanzoomInstance) return;

    mapaPanzoomInstance.moveTo(0, 0);
    mapaPanzoomInstance.zoomAbs(0, 0, 1);
}

// Función para obtener coordenada X o Y de una ruta, con validación y fallback a null
function getRutaCoord(ruta, key) {
    const value = key === 'x' ? Number(ruta?.posX) : Number(ruta?.posY);
    return Number.isFinite(value) ? value : null;
}

// Función de utilidad para limitar un valor entre un mínimo y máximo
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// Carga el SVG del rocódromo, con caching para evitar múltiples fetches
async function loadRocoSvg() {
    if (!rocoSvgCache) {
        const response = await fetch('/assets/Roco.svg');
        if (!response.ok) {
            throw new Error('No se pudo cargar el mapa SVG del rocódromo');
        }
        rocoSvgCache = await response.text();
    }

    return rocoSvgCache;
}

async function renderMapaInteractivoZona(container, rutas) {
    const mapaViewport = container.querySelector('#mapaSvgViewport');
    if (!mapaViewport) return;

    try {
        // Cargar y parsear el SVG base del rocódromo.
        const rawSvg = await loadRocoSvg();
        const svgDoc = new DOMParser().parseFromString(rawSvg, 'image/svg+xml');
        const svgElement = svgDoc.documentElement;

        if (!svgElement || svgElement.nodeName.toLowerCase() !== 'svg') {
            throw new Error('El archivo Roco.svg no tiene un nodo SVG valido');
        }

        // Limpiar atributos de tamaño fijo para permitir escalado responsivo.
        svgElement.removeAttribute('width');
        svgElement.removeAttribute('height');
        svgElement.classList.add('roco-svg');

        // Capa dedicada para pintar los marcadores de rutas.
        const markerLayer = document.createElementNS(SVG_NS, 'g');
        markerLayer.setAttribute('id', 'rutas-layer');

        let movedByPan = false;

        // Escala hibrida: el marcador crece con el zoom, pero de forma amortiguada.
        const updateMarkerScale = (currentScale = 1) => {
            const safeScale = currentScale > 0 ? currentScale : 1;
            const hybridScale = 1 / Math.pow(safeScale, 0.5);

            markerLayer.querySelectorAll('.ruta-visual').forEach((visualGroup) => {
                visualGroup.setAttribute('transform', `scale(${hybridScale})`);
            });
        };

        rutas.forEach((ruta) => {
            const rawX = getRutaCoord(ruta, 'x');
            const rawY = getRutaCoord(ruta, 'y');

            // Si una ruta no trae posX/posY, no se renderiza en el mapa.
            if (rawX === null || rawY === null) {
                return;
            }

            const x = clamp(rawX, 0, SVG_SIZE);
            const y = clamp(rawY, 0, SVG_SIZE);

            // Grupo anclado en coordenadas del mapa para una ruta.
            const markerGroup = document.createElementNS(SVG_NS, 'g');
            markerGroup.setAttribute('class', 'ruta-marker');
            markerGroup.setAttribute('transform', `translate(${x}, ${y})`);
            markerGroup.setAttribute('data-ruta-id', String(ruta.id));

            // Subgrupo con escala hibrida para mejorar legibilidad en cualquier zoom.
            const markerVisual = document.createElementNS(SVG_NS, 'g');
            markerVisual.setAttribute('class', 'ruta-visual');

            // Hitbox grande e invisible para mejorar interacción táctil.
            const touchHitbox = document.createElementNS(SVG_NS, 'circle');
            touchHitbox.setAttribute('cx', '0');
            touchHitbox.setAttribute('cy', '0');
            touchHitbox.setAttribute('r', '50');
            touchHitbox.setAttribute('class', 'ruta-hitbox');

            // Círculo visible según el estado de la ruta.
            const markerCircle = document.createElementNS(SVG_NS, 'circle');
            markerCircle.setAttribute('cx', '0');
            markerCircle.setAttribute('cy', '0');
            markerCircle.setAttribute('r', '20');
            markerCircle.setAttribute('class', 'ruta-dot');
            markerCircle.setAttribute('fill', ruta?.statusConfig?.color || '#6b7280');

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
                const isClick = deltaX <= CLICK_THRESHOLD && deltaY <= CLICK_THRESHOLD;

                // Solo navegamos si fue click real (no drag/pan).
                if (isClick && !movedByPan) {
                    window.location.hash = `#infoRuta?id=${ruta.id}`;
                }
            });

            markerVisual.appendChild(touchHitbox);
            markerVisual.appendChild(markerCircle);
            markerGroup.appendChild(markerVisual);
            markerLayer.appendChild(markerGroup);
        });

        svgElement.appendChild(markerLayer);

        if (mapaPanzoomInstance) {
            mapaPanzoomInstance.dispose();
            mapaPanzoomInstance = null;
        }

        // 3) Inyectar SVG final en el contenedor y activar pan/zoom.
        mapaViewport.replaceChildren(svgElement);

        mapaPanzoomInstance = panzoom(svgElement, {
            maxZoom: 6,
            minZoom: 0.8,
            zoomSpeed: 0.08,
            smoothScroll: false,
            bounds: true,
            boundsPadding: 0.1,
        });

        // Aplica límites manuales extra para no alejarse del mapa infinito.
        const clampPanToViewport = () => {
            const transform = mapaPanzoomInstance.getTransform();
            const viewportRect = mapaViewport.getBoundingClientRect();

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
                mapaPanzoomInstance.moveTo(nextX, nextY);
            }
        };

        // Aplicar escala inicial a los marcadores para que se vean bien desde el principio.
        updateMarkerScale(mapaPanzoomInstance.getTransform().scale);
        clampPanToViewport();

        // En pan y zoom: marcar arrastre, recalcular tamaño y límites.
        mapaPanzoomInstance.on('pan', () => {
            movedByPan = true;
            clampPanToViewport();
        });
        mapaPanzoomInstance.on('zoom', () => {
            movedByPan = true;
            const { scale } = mapaPanzoomInstance.getTransform();
            updateMarkerScale(scale);
            clampPanToViewport();
        });
    } catch (err) {
        console.error('Error al renderizar mapa interactivo:', err);
        mapaViewport.innerHTML = `
            <div class="d-flex justify-content-center align-items-center h-100 text-white-50 px-3 text-center">
                No se pudo cargar el mapa del rocódromo.
            </div>
        `;
    }
}

export async function mapaZonaCmd(container, idRocodromo, initialZonaId = null) {
    if (!idRocodromo) {
        showError('ID de rocódromo no válido o no proporcionado');
        return;
    }

    showLoading();

    try {
        // 1. Obtener información del rocódromo
        let rocodromo = { id: idRocodromo, nombre: `Rocódromo ${idRocodromo}` };
        try {
            const rocodromoRes = await fetchClient(`/rocodromos/${idRocodromo}`);
            rocodromo = await rocodromoRes.json();
        } catch (err) {
            console.warn('No se pudo obtener info del rocódromo:', err.message);
        }

        // 2. Obtener lista de zonas del rocódromo
        let zonas = [];
        try {
            const zonasRes = await fetchClient(`/rocodromos/zonas/${idRocodromo}`);
            zonas = await zonasRes.json();
        } catch (err) {
            console.warn('No se pudieron obtener las zonas:', err.message);
        }

        // Renderizar la vista inicial
        renderMapaZona(
            container,
            { rocodromo, zonas },
            async (idZona) => {
                return await cargarRutasZona(idZona);
            },
            initialZonaId,
            async (_idZona, rutas) => {
                await renderMapaInteractivoZona(container, rutas);
            },
            () => {
                // Esperar a que el DOM aplique el nuevo tamano antes de resetear pan/zoom.
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        resetMapaZoom();
                    });
                });
            }
        );

    } catch (err) {
        showError(`Error al cargar el mapa de zona: ${err.message}`);
    }
}

/**
 * Función auxiliar para obtener las rutas de una zona
 * @param {number} idZona ID de la zona
 * @returns {Promise<Array>} Lista de rutas
 */
async function cargarRutasZona(idZona) {
    try {
        const rutasRes = await fetchClient(`/zonas/pistas/${idZona}`);
        const rutas = await rutasRes.json();

        // Mapear configuración de estado para la vista
        return rutas.map(ruta => ({
            ...ruta,
            statusConfig: ESTADOS_CONFIG[ruta.estado] || ESTADOS_CONFIG['S/N']
        }));
    } catch (err) {
        console.error(`Error al cargar rutas de la zona ${idZona}:`, err);
        return [];
    }
}

// Controlador para la vista de crear una nueva zona
export function crearZonaCmd(container) {
    const callbacks = {
        onSubmit: async (values, fields) => {
            const { idRocodromoInput, nombreInput } = fields;

            // Simple validación frontend
            if (!values.idRoco) {
                idRocodromoInput.classList.add('is-invalid');
                return;
            }
            if (!values.nombre) {
                nombreInput.classList.add('is-invalid');
                return;
            }

            showLoading();

            try {
                // Backend expects: { idRoco, nombre }
                await fetchClient('/zonas/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...values,
                        idRoco: Number(values.idRoco)
                    }),
                });

                // Redirigir al mapa de la zona recien creada (o del rocódromo)
                // Como mapaZona requiere idRocodromo, y zona tiene idRoco (o similar), usamos eso.
                // Asumimos que zona.idRocodromo viene en la respuesta, o usamos values.idRoco
                const idRocodromo = values.idRoco;
                window.location.hash = `#mapaZona?id=${idRocodromo}`;

            } catch (err) {
                renderCrearZona(container, callbacks);

                // Recuperar referencias
                const newAlertBox = container.querySelector('#form-alert');
                if (newAlertBox) {
                    newAlertBox.textContent = `Error: ${err.message}`;
                    newAlertBox.classList.remove('d-none');
                    newAlertBox.classList.add('alert-danger');
                }
            }
        }
    };

    renderCrearZona(container, callbacks);
}
