// Utilidades reutilizables para formularios

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function showAlert(alertBox, message) {
  alertBox.className = 'alert alert-danger';
  alertBox.textContent = message;
}

export function hideAlert(alertBox) {
  alertBox.className = 'alert d-none';
}

export function setupAlertClearOnInput(alertBox, ...inputs) {
  inputs.forEach((input) => {
    input.addEventListener('input', () => {
      hideAlert(alertBox);
    });
  });
}

export function setupPasswordToggle(toggleBtn, passwordInput) {
  toggleBtn.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    toggleBtn.textContent = isPassword ? 'visibility_off' : 'visibility';
  });
}

export function setupBackButton(backBtn, onBack) {
  backBtn.addEventListener('click', (e) => {
    e.preventDefault();
    onBack();
  });
}

export function validateRegistroPasswords(password, passwordConfirm) {
  if (password.length < 8) {
    return 'La contraseña debe tener mínimo 8 caracteres';
  }

  if (!/[a-z]/.test(password)) {
    return 'La contraseña debe contener al menos una letra minúscula';
  }

  if (!/[A-Z]/.test(password)) {
    return 'La contraseña debe contener al menos una letra mayúscula';
  }

  if (!/\d/.test(password)) {
    return 'La contraseña debe contener al menos un número';
  }

  if (password !== passwordConfirm) {
    return 'Las contraseñas no coinciden';
  }

  return null;
}

export function validateRegistroApodo(apodo) {
  if (!apodo) {
    return 'El apodo es obligatorio';
  }

  if (apodo.length < 1 || apodo.length > 20) {
    return 'El apodo debe tener entre 1 y 20 caracteres';
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(apodo)) {
    return 'El apodo solo puede contener letras, números, guiones y guiones bajos';
  }

  return null;
}
