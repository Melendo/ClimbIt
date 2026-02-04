import { renderCrearPista, renderInfoPista } from './pistaView.js';
import { fetchClient } from '../../core/client.js';
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

// Configuración de estados para la vista de pista
const ESTADOS_CONFIG = {
    'flash': { icon: 'bolt', color: '#d97706', bg: '#fef3c7', texto: 'Flash' },
    'completado': { icon: 'done', color: '#16a34a', bg: '#dcfce7', texto: 'Completado' },
    'en-progreso': { icon: 'sync', color: '#2563eb', bg: '#dbeafe', texto: 'En proyecto' },
    'nada': { icon: 'remove', color: '#6b7280', bg: '#e5e7eb', texto: 'Sin registrar' }
};

// Validación de campos del formulario
function validateFields(values) {
    const errors = {};
    const idRocoNum = Number(values.idRocodromo);
    if (!Number.isInteger(idRocoNum) || idRocoNum < 1) {
        errors.idRocodromo = 'idRocodromo debe ser un entero positivo';
    }
    const idZonaNum = Number(values.idZona);
    if (!Number.isInteger(idZonaNum) || idZonaNum < 1) {
        errors.idZona = 'idZona debe ser un entero positivo';
    }
    const nombre = (values.nombre || '').trim();
    if (!nombre) {
        errors.nombre = 'nombre es requerido';
    }
    const dificultad = (values.dificultad || '').trim();
    if (!GRADOS_FRANCESES.includes(dificultad)) {
        errors.dificultad = `dificultad debe ser uno de: ${GRADOS_FRANCESES.join(', ')}`;
    }
    return errors;
}

// Controlador para la vista de crear una nueva pista
export function crearPistaCmd(container) {
    const callbacks = {
        // Limpiar errores al modificar un campo
        onFieldChange: (field, alertBox) => {
            clearFieldError(field);
            clearFormAlert(alertBox);
        },

        // Cargar zonas cuando cambia el rocódromo
        onRocodromoChange: async (idRocodromoInput, idZonaInput, alertBox) => {
            const id = Number(idRocodromoInput.value);
            if (!Number.isInteger(id) || id < 1) {
                setFieldError(idRocodromoInput, 'idRocodromo debe ser un entero positivo');
                return;
            }

            idZonaInput.innerHTML = '';
            idZonaInput.setAttribute('disabled', 'disabled');

            try {
                const res = await fetchClient(`/rocodromos/zonas/${id}`);
                const zonas = await res.json();

                if (!Array.isArray(zonas) || zonas.length === 0) {
                    idZonaInput.innerHTML = `<option value="">No hay zonas disponibles</option>`;
                    showFormAlert(alertBox, 'warning', 'Este rocódromo no tiene zonas disponibles.');
                    return;
                }

                idZonaInput.innerHTML = zonas
                    .map((z) => `<option value="${z.id}">Zona ${z.id} - ${z.tipo || 'N/D'}</option>`)
                    .join('');
                idZonaInput.removeAttribute('disabled');
            } catch (err) {
                showFormAlert(alertBox, 'danger', `No se pudieron cargar las zonas: ${err.message}`);
            }
        },

        // Enviar formulario
        onSubmit: async (values, fields) => {
            const { idRocodromoInput, idZonaInput, nombreInput, dificultadSelect, alertBox } = fields;
            
            clearFormAlert(alertBox);
            [idZonaInput, nombreInput, dificultadSelect].forEach(clearFieldError);

            // Validar campos
            const errors = validateFields(values);
            if (Object.keys(errors).length > 0) {
                if (errors.idRocodromo) setFieldError(idRocodromoInput, errors.idRocodromo);
                if (errors.idZona) setFieldError(idZonaInput, errors.idZona);
                if (errors.nombre) setFieldError(nombreInput, errors.nombre);
                if (errors.dificultad) setFieldError(dificultadSelect, errors.dificultad);
                showFormAlert(alertBox, 'danger', 'Por favor, corrige los campos marcados.');
                return;
            }

            // Crear pista
            try {
                const res = await fetchClient('/pistas/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        idZona: Number(values.idZona),
                        nombre: values.nombre.trim(),
                        dificultad: values.dificultad,
                    }),
                });
                const pista = await res.json();

                showFormAlert(alertBox, 'success', 'Pista creada correctamente.');
                window.location.hash = `#infoPista?id=${pista.id}`;

            } catch (err) {
                // Manejar errores de validación del servidor (422)
                if (err.response && err.response.status === 422) {
                    const body = await err.response.json();
                    if (Array.isArray(body.errors)) {
                        body.errors.forEach((e) => {
                            const field = e.field;
                            const msg = e.msg || 'Valor inválido';
                            if (field === 'idZona') setFieldError(idZonaInput, msg);
                            if (field === 'nombre') setFieldError(nombreInput, msg);
                            if (field === 'dificultad') setFieldError(dificultadSelect, msg);
                        });
                    }
                    showFormAlert(alertBox, 'danger', 'Solicitud inválida. Revisa los campos.');
                    return;
                }
                showFormAlert(alertBox, 'danger', `Error al crear pista: ${err.message}`);
            }
        }
    };

    renderCrearPista(container, callbacks);
}

// Controlador para la vista de información de una pista
export async function infoPistaCmd(container, id) {
    if (!id) {
        showError('Página no encontrada');
        return;
    }

    showLoading();

    try {
        const res = await fetchClient(`/pistas/${id}`);
        const pista = await res.json();

        const callbacks = {
            onEstadoChange: (estado, estadoElement) => {
                const config = ESTADOS_CONFIG[estado] || ESTADOS_CONFIG['nada'];
                estadoElement.style.background = config.bg;
                estadoElement.innerHTML = `<span class="material-icons" style="color: ${config.color}; font-size: 28px;">${config.icon}</span>`;
                // TODO: En el futuro, guardar el estado en el backend
            }
        };

        renderInfoPista(container, pista, callbacks);
    } catch (err) {
        showError(`Error al obtener o procesar la pista: ${err.message}`);
    }
}
