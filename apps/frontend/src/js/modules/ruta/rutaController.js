import { renderCrearRuta, renderInfoRuta } from './rutaView.js';

import { createSvgPanzoomMap } from '../../components/svgPanzoomMap.js';
import {
    ESTADOS_BACKEND,
    ESTADOS_CONFIG,
    ESTADOS_FRONTEND,
    loadColorScaleMap,
    getEstadoConfig,
    normalizeColorName,
    resolveColorScaleRgb,
} from '../../components/climbingConfig.js';
import { showConfirmModal } from '../../components/modal.js';
import { fetchClient, canManageRocodromo, fetchImageObjectUrl, fetchSvgText, getTokenPayload } from '../../core/client.js';
import { showError, showLoading, showFormAlert, clearFormAlert, setFieldError, clearFieldError } from '../../core/ui.js';
import { showToast } from '../../components/toast.js';

const RUTA_IMAGE_PLACEHOLDER = '/assets/placeholder.jpg';

const TIPOS_PISTA = ['boulder', 'via'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

function canRateRutaByEstado(estado) {
    const normalizedState = ESTADOS_FRONTEND[estado] || estado;
    return normalizedState === 'flash' || normalizedState === 'completado';
}

function mapValoracionTotalToFiveStars(valoracionTotal) {
    const numericValue = Number(valoracionTotal);
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
        return 0;
    }

    return Math.max(0, Math.min(5, numericValue / 2));
}

async function obtenerResumenValoracionPista(idPista) {
    try {
        const response = await fetchClient(`/pistas/${idPista}/valoracionTotal`);
        const payload = await response.json();

        return {
            averageRating: mapValoracionTotalToFiveStars(payload?.valoracionTotal),
            numValoraciones: Number(payload?.numValoraciones) || 0,
        };
    } catch (err) {
        console.warn(`No se pudo obtener la valoracion total de la pista ${idPista}:`, err.message);
        return {
            averageRating: 0,
            numValoraciones: 0,
        };
    }
}

async function extractBackendErrorMessage(error, fallbackMessage) {
    if (!error?.response) {
        return fallbackMessage;
    }

    try {
        const body = await error.response.json();
        if (Array.isArray(body?.errors) && body.errors[0]?.msg) {
            return body.errors[0].msg;
        }

        if (typeof body?.error === 'string' && body.error.trim()) {
            return body.error;
        }
    } catch {
        // No se pudo parsear el cuerpo de error, usar fallback.
    }

    return fallbackMessage;
}

function normalizeDificultades(dificultades) {
    if (!Array.isArray(dificultades)) return [];
    return dificultades
        .map((value) => String(value ?? '').trim())
        .filter((value) => value.length > 0);
}

function formatColorLabel(value) {
    return normalizeColorName(value);
}

function buildDificultadOptions(escala, colorScaleMap) {
    const dificultades = normalizeDificultades(escala?.dificultades);

    if (!escala?.isColor) {
        return dificultades.map((dificultad) => ({
            value: dificultad,
            label: dificultad,
        }));
    }

    return dificultades.map((colorName) => ({
        value: colorName,
        label: formatColorLabel(colorName) || colorName,
    }));
}

function buildColorPresasOptions(colorScaleMap) {
    return Object.keys(colorScaleMap || {})
        .map((colorName) => ({
            value: normalizeColorName(colorName),
            label: normalizeColorName(colorName),
        }))
        .filter((option) => option.value.length > 0);
}

function setTipoFieldError(container, message) {
    const tipoWrapper = container.querySelector('#tipo-wrapper');
    if (!tipoWrapper) return;

    tipoWrapper.classList.add('is-invalid');
    const feedback = tipoWrapper.querySelector('.invalid-feedback');
    if (feedback) {
        feedback.textContent = message;
    }
}

function applyServerValidationErrors(validationErrors, fields, container) {
    if (!Array.isArray(validationErrors)) return;

    const {
        nombreInput,
        dificultadSelect,
        colorPresasSelect,
        fechaCreacionInput,
        fechaRetiradaInput,
        imagenInput,
    } = fields;

    validationErrors.forEach((errorItem) => {
        const field = errorItem.field;
        const msg = errorItem.msg || 'Valor invalido';

        if (field === 'nombre') setFieldError(nombreInput, msg);
        if (field === 'dificultad') setFieldError(dificultadSelect, msg);
        if (field === 'colorPresas') setFieldError(colorPresasSelect, msg);
        if (field === 'tipo') setTipoFieldError(container, msg);
        if (field === 'fechaCreacion') setFieldError(fechaCreacionInput, msg);
        if (field === 'fechaRetirada') setFieldError(fechaRetiradaInput, msg);
        if (field === 'imagen') setFieldError(imagenInput, msg);
    });
}

function clearRouteFormFieldErrors(fields) {
    fields.forEach((field) => clearFieldError(field));
}

function isRutaActiva(ruta) {
    if (typeof ruta?.activo === 'boolean') {
        return ruta.activo;
    }

    if (!ruta?.fechaRetirada) {
        return true;
    }

    const retirada = new Date(ruta.fechaRetirada);
    if (Number.isNaN(retirada.getTime())) {
        return true;
    }

    return retirada > new Date();
}

async function obtenerRutasActivasZona(idZona, colorScaleMap = {}) {
    if (!idZona) return [];

    try {
        const rutasRes = await fetchClient(`/zonas/pistas/${idZona}`);
        const rutas = await rutasRes.json();

        return (Array.isArray(rutas) ? rutas : [])
            .filter((ruta) => isRutaActiva(ruta))
            .map((ruta) => ({
                ...ruta,
                statusConfig: ESTADOS_CONFIG[ruta.estado] || ESTADOS_CONFIG.nada,
                colorPresasRgb: resolveColorScaleRgb(ruta?.colorPresas, colorScaleMap),
            }));
    } catch (err) {
        console.warn(`No se pudieron cargar las rutas activas de la zona ${idZona}:`, err.message);
        return [];
    }
}

async function resolveRocodromoContextByZonaId(idZona) {
    const zonaIdNum = Number(idZona);
    if (!Number.isInteger(zonaIdNum) || zonaIdNum < 1) {
        return null;
    }

    try {
        const rocodromosRes = await fetchClient('/rocodromos');
        const rocodromos = await rocodromosRes.json();
        const rocodromosList = Array.isArray(rocodromos) ? rocodromos : [];

        for (const rocodromo of rocodromosList) {
            const idRocodromo = Number(rocodromo?.id);
            if (!Number.isInteger(idRocodromo) || idRocodromo < 1) {
                continue;
            }

            try {
                const zonasRes = await fetchClient(`/rocodromos/zonas/${idRocodromo}`);
                const zonas = await zonasRes.json();
                const zonaMatch = Array.isArray(zonas)
                    ? zonas.find((zona) => Number(zona.id) === zonaIdNum)
                    : null;

                if (zonaMatch) {
                    return {
                        idRocodromo,
                        nombreRocodromo: rocodromo?.nombre || `Rocodromo ${idRocodromo}`,
                        nombreZona: zonaMatch.nombre || `${zonaIdNum}`,
                        zonaMapaDisponible: Boolean(zonaMatch.mapa),
                    };
                }
            } catch (err) {
                console.warn(`No se pudieron cargar zonas del rocodromo ${idRocodromo}:`, err.message);
            }
        }
    } catch (err) {
        console.warn('No se pudieron cargar los rocodromos para resolver la zona:', err.message);
    }

    return null;
}


// Función para verificar si el usuario puede gestionar la ruta basada en el ID de la zona
async function canManageRutaByZonaId(idZona) {
    const payload = getTokenPayload();
    if (!payload || !idZona) return false;

    if (payload.rol === 'Admin') {
        return true;
    }

    if (payload.rol !== 'Gestor') {
        return false;
    }

    // Validar que el gestor tiene permisos sobre el rocódromo al que pertenece la zona de la ruta
    const managedIds = Array.isArray(payload.rocodromosGestionados)
        ? payload.rocodromosGestionados.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0)
        : [];

    for (const idRocodromo of managedIds) {
        try {
            const zonasRes = await fetchClient(`/rocodromos/zonas/${idRocodromo}`);
            const zonas = await zonasRes.json();
            const match = Array.isArray(zonas) && zonas.some((zona) => Number(zona.id) === Number(idZona));
            if (match) {
                return true;
            }
        } catch (err) {
            console.warn(`No se pudieron cargar zonas para validar permisos del rocódromo ${idRocodromo}:`, err.message);
        }
    }

    return false;
}

// Función auxiliar para convertir una fecha a ISO o retornar null si no es válida
function toIsoDateOrNull(value) {
    if (!value) return null;

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
        return null;
    }

    return parsedDate.toISOString();
}

// Configuración de estados para los botones de la vista de ruta 
function updateCoordinatesBadge(coordsBadge, point) {
    if (!coordsBadge) return;

    if (!point) {
        coordsBadge.className = 'badge text-bg-light';
        coordsBadge.textContent = 'Sin punto';
        return;
    }

    coordsBadge.className = 'badge text-bg-success';
    coordsBadge.textContent = `posX: ${point.x} | posY: ${point.y}`;
}

// Validación de campos del formulario
function validateFields(values, selectedPoint, allowedDificultades = [], allowedColorPresas = []) {
    const errors = {};
    const idZonaNum = Number(values.idZona);
    if (!Number.isInteger(idZonaNum) || idZonaNum < 1) {
        errors.idZona = 'idZona debe ser un entero positivo';
    }

    const nombre = (values.nombre || '').trim();
    if (nombre.length > 100) {
        errors.nombre = 'El nombre no puede superar los 100 caracteres';
    }

    const dificultad = (values.dificultad || '').trim();
    if (dificultad && !allowedDificultades.includes(dificultad)) {
        errors.dificultad = 'La dificultad seleccionada no pertenece a la escala del tipo elegido';
    }

    const colorPresas = (values.colorPresas || '').trim();
    if (colorPresas && !allowedColorPresas.includes(colorPresas)) {
        errors.colorPresas = 'Selecciona un color de presas valido';
    }

    const tipo = (values.tipo || '').trim();
    if (!TIPOS_PISTA.includes(tipo)) {
        errors.tipo = 'tipo debe ser uno de: boulder, via';
    }

    const fechaCreacionIso = toIsoDateOrNull(values.fechaCreacion);
    const fechaRetiradaIso = toIsoDateOrNull(values.fechaRetirada);
    const now = new Date();

    if (values.fechaCreacion && !fechaCreacionIso) {
        errors.fechaCreacion = 'Formato de fecha de creacion invalido';
    } else if (fechaCreacionIso && new Date(fechaCreacionIso) > now) {
        errors.fechaCreacion = 'La fecha de creacion no puede ser futura';
    }

    if (values.fechaRetirada && !fechaRetiradaIso) {
        errors.fechaRetirada = 'Formato de fecha de retirada invalido';
    } else if (fechaRetiradaIso && new Date(fechaRetiradaIso) <= now) {
        errors.fechaRetirada = 'La fecha de retirada debe ser posterior al momento actual';
    }

    if (!selectedPoint) {
        errors.posicion = 'Selecciona una posicion en el mapa para guardar posX y posY';
    }

    if (values.imagen) {
        if (!values.imagen.type.startsWith('image/')) {
            errors.imagen = 'La imagen debe ser un archivo de tipo imagen';
        }

        if (values.imagen.size > MAX_IMAGE_SIZE_BYTES) {
            errors.imagen = 'La imagen no puede superar los 5MB';
        }
    }

    return errors;
}

// Controlador para la vista de crear una nueva ruta
export async function crearRutaCmd(container, params = {}) {
    showLoading();

    const idRocodromo = Number(params.idRocodromo);
    const idZona = Number(params.idZona);

    if (!canManageRocodromo(idRocodromo)) {
        showError('No tienes permisos para crear rutas en este rocódromo.');
        return;
    }

    const hasValidParams = Number.isInteger(idRocodromo) && idRocodromo > 0 && Number.isInteger(idZona) && idZona > 0;

    let nombreRocodromo = hasValidParams ? `Rocodromo ${idRocodromo}` : 'Rocodromo';
    let nombreZona = hasValidParams ? `${idZona}` : 'N/D';
    let contextError = '';
    let zonaMapaSvg = null;
    let dificultadOptionsByTipo = {
        boulder: [],
        via: [],
    };
    const colorScaleMap = await loadColorScaleMap();
    const colorPresasOptions = buildColorPresasOptions(colorScaleMap);

    if (!hasValidParams) {
        contextError = 'La URL debe incluir idRocodromo e idZona validos para crear una ruta.';
    } else {
        try {
            const rocodromoRes = await fetchClient(`/rocodromos/${idRocodromo}`);
            const rocodromo = await rocodromoRes.json();
            nombreRocodromo = rocodromo?.nombre || nombreRocodromo;
        } catch (err) {
            console.warn('No se pudo cargar el nombre del rocodromo:', err.message);
        }

        try {
            const zonasRes = await fetchClient(`/rocodromos/zonas/${idRocodromo}`);
            const zonas = await zonasRes.json();
            const zonaActual = Array.isArray(zonas)
                ? zonas.find((z) => Number(z.id) === idZona)
                : null;

            if (!zonaActual) {
                contextError = 'La zona indicada no pertenece a este rocodromo o no existe.';
            } else {
                nombreZona = zonaActual.nombre || `${idZona}`;

                if (zonaActual.mapa) {
                    try {
                        zonaMapaSvg = await fetchSvgText(`/zonas/${idZona}/mapa`);
                    } catch (err) {
                        console.warn('No se pudo cargar el mapa de la zona:', err.message);
                    }
                }
            }
        } catch (err) {
            contextError = `No se pudo validar la zona indicada: ${err.message}`;
        }

        try {
            const escalasRes = await fetchClient(`/rocodromos/${idRocodromo}/escalasDificultad`);
            const escalas = await escalasRes.json();
            dificultadOptionsByTipo = {
                boulder: buildDificultadOptions(escalas?.escalaDificultadBloque, colorScaleMap),
                via: buildDificultadOptions(escalas?.escalaDificultadVia, colorScaleMap),
            };
        } catch (err) {
            console.warn('No se pudieron cargar las escalas de dificultad del rocodromo:', err.message);
        }
    }

    let selectedPoint = null;
    let mapaSelector = null;
    const rutasActivasZona = hasValidParams
        ? await obtenerRutasActivasZona(idZona, colorScaleMap)
        : [];

    const applyDificultadOptionsByTipo = (tipo, { dificultadSelect, setDificultadOptions }) => {
        const options = dificultadOptionsByTipo[tipo] || [];
        const hasTipo = tipo === 'boulder' || tipo === 'via';

        if (!hasTipo) {
            dificultadSelect.disabled = true;
            setDificultadOptions([], 'Selecciona tipo de ruta');
            return;
        }

        dificultadSelect.disabled = false;
        setDificultadOptions(options, 'Sin dificultad');
    };

    const callbacks = {
        // Limpiar errores al modificar un campo
        onFieldChange: (field, alertBox) => {
            clearFieldError(field);
            clearFormAlert(alertBox);
        },

        onViewReady: ({ mapaViewport, coordsBadge, alertBox, submitButton, dificultadSelect, tipoBoulderInput, tipoViaInput, setDificultadOptions, initialValues }) => {
            updateCoordinatesBadge(coordsBadge, selectedPoint);

            const selectedTipo = tipoBoulderInput.checked ? 'boulder' : tipoViaInput.checked ? 'via' : '';
            applyDificultadOptionsByTipo(selectedTipo, { dificultadSelect, setDificultadOptions });
            if (initialValues?.dificultad) {
                dificultadSelect.value = String(initialValues.dificultad);
            }

            if (contextError || !mapaViewport) {
                if (contextError) {
                    showFormAlert(alertBox, 'warning', contextError);
                }
                return;
            }

            if (!zonaMapaSvg) {
                mapaViewport.innerHTML = `
                    <div class="d-flex flex-column justify-content-center align-items-center h-100 text-white-50 text-center px-3">
                        <span class="material-icons mb-2" style="font-size: 32px;">map</span>
                        <p class="mb-1">No hay mapa para esta zona.</p>
                        <small>No se puede seleccionar la ubicacion.</small>
                    </div>
                `;
                if (coordsBadge) {
                    coordsBadge.className = 'badge text-bg-secondary';
                    coordsBadge.textContent = 'Sin mapa';
                }
                if (submitButton) {
                    submitButton.disabled = true;
                }
                return;
            }

            mapaSelector = createSvgPanzoomMap({
                viewport: mapaViewport,
                svgContent: zonaMapaSvg,
                enablePointSelection: true,
                onMapPointSelect: (point) => {
                    selectedPoint = point;
                    updateCoordinatesBadge(coordsBadge, point);
                    clearFormAlert(alertBox);
                },
            });

            mapaSelector
                .renderMarkers(rutasActivasZona)
                .then(() => {
                    if (selectedPoint) {
                        mapaSelector.setSelectedPoint(selectedPoint);
                        updateCoordinatesBadge(coordsBadge, selectedPoint);
                    }
                })
                .catch((err) => {
                    console.error('No se pudo inicializar el mapa para crear ruta:', err);
                    showFormAlert(alertBox, 'danger', 'No se pudo cargar el mapa para seleccionar la posicion.');
                });
        },

        onTipoChange: (tipo, { dificultadSelect, setDificultadOptions, alertBox }) => {
            applyDificultadOptionsByTipo(tipo, { dificultadSelect, setDificultadOptions });
            clearFieldError(dificultadSelect);
            clearFormAlert(alertBox);
        },

        // Enviar formulario
        onSubmit: async (values, fields) => {
            const {
                nombreInput,
                dificultadSelect,
                colorPresasSelect,
                tipoBoulderInput,
                tipoViaInput,
                fechaCreacionInput,
                fechaRetiradaInput,
                imagenInput,
                alertBox,
                submitButton,
            } = fields;

            if (contextError) {
                showFormAlert(alertBox, 'warning', contextError);
                return;
            }

            if (!zonaMapaSvg) {
                showFormAlert(alertBox, 'warning', 'No hay mapa para esta zona, no se puede seleccionar la ubicacion.');
                if (submitButton) {
                    submitButton.disabled = true;
                }
                return;
            }

            clearFormAlert(alertBox);
            clearRouteFormFieldErrors([
                nombreInput,
                dificultadSelect,
                colorPresasSelect,
                tipoBoulderInput,
                tipoViaInput,
                fechaCreacionInput,
                fechaRetiradaInput,
                imagenInput,
            ]);

            // Validar campos
            const allowedDificultades = (dificultadOptionsByTipo[values.tipo] || []).map((option) => option.value);
            const allowedColorPresas = colorPresasOptions.map((option) => option.value);
            const errors = validateFields(values, selectedPoint, allowedDificultades, allowedColorPresas);
            if (Object.keys(errors).length > 0) {
                if (errors.nombre) setFieldError(nombreInput, errors.nombre);
                if (errors.dificultad) setFieldError(dificultadSelect, errors.dificultad);
                if (errors.colorPresas) setFieldError(colorPresasSelect, errors.colorPresas);
                if (errors.tipo) {
                    setTipoFieldError(container, errors.tipo);
                }
                if (errors.fechaCreacion) setFieldError(fechaCreacionInput, errors.fechaCreacion);
                if (errors.fechaRetirada) setFieldError(fechaRetiradaInput, errors.fechaRetirada);
                if (errors.imagen) setFieldError(imagenInput, errors.imagen);

                if (errors.idZona) {
                    showFormAlert(alertBox, 'danger', errors.idZona);
                } else if (errors.posicion) {
                    showFormAlert(alertBox, 'danger', errors.posicion);
                } else {
                    showFormAlert(alertBox, 'danger', 'Por favor, corrige los campos marcados.');
                }

                return;
            }

            const formData = new FormData();
            formData.append('idZona', String(Number(values.idZona)));
            formData.append('tipo', values.tipo.trim());
            formData.append('posX', String(selectedPoint.x));
            formData.append('posY', String(selectedPoint.y));

            const dificultad = (values.dificultad || '').trim();
            if (dificultad) {
                formData.append('dificultad', dificultad);
            }

            const nombre = (values.nombre || '').trim();
            if (nombre) {
                formData.append('nombre', nombre);
            }

            const colorPresas = (values.colorPresas || '').trim();
            if (colorPresas) {
                formData.append('colorPresas', colorPresas);
            }

            const fechaCreacionIso = toIsoDateOrNull(values.fechaCreacion);
            const fechaRetiradaIso = toIsoDateOrNull(values.fechaRetirada);

            if (fechaCreacionIso) {
                formData.append('fechaCreacion', fechaCreacionIso);
            }

            if (fechaRetiradaIso) {
                formData.append('fechaRetirada', fechaRetiradaIso);
            }

            if (values.imagen) {
                formData.append('imagen', values.imagen);
            }

            submitButton.setAttribute('disabled', 'disabled');

            // Crear ruta
            try {
                const res = await fetchClient('/pistas/create', {
                    method: 'POST',
                    body: formData,
                });
                const ruta = await res.json();

                showFormAlert(alertBox, 'success', 'Ruta creada correctamente.');
                window.location.hash = `#infoRuta?id=${ruta.id}`;

            } catch (err) {
                // Manejar errores de validación del servidor (422)
                if (err.response && err.response.status === 422) {
                    const body = await err.response.json();
                    applyServerValidationErrors(body.errors, {
                        nombreInput,
                        dificultadSelect,
                        colorPresasSelect,
                        fechaCreacionInput,
                        fechaRetiradaInput,
                        imagenInput,
                    }, container);
                    showFormAlert(alertBox, 'danger', 'Solicitud invalida. Revisa los campos.');
                    return;
                }
                showFormAlert(alertBox, 'danger', `Error al crear ruta: ${err.message}`);
            } finally {
                submitButton.removeAttribute('disabled');
            }
        }
    };

    renderCrearRuta(container, callbacks, {
        idRocodromo,
        idZona,
        nombreRocodromo,
        nombreZona,
        contextError,
        colorPresasOptions,
    });
}

// Controlador para la vista de información de una ruta
export async function infoRutaCmd(container, id) {
    if (!id) {
        showError('Página no encontrada');
        return;
    }

    showLoading();

    try {
        const res = await fetchClient(`/pistas/${id}`);
        const ruta = await res.json();
        const idZonaRuta = Number(ruta?.idZona);
        const zonaContext = Number.isInteger(idZonaRuta) && idZonaRuta > 0
            ? await resolveRocodromoContextByZonaId(idZonaRuta)
            : null;

        if (zonaContext?.idRocodromo && Number.isInteger(idZonaRuta) && idZonaRuta > 0) {
            ruta.backHref = `#mapaZona?id=${zonaContext.idRocodromo}&zona=${idZonaRuta}`;
        } else {
            ruta.backHref = '#misRocodromos';
        }

        const colorScaleMap = await loadColorScaleMap();
        const ratingSummary = await obtenerResumenValoracionPista(ruta.id);
        ruta.canManage = await canManageRutaByZonaId(ruta.idZona);
        ruta.canRateRating = canRateRutaByEstado(ruta.estado);
        ruta.ratingSummary = ratingSummary;
        ruta.colorPresasRgb = resolveColorScaleRgb(ruta?.colorPresas, colorScaleMap);

        if (ruta?.imagenUrl) {
            try {
                ruta.imagenSrc = await fetchImageObjectUrl(`/pistas/${ruta.id}/imagen`);
            } catch (err) {
                console.warn('No se pudo cargar la imagen de la ruta:', err.message);
                ruta.imagenSrc = RUTA_IMAGE_PLACEHOLDER;
            }
        } else {
            ruta.imagenSrc = RUTA_IMAGE_PLACEHOLDER;
        }

        let ratingSectionController = null;

        const updateRatingAvailability = (estado) => {
            const canRate = canRateRutaByEstado(estado);
            ruta.canRateRating = canRate;

            if (ratingSectionController?.setCanRate) {
                ratingSectionController.setCanRate(canRate);
            }
        };

        const callbacks = {
            onEdit: () => {
                window.location.hash = `#modificarRuta?id=${ruta.id}`;
            },
            onEstadoChange: async (estado, estadoElement, estadoTextoElement) => {
                const config = getEstadoConfig(estado);
                const estadoBackend = ESTADOS_BACKEND[ESTADOS_FRONTEND[estado] || estado] || 'S/N';
                const prevEstado = ruta.estado;

                updateRatingAvailability(estado);

                // Actualizar UI inmediatamente para mejor UX
                estadoElement.style.background = config.bg;
                estadoElement.innerHTML = `<span class="material-icons" style="color: ${config.color}; font-size: 28px;">${config.icon}</span>`;

                try {
                    await fetchClient(`/pistas/cambiar-estado/${ruta.id}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ estado: estadoBackend })
                    });

                    ruta.estado = ESTADOS_FRONTEND[estado] || estado;
                } catch (err) {
                    // Revertir UI en caso de error
                    const prevConfig = getEstadoConfig(prevEstado || 'nada');
                    estadoElement.style.background = prevConfig.bg;
                    estadoElement.innerHTML = `<span class="material-icons" style="color: ${prevConfig.color}; font-size: 28px;">${prevConfig.icon}</span>`;
                    estadoTextoElement.textContent = prevConfig.texto;
                    updateRatingAvailability(prevEstado);
                    showError(`Error al cambiar estado: ${err.message}`);
                }
            },
            onRatingSave: async (selectedStars) => {
                if (!canRateRutaByEstado(ruta.estado)) {
                    throw new Error('Solo puedes valorar rutas marcadas como completadas o flash.');
                }

                const valoracion = Math.round(Number(selectedStars) * 2);

                try {
                    await fetchClient(`/pistas/${ruta.id}/valoracion`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ valoracion }),
                    });

                    const nextSummary = await obtenerResumenValoracionPista(ruta.id);
                    ruta.ratingSummary = nextSummary;
                    showToast('Valoracion guardada correctamente.', { variant: 'success' });

                    return {
                        summary: nextSummary,
                    };
                } catch (err) {
                    const message = await extractBackendErrorMessage(
                        err,
                        `Error al guardar valoracion: ${err.message}`
                    );
                    showToast(message, { variant: 'danger' });
                    throw new Error(message);
                }
            },
            onRatingReady: (controller) => {
                ratingSectionController = controller;
            },
            onRatingWarn: (message) => {
                showToast(message);
            },
            onRatingError: (message) => {
                showToast(message);
            },
            onDeleteRoute: async (rutaData, deleteButton) => {
                const confirmed = await showConfirmModal({
                    title: 'Eliminar ruta',
                    message: `¿Estás seguro de que deseas eliminar la ruta ${rutaData?.nombre || 'sin nombre'}? Esta acción no se puede deshacer.`,
                    confirmText: 'Eliminar',
                    cancelText: 'Cancelar',
                    confirmClass: 'btn-danger',
                });

                if (!confirmed) {
                    return;
                }

                if (deleteButton) {
                    deleteButton.disabled = true;
                }

                try {
                    await fetchClient(`/pistas/${ruta.id}`, {
                        method: 'DELETE',
                    });

                    window.location.hash = '#misRocodromos';
                } catch (err) {
                    if (deleteButton) {
                        deleteButton.disabled = false;
                    }
                    showError(`Error al eliminar la ruta: ${err.message}`);
                }
            }
        };

        renderInfoRuta(container, ruta, callbacks);

        // Inicializar el estado actual del escalador en la UI
        if (ruta.estado) {
            const estadoFrontend = ESTADOS_FRONTEND[ruta.estado] || 'nada';
            const config = getEstadoConfig(estadoFrontend);
            const estadoActual = container.querySelector('#estado-actual');
            const estadoTexto = container.querySelector('#estado-texto');

            if (estadoActual) {
                estadoActual.style.background = config.bg;
                estadoActual.innerHTML = `<span class="material-icons" style="color: ${config.color}; font-size: 28px;">${config.icon}</span>`;
            }
            if (estadoTexto) {
                estadoTexto.textContent = config.texto;
            }
        }
    } catch (err) {
        showError(`Error al obtener o procesar la ruta: ${err.message}`);
    }
}

export async function modificarRutaCmd(container, id) {
    const idRuta = Number(id);
    if (!Number.isInteger(idRuta) || idRuta < 1) {
        showError('ID de ruta no válido');
        return;
    }

    showLoading();

    try {
        const rutaRes = await fetchClient(`/pistas/${idRuta}`);
        const ruta = await rutaRes.json();

        const canManage = await canManageRutaByZonaId(ruta.idZona);
        if (!canManage) {
            showError('No tienes permisos para modificar esta ruta.');
            return;
        }

        const zonaContext = await resolveRocodromoContextByZonaId(ruta.idZona);
        const idRocodromo = zonaContext?.idRocodromo;
        const idZona = Number(ruta.idZona);

        const nombreRocodromo = zonaContext?.nombreRocodromo || 'Rocodromo';
        const nombreZona = zonaContext?.nombreZona || `${idZona}`;
        let contextError = '';
        let zonaMapaSvg = null;

        const hasValidParams = Number.isInteger(idRocodromo) && idRocodromo > 0 && Number.isInteger(idZona) && idZona > 0;
        if (!hasValidParams) {
            contextError = 'No se pudo resolver el rocódromo/zona de la ruta a modificar.';
        } else if (zonaContext?.zonaMapaDisponible) {
            try {
                zonaMapaSvg = await fetchSvgText(`/zonas/${idZona}/mapa`);
            } catch (err) {
                console.warn('No se pudo cargar el mapa de la zona:', err.message);
            }
        }

        const colorScaleMap = await loadColorScaleMap();
        const colorPresasOptions = buildColorPresasOptions(colorScaleMap);
        let dificultadOptionsByTipo = {
            boulder: [],
            via: [],
        };

        if (hasValidParams) {
            try {
                const escalasRes = await fetchClient(`/rocodromos/${idRocodromo}/escalasDificultad`);
                const escalas = await escalasRes.json();
                dificultadOptionsByTipo = {
                    boulder: buildDificultadOptions(escalas?.escalaDificultadBloque, colorScaleMap),
                    via: buildDificultadOptions(escalas?.escalaDificultadVia, colorScaleMap),
                };
            } catch (err) {
                console.warn('No se pudieron cargar las escalas de dificultad del rocodromo:', err.message);
            }
        }

        let selectedPoint = null;
        if (Number.isFinite(Number(ruta.posX)) && Number.isFinite(Number(ruta.posY))) {
            selectedPoint = {
                x: Number(ruta.posX),
                y: Number(ruta.posY),
            };
        }
        const rutasActivasZona = hasValidParams
            ? await obtenerRutasActivasZona(idZona, colorScaleMap)
            : [];

        const applyDificultadOptionsByTipo = (tipo, { dificultadSelect, setDificultadOptions }) => {
            const options = dificultadOptionsByTipo[tipo] || [];
            const hasTipo = tipo === 'boulder' || tipo === 'via';

            if (!hasTipo) {
                dificultadSelect.disabled = true;
                setDificultadOptions([], 'Selecciona tipo de ruta');
                return;
            }

            dificultadSelect.disabled = false;
            setDificultadOptions(options, 'Sin dificultad');
        };

        const callbacks = {
            onFieldChange: (field, alertBox) => {
                clearFieldError(field);
                clearFormAlert(alertBox);
            },

            onViewReady: ({ mapaViewport, coordsBadge, alertBox, submitButton, dificultadSelect, tipoBoulderInput, tipoViaInput, setDificultadOptions, initialValues }) => {
                updateCoordinatesBadge(coordsBadge, selectedPoint);

                const selectedTipo = tipoBoulderInput.checked ? 'boulder' : tipoViaInput.checked ? 'via' : '';
                applyDificultadOptionsByTipo(selectedTipo, { dificultadSelect, setDificultadOptions });
                if (initialValues?.dificultad) {
                    dificultadSelect.value = String(initialValues.dificultad);
                }

                if (contextError || !mapaViewport) {
                    if (contextError) {
                        showFormAlert(alertBox, 'warning', contextError);
                    }
                    return;
                }

                if (!zonaMapaSvg) {
                    mapaViewport.innerHTML = `
                        <div class="d-flex flex-column justify-content-center align-items-center h-100 text-white-50 text-center px-3">
                            <span class="material-icons mb-2" style="font-size: 32px;">map</span>
                            <p class="mb-1">No hay mapa para esta zona.</p>
                            <small>No se puede seleccionar la ubicacion.</small>
                        </div>
                    `;
                    if (coordsBadge) {
                        coordsBadge.className = 'badge text-bg-secondary';
                        coordsBadge.textContent = 'Sin mapa';
                    }
                    if (submitButton) {
                        submitButton.disabled = true;
                    }
                    return;
                }

                const mapaSelector = createSvgPanzoomMap({
                    viewport: mapaViewport,
                    svgContent: zonaMapaSvg,
                    enablePointSelection: true,
                    onMapPointSelect: (point) => {
                        selectedPoint = point;
                        updateCoordinatesBadge(coordsBadge, point);
                        clearFormAlert(alertBox);
                    },
                });

                mapaSelector
                    .renderMarkers(rutasActivasZona)
                    .then(() => {
                        if (selectedPoint) {
                            mapaSelector.setSelectedPoint(selectedPoint);
                            updateCoordinatesBadge(coordsBadge, selectedPoint);
                        }
                    })
                    .catch((err) => {
                        console.error('No se pudo inicializar el mapa para modificar ruta:', err);
                        showFormAlert(alertBox, 'danger', 'No se pudo cargar el mapa para seleccionar la posicion.');
                    });
            },

            onTipoChange: (tipo, { dificultadSelect, setDificultadOptions, alertBox }) => {
                applyDificultadOptionsByTipo(tipo, { dificultadSelect, setDificultadOptions });
                clearFieldError(dificultadSelect);
                clearFormAlert(alertBox);
            },

            onSubmit: async (values, fields) => {
                const {
                    nombreInput,
                    dificultadSelect,
                    colorPresasSelect,
                    tipoBoulderInput,
                    tipoViaInput,
                    fechaCreacionInput,
                    fechaRetiradaInput,
                    imagenInput,
                    alertBox,
                    submitButton,
                } = fields;

                if (contextError) {
                    showFormAlert(alertBox, 'warning', contextError);
                    return;
                }

                if (!zonaMapaSvg) {
                    showFormAlert(alertBox, 'warning', 'No hay mapa para esta zona, no se puede seleccionar la ubicacion.');
                    if (submitButton) {
                        submitButton.disabled = true;
                    }
                    return;
                }

                clearFormAlert(alertBox);
                clearRouteFormFieldErrors([
                    nombreInput,
                    dificultadSelect,
                    colorPresasSelect,
                    tipoBoulderInput,
                    tipoViaInput,
                    fechaCreacionInput,
                    fechaRetiradaInput,
                    imagenInput,
                ]);

                const allowedDificultades = (dificultadOptionsByTipo[values.tipo] || []).map((option) => option.value);
                const allowedColorPresas = colorPresasOptions.map((option) => option.value);
                const errors = validateFields(values, selectedPoint, allowedDificultades, allowedColorPresas);
                if (Object.keys(errors).length > 0) {
                    if (errors.nombre) setFieldError(nombreInput, errors.nombre);
                    if (errors.dificultad) setFieldError(dificultadSelect, errors.dificultad);
                    if (errors.colorPresas) setFieldError(colorPresasSelect, errors.colorPresas);
                    if (errors.tipo) {
                        setTipoFieldError(container, errors.tipo);
                    }
                    if (errors.fechaCreacion) setFieldError(fechaCreacionInput, errors.fechaCreacion);
                    if (errors.fechaRetirada) setFieldError(fechaRetiradaInput, errors.fechaRetirada);
                    if (errors.imagen) setFieldError(imagenInput, errors.imagen);

                    if (errors.idZona) {
                        showFormAlert(alertBox, 'danger', errors.idZona);
                    } else if (errors.posicion) {
                        showFormAlert(alertBox, 'danger', errors.posicion);
                    } else {
                        showFormAlert(alertBox, 'danger', 'Por favor, corrige los campos marcados.');
                    }

                    return;
                }

                const body = {
                    idZona: Number(values.idZona),
                    tipo: values.tipo.trim(),
                    posX: Number(selectedPoint.x),
                    posY: Number(selectedPoint.y),
                };

                const dificultad = (values.dificultad || '').trim();
                if (dificultad) {
                    body.dificultad = dificultad;
                }

                const nombre = (values.nombre || '').trim();
                if (nombre) {
                    body.nombre = nombre;
                }

                const colorPresas = (values.colorPresas || '').trim();
                if (colorPresas) {
                    body.colorPresas = colorPresas;
                }

                const fechaCreacionIso = toIsoDateOrNull(values.fechaCreacion);
                const fechaRetiradaIso = toIsoDateOrNull(values.fechaRetirada);
                if (fechaCreacionIso) {
                    body.fechaCreacion = fechaCreacionIso;
                }
                if (fechaRetiradaIso) {
                    body.fechaRetirada = fechaRetiradaIso;
                }

                submitButton.setAttribute('disabled', 'disabled');

                try {
                    await fetchClient(`/pistas/${idRuta}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body),
                    });

                    if (values.imagen) {
                        const imageFormData = new FormData();
                        imageFormData.append('imagen', values.imagen);
                        await fetchClient(`/pistas/${idRuta}/imagen`, {
                            method: 'PUT',
                            body: imageFormData,
                        });
                    }

                    showFormAlert(alertBox, 'success', 'Ruta modificada correctamente.');
                    window.location.hash = `#infoRuta?id=${idRuta}`;
                } catch (err) {
                    if (err.response && err.response.status === 422) {
                        const bodyError = await err.response.json();
                        applyServerValidationErrors(bodyError.errors, {
                            nombreInput,
                            dificultadSelect,
                            colorPresasSelect,
                            fechaCreacionInput,
                            fechaRetiradaInput,
                            imagenInput,
                        }, container);
                        showFormAlert(alertBox, 'danger', 'Solicitud invalida. Revisa los campos.');
                        return;
                    }

                    showFormAlert(alertBox, 'danger', `Error al modificar ruta: ${err.message}`);
                } finally {
                    submitButton.removeAttribute('disabled');
                }
            },
        };

        renderCrearRuta(container, callbacks, {
            idRocodromo,
            idZona,
            nombreRocodromo,
            nombreZona,
            contextError,
            mode: 'edit',
            initialValues: {
                nombre: ruta.nombre || '',
                dificultad: ruta.dificultad || '',
                colorPresas: ruta.colorPresas || '',
                tipo: ruta.tipo || '',
                fechaCreacion: ruta.fechaCreacion || null,
                fechaRetirada: ruta.fechaRetirada || null,
            },
            colorPresasOptions,
        });
    } catch (err) {
        showError(`Error al cargar la ruta para modificar: ${err.message}`);
    }
}
