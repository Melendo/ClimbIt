import { renderPerfil } from './escaladorView.js';
import { fetchClient, removeToken } from '../../core/client.js';
import { showLoading, showError } from '../../core/ui.js';

// Controlador para la vista de perfil del usuario
export async function perfilCmd(container) {
    showLoading();

    try {
        const response = await fetchClient('/escaladores/perfil');
        const escalador = await response.json();

        const callbacks = {
            onLogout: () => {
                removeToken();
                window.location.hash = '#home';
            }
        };

        renderPerfil(container, escalador, callbacks);
    } catch (err) {
        showError(`Error al obtener el perfil: ${err.message}`);
    }
}
