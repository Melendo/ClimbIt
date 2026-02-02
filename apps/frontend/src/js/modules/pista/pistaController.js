import { renderCrearPista, renderInfoPista } from './pistaView.js';
import { fetchClient } from '../../core/client.js';
import { showError, showLoading } from '../../core/ui.js';

export function crearPistaCmd(container) {
    renderCrearPista(container);
}

export async function infoPistaCmd(container, id) {
    if (id) {
        showLoading();
        try {
            const res = await fetchClient(`/pistas/${id}`);
            //   if (!res.ok) {
            //     throw new Error(`Error al obtener pista: ${res.status} ${res.statusText}`);
            //   }
            // fetchClient already throws error if not ok
            const pista = await res.json();
            renderInfoPista(container, pista);
        } catch (err) {
            showError(`Error al obtener o procesar la pista: ${err.message}`);
        }
    } else {
        showError('Página no encontrada');
    }
}
