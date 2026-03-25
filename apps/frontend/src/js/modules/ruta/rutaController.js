import { renderCrearRuta, renderInfoRuta } from './rutaView.js';
import { createSvgPanzoomMap } from '../../components/svgPanzoomMap.js';
import { fetchClient, canManageRocodromo } from '../../core/client.js';
import { showError, showLoading, showFormAlert, clearFormAlert, setFieldError, clearFieldError } from '../../core/ui.js';

// Escala de grados para validación
const GRADOS_FRANCESES = [
    '3', '4',
    '5a', '5a+', '5b', '5b+', '5c', '5c+',
    '6a', '6a+', '6b', '6b+', '6c', '6c+',
    '7a', '7a+', '7b', '7b+', '7c', '7c+',
    '8a', '8a+', '8b', '8b+', '8c', '8c+',
    '9a', '9a+', '9b', '9b+', '9c', '9c+',
];

const TIPOS_PISTA = ['boulder', 'via'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

// Configuración de estados para la vista de ruta
const ESTADOS_CONFIG = {
    'flash': { icon: 'bolt', color: '#d97706', bg: '#fef3c7', texto: 'Flash' },
    'completado': { icon: 'done', color: '#16a34a', bg: '#dcfce7', texto: 'Completado' },
    'en-progreso': { icon: 'sync', color: '#2563eb', bg: '#dbeafe', texto: 'En proyecto' },
    'nada': { icon: 'remove', color: '#6b7280', bg: '#e5e7eb', texto: 'Sin registrar' }
};

// Mapeo de estados del frontend a estados del backend
const ESTADOS_BACKEND = {
    'flash': 'Flash',
    'completado': 'Completado',
    'en-progreso': 'Proyecto',
    'nada': 'S/N'
};

function toIsoDateOrNull(value) {
    if (!value) return null;

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
        return null;
    }

    return parsedDate.toISOString();
}

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
function validateFields(values, selectedPoint) {
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
    if (!GRADOS_FRANCESES.includes(dificultad)) {
        errors.dificultad = `dificultad debe ser uno de: ${GRADOS_FRANCESES.join(', ')}`;
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
            }
        } catch (err) {
            contextError = `No se pudo validar la zona indicada: ${err.message}`;
        }
    }

    let selectedPoint = null;
    let mapaSelector = null;

    const callbacks = {
        // Limpiar errores al modificar un campo
        onFieldChange: (field, alertBox) => {
            clearFieldError(field);
            clearFormAlert(alertBox);
        },

        onViewReady: ({ mapaViewport, coordsBadge, alertBox }) => {
            updateCoordinatesBadge(coordsBadge, selectedPoint);

            if (contextError || !mapaViewport) {
                if (contextError) {
                    showFormAlert(alertBox, 'warning', contextError);
                }
                return;
            }

            mapaSelector = createSvgPanzoomMap({
                viewport: mapaViewport,
                svgAssetUrl: '/assets/Roco.svg',
                enablePointSelection: true,
                onMapPointSelect: (point) => {
                    selectedPoint = point;
                    updateCoordinatesBadge(coordsBadge, point);
                    clearFormAlert(alertBox);
                },
            });

            mapaSelector
                .renderMarkers([])
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

        // Enviar formulario
        onSubmit: async (values, fields) => {
            const {
                nombreInput,
                dificultadSelect,
                tipoSelect,
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

            clearFormAlert(alertBox);
            [nombreInput, dificultadSelect, tipoSelect, fechaCreacionInput, fechaRetiradaInput, imagenInput].forEach(clearFieldError);

            // Validar campos
            const errors = validateFields(values, selectedPoint);
            if (Object.keys(errors).length > 0) {
                if (errors.nombre) setFieldError(nombreInput, errors.nombre);
                if (errors.dificultad) setFieldError(dificultadSelect, errors.dificultad);
                if (errors.tipo) setFieldError(tipoSelect, errors.tipo);
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
            formData.append('dificultad', values.dificultad.trim());
            formData.append('tipo', values.tipo.trim());
            formData.append('posX', String(selectedPoint.x));
            formData.append('posY', String(selectedPoint.y));

            const nombre = (values.nombre || '').trim();
            if (nombre) {
                formData.append('nombre', nombre);
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
                    if (Array.isArray(body.errors)) {
                        body.errors.forEach((e) => {
                            const field = e.field;
                            const msg = e.msg || 'Valor invalido';

                            if (field === 'nombre') setFieldError(nombreInput, msg);
                            if (field === 'dificultad') setFieldError(dificultadSelect, msg);
                            if (field === 'tipo') setFieldError(tipoSelect, msg);
                            if (field === 'fechaCreacion') setFieldError(fechaCreacionInput, msg);
                            if (field === 'fechaRetirada') setFieldError(fechaRetiradaInput, msg);
                            if (field === 'imagen') setFieldError(imagenInput, msg);
                        });
                    }
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
    });
}

// Mapeo de estados del backend a estados del frontend
const ESTADOS_FRONTEND = {
    'flash': 'flash',
    'completado': 'completado',
    'proyecto': 'en-progreso',
    'S/N': 'nada'
};

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

        const callbacks = {
            onEstadoChange: async (estado, estadoElement, estadoTextoElement) => {
                const config = ESTADOS_CONFIG[estado] || ESTADOS_CONFIG['nada'];
                const estadoBackend = ESTADOS_BACKEND[estado] || 'S/N';

                // Actualizar UI inmediatamente para mejor UX
                estadoElement.style.background = config.bg;
                estadoElement.innerHTML = `<span class="material-icons" style="color: ${config.color}; font-size: 28px;">${config.icon}</span>`;

                try {
                    await fetchClient(`/pistas/cambiar-estado/${ruta.id}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ estado: estadoBackend })
                    });
                } catch (err) {
                    // Revertir UI en caso de error
                    const prevConfig = ESTADOS_CONFIG['nada'];
                    estadoElement.style.background = prevConfig.bg;
                    estadoElement.innerHTML = `<span class="material-icons" style="color: ${prevConfig.color}; font-size: 28px;">${prevConfig.icon}</span>`;
                    estadoTextoElement.textContent = 'Sin registrar';
                    showError(`Error al cambiar estado: ${err.message}`);
                }
            }
        };

        renderInfoRuta(container, ruta, callbacks);

        // Inicializar el estado actual del escalador en la UI
        if (ruta.estado) {
            const estadoFrontend = ESTADOS_FRONTEND[ruta.estado] || 'nada';
            const config = ESTADOS_CONFIG[estadoFrontend] || ESTADOS_CONFIG['nada'];
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
