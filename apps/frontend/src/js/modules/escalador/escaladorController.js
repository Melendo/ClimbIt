import { renderPerfil } from './escaladorView.js';
import { fetchClient, fetchImageObjectUrl, removeToken } from '../../core/client.js';
import { showLoading, showError } from '../../core/ui.js';

const PERFIL_PLACEHOLDER = '/assets/johnDoe.png';

// Controlador para la vista de perfil del usuario
export async function perfilCmd(container) {
    showLoading();

    try {
        const response = await fetchClient('/escaladores/perfil');
        const escalador = await response.json();

        const fotoUrl = escalador?.fotoUrl || escalador?.fotoPerfil || escalador?.urlFoto || '';
        if (fotoUrl) {
            try {
                escalador.fotoSrc = await fetchImageObjectUrl(fotoUrl);
            } catch (err) {
                console.warn('No se pudo cargar la foto de perfil:', err.message);
                escalador.fotoSrc = PERFIL_PLACEHOLDER;
            }
        } else {
            escalador.fotoSrc = PERFIL_PLACEHOLDER;
        }

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
