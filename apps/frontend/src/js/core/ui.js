// Contenedor principal donde se renderiza el contenido
const appContainer = document.getElementById('app-container');
export const mainContainer = appContainer.querySelector('.app-content') || appContainer;

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
    if (mainContainer) {
        mainContainer.innerHTML = `
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
