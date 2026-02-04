import { showFormAlert, clearFormAlert, setFieldError, clearFieldError } from '../../core/ui.js';

// Escala de grados (falta traerla con peticion al backend)
const GRADOS_FRANCESES = [
    '3',
    '4',
    '5a', '5a+', '5b', '5b+', '5c', '5c+',
    '6a', '6a+', '6b', '6b+', '6c', '6c+',
    '7a', '7a+', '7b', '7b+', '7c', '7c+',
    '8a', '8a+', '8b', '8b+', '8c', '8c+',
    '9a', '9a+', '9b', '9b+', '9c', '9c+',
];

// Vista para la creación y visualización de pistas
export function renderCrearPista(container, callbacks) {
    container.innerHTML = `
  <div class="card shadow-sm">
    <div class="card-header bg-white d-flex align-items-center gap-2 py-3">
      <a href="#" onclick="history.back(); return false;" class="text-dark">
        <span class="material-icons align-middle">arrow_back</span>
      </a>
      <span class="fw-medium">Nueva Pista</span>
    </div>
    <div class="card-body">
      <form id="form-crear-pista" action="/pistas/create" method="POST" novalidate>
        <div class="mb-3">
          <label for="idRocodromo" class="form-label">ID Rocódromo</label>
          <input
            type="number"
            class="form-control"
            name="idRocodromo"
            id="idRocodromo"
            required
          />
          <div class="invalid-feedback"></div>
        </div>
        <div class="mb-3">
          <label for="idZona" class="form-label">Zona</label>
          <select
            class="form-control"
            name="idZona"
            id="idZona"
            required
            disabled
          ></select>
          <div class="invalid-feedback"></div>
        </div>
        <div class="mb-3">
          <label for="nombre" class="form-label">Nombre</label>
          <input
            type="text"
            class="form-control"
            name="nombre"
            id="nombre"
            required
          />
          <div class="invalid-feedback"></div>
        </div>
        <div class="mb-3">
          <label for="dificultad" class="form-label">Dificultad</label>
          <select class="form-control" name="dificultad" id="dificultad" required></select>
          <div class="invalid-feedback"></div>
        </div>
        <div id="form-alert" class="alert d-none" role="alert"></div>
        <button type="submit" class="btn btn-primary w-100">Crear</button>
      </form>
    </div>
  </div>`;

    // Referencias a elementos del formulario
    const dificultadSelect = document.getElementById('dificultad');
    const form = document.getElementById('form-crear-pista');
    const idRocodromoInput = document.getElementById('idRocodromo');
    const idZonaInput = document.getElementById('idZona');
    const nombreInput = document.getElementById('nombre');
    const alertBox = document.getElementById('form-alert');

    dificultadSelect.innerHTML = GRADOS_FRANCESES
        .map((grado) => `<option value="${grado}">${grado}</option>`)
        .join('');

    // Validación de campos del formulario
    function validateFields(values) {
        const errors = {};
        const idRocoNum = Number(values.idRocodromo);
        if (!Number.isInteger(idRocoNum) || idRocoNum < 1) {
            errors.idRocodromo = 'idRocodromo debe ser un entero positivo';
        }
        const idZonaNum = Number(values.idZona);
        if (!Number.isInteger(idZonaNum) || idZonaNum < 1) {
            errors.idZona = 'idZona debe ser un entero positivo';
        }
        const nombre = (values.nombre || '').trim();
        if (!nombre) {
            errors.nombre = 'nombre es requerido';
        }
        const dificultad = (values.dificultad || '').trim();
        if (!GRADOS_FRANCESES.includes(dificultad)) {
            errors.dificultad = `dificultad debe ser uno de: ${GRADOS_FRANCESES.join(', ')}`;
        }
        return errors;
    }

    
    // Recorrremos los campos para limpiar errores al modificar su valor
    [idRocodromoInput, idZonaInput, nombreInput, dificultadSelect].forEach((el) => {
        el.addEventListener('input', () => {
            clearFieldError(el);
            clearFormAlert(alertBox);
        });
        el.addEventListener('change', () => {
            clearFieldError(el);
            clearFormAlert(alertBox);
        });
    });

    // Cargar zonas al seleccionar un rocódromo
    async function cargarZonasParaRocodromo(idRoco) {
        const id = Number(idRoco);
        if (!Number.isInteger(id) || id < 1) {
            setFieldError(idRocodromoInput, 'idRocodromo debe ser un entero positivo');
            return;
        }
        try {
            idZonaInput.innerHTML = '';
            idZonaInput.setAttribute('disabled', 'disabled');

            let zonas;
            try {
                zonas = await callbacks.getZonas(id);
            } catch (err) {
                showFormAlert(alertBox, 'danger', `No se pudieron cargar las zonas: ${err.message}`);
                return;
            }
            if (!Array.isArray(zonas) || zonas.length === 0) {
                idZonaInput.innerHTML = `<option value="">No hay zonas disponibles</option>`;
                idZonaInput.setAttribute('disabled', 'disabled');
                showFormAlert(alertBox, 'warning', 'Este rocódromo no tiene zonas disponibles.');
                return;
            }

            idZonaInput.innerHTML = zonas
                .map((z) => `<option value="${z.id}">Zona ${z.id} - ${z.tipo || 'N/D'}</option>`)
                .join('');
            idZonaInput.removeAttribute('disabled');
        } catch (err) {
            showFormAlert(alertBox, 'danger', `Error cargando zonas: ${err.message}`);
        }
    }

    // Eventos para cargar zonas al cambiar el rocódromo
    idRocodromoInput.addEventListener('blur', () => cargarZonasParaRocodromo(idRocodromoInput.value));
    idRocodromoInput.addEventListener('change', () => cargarZonasParaRocodromo(idRocodromoInput.value));

    // Manejo del envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearFormAlert(alertBox);
        [idZonaInput, nombreInput, dificultadSelect].forEach(clearFieldError);

        const values = {
            idRocodromo: idRocodromoInput.value,
            idZona: idZonaInput.value,
            nombre: nombreInput.value,
            dificultad: dificultadSelect.value,
        };

        const errors = validateFields(values);
        if (Object.keys(errors).length > 0) {
            if (errors.idRocodromo) setFieldError(idRocodromoInput, errors.idRocodromo);
            if (errors.idZona) setFieldError(idZonaInput, errors.idZona);
            if (errors.nombre) setFieldError(nombreInput, errors.nombre);
            if (errors.dificultad) setFieldError(dificultadSelect, errors.dificultad);
            showFormAlert(alertBox, 'danger', 'Por favor, corrige los campos marcados.');
            return;
        }

        try {
            const pista = await callbacks.createPista({
                idZona: Number(values.idZona),
                nombre: values.nombre.trim(),
                dificultad: values.dificultad,
            });

            showFormAlert(alertBox, 'success', 'Pista creada correctamente.');
            window.location.hash = `#infoPista?id=${pista.id}`;

        } catch (err) {
            if (err.status === 422 && Array.isArray(err.errors)) {
                err.errors.forEach((e) => {
                    const field = e.field;
                    const msg = e.msg || 'Valor inválido';
                    if (field === 'idZona') setFieldError(idZonaInput, msg);
                    if (field === 'nombre') setFieldError(nombreInput, msg);
                    if (field === 'dificultad') setFieldError(dificultadSelect, msg);
                });
                showFormAlert(alertBox, 'danger', 'Solicitud inválida. Revisa los campos.');
                return;
            }
            showFormAlert(alertBox, 'danger', `Error al crear pista: ${err.message}`);
        }
    });
}

// Vista para la información de una pista
export function renderInfoPista(container, pista) {
    const { nombre, dificultad } = pista || {};

    container.innerHTML = `
<div class="card shadow-sm">
  
  <!-- Cabecera: Color + Nombre -->
  <div class="card-header bg-white d-flex align-items-center gap-2 py-3">
    <a href="#" onclick="history.back(); return false;" class="text-dark">
      <span class="material-icons align-middle">arrow_back</span>
    </a>
    <span class="fw-medium">${nombre || 'Sin nombre'}</span>
  </div>

  <!-- Imagen de la pista -->
  <div class="card-img-container" style="height: 300px; overflow: hidden;">
    <img 
      src="/assets/placeholder.jpg" 
      alt="Imagen de la pista ${nombre || ''}" 
      class="w-100 h-100" 
      style="object-fit: cover;"
    />
  </div>

  <!-- Info: Nivel y Estado -->
  <div class="card-body">
    <div class="row text-center">
      <div class="col-6">
        <p class="text-muted mb-1">Nivel</p>
        <p class="fs-2 fw-bold text-primary mb-0">${dificultad || '-'}</p>
      </div>
      <div class="col-6">
        <p class="text-muted mb-1">Estado</p>
        <div class="estado-icon fs-1" id="estado-actual">
          <span class="material-icons text-secondary" style="font-size: 48px;">radio_button_unchecked</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Botones de acción -->
  <div class="card-footer bg-white border-top py-3">
    <div class="d-flex justify-content-around text-center">
      <button class="btn btn-link text-warning p-2 estado-btn d-flex flex-column align-items-center" data-estado="flash" title="Flash">
        <span class="material-icons" style="font-size: 32px;">flash_on</span>
        <small>Flash</small>
      </button>
      <button class="btn btn-link text-success p-2 estado-btn d-flex flex-column align-items-center" data-estado="completado" title="Completado">
        <span class="material-icons" style="font-size: 32px;">check</span>
        <small>Completado</small>
      </button>
      <button class="btn btn-link text-info p-2 estado-btn d-flex flex-column align-items-center" data-estado="en-progreso" title="En progreso">
        <span class="material-icons" style="font-size: 32px;">hexagon</span>
        <small>Proyecto</small>
      </button>
      <button class="btn btn-link text-secondary p-2 estado-btn d-flex flex-column align-items-center" data-estado="nada" title="Desmarcar">
        <span class="material-icons" style="font-size: 32px;">close</span>
        <small>Desmarcar</small>
      </button>
    </div>
  </div>

</div>`;

    // Configurar eventos para los botones de estado
    const estadoActual = container.querySelector('#estado-actual');
    const estadoBtns = container.querySelectorAll('.estado-btn');

    const estadoIcons = {
        'flash': '<span class="material-icons text-warning" style="font-size: 48px;">flash_on</span>',
        'completado': '<span class="material-icons text-success" style="font-size: 48px;">check</span>',
        'en-progreso': '<span class="material-icons text-info" style="font-size: 48px;">hexagon</span>',
        'nada': '<span class="material-icons text-secondary" style="font-size: 48px;">radio_button_unchecked</span>'
    };

    estadoBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const estado = btn.dataset.estado;
            estadoActual.innerHTML = estadoIcons[estado] || estadoIcons['nada'];
        });
    });
}
