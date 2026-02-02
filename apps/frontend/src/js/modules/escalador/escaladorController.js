import { renderCrearEscalador } from './escaladorView.js';
import { fetchClient } from '../../core/client.js';

export function crearEscaladorCmd(container) {
    const callbacks = {
        createEscalador: async (data) => {
            try {
                const res = await fetchClient('/escaladores/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                return await res.json();
            } catch (error) {
                if (error.response && error.response.status === 422) {
                    const body = await error.response.json();
                    const validationErr = new Error('Error de validación');
                    validationErr.status = 422;
                    validationErr.errors = body.errors;
                    throw validationErr;
                }
                throw error;
            }
        }
    };
    renderCrearEscalador(container, callbacks);
}
