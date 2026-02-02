import { renderZonasRocodromo } from './rocodromoView.js';
import { fetchClient } from '../../core/client.js';
import { showLoading, showError } from '../../core/ui.js';

// Controlador para la vista de mapa de un rocódromo
export async function mapaRocodromoCmd(container, id) {
    if (id) {
        showLoading();
        try {
            const res = await fetchClient(`/rocodromos/zonas/${id}`);
            const zonas = await res.json();
            renderZonasRocodromo(container, zonas);
        } catch (err) {
            showError(`Error al obtener o procesar las zonas del rocódromo: ${err.message}`);
        }
    } else {
        showError('ID de rocódromo no válido o no proporcionado');
    }
}
