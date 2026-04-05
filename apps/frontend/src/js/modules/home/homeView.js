// Vista de la página principal (home)
export function renderHomeView(container, callbacks) {
  container.innerHTML = `
    <div class="card shadow-sm d-flex flex-column" style="min-height: 100dvh;">

      <!-- Contenido principal centrado -->
      <div class="card-body flex-grow-1 d-flex flex-column justify-content-center align-items-center text-center">
        <img src="/icons/apple-touch-icon.png" alt="Logo de ClimbIt" class="mb-3" style="width: 64px; height: 64px; object-fit: contain;" />
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

        <p class="text-muted small mt-4 mb-0 px-4" style="max-width: 520px;">
          Esta aplicación es un proyecto de universidad y aún sigue en desarrollo. No se recomienda su uso para datos reales o sensibles. ¡Gracias por tu comprensión!
        </p>
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
