import { renderMapaZona, renderCrearZona } from './zonaView.js';
import { ESTADOS_CONFIG, loadColorScaleMap, resolveColorScaleRgb } from '../../components/climbingConfig.js';
import { createSvgPanzoomMap } from '../../components/svgPanzoomMap.js';
import { fetchClient, canManageRocodromo, fetchImageObjectUrl, fetchSvgText } from '../../core/client.js';
import { showLoading, showError } from '../../core/ui.js';

/**
* Controlador para la vista de mapa de zona
* Muestra el mapa del rocódromo y permite seleccionar una zona para ver sus rutas
* @param {HTMLElement} container Contenedor donde renderizar la vista
* @param {number} idRocodromo ID del rocódromo
*/
const RUTA_IMAGE_PLACEHOLDER = '/assets/placeholder.jpg';
const ZONA_FILTERS_STORAGE_PREFIX = 'mapaZona:filtros';

function normalizeDificultades(dificultades) {
    if (!Array.isArray(dificultades)) return [];

    return dificultades
        .map((value) => String(value ?? '').trim())
        .filter((value) => value.length > 0);
}

function buildDificultadOptions(escala) {
    const dificultades = normalizeDificultades(escala?.dificultades);

    return dificultades.map((dificultad) => {
        return {
            value: dificultad,
            label: dificultad,
        };
    });
}

function normalizeTipo(tipo) {
    const normalized = String(tipo || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();

    if (normalized === 'bloque' || normalized === 'boulder') return 'boulder';
    if (normalized === 'via') return 'via';
    return normalized;
}

function buildZonaFiltersStorageKey(idRocodromo) {
    return `${ZONA_FILTERS_STORAGE_PREFIX}:${idRocodromo}`;
}

function normalizeFiltrosState(rawFiltros, dificultadOrderByTipo = null) {
    const rawTipo = normalizeTipo(rawFiltros?.tipo || 'all');
    const tipo = rawTipo === 'boulder' || rawTipo === 'via' ? rawTipo : 'all';

    if (tipo === 'all') {
        return {
            tipo: 'all',
            dificultadMin: '',
            dificultadMax: '',
        };
    }

    let dificultadMin = String(rawFiltros?.dificultadMin || '').trim();
    let dificultadMax = String(rawFiltros?.dificultadMax || '').trim();

    const order = Array.isArray(dificultadOrderByTipo?.[tipo])
        ? dificultadOrderByTipo[tipo]
        : null;

    if (order) {
        const validValues = new Set(order);
        if (dificultadMin && !validValues.has(dificultadMin)) {
            dificultadMin = '';
        }
        if (dificultadMax && !validValues.has(dificultadMax)) {
            dificultadMax = '';
        }

        if (dificultadMin && dificultadMax) {
            const minIndex = order.indexOf(dificultadMin);
            const maxIndex = order.indexOf(dificultadMax);

            if (minIndex > -1 && maxIndex > -1 && minIndex > maxIndex) {
                dificultadMax = dificultadMin;
            }
        }
    }

    return {
        tipo,
        dificultadMin,
        dificultadMax,
    };
}

function loadZonaFilters(idRocodromo) {
    try {
        const key = buildZonaFiltersStorageKey(idRocodromo);
        const storedValue = localStorage.getItem(key);

        if (!storedValue) {
            return normalizeFiltrosState(null);
        }

        const parsed = JSON.parse(storedValue);
        return normalizeFiltrosState(parsed);
    } catch {
        return normalizeFiltrosState(null);
    }
}

function saveZonaFilters(idRocodromo, filtros) {
    try {
        const key = buildZonaFiltersStorageKey(idRocodromo);
        localStorage.setItem(key, JSON.stringify(filtros));
    } catch {
        // Ignorar errores de persistencia (modo privado, quota, etc.).
    }
}

function buildFilterIndexByTipo(dificultadOrderByTipo) {
    return {
        boulder: new Map((dificultadOrderByTipo.boulder || []).map((value, index) => [value, index])),
        via: new Map((dificultadOrderByTipo.via || []).map((value, index) => [value, index])),
    };
}

function filterRutas(rutas, filtros, dificultadIndexByTipo) {
    const tipoFiltro = normalizeTipo(filtros?.tipo || 'all');
    const dificultadMin = String(filtros?.dificultadMin || '').trim();
    const dificultadMax = String(filtros?.dificultadMax || '').trim();

    return (Array.isArray(rutas) ? rutas : []).filter((ruta) => {
        const tipoRuta = normalizeTipo(ruta?.tipo);

        if (tipoFiltro !== 'all' && tipoFiltro !== tipoRuta) {
            return false;
        }

        if (tipoFiltro === 'all' || (!dificultadMin && !dificultadMax)) {
            return true;
        }

        const dificultadRuta = String(ruta?.dificultad || '').trim();
        const difficultyMap = dificultadIndexByTipo[tipoFiltro] || new Map();
        const routeIndex = difficultyMap.get(dificultadRuta);

        if (!Number.isInteger(routeIndex)) {
            return false;
        }

        const minIndex = dificultadMin ? difficultyMap.get(dificultadMin) : null;
        const maxIndex = dificultadMax ? difficultyMap.get(dificultadMax) : null;

        if (Number.isInteger(minIndex) && routeIndex < minIndex) {
            return false;
        }

        if (Number.isInteger(maxIndex) && routeIndex > maxIndex) {
            return false;
        }

        return true;
    });
}

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

function resolveRutaColorPresasRgb(ruta, colorScaleMap) {
    const colorName = ruta?.colorPresas || ruta?.color || ruta?.dificultad;
    return resolveColorScaleRgb(colorName, colorScaleMap);
}

export async function mapaZonaCmd(container, idRocodromo, initialZonaId = null) {
    if (!idRocodromo) {
        showError('ID de rocódromo no válido o no proporcionado');
        return;
    }
    
    showLoading();
    
    const canCreateRuta = canManageRocodromo(idRocodromo);
    
    try {
        // Obtener información del rocódromo
        let rocodromo = { id: idRocodromo, nombre: `Rocódromo ${idRocodromo}` };
        try {
            const rocodromoRes = await fetchClient(`/rocodromos/${idRocodromo}`);
            rocodromo = await rocodromoRes.json();
        } catch (err) {
            console.warn('No se pudo obtener info del rocódromo:', err.message);
        }

        rocodromo.id = rocodromo?.id || idRocodromo;
        rocodromo.nombre = rocodromo?.nombre || `Rocódromo ${idRocodromo}`;
        
        if (rocodromo?.logoUrl) {
            try {
                rocodromo.logoSrc = await fetchImageObjectUrl(`/rocodromos/${idRocodromo}/logo`);
            } catch (err) {
                console.warn('No se pudo cargar el logo del rocódromo:', err.message);
            }
        }
        
        // Obtener lista de zonas del rocódromo
        let zonas = [];
        try {
            const zonasRes = await fetchClient(`/rocodromos/zonas/${idRocodromo}`);
            zonas = await zonasRes.json();
        } catch (err) {
            console.warn('No se pudieron obtener las zonas:', err.message);
        }
        
        const colorScaleMap = await loadColorScaleMap();

        let mapaInteractivo = null;
        let mapaSourceKey = null;
        const mapaCache = new Map();
        const rutasCache = new Map();
        let dificultadOptionsByTipo = {
            boulder: [],
            via: [],
        };
        const filtrosActivos = loadZonaFilters(idRocodromo);

        try {
            const escalasRes = await fetchClient(`/rocodromos/${idRocodromo}/escalasDificultad`);
            const escalas = await escalasRes.json();

            dificultadOptionsByTipo = {
                boulder: buildDificultadOptions(escalas?.escalaDificultadBloque),
                via: buildDificultadOptions(escalas?.escalaDificultadVia),
            };
        } catch (err) {
            console.warn('No se pudieron cargar las escalas de dificultad del rocódromo:', err.message);
        }

        const dificultadOrderByTipo = {
            boulder: dificultadOptionsByTipo.boulder.map((item) => item.value),
            via: dificultadOptionsByTipo.via.map((item) => item.value),
        };

        Object.assign(filtrosActivos, normalizeFiltrosState(filtrosActivos, dificultadOrderByTipo));
        saveZonaFilters(idRocodromo, filtrosActivos);

        const dificultadIndexByTipo = buildFilterIndexByTipo(dificultadOrderByTipo);

        const getRutasZonaRaw = async (idZona) => {
            if (!idZona) return [];

            if (!rutasCache.has(idZona)) {
                const rutas = await cargarRutasZona(idZona, colorScaleMap);
                rutasCache.set(idZona, rutas);
            }

            return rutasCache.get(idZona) || [];
        };

        const getRutasZonaFiltradas = async (idZona) => {
            const rutasRaw = await getRutasZonaRaw(idZona);
            return filterRutas(rutasRaw, filtrosActivos, dificultadIndexByTipo);
        };
        
        // Renderizar la vista inicial
        renderMapaZona(
            container,
            {
                rocodromo,
                zonas,
                canCreateRuta,
                dificultadOptionsByTipo,
                filtrosActivos,
            },
            async (idZona) => {
                return await getRutasZonaFiltradas(idZona);
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
            },
            async (nextFiltros) => {
                // Estado de filtros centralizado para mantener mapa y tarjetas sincronizados.
                Object.assign(filtrosActivos, normalizeFiltrosState(nextFiltros, dificultadOrderByTipo));
                saveZonaFilters(idRocodromo, filtrosActivos);
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
async function cargarRutasZona(idZona, colorScaleMap = {}) {
    try {
        const rutasRes = await fetchClient(`/zonas/pistas/${idZona}`);
        const rutas = await rutasRes.json();
        
        // Mapear configuración de estado para la vista
        const rutasConImagen = await Promise.all(
            rutas.map(async (ruta) => ({
                ...ruta,
                statusConfig: ESTADOS_CONFIG[ruta.estado] || ESTADOS_CONFIG.nada,
                colorPresasRgb: resolveRutaColorPresasRgb(ruta, colorScaleMap),
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
                
                // Redirigir al mapa de la zona recien creada 
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
