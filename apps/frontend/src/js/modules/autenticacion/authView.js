export function renderLogin(container) {
    container.innerHTML = `
      <div class="card shadow-sm">
        <div class="card-header bg-white d-flex align-items-center gap-2 py-3">
          <a href="#" onclick="history.back(); return false;" class="text-dark">
            <span class="material-icons align-middle">arrow_back</span>
          </a>
          <span class="fw-medium">Autenticación</span>
        </div>
        <div class="card-body text-center">
          <span class="material-icons text-muted mb-3" style="font-size: 64px;">lock</span>
          <p class="text-muted">Módulo de autenticación (Placeholder)</p>
        </div>
      </div>
    `;
}
