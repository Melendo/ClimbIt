// Vista paso 1: Pedir email
export function renderLoginEmail(container, callbacks) {
    container.innerHTML = `
      <div class="card shadow-sm d-flex flex-column" style="min-height: 100vh;">
        <div class="card-header bg-white d-flex align-items-center gap-2 py-3">
          <a href="#home" class="text-dark">
            <span class="material-icons align-middle">arrow_back</span>
          </a>
          <span class="fw-medium">Iniciar sesión</span>
        </div>
        <div class="card-body flex-grow-1 d-flex flex-column justify-content-center px-4">
          <div class="text-center mb-4">
            <span class="material-icons text-primary mb-2" style="font-size: 48px;">email</span>
            <h5 class="fw-bold">¿Cuál es tu email?</h5>
            <p class="text-muted small">Introduce el email con el que te registraste</p>
          </div>
          
          <form id="login-email-form">
            <div class="mb-3">
              <input type="email" class="form-control form-control-lg" id="email" 
                     placeholder="tu@email.com" required autofocus>
              <div class="invalid-feedback"></div>
            </div>
            
            <div class="alert d-none" role="alert" id="alert-box"></div>
            
            <div class="d-grid">
              <button type="submit" class="btn btn-primary btn-lg">
                Continuar
                <span class="material-icons align-middle ms-1">arrow_forward</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    const form = container.querySelector('#login-email-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = container.querySelector('#email').value.trim();
        if (email) {
            callbacks.onEmailSubmit(email);
        }
    });
}

// Vista paso 2: Pedir contraseña
export function renderLoginPassword(container, email, callbacks) {
    container.innerHTML = `
      <div class="card shadow-sm d-flex flex-column" style="min-height: 100vh;">
        <div class="card-header bg-white d-flex align-items-center gap-2 py-3">
          <a href="#" id="back-btn" class="text-dark">
            <span class="material-icons align-middle">arrow_back</span>
          </a>
          <span class="fw-medium">Iniciar sesión</span>
        </div>
        <div class="card-body flex-grow-1 d-flex flex-column justify-content-center px-4">
          <div class="text-center mb-4">
            <span class="material-icons text-primary mb-2" style="font-size: 48px;">lock</span>
            <h5 class="fw-bold">Introduce tu contraseña</h5>
            <p class="text-muted small">${email}</p>
          </div>
          
          <form id="login-password-form">
            <div class="mb-3 position-relative">
              <input type="password" class="form-control form-control-lg" id="password" 
                     placeholder="Contraseña" required autofocus>
              <span class="material-icons position-absolute top-50 end-0 translate-middle-y me-3 text-muted" 
                    style="cursor: pointer;" id="toggle-password">visibility</span>
              <div class="invalid-feedback"></div>
            </div>
            
            <div class="alert d-none" role="alert" id="alert-box"></div>
            
            <div class="d-grid">
              <button type="submit" class="btn btn-primary btn-lg" id="submit-btn">
                Iniciar sesión
                <span class="material-icons align-middle ms-1">login</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Toggle para mostrar/ocultar contraseña
    const toggleBtn = container.querySelector('#toggle-password');
    const passwordInput = container.querySelector('#password');
    toggleBtn.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        toggleBtn.textContent = isPassword ? 'visibility_off' : 'visibility';
    });

    // Botón volver al paso anterior
    const backBtn = container.querySelector('#back-btn');
    backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        callbacks.onBack();
    });

    // Enviar formulario
    const form = container.querySelector('#login-password-form');
    const submitBtn = container.querySelector('#submit-btn');
    const alertBox = container.querySelector('#alert-box');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = passwordInput.value;

        // Deshabilitar botón mientras se procesa
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
            Iniciando sesión...
        `;

        try {
            await callbacks.onPasswordSubmit(password);
        } catch (error) {
            // Mostrar error
            alertBox.className = 'alert alert-danger';
            alertBox.textContent = error.message || 'Error al iniciar sesión';
            
            // Rehabilitar botón
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
                Iniciar sesión
                <span class="material-icons align-middle ms-1">login</span>
            `;
        }
    });
}
