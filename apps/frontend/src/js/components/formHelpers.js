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
    if (password.length < 4) {
        return 'La contraseña debe tener al menos 4 caracteres';
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

    if (apodo.length > 15) {
        return 'El apodo no puede superar los 15 caracteres';
    }

    if (apodo.length < 2) {
        return 'El apodo debe tener al menos 2 caracteres';
    }

    return null;
}
