import { isValidEmail } from '../../core/ui.js';

// Helper para configurar validación de email en formularios
function setupEmailFormValidation(form, emailInput, alertBox, onValidEmail) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();
        
        if (!isValidEmail(email)) {
            alertBox.className = 'alert alert-danger';
            alertBox.textContent = 'El email debe tener el formato correcto (ej: usuario@dominio.com)';
            return;
        }
        
        alertBox.className = 'alert d-none';
        onValidEmail(email);
    });

    emailInput.addEventListener('input', () => {
        alertBox.className = 'alert d-none';
    });
}

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
              <input class="form-control form-control-lg" id="email" 
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
    const emailInput = container.querySelector('#email');
    const alertBox = container.querySelector('#alert-box');

    setupEmailFormValidation(form, emailInput, alertBox, callbacks.onEmailSubmit);
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
        } 
        // eslint-disable-next-line no-unused-vars
        catch (error) {
            // Mostrar error
            alertBox.className = 'alert alert-danger';
            alertBox.textContent = 'El usuario y la contraseña no coinciden';
            
            // Rehabilitar botón
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
                Iniciar sesión
                <span class="material-icons align-middle ms-1">login</span>
            `;
        }
    });
}

// Componente de barra de progreso para el registro
function renderRegistroProgress(currentStep) {
    const steps = [
        { num: 1, label: 'Email' },
        { num: 2, label: 'Contraseña' },
        { num: 3, label: 'Apodo' }
    ];
    
    const progressPercent = ((currentStep) / steps.length) * 100;
    
    return `
      <div class="registro-progress-container">
        <div class="registro-progress-wrapper">
          <div class="registro-progress">
            <div class="registro-progress-bar" style="width: ${progressPercent}%"></div>
          </div>
          <div class="registro-steps">
            ${steps.map(step => {
                let stepClass = '';
                if (step.num < currentStep) stepClass = 'completed';
                else if (step.num === currentStep) stepClass = 'active';
                
                return `
                  <div class="registro-step ${stepClass}">
                    <div class="registro-step-dot"></div>
                    <span>${step.label}</span>
                  </div>
                `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
}

// Vista registro paso 1: Pedir email
export function renderRegistroEmail(container, callbacks) {
    container.innerHTML = `
      <div class="card shadow-sm d-flex flex-column" style="min-height: 100vh;">
        <div class="card-header bg-white d-flex align-items-center gap-2 py-3">
          <a href="#home" class="text-dark">
            <span class="material-icons align-middle">arrow_back</span>
          </a>
          <span class="fw-medium">Crear cuenta</span>
        </div>
        <div class="card-body flex-grow-1 d-flex flex-column justify-content-center px-4" style="padding-bottom: 100px;">
          <div class="text-center mb-4">
            <span class="material-icons text-primary mb-2" style="font-size: 48px;">email</span>
            <h5 class="fw-bold">¿Cuál es tu email?</h5>
            <p class="text-muted small">Usaremos este email para tu cuenta</p>
          </div>
          
          <form id="registro-email-form">
            <div class="mb-3">
              <input class="form-control form-control-lg" id="email" 
                     placeholder="tu@email.com" required autofocus>
            </div>
            
            <div class="alert d-none" role="alert" id="alert-box"></div>
            
            <div class="d-grid">
              <button type="submit" class="btn btn-primary btn-lg">
                Continuar
                <span class="material-icons align-middle ms-1">arrow_forward</span>
              </button>
            </div>
            
            <p class="text-center mt-3 text-muted small">
              ¿Ya tienes cuenta? <a href="#login">Inicia sesión</a>
            </p>
          </form>
        </div>
        
        ${renderRegistroProgress(1)}
      </div>
    `;

    const form = container.querySelector('#registro-email-form');
    const emailInput = container.querySelector('#email');
    const alertBox = container.querySelector('#alert-box');

    setupEmailFormValidation(form, emailInput, alertBox, callbacks.onEmailSubmit);
}

// Vista registro paso 2: Pedir contraseña
export function renderRegistroPassword(container, email, callbacks) {
    container.innerHTML = `
      <div class="card shadow-sm d-flex flex-column" style="min-height: 100vh;">
        <div class="card-header bg-white d-flex align-items-center gap-2 py-3">
          <a href="#" id="back-btn" class="text-dark">
            <span class="material-icons align-middle">arrow_back</span>
          </a>
          <span class="fw-medium">Crear cuenta</span>
        </div>
        <div class="card-body flex-grow-1 d-flex flex-column justify-content-center px-4" style="padding-bottom: 100px;">
          <div class="text-center mb-4">
            <span class="material-icons text-primary mb-2" style="font-size: 48px;">lock</span>
            <h5 class="fw-bold">Crea tu contraseña</h5>
            <p class="text-muted small">${email}</p>
          </div>
          
          <form id="registro-password-form">
            <div class="mb-3">
              <div class="position-relative">
                <input type="password" class="form-control form-control-lg" id="password" 
                       placeholder="Contraseña" required autofocus style="padding-right: 48px;">
                <span class="material-icons position-absolute top-50 end-0 translate-middle-y me-3 text-muted" 
                      style="cursor: pointer;" id="toggle-password">visibility</span>
              </div>
            </div>
            
            <div class="mb-3">
              <div class="position-relative">
                <input type="password" class="form-control form-control-lg" id="password-confirm" 
                       placeholder="Repetir contraseña" required style="padding-right: 48px;">
                <span class="material-icons position-absolute top-50 end-0 translate-middle-y me-3 text-muted" 
                      style="cursor: pointer;" id="toggle-password-confirm">visibility</span>
              </div>
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
        
        ${renderRegistroProgress(2)}
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

    // Toggle para mostrar/ocultar confirmar contraseña
    const toggleBtnConfirm = container.querySelector('#toggle-password-confirm');
    const passwordConfirmInput = container.querySelector('#password-confirm');
    toggleBtnConfirm.addEventListener('click', () => {
        const isPassword = passwordConfirmInput.type === 'password';
        passwordConfirmInput.type = isPassword ? 'text' : 'password';
        toggleBtnConfirm.textContent = isPassword ? 'visibility_off' : 'visibility';
    });

    // Botón volver al paso anterior
    const backBtn = container.querySelector('#back-btn');
    backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        callbacks.onBack();
    });

    // Enviar formulario
    const form = container.querySelector('#registro-password-form');
    const alertBox = container.querySelector('#alert-box');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const password = passwordInput.value;
        const passwordConfirm = passwordConfirmInput.value;

        // Validar longitud mínima de contraseña
        if (password.length < 4) {
            alertBox.className = 'alert alert-danger';
            alertBox.textContent = 'La contraseña debe tener al menos 4 caracteres';
            return;
        }

        // Validar que las contraseñas coincidan
        if (password !== passwordConfirm) {
            alertBox.className = 'alert alert-danger';
            alertBox.textContent = 'Las contraseñas no coinciden';
            return;
        }

        // Limpiar errores
        alertBox.className = 'alert d-none';

        callbacks.onPasswordSubmit(password);
    });

    // Limpiar errores al escribir
    passwordInput.addEventListener('input', () => {
        alertBox.className = 'alert d-none';
    });

    passwordConfirmInput.addEventListener('input', () => {
        alertBox.className = 'alert d-none';
    });
}

// Vista registro paso 3: Pedir apodo
export function renderRegistroApodo(container, email, callbacks) {
    container.innerHTML = `
      <div class="card shadow-sm d-flex flex-column" style="min-height: 100vh;">
        <div class="card-header bg-white d-flex align-items-center gap-2 py-3">
          <a href="#" id="back-btn" class="text-dark">
            <span class="material-icons align-middle">arrow_back</span>
          </a>
          <span class="fw-medium">Crear cuenta</span>
        </div>
        <div class="card-body flex-grow-1 d-flex flex-column justify-content-center px-4" style="padding-bottom: 100px;">
          <div class="text-center mb-4">
            <span class="material-icons text-primary mb-2" style="font-size: 48px;">person</span>
            <h5 class="fw-bold">¿Cómo te llamamos?</h5>
            <p class="text-muted small">${email}</p>
          </div>
          
          <form id="registro-apodo-form">
            <div class="mb-3">
              <input type="text" class="form-control form-control-lg" id="apodo" 
                     placeholder="Tu apodo" required autofocus maxlength="20">
              <small class="text-muted">Máximo 20 caracteres</small>
              <div class="invalid-feedback"></div>
            </div>
            
            <div class="alert d-none" role="alert" id="alert-box"></div>
            
            <div class="d-grid">
              <button type="submit" class="btn btn-primary btn-lg" id="submit-btn">
                Crear cuenta
                <span class="material-icons align-middle ms-1">check</span>
              </button>
            </div>
          </form>
        </div>
        
        ${renderRegistroProgress(3)}
      </div>
    `;

    // Botón volver al paso anterior
    const backBtn = container.querySelector('#back-btn');
    backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        callbacks.onBack();
    });

    // Enviar formulario
    const form = container.querySelector('#registro-apodo-form');
    const submitBtn = container.querySelector('#submit-btn');
    const alertBox = container.querySelector('#alert-box');
    const apodoInput = container.querySelector('#apodo');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const apodo = apodoInput.value.trim();

        if (!apodo) {
            alertBox.className = 'alert alert-danger';
            alertBox.textContent = 'El apodo es obligatorio';
            apodoInput.classList.add('is-invalid');
            return;
        }

        if (apodo.length > 15) {
            alertBox.className = 'alert alert-danger';
            alertBox.textContent = 'El apodo no puede superar los 15 caracteres';
            apodoInput.classList.add('is-invalid');
            return;
        }

        if (apodo.length < 2) {
            alertBox.className = 'alert alert-danger';
            alertBox.textContent = 'El apodo debe tener al menos 2 caracteres';
            apodoInput.classList.add('is-invalid');
            return;
        }

        // Deshabilitar botón mientras se procesa
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
            Creando cuenta...
        `;

        try {
            await callbacks.onApodoSubmit(apodo);
        } catch (error) {
            // Mostrar error
            alertBox.className = 'alert alert-danger';
            alertBox.textContent = error.message || 'Error al crear la cuenta';
            
            // Rehabilitar botón
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
                Crear cuenta
                <span class="material-icons align-middle ms-1">check</span>
            `;
        }
    });

    // Limpiar error al escribir
    apodoInput.addEventListener('input', () => {
        apodoInput.classList.remove('is-invalid');
        alertBox.className = 'alert d-none';
    });
}
