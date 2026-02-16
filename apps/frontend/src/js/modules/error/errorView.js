export function error404View() {
  return `
        <div class="card shadow-sm" style="min-height: 100dvh;">
          <div class="card-body text-center py-5">
            <span class="material-icons text-warning mb-3" style="font-size: 64px;">search_off</span>
            <h1 class="display-1 fw-bold text-primary">404</h1>
            <h2 class="h5 text-muted mb-3">Página no encontrada</h2>
            <p class="text-muted">La ruta que buscas no existe.</p>
            <a href="#misRocodromos" class="btn btn-primary">Volver al inicio</a>
          </div>
        </div>
    `;
}

export function error500View() {
  return `
        <div class="card shadow-sm" style="min-height: 100dvh;">
          <div class="card-body text-center py-5">
            <span class="material-icons text-danger mb-3" style="font-size: 64px;">error</span>
            <h1 class="display-1 fw-bold text-danger">500</h1>
            <h2 class="h5 text-muted mb-3">Error del servidor</h2>
            <p class="text-muted">Ha ocurrido un error inesperado. Inténtalo de nuevo más tarde.</p>
            <a href="#misRocodromos" class="btn btn-primary">Volver al inicio</a>
          </div>
        </div>
    `;
}

export function errorGenericoView(mensaje = 'Ha ocurrido un error desconocido') {
  return `
        <div class="card shadow-sm" style="min-height: 100dvh;">
          <div class="card-body text-center py-5">
            <span class="material-icons text-warning mb-3" style="font-size: 64px;">warning</span>
            <h1 class="h3 fw-bold">Error</h1>
            <p class="text-muted">${mensaje}</p>
            <a href="#misRocodromos" class="btn btn-primary">Volver al inicio</a>
          </div>
        </div>
    `;
}
