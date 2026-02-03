import { renderNavbar } from '../../components/navbar.js';

// Vista del perfil del escalador
export function renderPerfil(container, escalador) {
    const { correo, apodo, fotoPerfil } = escalador;

    container.innerHTML = `
    <div class="card shadow-sm d-flex flex-column" style="min-height: 100vh;">

      <!-- Cabecera -->
      <div class="card-header bg-white d-flex align-items-center justify-content-center gap-2 py-3">
        <span class="material-icons text-primary" style="font-size: 32px;">terrain</span>
        <span class="fw-bold" style="font-size: 1.5rem;">ClimbIt</span>
      </div>

      <!-- Contenido del perfil -->
      <div class="card-body flex-grow-1 overflow-auto">
        
        <!-- Sección de información del perfil -->
        <div class="text-center mb-4">
          <img 
            src="${fotoPerfil}" 
            alt="Foto de perfil" 
            class="rounded-circle mb-3" 
            style="width: 100px; height: 100px; object-fit: cover;"
          />
          <h5 class="fw-bold mb-1">${apodo}</h5>
          <p class="text-muted mb-0">${correo}</p>
        </div>

        <hr>

        <!-- Sección de ajustes de cuenta -->
        <h6 class="text-muted mb-3">Ajustes de cuenta</h6>
        
        <ul class="list-group list-group-flush">
          <li class="list-group-item d-flex justify-content-between align-items-center px-0">
            <div class="d-flex align-items-center gap-2">
              <span class="material-icons text-muted">person</span>
              <span>Editar perfil</span>
            </div>
            <span class="material-icons text-muted">chevron_right</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center px-0">
            <div class="d-flex align-items-center gap-2">
              <span class="material-icons text-muted">lock</span>
              <span>Cambiar contraseña</span>
            </div>
            <span class="material-icons text-muted">chevron_right</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center px-0">
            <div class="d-flex align-items-center gap-2">
              <span class="material-icons text-muted">notifications</span>
              <span>Notificaciones</span>
            </div>
            <span class="material-icons text-muted">chevron_right</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center px-0">
            <div class="d-flex align-items-center gap-2">
              <span class="material-icons text-muted">help</span>
              <span>Ayuda</span>
            </div>
            <span class="material-icons text-muted">chevron_right</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center px-0 text-danger" style="cursor: pointer;">
            <div class="d-flex align-items-center gap-2">
              <span class="material-icons">logout</span>
              <span>Cerrar sesión</span>
            </div>
            <span class="material-icons">chevron_right</span>
          </li>
        </ul>

      </div>

      <!-- Menú de navegación inferior -->
      ${renderNavbar()}

    </div>
    `;
}
