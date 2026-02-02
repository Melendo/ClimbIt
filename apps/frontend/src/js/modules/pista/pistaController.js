import { renderCrearPista, renderInfoPista } from './pistaView.js';
import { fetchClient } from '../../core/client.js';
import { showError, showLoading } from '../../core/ui.js';

// Controlador para la vista de crear una nueva pista
export function crearPistaCmd(container) {
    const callbacks = {
        getZonas: async (idRocodromo) => {
            const res = await fetchClient(`/rocodromos/zonas/${idRocodromo}`);
            return await res.json();
        },
        createPista: async (data) => {
            try {
                const res = await fetchClient('/pistas/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                return await res.json();
            } catch (error) {
                if (error.response && error.response.status === 422) {
                    // Si el error es de validación (422), extraemos el JSON de la respuesta
                    const body = await error.response.json();
                    // Lanzamos un error 'controlado' que el View pueda entender
                    const validationErr = new Error('Error de validación');
                    validationErr.status = 422;
                    validationErr.errors = body.errors; 
                    throw validationErr;
                }
                // Si no, relanzamos el error original
                throw error;
            }
        }
    };

    renderCrearPista(container, callbacks);
}

// Controlador para la vista de información de una pista
export async function infoPistaCmd(container, id) {
    if (id) {
        showLoading();
        try {
            const res = await fetchClient(`/pistas/${id}`);
            const pista = await res.json();
            renderInfoPista(container, pista);
        } catch (err) {
            showError(`Error al obtener o procesar la pista: ${err.message}`);
        }
    } else {
        showError('Página no encontrada');
    }
}
