import { renderPistasZona } from './zonaView.js';
import './zona.css';
import { fetchClient } from '../../core/client.js';
import { showLoading, showError } from '../../core/ui.js';

export async function mapaZonaCmd(container, id) {
    if (id) {
        showLoading();
        try {
            const res = await fetchClient(`/zonas/pistas/${id}`);
            const pistas = await res.json();
            renderPistasZona(container, pistas);
        } catch (err) {
            showError(`Error al obtener o procesar las pistas de la zona: ${err.message}`);
        }
    } else {
        showError('ID de zona no válido o no proporcionado');
    }
}
