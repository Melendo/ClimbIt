import {
  renderLogin,
  renderRegistroEmail,
  renderRegistroPassword,
  renderRegistroApodo,
} from './authView.js';
import {
  fetchClient,
  saveToken,
  warmUpAppDataCache,
} from '../../core/client.js';

// Controlador de login en una sola vista
export function loginCmd(container) {
  const callbacks = {
    onLoginSubmit: async (email, password) => {
      // Enviar petición de autenticación
      const res = await fetchClient('escaladores/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: email,
          contrasena: password,
        }),
      });

      // Si la respuesta no es exitosa, mostrar error
      if (!res.ok) {
        throw new Error('El correo o la contraseña no son correctos');
      }

      const data = await res.json();

      // Guardar el token
      if (data.token) {
        saveToken(data.token);
        // Cebar cache dinámica antes de navegar para mejorar la disponibilidad offline.
        await warmUpAppDataCache();
        // Redirigir al listado de rocódromos
        window.location.hash = '#misRocodromos';
      } else {
        throw new Error('El correo o la contraseña no son correctos');
      }
    },
  };

  renderLogin(container, callbacks);
}

// ===================== REGISTRO =====================

// Estado del registro (guardamos los datos entre pasos)
let registroState = {
  email: '',
  contrasena: '',
};

// Controlador principal de registro (paso 1: email)
export function registroCmd(container) {
  // Resetear estado al iniciar el flujo
  registroState = { email: '', contrasena: '' };

  const callbacks = {
    onEmailSubmit: async (email) => {
      const validation = await validarCorreoDisponibilidad(email);
      if (!validation.ok) {
        throw new Error(validation.message || 'El correo no esta disponible');
      }

      registroState.email = email;
      // Ir al paso 2
      registroPasswordCmd(container);
    },
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
    },
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
      const validation = await validarApodoDisponibilidad(apodo);
      if (!validation.ok) {
        throw new Error(validation.message || 'El apodo no esta disponible');
      }

      // Enviar petición de registro
      const res = await fetchClient('escaladores/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: registroState.email,
          contrasena: registroState.contrasena,
          apodo: apodo,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.errors && Array.isArray(data.errors)) {
          const mensajes = data.errors.map((e) => e.msg).join('. ');
          throw new Error(mensajes || 'Error de validación');
        }
        throw new Error(data.message || 'Error al crear la cuenta');
      }

      const data = await res.json();

      // Guardar el token JWT
      if (data.token) {
        saveToken(data.token);
        // Cebar cache dinámica antes de navegar para mejorar la disponibilidad offline.
        await warmUpAppDataCache();
        // Redirigir al tutorial tras completar el registro
        window.location.hash = '#tutorial';
      } else {
        throw new Error('No se recibió el token de autenticación');
      }
    },
  };

  renderRegistroApodo(container, registroState.email, callbacks);
}

async function validarCorreoDisponibilidad(correo) {
  try {
    const response = await fetchClient(
      `/escaladores/validarCorreo/${encodeURIComponent(correo)}`
    );
    const data = await response.json();
    if (data?.disponible === false) {
      return { ok: false, message: 'El correo ya esta registrado.' };
    }
    return { ok: true };
  } catch (err) {
    const errorMsg = await extractValidatorMessage(err);
    return {
      ok: false,
      message: errorMsg || err.message || 'No se pudo validar el correo.',
    };
  }
}

async function validarApodoDisponibilidad(apodo) {
  try {
    const response = await fetchClient(
      `/escaladores/validarApodo/${encodeURIComponent(apodo)}`
    );
    const data = await response.json();
    if (data?.disponible === false) {
      return { ok: false, message: 'El apodo no esta disponible.' };
    }
    return { ok: true };
  } catch (err) {
    const errorMsg = await extractValidatorMessage(err);
    return {
      ok: false,
      message: errorMsg || err.message || 'No se pudo validar el apodo.',
    };
  }
}

async function extractValidatorMessage(err) {
  if (!err?.response) {
    return null;
  }

  try {
    const payload = await err.response.json();
    const errorMsg = payload?.errors?.[0]?.msg;
    if (errorMsg) {
      return errorMsg;
    }
    return payload?.message || payload?.error || null;
  } catch {
    return null;
  }
}
