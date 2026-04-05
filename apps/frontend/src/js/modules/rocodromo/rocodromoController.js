import {
    renderMisRocodromos,
    renderBuscarRocodromos,
    renderCrearRocodromo,
    renderInfoRocodromo
} from './rocodromoView.js';
import { fetchClient, fetchImageObjectUrl } from '../../core/client.js';
import { showLoading, showError } from '../../core/ui.js';

const ROCODROMO_LOGO_PLACEHOLDER = '/assets/rocodromoDefecto.jpg';



// Controlador para la vista de "Mis Rocódromos" (rocodromos suscritos del usuario)
export async function misRocodromosCmd(container) {
    showLoading();
    
    try {
        const response = await fetchClient('/escaladores/mis-rocodromos');
        const rocodromos = await response.json();
        const rocodromosConLogo = await Promise.all(
            rocodromos.map(async (rocodromo) => ({
                ...rocodromo,
                logoSrc: await resolveRocodromoLogoSrc(rocodromo),
            }))
        );
        renderMisRocodromos(container, rocodromosConLogo);
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
        
        const rocodromosConLogo = await Promise.all(
            rocodromos.map(async (rocodromo) => ({
                ...rocodromo,
                logoSrc: await resolveRocodromoLogoSrc(rocodromo),
            }))
        );
        
        renderBuscarRocodromos(container, rocodromosConLogo, suscritosIds);
    } catch (err) {
        console.warn('Error al obtener rocódromos:', err.message);
        // Mostrar vista con lista vacía si hay error
        renderBuscarRocodromos(container, [], []);
    }
}

// Controlador para la vista de información completa de un rocódromo
export async function infoRocoCmd(container, id) {
    if (!id) {
        showError('ID de rocódromo no válido o no proporcionado');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetchClient(`/rocodromos/${id}`);
        const rocodromo = await response.json();
        
        rocodromo.logoSrc = await resolveRocodromoLogoSrc(rocodromo);
        
        // Verificar si el usuario está suscrito a este rocódromo
        let estaSuscrito = false;
        try {
            const suscritosRes = await fetchClient('/escaladores/mis-rocodromos');
            const suscritos = await suscritosRes.json();
            estaSuscrito = suscritos.some(r => r.id === rocodromo.id);
        } catch (err) {
            console.warn('No se pudieron obtener rocódromos suscritos:', err.message);
        }
        
        renderInfoRocodromo(container, rocodromo, estaSuscrito);
    } catch (err) {
        showError(`Error al obtener la información del rocódromo: ${err.message}`);
    }
}

// Controlador para la vista de crear un nuevo rocódromo
export function crearRocodromoCmd(container) {
    const callbacks = {
        onSubmit: async (values, fields) => {
            const { nombreInput, ubicacionInput } = fields;
            
            // Simple validación frontend
            if (!values.nombre) {
                nombreInput.classList.add('is-invalid');
                return;
            }
            if (!values.ubicacion) {
                ubicacionInput.classList.add('is-invalid');
                return;
            }
            
            showLoading();
            
            try {
                const res = await fetchClient('/rocodromos/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values),
                });
                const rocodromo = await res.json();
                
                // Redirigir al nuevo rocódromo
                window.location.hash = `#mapaZona?id=${rocodromo.id}`;
            } catch (err) {
                // Restaurar la vista del formulario (el loading lo quita)
                // Como showLoading reemplaza el contenido, tendríamos que volver a renderizar
                // pero por simplicidad, mostraremos el error en una alerta general por ahora
                // o idealmente, no usar showLoading fullscreen si queremos mantener el formulario
                // Para este MVP, recargamos el formulario
                renderCrearRocodromo(container, callbacks);
                
                // Recuperar referencias
                const newAlertBox = container.querySelector('#form-alert');
                if (newAlertBox) {
                    newAlertBox.textContent = `Error: ${err.message}`;
                    newAlertBox.classList.remove('d-none');
                    newAlertBox.classList.add('alert-danger');
                }
            }
        }
    };
    
    renderCrearRocodromo(container, callbacks);
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

// Función auxiliar para resolver la URL de la imagen del logo de un rocódromo
async function resolveRocodromoLogoSrc(rocodromo) {
    if (!rocodromo?.logoUrl) {
        return ROCODROMO_LOGO_PLACEHOLDER;
    }
    
    try {
        return await fetchImageObjectUrl(`/rocodromos/${rocodromo.id}/logo`);
    } catch (err) {
        console.warn('No se pudo cargar el logo del rocódromo:', err.message);
        return ROCODROMO_LOGO_PLACEHOLDER;
    }
}
