// Vista de la página principal (home)
export function renderHomeView(container, callbacks) {
    container.innerHTML = `
    <div class="card shadow-sm d-flex flex-column" style="min-height: 100vh;">

      <!-- Contenido principal centrado -->
      <div class="card-body flex-grow-1 d-flex flex-column justify-content-center align-items-center text-center">
        <span class="material-icons text-primary mb-3" style="font-size: 64px;">terrain</span>
        <h1 class="fw-bold mb-2" style="font-size: 2.5rem;">ClimbIt</h1>
        <p class="text-muted fs-5 mb-4">Marca tu progreso</p>
        
        <!-- Botones de registro e inicio de sesión -->
        <div class="d-grid gap-3 w-100 px-4" style="max-width: 300px;">
          <a href="#login" class="btn btn-primary btn-lg" id="login-btn">
            <span class="material-icons align-middle me-2">login</span>
            Iniciar sesión
          </a>
          <a href="#registro" class="btn btn-outline-primary btn-lg">
            <span class="material-icons align-middle me-2">person_add</span>
            Registrarse
          </a>
        </div>
      </div>

    </div>`;

    // Evento para el botón de login
    const loginBtn = container.querySelector('#login-btn');
    loginBtn.addEventListener('click', (e) => {
        if (callbacks.isAuthenticated()) {
            e.preventDefault();
            callbacks.onAlreadyAuthenticated();
        }
    });
}
