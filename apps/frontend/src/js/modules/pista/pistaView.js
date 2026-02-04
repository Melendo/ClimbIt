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

// Vista para la creación de pistas
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
      <form id="form-crear-pista" novalidate>
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
    const form = container.querySelector('#form-crear-pista');
    const idRocodromoInput = container.querySelector('#idRocodromo');
    const idZonaInput = container.querySelector('#idZona');
    const nombreInput = container.querySelector('#nombre');
    const dificultadSelect = container.querySelector('#dificultad');
    const alertBox = container.querySelector('#form-alert');

    // Poblar select de dificultades
    dificultadSelect.innerHTML = GRADOS_FRANCESES
        .map((grado) => `<option value="${grado}">${grado}</option>`)
        .join('');

    // Limpiar errores al modificar campos
    [idRocodromoInput, idZonaInput, nombreInput, dificultadSelect].forEach((el) => {
        el.addEventListener('input', () => callbacks.onFieldChange(el, alertBox));
        el.addEventListener('change', () => callbacks.onFieldChange(el, alertBox));
    });

    // Cargar zonas al cambiar el rocódromo
    idRocodromoInput.addEventListener('blur', () => {
        callbacks.onRocodromoChange(idRocodromoInput, idZonaInput, alertBox);
    });
    idRocodromoInput.addEventListener('change', () => {
        callbacks.onRocodromoChange(idRocodromoInput, idZonaInput, alertBox);
    });

    // Envío del formulario
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const values = {
            idRocodromo: idRocodromoInput.value,
            idZona: idZonaInput.value,
            nombre: nombreInput.value,
            dificultad: dificultadSelect.value,
        };
        callbacks.onSubmit(values, {
            idRocodromoInput,
            idZonaInput,
            nombreInput,
            dificultadSelect,
            alertBox
        });
    });
}

// Vista para la información de una pista
export function renderInfoPista(container, pista, callbacks) {
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

    estadoBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const estado = btn.dataset.estado;
            callbacks.onEstadoChange(estado, estadoActual);
        });
    });
}
