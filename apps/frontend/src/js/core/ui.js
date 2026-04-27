// Contenedor principal donde se renderiza el contenido
import { showToast } from '../components/toast.js';

const appContainer = document.getElementById('app-container');
export const mainContainer = appContainer.querySelector('.app-content') || appContainer;

let connectivityBanner = null;
let connectivityBannerInitialized = false;

function ensureConnectivityBanner() {
    if (connectivityBanner) {
        return connectivityBanner;
    }
    
    connectivityBanner = document.createElement('div');
    connectivityBanner.className = 'connectivity-banner';
    connectivityBanner.setAttribute('aria-live', 'polite');
    connectivityBanner.setAttribute('title', 'Sin conexión: modo lectura');
    connectivityBanner.innerHTML = `
            <span class="material-icons" aria-hidden="true">cloud_off</span>
            <span class="visually-hidden">Sin conexión. Modo lectura.</span>
    `;
    
    document.body.appendChild(connectivityBanner);
    return connectivityBanner;
}

export function updateConnectivityBanner() {
    const banner = ensureConnectivityBanner();
    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
    
    if (isOffline) {
        banner.classList.add('is-visible');
        return;
    }
    
    banner.classList.remove('is-visible');
}

export function initConnectivityBanner() {
    if (connectivityBannerInitialized) {
        return;
    }
    
    ensureConnectivityBanner();
    updateConnectivityBanner();
    
    window.addEventListener('online', updateConnectivityBanner);
    window.addEventListener('offline', updateConnectivityBanner);
    connectivityBannerInitialized = true;
}

export function showLoading() {
    if (mainContainer) {
        mainContainer.innerHTML = `
        <div class="card shadow-sm">
          <div class="card-body d-flex justify-content-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
          </div>
        </div>`;
    }
}

export function showError(message) {
    if (typeof message === 'string' && message.includes('Sin conexión: la app está en modo lectura')) {
        showToast(message, { variant: 'danger' });
        return;
    }

    if (mainContainer) {
        mainContainer.innerHTML = `
        <div class="card-header bg-white d-flex align-items-center justify-content-between gap-2 py-3">
            <div class="d-flex align-items-center gap-2">
                <a href="#" onclick="history.back(); return false;" class="text-dark text-decoration-none">
                    <span class="material-icons align-middle">arrow_back</span>
                </a>
                <img src="/icons/apple-touch-icon.png" alt="Logo de ClimbIt" style="width: 32px; height: 32px; object-fit: contain;" />
                <span class="fw-bold" style="font-size: 1.5rem;">ClimbIt</span>
            </div>
        </div>
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="alert alert-danger mb-0" role="alert">
                <strong>Error:</strong> ${message}
            </div>
          </div>
        </div>`;
    }
}

/**
* Muestra una alerta en un elemento alert box
* @param {HTMLElement} alertBox - Elemento donde mostrar la alerta
* @param {string} type - Tipo de alerta (success, danger, warning, info)
* @param {string} message - Mensaje a mostrar
*/
export function showFormAlert(alertBox, type, message) {
    alertBox.className = `alert alert-${type}`;
    alertBox.textContent = message;
}

/**
* Oculta/limpia una alerta
* @param {HTMLElement} alertBox - Elemento alert box a limpiar
*/
export function clearFormAlert(alertBox) {
    alertBox.className = 'alert d-none';
    alertBox.textContent = '';
}

/**
* Marca un campo como inválido y muestra mensaje de error
* @param {HTMLElement} input - Campo de entrada
* @param {string} msg - Mensaje de error
*/
export function setFieldError(input, msg) {
    input.classList.add('is-invalid');
    const feedback = input.parentElement.querySelector('.invalid-feedback');
    if (feedback) {
        feedback.textContent = msg || 'Campo inválido';
    }
}

/**
* Limpia el error de un campo
* @param {HTMLElement} input - Campo de entrada
*/
export function clearFieldError(input) {
    input.classList.remove('is-invalid');
    const feedback = input.parentElement.querySelector('.invalid-feedback');
    if (feedback) {
        feedback.textContent = '';
    }
}
/**
* Valida que un email tenga formato correcto (texto@texto.texto) y longitud válida
* @param {string} email - Email a validar
* @param {number} maxLength - Longitud máxima (por defecto 254, estándar RFC 5321)
* @returns {boolean} - true si el formato es válido
*/
export function isValidEmail(email, maxLength = 254) {
    if (!email || email.length > maxLength) {
        return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
* Valida que una contraseña cumpla requisitos mínimos
* @param {string} password - Contraseña a validar
* @param {number} minLength - Longitud mínima (por defecto 6)
* @returns {boolean} - true si cumple los requisitos
*/
export function isValidPassword(password, minLength = 6) {
    return password && password.length >= minLength;
}

/**
* Valida que un campo no esté vacío
* @param {string} value - Valor a validar
* @returns {boolean} - true si no está vacío
*/
export function isNotEmpty(value) {
    return value && value.trim().length > 0;
}
