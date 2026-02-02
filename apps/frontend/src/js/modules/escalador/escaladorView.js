import { showFormAlert, clearFormAlert, setFieldError, clearFieldError } from '../../core/ui.js';

export function renderCrearEscalador(container, callbacks) {
    container.innerHTML = `
    <div class="container">
    <h1>Nuevo Escalador</h1>
    <form id="form-crear-escalador" novalidate>
      <div class="mb-3">
        <label for="correo" class="form-label">Correo</label>
        <input
          type="email"
          class="form-control"
          name="correo"
          id="correo"
          required
        />
        <div class="invalid-feedback"></div>
      </div>
      <div class="mb-3">
        <label for="contrasena" class="form-label">Contraseña</label>
        <input
          type="password"
          class="form-control"
          name="contrasena"
          id="contrasena"
          required
        />
        <div class="invalid-feedback"></div>
      </div>
      <div class="mb-3">
        <label for="apodo" class="form-label">Apodo</label>
        <input
          type="text"
          class="form-control"
          name="apodo"
          id="apodo"
          required
        />
        <div class="invalid-feedback"></div>
      </div>
      <div id="form-alert" class="alert d-none" role="alert"></div>
      <button type="submit" class="btn btn-primary">Crear</button>
    </form></div>`;

    // Referencias a elementos del formulario
    const form = document.getElementById('form-crear-escalador');
    const alertBox = document.getElementById('form-alert');
    const correoInput = document.getElementById('correo');
    const contrasenaInput = document.getElementById('contrasena');
    const apodoInput = document.getElementById('apodo');

    // Limpieza de errores al modificar los campos
    [correoInput, contrasenaInput, apodoInput].forEach((el) => {
        el.addEventListener('input', () => {
             clearFieldError(el);
             clearFormAlert(alertBox);
        });
    });

    // Manejo del envio del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearFormAlert(alertBox);
        [correoInput, contrasenaInput, apodoInput].forEach(clearFieldError);

        const data = {
            correo: correoInput.value,
            contrasena: contrasenaInput.value,
            apodo: apodoInput.value
        };

        try {
            await callbacks.createEscalador(data);
            showFormAlert(alertBox, 'success', 'Escalador creado correctamente.');
            form.reset();
        } catch (err) {
            if (err.status === 422 && Array.isArray(err.errors)) {
                 err.errors.forEach((e) => {
                    const field = e.field;
                    const msg = e.msg || 'Valor inválido';
                    if (field === 'correo') setFieldError(correoInput, msg);
                    if (field === 'contrasena') setFieldError(contrasenaInput, msg);
                    if (field === 'apodo') setFieldError(apodoInput, msg);
                });
                showFormAlert(alertBox, 'danger', 'Solicitud inválida. Revisa los campos.');
            } else {
                 showFormAlert(alertBox, 'danger', `Error al crear escalador: ${err.message}`);
            }
        }
    });
}
