import { renderNavbar } from '../../components/navbar.js';

export function renderHomeView() {
    return `
    <div class="card shadow-sm d-flex flex-column" style="min-height: 100vh;">

      <!-- Contenido principal centrado -->
      <div class="card-body flex-grow-1 d-flex flex-column justify-content-center align-items-center text-center">
        <span class="material-icons text-primary mb-3" style="font-size: 64px;">terrain</span>
        <h1 class="fw-bold mb-2" style="font-size: 2.5rem;">ClimbIt</h1>
        <p class="text-muted fs-5">Marca tu progreso</p>
      </div>

      <!-- Menú de navegación inferior -->
      ${renderNavbar()}

    </div>`;
}
