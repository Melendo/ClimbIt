import { renderPerfil } from './perfilView.js';

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

    renderPerfil(container, escaladorMock);
}
