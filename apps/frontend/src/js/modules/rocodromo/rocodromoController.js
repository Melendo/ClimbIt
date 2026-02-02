import { renderMapaRocodromo } from './rocodromoView.js';
import { fetchClient } from '../../core/client.js';
import { showLoading, showError } from '../../core/ui.js';

// Controlador para la vista de mapa de un rocódromo
export async function mapaRocodromoCmd(container, id) {
    if (!id) {
        showError('ID de rocódromo no válido o no proporcionado');
        return;
    }

    showLoading();

    try {
        // Intentar obtener datos del rocódromo
        let rocodromo = { id, nombre: `Rocódromo ${id}` };
        let zonas = [];

        try {
            const rocodromoRes = await fetchClient(`/rocodromos/${id}`);
            rocodromo = await rocodromoRes.json();
        } catch (err) {
            console.warn('No se pudo obtener info del rocódromo:', err.message);
        }

        try {
            const zonasRes = await fetchClient(`/rocodromos/zonas/${id}`);
            zonas = await zonasRes.json();
        } catch (err) {
            console.warn('No se pudieron obtener las zonas:', err.message);
        }

        // Para cada zona, intentar obtener sus pistas
        const zonasConPistas = await Promise.all(
            zonas.map(async (zona) => {
                try {
                    const pistasRes = await fetchClient(`/zonas/pistas/${zona.id}`);
                    const pistas = await pistasRes.json();
                    return { ...zona, pistas };
                } catch {
                    return { ...zona, pistas: [] };
                }
            })
        );

        renderMapaRocodromo(container, { rocodromo, zonas: zonasConPistas });
    } catch (err) {
        showError(`Error al obtener o procesar el rocódromo: ${err.message}`);
    }
}
