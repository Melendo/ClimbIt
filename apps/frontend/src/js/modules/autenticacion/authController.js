import { renderLoginEmail, renderLoginPassword } from './authView.js';
import { fetchClient, saveToken } from '../../core/client.js';

// Estado del login (guardamos el email entre pasos)
let loginState = {
    email: ''
};

// Controlador para el correo electrónico
export function loginCmd(container) {
    // Resetear estado al iniciar el flujo
    loginState = { email: '' };

    const callbacks = {
        onEmailSubmit: (email) => {
            loginState.email = email;
            // Ir al paso 2
            loginPasswordCmd(container);
        }
    };

    renderLoginEmail(container, callbacks);
}

// Controlador para la contraseña
function loginPasswordCmd(container) {
    const callbacks = {
        onBack: () => {
            // Volver al paso 1
            loginCmd(container);
        },
        onPasswordSubmit: async (password) => {
            // Enviar petición de autenticación
            const res = await fetchClient('escaladores/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    correo: loginState.email,
                    contrasena: password
                })
            });

            const data = await res.json();

            // Guardar el token
            if (data.token) {
                saveToken(data.token);
                // Redirigir al listado de rocódromos
                window.location.hash = '#listaRocodromos';
            } else {
                throw new Error('No se recibió el token de autenticación');
            }
        }
    };

    renderLoginPassword(container, loginState.email, callbacks);
}
