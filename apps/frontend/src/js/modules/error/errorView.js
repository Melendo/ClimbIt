export function error404View() {
    return `
        <div class="error-page">
            <h1>404</h1>
            <h2>Página no encontrada</h2>
            <p>La ruta que buscas no existe.</p>
            <a href="#home" class="btn-home">Volver al inicio</a>
        </div>
    `;
}

export function error500View() {
    return `
        <div class="error-page">
            <h1>500</h1>
            <h2>Error del servidor</h2>
            <p>Ha ocurrido un error inesperado. Inténtalo de nuevo más tarde.</p>
            <a href="#home" class="btn-home">Volver al inicio</a>
        </div>
    `;
}

export function errorGenericoView(mensaje = 'Ha ocurrido un error desconocido') {
    return `
        <div class="error-page">
            <h1>Error</h1>
            <p>${mensaje}</p>
            <a href="#home" class="btn-home">Volver al inicio</a>
        </div>
    `;
}
