export function renderHomeView() {
    return `
    <div class="card shadow-sm">
      <div class="card-header bg-white py-3 text-center">
        <span class="fw-medium">ClimbIt</span>
      </div>
      <div class="card-body text-center">
        <h1 class="h4 mb-3">Bienvenido a ClimbIt</h1>
        <p class="text-muted">Tu aplicación para gestionar escaladores y pistas de escalada.</p>
      </div>
      <div class="card-footer bg-white border-top py-3">
        <div class="d-grid gap-2">
          <a href="#crearEscalador" class="btn btn-primary">Crear Escalador</a>
          <a href="#crearPista" class="btn btn-outline-secondary">Crear Pista</a>
        </div>
      </div>
    </div>`;
}
