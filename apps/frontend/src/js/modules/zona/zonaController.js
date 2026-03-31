import { renderMapaZona, renderCrearZona } from './zonaView.js';
import { createSvgPanzoomMap } from '../../components/svgPanzoomMap.js';
import { fetchClient, canManageRocodromo, fetchImageObjectUrl, fetchSvgText } from '../../core/client.js';
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

const RUTA_IMAGE_PLACEHOLDER = '/assets/placeholder.jpg';

async function resolveRutaImageSrc(ruta) {
    if (!ruta?.imagenUrl) {
        return RUTA_IMAGE_PLACEHOLDER;
    }

    try {
        return await fetchImageObjectUrl(`/pistas/${ruta.id}/imagen`);
    } catch (err) {
        console.warn('No se pudo cargar la imagen de la ruta:', err.message);
        return RUTA_IMAGE_PLACEHOLDER;
    }
}

export async function mapaZonaCmd(container, idRocodromo, initialZonaId = null) {
    if (!idRocodromo) {
        showError('ID de rocódromo no válido o no proporcionado');
        return;
    }

    showLoading();

    const canCreateRuta = canManageRocodromo(idRocodromo);

    try {
        // 1. Obtener información del rocódromo
        let rocodromo = { id: idRocodromo, nombre: `Rocódromo ${idRocodromo}` };
        try {
            const rocodromoRes = await fetchClient(`/rocodromos/${idRocodromo}`);
            rocodromo = await rocodromoRes.json();
        } catch (err) {
            console.warn('No se pudo obtener info del rocódromo:', err.message);
        }

        if (rocodromo?.logoUrl) {
            try {
                rocodromo.logoSrc = await fetchImageObjectUrl(`/rocodromos/${idRocodromo}/logo`);
            } catch (err) {
                console.warn('No se pudo cargar el logo del rocódromo:', err.message);
            }
        }

        // 2. Obtener lista de zonas del rocódromo
        let zonas = [];
        try {
            const zonasRes = await fetchClient(`/rocodromos/zonas/${idRocodromo}`);
            zonas = await zonasRes.json();
        } catch (err) {
            console.warn('No se pudieron obtener las zonas:', err.message);
        }

        let mapaInteractivo = null;
        let mapaSourceKey = null;
        const mapaCache = new Map();

        // Renderizar la vista inicial
        renderMapaZona(
            container,
            { rocodromo, zonas, canCreateRuta },
            async (idZona) => {
                return await cargarRutasZona(idZona);
            },
            initialZonaId,
            async (idZona, rutas) => {
                const mapaViewport = container.querySelector('#mapaSvgViewport');
                if (!mapaViewport) return;

                const zona = zonas.find((z) => z.id == idZona);
                let zonaSvgContent = null;

                if (zona?.mapa) {
                    if (mapaCache.has(idZona)) {
                        zonaSvgContent = mapaCache.get(idZona);
                    } else {
                        try {
                            zonaSvgContent = await fetchSvgText(`/zonas/${idZona}/mapa`);
                            mapaCache.set(idZona, zonaSvgContent);
                        } catch (err) {
                            console.warn('No se pudo cargar el mapa de la zona:', err.message);
                        }
                    }
                }

                const nextMapKey = zonaSvgContent ? `zona-svg-${idZona}` : 'default-svg';

                if (!mapaInteractivo || mapaSourceKey !== nextMapKey) {
                    if (mapaInteractivo) {
                        mapaInteractivo.dispose();
                    }

                    mapaInteractivo = createSvgPanzoomMap({
                        viewport: mapaViewport,
                        svgAssetUrl: '/assets/Roco.svg',
                        svgContent: zonaSvgContent,
                        onMarkerClick: (ruta) => {
                            window.location.hash = `#infoRuta?id=${ruta.id}`;
                        },
                    });

                    mapaSourceKey = nextMapKey;
                }

                await mapaInteractivo.renderMarkers(rutas || []);
            },
            () => {
                // Esperar a que el DOM aplique el nuevo tamano antes de resetear pan/zoom.
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        if (mapaInteractivo) {
                            mapaInteractivo.reset();
                        }
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
        const rutasConImagen = await Promise.all(
            rutas.map(async (ruta) => ({
                ...ruta,
                statusConfig: ESTADOS_CONFIG[ruta.estado] || ESTADOS_CONFIG['S/N'],
                imagenSrc: await resolveRutaImageSrc(ruta),
            }))
        );

        return rutasConImagen;
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
