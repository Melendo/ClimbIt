import { renderLoginEmail, renderLoginPassword, renderRegistroEmail, renderRegistroPassword, renderRegistroApodo } from './authView.js';
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

// ===================== REGISTRO =====================

// Estado del registro (guardamos los datos entre pasos)
let registroState = {
    email: '',
    contrasena: ''
};

// Controlador principal de registro (paso 1: email)
export function registroCmd(container) {
    // Resetear estado al iniciar el flujo
    registroState = { email: '', contrasena: '' };

    const callbacks = {
        onEmailSubmit: (email) => {
            registroState.email = email;
            // Ir al paso 2
            registroPasswordCmd(container);
        }
    };

    renderRegistroEmail(container, callbacks);
}

// Controlador para la contraseña (paso 2)
function registroPasswordCmd(container) {
    const callbacks = {
        onBack: () => {
            // Volver al paso 1
            registroCmd(container);
        },
        onPasswordSubmit: (password) => {
            registroState.contrasena = password;
            // Ir al paso 3
            registroApodoCmd(container);
        }
    };

    renderRegistroPassword(container, registroState.email, callbacks);
}

// Controlador para el apodo (paso 3 - final)
function registroApodoCmd(container) {
    const callbacks = {
        onBack: () => {
            // Volver al paso 2
            registroPasswordCmd(container);
        },
        onApodoSubmit: async (apodo) => {
            // Enviar petición de registro
            const res = await fetchClient('/escaladores/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    correo: registroState.email,
                    contrasena: registroState.contrasena,
                    apodo: apodo
                })
            });

            if (!res.ok) {
                const data = await res.json();
                if (data.errors && Array.isArray(data.errors)) {
                    const mensajes = data.errors.map(e => e.msg).join('. ');
                    throw new Error(mensajes || 'Error de validación');
                }
                throw new Error(data.message || 'Error al crear la cuenta');
            }

            const data = await res.json();

            // Guardar el token JWT
            if (data.token) {
                saveToken(data.token);
                // Redirigir al listado de rocódromos
                window.location.hash = '#listaRocodromos';
            } else {
                throw new Error('No se recibió el token de autenticación');
            }
        }
    };

    renderRegistroApodo(container, registroState.email, callbacks);
}
