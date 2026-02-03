import { renderPerfil } from './escaladorView.js';
import { removeToken } from '../../core/client.js';

// Controlador para la vista de perfil del usuario
export function perfilCmd(container) {
    // Datos mockeados del escalador (John Doe)
    const escaladorMock = {
        id: 1,
        correo: 'john.doe@example.com',
        apodo: 'John Doe',
        fotoPerfil: '/assets/johnDoe.png'
    };

    // TODO: En el futuro, obtener datos del endpoint del backend
    // const response = await fetchClient('/escaladores/me');
    // const escalador = await response.json();

    const callbacks = {
        onLogout: () => {
            removeToken();
            window.location.hash = '#home';
        }
    };

    renderPerfil(container, escaladorMock, callbacks);
}
