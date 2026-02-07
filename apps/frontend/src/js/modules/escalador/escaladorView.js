import { renderNavbar } from '../../components/navbar.js';

// Vista del perfil del escalador
export function renderPerfil(container, escalador, callbacks) {
    const { correo, apodo, fotoPerfil } = escalador;
    const avatar = fotoPerfil || '/assets/johnDoe.png';

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
            src="${avatar}" 
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
          <li class="list-group-item d-flex justify-content-between align-items-center px-0 text-danger" style="cursor: pointer;" id="logout-btn">
            <div class="d-flex align-items-center gap-2">
              <span class="material-icons">logout</span>
              <span>Cerrar sesión</span>
            </div>
            <span class="material-icons">chevron_right</span>
          </li>
        </ul>

      </div>

      <!-- Modal de confirmación para cerrar sesión -->
      <div class="modal fade" id="logoutModal" tabindex="-1" aria-labelledby="logoutModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header border-0">
              <h5 class="modal-title" id="logoutModalLabel">Cerrar sesión</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body text-center py-4">
              <span class="material-icons text-warning mb-3" style="font-size: 48px;">warning</span>
              <p class="mb-0">¿Estás seguro de que quieres cerrar sesión?</p>
            </div>
            <div class="modal-footer border-0 justify-content-center gap-2">
              <button type="button" class="btn btn-outline-secondary px-4" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" class="btn btn-danger px-4" id="confirm-logout-btn">Cerrar sesión</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Menú de navegación inferior -->
      ${renderNavbar()}

    </div>
    `;

    // Evento para abrir el modal de confirmación
    const logoutBtn = container.querySelector('#logout-btn');
    const logoutModal = new window.bootstrap.Modal(container.querySelector('#logoutModal'));
    
    logoutBtn.addEventListener('click', () => {
        logoutModal.show();
    });

    // Evento para confirmar el cierre de sesión
    const confirmLogoutBtn = container.querySelector('#confirm-logout-btn');
    confirmLogoutBtn.addEventListener('click', () => {
        logoutModal.hide();
        callbacks.onLogout();
    });
}
