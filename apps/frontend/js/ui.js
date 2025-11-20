export const mainContainer = document.getElementById('app-container');
// ----VISTAS----//
// Página de inicio
export function renderHome() {
  mainContainer.innerHTML = `
    <div class="container"><div class="text-center my-5">
      <h1>Bienvenido a ClimbIt</h1>
      <p class="lead">Tu aplicación para gestionar escaladores y pistas de escalada.</p>
      <a href="#crearEscalador" class="btn btn-primary mx-2">Crear Escalador</a>
      <a href="#crearPista" class="btn btn-secondary mx-2">Crear Pista</a>
    </div></div>`;
}

// Formulario para crear un nuevo escalador
export function renderCrearEscalador() {
  mainContainer.innerHTML = `

    <div class="container">
    <h1>Nuevo Escalador</h1>
    <form action="http://localhost:3000/escaladores/create" method="POST">
      <div class="mb-3">
        <label for="nombre" class="form-label">Nombre</label>
        <input
          type="text"
          class="form-control"
          name="nombre"
          id="nombre"
          required
        />
      </div>
      <div class="mb-3">
        <label for="edad" class="form-label">Edad</label>
        <input
          type="number"
          class="form-control"
          name="edad"
          id="edad"
          required
        />
      </div>
      <div class="mb-3">
        <label for="experiencia" class="form-label">Experiencia</label>
        <select
          name="experiencia"
          id="experiencia"
          class="form-select"
          required
        >
          <option value="" disabled selected>Seleccione una opción</option>
          <option value="Principiante">Principiante</option>
          <option value="Intermedio">Intermedio</option>
          <option value="Avanzado">Avanzado</option>
          <option value="Experto">Experto</option>
        </select>
      </div>
      <button type="submit" class="btn btn-primary">Crear</button>
    </form></div>`;
}

// Formulario para crear una nueva pista
export function renderCrearPista() {
  mainContainer.innerHTML = `
  <div class="container">  
  <h1>Nueva Pista</h1>
    <form action="http://localhost:3000/pistas/create" method="POST">
      <div class="mb-3">
        <label for="nombre" class="form-label">Nombre</label>
        <input
          type="text"
          class="form-control"
          name="nombre"
          id="nombre"
          required
        />
      </div>
      <div class="mb-3">
        <label for="dificultad" class="form-label">Dificultad</label>
        <select class="form-control" name="dificultad" id="dificultad">
          <option value="Fácil">Fácil</option>
          <option value="Media">Media</option>
          <option value="Difícil">Difícil</option>
        </select>
      </div>
      <button type="submit" class="btn btn-primary">Crear</button>
    </form></div>`;
}

export async function renderInfoPista(pista) {
  try {
    let data = pista;

    // Si nos han pasado un Response, parsearlo a JSON
    if (pista && typeof pista.json === 'function') {
      data = await pista.json().catch(() => {
        throw new Error('Respuesta no válida: JSON esperado');
      });
    }

    // Asegurar que tenemos un objeto con los campos esperados
    const { id, nombre, dificultad } = data || {};
    if (id == null || nombre == null || dificultad == null) {
      throw new Error('Datos de pista incompletos');
    }

    mainContainer.innerHTML = `<div class="bg-light">
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
    // Mostrar error amigable
    showError(err.message || 'Error al mostrar la pista');
  }
}


// ----Componentes UI----//
// Loader
export function showLoading() {
  mainContainer.innerHTML = `
        <div class="d-flex justify-content-center my-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
        </div>`;
}

// Error
export function showError(message) {
  mainContainer.innerHTML = `
        <div class="alert alert-danger" role="alert">
            <strong>Error:</strong> ${message}
        </div>`;
}
