export const mainContainer = document.getElementById('app-container');
// ----VISTAS----//
// Página de inicio
export function renderHome() {
  mainContainer.innerHTML = `
    <div class="text-center my-5">
      <h1>Bienvenido a ClimbIt</h1>
      <p class="lead">Tu aplicación para gestionar escaladores y pistas de escalada.</p>
      <a href="#crearEscalador" class="btn btn-primary mx-2">Crear Escalador</a>
      <a href="#crearPista" class="btn btn-secondary mx-2">Crear Pista</a>
    </div>`;
}

// Formulario para crear un nuevo escalador
export function renderCrearEscalador() {
  mainContainer.innerHTML = `
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
    </form>`;
}

// Formulario para crear una nueva pista
export function renderCrearPista() {
  mainContainer.innerHTML = `
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
    </form>`;
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
