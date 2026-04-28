import { isValidEmail } from '../../core/ui.js';
import {
  isOnline,
  OFFLINE_READ_ONLY_ERROR_CODE,
  OFFLINE_UNAVAILABLE_ERROR_CODE,
} from '../../core/client.js';
import {
  hideAlert,
  setupAlertClearOnInput,
  setupBackButton,
  setupPasswordToggle,
  showAlert,
  validateRegistroApodo,
  validateRegistroPasswords,
} from '../../components/formHelpers.js';

// Vista de inicio de sesión (email + contraseña)
export function renderLogin(container, callbacks) {
  container.innerHTML = `
        <div class="card-header bg-white d-flex align-items-center gap-2 py-3">
          <a href="#home" class="text-dark">
            <span class="material-icons align-middle">arrow_back</span>
          </a>
          <span class="fw-medium">Iniciar sesión</span>
        </div>
        <div class="card-body flex-grow-1 d-flex flex-column justify-content-center px-4">
          <div class="text-center mb-4">
            <span class="material-icons text-primary mb-2" style="font-size: 48px;">login</span>
            <h5 class="fw-bold">Accede a tu cuenta</h5>
            <p class="text-muted small">Introduce tu email y tu contraseña</p>
          </div>
          
          <form id="login-form">
            <div class="mb-3">
              <input class="form-control form-control-lg" id="email"
                     type="email" name="email" autocomplete="username"
                     placeholder="tu@email.com" required autofocus>
            </div>

            <div class="mb-3 position-relative">
              <input type="password" class="form-control form-control-lg" id="password"
                     name="password" autocomplete="current-password"
                     autocapitalize="off" autocorrect="off" spellcheck="false"
                     data-lpignore="true" data-1p-ignore="true"
                     placeholder="Contraseña" required style="padding-right: 48px;">
              <span class="material-icons position-absolute top-50 end-0 translate-middle-y me-3 text-muted"
                    style="cursor: pointer;" id="toggle-password">visibility</span>
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
    `;

  const form = container.querySelector('#login-form');
  const emailInput = container.querySelector('#email');
  const passwordInput = container.querySelector('#password');
  const toggleBtn = container.querySelector('#toggle-password');
  const submitBtn = container.querySelector('#submit-btn');
  const alertBox = container.querySelector('#alert-box');

  setupPasswordToggle(toggleBtn, passwordInput);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!isOnline()) {
      showAlert(
        alertBox,
        'Sin conexión. No puedes iniciar sesión hasta recuperar Internet.'
      );
      return;
    }

    if (!isValidEmail(email)) {
      showAlert(
        alertBox,
        'El email debe tener el formato correcto (ej: usuario@dominio.com)'
      );
      return;
    }

    // Deshabilitar botón mientras se procesa
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
            Iniciando sesión...
        `;

    try {
      await callbacks.onLoginSubmit(email, password);
    } catch (error) {
      if (error.code === OFFLINE_READ_ONLY_ERROR_CODE) {
        showAlert(
          alertBox,
          'Sin conexión. No puedes iniciar sesión hasta recuperar Internet.'
        );
      } else {
        showAlert(alertBox, 'El usuario y la contraseña no coinciden');
      }

      // Rehabilitar botón
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
                Iniciar sesión
                <span class="material-icons align-middle ms-1">login</span>
            `;
    }
  });

  setupAlertClearOnInput(alertBox, emailInput, passwordInput);
}

// Vista registro paso 1: Pedir email
export function renderRegistroEmail(container, callbacks) {
  container.innerHTML = `
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
                     type="email" name="email" autocomplete="email"
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
    `;

  const form = container.querySelector('#registro-email-form');
  const emailInput = container.querySelector('#email');
  const alertBox = container.querySelector('#alert-box');
  const submitBtn = container.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();

    if (!isOnline()) {
      showAlert(
        alertBox,
        'Sin conexión. No puedes validar el email hasta recuperar Internet.'
      );
      return;
    }

    if (!isValidEmail(email)) {
      showAlert(
        alertBox,
        'El email debe tener el formato correcto (ej: usuario@dominio.com)'
      );
      return;
    }

    if (email.length < 5 || email.length > 255) {
      showAlert(alertBox, 'El email debe tener entre 5 y 255 caracteres');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
            Validando...
        `;

    try {
      await callbacks.onEmailSubmit(email);
    } catch (error) {
      if (
        error.code === OFFLINE_READ_ONLY_ERROR_CODE ||
        error.code === OFFLINE_UNAVAILABLE_ERROR_CODE
      ) {
        showAlert(
          alertBox,
          'Sin conexión. No puedes validar el email hasta recuperar Internet.'
        );
      } else {
        showAlert(alertBox, error.message || 'No se pudo validar el email');
      }

      submitBtn.disabled = false;
      submitBtn.innerHTML = `
                Continuar
                <span class="material-icons align-middle ms-1">arrow_forward</span>
            `;
    }
  });

  setupAlertClearOnInput(alertBox, emailInput);
}

// Vista registro paso 2: Pedir contraseña
export function renderRegistroPassword(container, email, callbacks) {
  container.innerHTML = `
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
                  name="new-password" autocomplete="new-password"
                  autocapitalize="off" autocorrect="off" spellcheck="false"
                  data-lpignore="true" data-1p-ignore="true"
                       placeholder="Contraseña" required autofocus style="padding-right: 48px;">
                <span class="material-icons position-absolute top-50 end-0 translate-middle-y me-3 text-muted" 
                      style="cursor: pointer;" id="toggle-password">visibility</span>
              </div>
            </div>
            
            <div class="mb-3">
              <div class="position-relative">
                <input type="password" class="form-control form-control-lg" id="password-confirm"
                  name="new-password-confirm" autocomplete="new-password"
                  autocapitalize="off" autocorrect="off" spellcheck="false"
                  data-lpignore="true" data-1p-ignore="true"
                       placeholder="Repetir contraseña" required style="padding-right: 48px;">
                <span class="material-icons position-absolute top-50 end-0 translate-middle-y me-3 text-muted" 
                      style="cursor: pointer;" id="toggle-password-confirm">visibility</span>
              </div>
            </div>

            <ul class="list-unstyled small mb-3" id="password-criteria">
              <li class="text-secondary d-flex align-items-center gap-2" data-check="length">
                <span class="material-icons" data-icon>radio_button_unchecked</span>
                Minimo 8 caracteres
              </li>
              <li class="text-secondary d-flex align-items-center gap-2" data-check="lower">
                <span class="material-icons" data-icon>radio_button_unchecked</span>
                Al menos una letra minuscula
              </li>
              <li class="text-secondary d-flex align-items-center gap-2" data-check="upper">
                <span class="material-icons" data-icon>radio_button_unchecked</span>
                Al menos una letra mayuscula
              </li>
              <li class="text-secondary d-flex align-items-center gap-2" data-check="number">
                <span class="material-icons" data-icon>radio_button_unchecked</span>
                Al menos un numero
              </li>
              <li class="text-secondary d-flex align-items-center gap-2" data-check="match">
                <span class="material-icons" data-icon>radio_button_unchecked</span>
                Las contrasenas coinciden
              </li>
            </ul>
            
            <div class="alert d-none" role="alert" id="alert-box"></div>
            
            <div class="d-grid">
              <button type="submit" class="btn btn-primary btn-lg" disabled>
                Continuar
                <span class="material-icons align-middle ms-1">arrow_forward</span>
              </button>
            </div>
          </form>
        </div>
    `;

  const toggleBtn = container.querySelector('#toggle-password');
  const passwordInput = container.querySelector('#password');
  setupPasswordToggle(toggleBtn, passwordInput);

  const toggleBtnConfirm = container.querySelector('#toggle-password-confirm');
  const passwordConfirmInput = container.querySelector('#password-confirm');
  setupPasswordToggle(toggleBtnConfirm, passwordConfirmInput);

  const backBtn = container.querySelector('#back-btn');
  setupBackButton(backBtn, callbacks.onBack);

  // Enviar formulario
  const form = container.querySelector('#registro-password-form');
  const alertBox = container.querySelector('#alert-box');
  const submitBtn = container.querySelector('button[type="submit"]');
  const criteriaList = container.querySelector('#password-criteria');

  const criteriaItems = {
    length: criteriaList.querySelector('[data-check="length"]'),
    lower: criteriaList.querySelector('[data-check="lower"]'),
    upper: criteriaList.querySelector('[data-check="upper"]'),
    number: criteriaList.querySelector('[data-check="number"]'),
    match: criteriaList.querySelector('[data-check="match"]'),
  };

  const setCriteriaStatus = (element, isOk) => {
    const icon = element.querySelector('[data-icon]');
    element.classList.toggle('text-success', isOk);
    element.classList.toggle('text-secondary', !isOk);
    if (icon) {
      icon.textContent = isOk ? 'check_circle' : 'radio_button_unchecked';
    }
  };

  const updatePasswordCriteria = () => {
    const password = passwordInput.value;
    const passwordConfirm = passwordConfirmInput.value;

    const checks = {
      length: password.length >= 8,
      lower: /[a-z]/.test(password),
      upper: /[A-Z]/.test(password),
      number: /\d/.test(password),
      match: password.length > 0 && password === passwordConfirm,
    };

    setCriteriaStatus(criteriaItems.length, checks.length);
    setCriteriaStatus(criteriaItems.lower, checks.lower);
    setCriteriaStatus(criteriaItems.upper, checks.upper);
    setCriteriaStatus(criteriaItems.number, checks.number);
    setCriteriaStatus(criteriaItems.match, checks.match);

    submitBtn.disabled = !Object.values(checks).every(Boolean);
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = passwordInput.value;
    const passwordConfirm = passwordConfirmInput.value;
    const validationMessage = validateRegistroPasswords(
      password,
      passwordConfirm
    );

    if (validationMessage) {
      showAlert(alertBox, validationMessage);
      return;
    }

    hideAlert(alertBox);

    callbacks.onPasswordSubmit(password);
  });

  passwordInput.addEventListener('input', updatePasswordCriteria);
  passwordConfirmInput.addEventListener('input', updatePasswordCriteria);
  updatePasswordCriteria();

  setupAlertClearOnInput(alertBox, passwordInput, passwordConfirmInput);
}

// Vista registro paso 3: Pedir apodo
export function renderRegistroApodo(container, email, callbacks) {
  container.innerHTML = `
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
    `;

  const backBtn = container.querySelector('#back-btn');
  setupBackButton(backBtn, callbacks.onBack);

  // Enviar formulario
  const form = container.querySelector('#registro-apodo-form');
  const submitBtn = container.querySelector('#submit-btn');
  const alertBox = container.querySelector('#alert-box');
  const apodoInput = container.querySelector('#apodo');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const apodo = apodoInput.value.trim();
    const validationMessage = validateRegistroApodo(apodo);

    if (!isOnline()) {
      showAlert(
        alertBox,
        'Sin conexión. No puedes crear una cuenta hasta recuperar Internet.'
      );
      return;
    }

    if (validationMessage) {
      showAlert(alertBox, validationMessage);
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
      if (error.code === OFFLINE_READ_ONLY_ERROR_CODE) {
        showAlert(
          alertBox,
          'Sin conexión. No puedes crear una cuenta hasta recuperar Internet.'
        );
      } else {
        showAlert(alertBox, error.message || 'Error al crear la cuenta');
      }

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
    hideAlert(alertBox);
  });
}
