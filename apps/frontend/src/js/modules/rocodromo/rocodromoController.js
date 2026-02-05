import { renderMapaRocodromo, renderMisRocodromos, renderBuscarRocodromos } from './rocodromoView.js';
import { fetchClient } from '../../core/client.js';
import { showLoading, showError } from '../../core/ui.js';

// Controlador para la vista de "Mis Rocódromos" (rocodromos suscritos del usuario)
export async function misRocodromosCmd(container) {
    showLoading();

    try {
        const response = await fetchClient('/escaladores/mis-rocodromos');
        const rocodromos = await response.json();
        renderMisRocodromos(container, rocodromos);
    } catch (err) {
        console.warn('Error al obtener mis rocódromos:', err.message);
        // Mostrar vista con lista vacía si hay error
        renderMisRocodromos(container, []);
    }
}

// Controlador para la vista de buscar rocódromos (todos los disponibles)
export async function buscarRocodromosCmd(container) {
    showLoading();

    try {
        // Obtener todos los rocódromos disponibles
        const response = await fetchClient('/rocodromos');
        const rocodromos = await response.json();
        
        // Obtener los rocódromos suscritos para marcarlos
        let suscritosIds = [];
        try {
            const suscritosRes = await fetchClient('/escaladores/mis-rocodromos');
            const suscritos = await suscritosRes.json();
            suscritosIds = suscritos.map(r => r.id);
        } catch (err) {
            console.warn('No se pudieron obtener rocódromos suscritos:', err.message);
        }
        
        renderBuscarRocodromos(container, rocodromos, suscritosIds);
    } catch (err) {
        console.warn('Error al obtener rocódromos:', err.message);
        // Mostrar vista con lista vacía si hay error
        renderBuscarRocodromos(container, [], []);
    }
}

// Función para suscribirse a un rocódromo
export async function suscribirseRocodromo(idRocodromo) {
    try {
        await fetchClient('/escaladores/suscribirse', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idRocodromo })
        });
        
        // Recargar la vista actual
        window.location.reload();
    } catch (err) {
        console.error('Error al suscribirse:', err.message);
        showError('Error al suscribirse al rocódromo');
    }
}

// Función para desuscribirse de un rocódromo
export async function desuscribirseRocodromo(idRocodromo) {
    try {
        await fetchClient('/escaladores/desuscribirse', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idRocodromo })
        });
        
        // Recargar la vista actual
        window.location.reload();
    } catch (err) {
        console.error('Error al desuscribirse:', err.message);
        showError('Error al desuscribirse del rocódromo');
    }
}

// Exponer funciones globalmente para los event listeners de las vistas
window.suscribirseRocodromo = suscribirseRocodromo;
window.desuscribirseRocodromo = desuscribirseRocodromo;

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
