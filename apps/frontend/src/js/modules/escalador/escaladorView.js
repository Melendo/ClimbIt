export function renderCrearEscalador(container) {
    container.innerHTML = `
    <div class="container">
    <h1>Nuevo Escalador</h1>
    <form action="/escaladores/create" method="POST">
      <div class="mb-3">
        <label for="correo" class="form-label">Correo</label>
        <input
          type="email"
          class="form-control"
          name="correo"
          id="correo"
          required
        />
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
      </div>
      <button type="submit" class="btn btn-primary">Crear</button>
    </form></div>`;
}
