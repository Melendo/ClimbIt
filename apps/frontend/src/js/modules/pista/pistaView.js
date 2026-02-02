import { showError } from '../../core/ui.js';

const GRADOS_FRANCESES = [
    '3',
    '4',
    '5a', '5a+', '5b', '5b+', '5c', '5c+',
    '6a', '6a+', '6b', '6b+', '6c', '6c+',
    '7a', '7a+', '7b', '7b+', '7c', '7c+',
    '8a', '8a+', '8b', '8b+', '8c', '8c+',
    '9a', '9a+', '9b', '9b+', '9c', '9c+',
];

export function renderCrearPista(container, callbacks) {
    container.innerHTML = `
  <div class="container">  
  <h1>Nueva Pista</h1>
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
      <button type="submit" class="btn btn-primary">Crear</button>
    </form></div>`;

    // Rellenar opciones de dificultad según escala francesa
    const dificultadSelect = document.getElementById('dificultad');
    const form = document.getElementById('form-crear-pista');
    const idRocodromoInput = document.getElementById('idRocodromo');
    const idZonaInput = document.getElementById('idZona');
    const nombreInput = document.getElementById('nombre');
    const alertBox = document.getElementById('form-alert');

    dificultadSelect.innerHTML = GRADOS_FRANCESES
        .map((grado) => `<option value="${grado}">${grado}</option>`)
        .join('');

    // Funciones para agregar o quitar errores de validación en campos
    function setFieldError(input, msg) {
        input.classList.add('is-invalid');
        const feedback = input.parentElement.querySelector('.invalid-feedback');
        if (feedback) {
            feedback.textContent = msg || 'Campo inválido';
        }
    }
    function clearFieldError(input) {
        input.classList.remove('is-invalid');
        const feedback = input.parentElement.querySelector('.invalid-feedback');
        if (feedback) {
            feedback.textContent = '';
        }
    }

    // Funciones para mostrar y limpiar alertas del formulario
    function showFormAlert(type, message) {
        alertBox.className = `alert alert-${type}`;
        alertBox.textContent = message;
    }

    function clearFormAlert() {
        alertBox.className = 'alert d-none';
        alertBox.textContent = '';
    }

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
            clearFormAlert();
        });
        el.addEventListener('change', () => {
            clearFieldError(el);
            clearFormAlert();
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
                showFormAlert('danger', `No se pudieron cargar las zonas: ${err.message}`);
                return;
            }
            if (!Array.isArray(zonas) || zonas.length === 0) {
                idZonaInput.innerHTML = `<option value="">No hay zonas disponibles</option>`;
                idZonaInput.setAttribute('disabled', 'disabled');
                showFormAlert('warning', 'Este rocódromo no tiene zonas disponibles.');
                return;
            }

            idZonaInput.innerHTML = zonas
                .map((z) => `<option value="${z.id}">Zona ${z.id} - ${z.tipo || 'N/D'}</option>`)
                .join('');
            idZonaInput.removeAttribute('disabled');
        } catch (err) {
            showFormAlert('danger', `Error cargando zonas: ${err.message}`);
        }
    }

    // Eventos para cargar zonas al cambiar el rocódromo
    idRocodromoInput.addEventListener('blur', () => cargarZonasParaRocodromo(idRocodromoInput.value));
    idRocodromoInput.addEventListener('change', () => cargarZonasParaRocodromo(idRocodromoInput.value));

    // Manejo del envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearFormAlert();
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
            showFormAlert('danger', 'Por favor, corrige los campos marcados.');
            return;
        }

        try {
            const pista = await callbacks.createPista({
                idZona: Number(values.idZona),
                nombre: values.nombre.trim(),
                dificultad: values.dificultad,
            });

            showFormAlert('success', 'Pista creada correctamente.');
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
                showFormAlert('danger', 'Solicitud inválida. Revisa los campos.');
                return;
            }
            showFormAlert('danger', `Error al crear pista: ${err.message}`);
        }
    });
}

export async function renderInfoPista(container, pista) {
    try {
        let data = pista;
        if (pista && typeof pista.json === 'function') {
            data = await pista.json().catch(() => {
                throw new Error('Respuesta no válida: JSON esperado');
            });
        }

        const { id, idZona, nombre, dificultad } = data || {};
        if (id == null || idZona == null || nombre == null || dificultad == null) {
            throw new Error('Datos de pista incompletos');
        }

        container.innerHTML = `<div class="bg-light">
    <nav class="bg-primary text-white shadow p-3 d-flex align-items-center justify-content-between">
      <div class="d-flex align-items-center">
        <span class="material-icons align-middle me-2">arrow_back</span>
        <span class="fs-5 fw-medium">Pista: ${nombre}</span>
      </div>
      <div>
        <span class="material-icons align-middle me-3">search</span>
        <span class="material-icons align-middle me-3">edit</span>
        <span class="material-icons align-middle">more_vert</span>
      </div>
    </nav>

    <div class="container mt-4 p-3">
      <div class="mb-4">
        <div class="card h-100 shadow-sm rounded-3">
          <div class="card-body">
          <h5 class="card-title mb-3">
              <span>Nombre</span>
              -
              <span>${nombre}</span>
            </h5>
            <h5 class="card-title mb-3">
              <span>Zona</span>
              -
              <span>${idZona}</span>
            </h5>
            <h5 class="card-title mb-3">
              <span>Dificultad</span>
              -
              <span>${dificultad}</span>
            </h5>
          </div>
        </div>
      </div>

      <div class="mb-4">
        <div class="card h-100 shadow-sm rounded-3">
          <div class="card-body">
            <h5 class="card-title mb-3">
              <span>Estado</span>
              -
              <span class="material-icons align-middle text-success display-3">check_circle</span>
            </h5>
          </div>
        </div>
      </div>

      <div class="container">
        <div class="row gap-2">
          <button class="col btn btn-outline-primary text-start">
            <span class="material-icons align-middle me-2">flash_on</span> Flash
          </button>
          <button class="col btn btn-outline-success text-start">
            <span class="material-icons align-middle me-2">check_circle</span> Hecha
          </button>
          <button class="col btn btn-outline-info text-start">
            <span class="material-icons align-middle me-2">assignment</span> Proyecto
          </button>
          <button class="col btn btn-outline-warning text-start">
            <span class="material-icons align-middle me-2">do_not_disturb_on</span> Nada
          </button>
        </div>
      </div>
    </div>
  </div>`;
    } catch (err) {
        showError(err.message || 'Error al mostrar la pista');
    }
}
