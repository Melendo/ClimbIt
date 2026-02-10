import { renderMapaZona } from './zonaView.js';
import { fetchClient } from '../../core/client.js';
import { showLoading, showError } from '../../core/ui.js';

/**
 * Controlador para la vista de mapa de zona
 * Muestra el mapa del rocódromo y permite seleccionar una zona para ver sus pistas
 * @param {HTMLElement} container Contenedor donde renderizar la vista
 * @param {number} idRocodromo ID del rocódromo
 */
export async function mapaZonaCmd(container, idRocodromo) {
    if (!idRocodromo) {
        showError('ID de rocódromo no válido o no proporcionado');
        return;
    }

    showLoading();

    try {
        // 1. Obtener información del rocódromo
        let rocodromo = { id: idRocodromo, nombre: `Rocódromo ${idRocodromo}` };
        try {
            const rocodromoRes = await fetchClient(`/rocodromos/${idRocodromo}`);
            rocodromo = await rocodromoRes.json();
        } catch (err) {
            console.warn('No se pudo obtener info del rocódromo:', err.message);
        }

        // 2. Obtener lista de zonas del rocódromo
        let zonas = [];
        try {
            const zonasRes = await fetchClient(`/rocodromos/zonas/${idRocodromo}`);
            zonas = await zonasRes.json();
        } catch (err) {
            console.warn('No se pudieron obtener las zonas:', err.message);
        }

        // Renderizar la vista inicial (sin pistas cargadas o con la primera zona por defecto si se desea)
        // Pasamos una función callback para cargar pistas de una zona específica
        renderMapaZona(container, { rocodromo, zonas }, async (idZona) => {
            return await cargarPistasZona(idZona);
        });

    } catch (err) {
        showError(`Error al cargar el mapa de zona: ${err.message}`);
    }
}

/**
 * Función auxiliar para obtener las pistas de una zona
 * @param {number} idZona ID de la zona
 * @returns {Promise<Array>} Lista de pistas
 */
async function cargarPistasZona(idZona) {
    try {
        const pistasRes = await fetchClient(`/zonas/pistas/${idZona}`);
        const pistas = await pistasRes.json();
        return pistas;
    } catch (err) {
        console.error(`Error al cargar pistas de la zona ${idZona}:`, err);
        return [];
    }
}
