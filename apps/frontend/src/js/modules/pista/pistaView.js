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
<div class="d-flex flex-column" style="min-height: 100vh; background: #f8f9fa;">
  
  <!-- Imagen hero con overlay -->
  <div class="position-relative" style="height: 45vh; min-height: 280px;">
    <img 
      src="/assets/placeholder.jpg" 
      alt="Imagen de la pista ${nombre || ''}" 
      class="w-100 h-100" 
      style="object-fit: cover;"
    />
    <div class="position-absolute top-0 start-0 end-0 bottom-0" style="background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.5) 100%);"></div>
    
    <!-- Botón volver -->
    <a href="#" onclick="history.back(); return false;" class="position-absolute top-0 start-0 m-3 text-white d-flex align-items-center justify-content-center rounded-circle text-decoration-none" style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); backdrop-filter: blur(4px);">
      <span class="material-icons">arrow_back</span>
    </a>
    
    <!-- Info sobre la imagen -->
    <div class="position-absolute bottom-0 start-0 end-0 p-4 text-white">
      <span class="badge mb-2" style="background: rgba(255,255,255,0.2); backdrop-filter: blur(4px); font-size: 0.9rem; padding: 6px 12px;">${dificultad || '-'}</span>
      <h1 class="fs-4 fw-semibold mb-0">${nombre || 'Sin nombre'}</h1>
    </div>
  </div>

  <!-- Contenido principal -->
  <div class="flex-grow-1 d-flex flex-column">
    
    <!-- Estado actual -->
    <div class="bg-white px-4 py-4 border-bottom">
      <div class="d-flex align-items-center justify-content-between">
        <div>
          <p class="text-muted small mb-1 text-uppercase" style="letter-spacing: 0.5px;">Tu progreso</p>
          <p class="mb-0 fw-medium" id="estado-texto">Sin registrar</p>
        </div>
        <div id="estado-actual" class="d-flex align-items-center justify-content-center rounded-circle" style="width: 48px; height: 48px; background: #e5e7eb;">
          <span class="material-icons" style="color: #6b7280; font-size: 28px;">remove</span>
        </div>
      </div>
    </div>

    <!-- Acciones -->
    <div class="bg-white mt-2 px-4 py-3">
      <p class="text-muted small mb-3 text-uppercase" style="letter-spacing: 0.5px;">Marcar como</p>
      <div class="row g-2">
        
        <div class="col-6">
          <button class="btn estado-btn d-flex flex-column align-items-center justify-content-center gap-2 w-100 py-3 rounded-3 border-0 position-relative" data-estado="flash" style="background: #fffbeb;">
            <span class="material-icons info-btn position-absolute" data-tooltip="Completado al primer intento" style="top: 8px; right: 8px; font-size: 16px; color: #d97706; cursor: pointer;">info_outline</span>
            <div class="d-flex align-items-center justify-content-center rounded-circle" style="width: 48px; height: 48px; background: #fef3c7;">
              <span class="material-icons" style="color: #d97706; font-size: 28px;">bolt</span>
            </div>
            <span class="fw-medium">Flash</span>
          </button>
        </div>

        <div class="col-6">
          <button class="btn estado-btn d-flex flex-column align-items-center justify-content-center gap-2 w-100 py-3 rounded-3 border-0 position-relative" data-estado="completado" style="background: #f0fdf4;">
            <span class="material-icons info-btn position-absolute" data-tooltip="Has superado la vía" style="top: 8px; right: 8px; font-size: 16px; color: #16a34a; cursor: pointer;">info_outline</span>
            <div class="d-flex align-items-center justify-content-center rounded-circle" style="width: 48px; height: 48px; background: #dcfce7;">
              <span class="material-icons" style="color: #16a34a; font-size: 28px;">done</span>
            </div>
            <span class="fw-medium">Completado</span>
          </button>
        </div>

        <div class="col-6">
          <button class="btn estado-btn d-flex flex-column align-items-center justify-content-center gap-2 w-100 py-3 rounded-3 border-0 position-relative" data-estado="en-progreso" style="background: #eff6ff;">
            <span class="material-icons info-btn position-absolute" data-tooltip="Trabajando en esta vía" style="top: 8px; right: 8px; font-size: 16px; color: #2563eb; cursor: pointer;">info_outline</span>
            <div class="d-flex align-items-center justify-content-center rounded-circle" style="width: 48px; height: 48px; background: #dbeafe;">
              <span class="material-icons" style="color: #2563eb; font-size: 28px;">sync</span>
            </div>
            <span class="fw-medium">Proyecto</span>
          </button>
        </div>

        <div class="col-6">
          <button class="btn estado-btn d-flex flex-column align-items-center justify-content-center gap-2 w-100 py-3 rounded-3 border-0 position-relative" data-estado="nada" style="background: #f3f4f6;">
            <span class="material-icons info-btn position-absolute" data-tooltip="Quitar registro" style="top: 8px; right: 8px; font-size: 16px; color: #6b7280; cursor: pointer;">info_outline</span>
            <div class="d-flex align-items-center justify-content-center rounded-circle" style="width: 48px; height: 48px; background: #e5e7eb;">
              <span class="material-icons" style="color: #6b7280; font-size: 28px;">remove</span>
            </div>
            <span class="fw-medium">Desmarcar</span>
          </button>
        </div>

      </div>
    </div>

  </div>
</div>`;

    // Configurar eventos para los botones de estado
    const estadoActual = container.querySelector('#estado-actual');
    const estadoTexto = container.querySelector('#estado-texto');
    const estadoBtns = container.querySelectorAll('.estado-btn');

    const estadosTexto = {
        'flash': 'Flash',
        'completado': 'Completado',
        'en-progreso': 'Proyecto',
        'nada': 'Sin registrar'
    };

    estadoBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Ignorar si se hizo clic en el icono de info
            if (e.target.classList.contains('info-btn')) return;
            
            const estado = btn.dataset.estado;
            
            // Actualizar texto del estado
            estadoTexto.textContent = estadosTexto[estado] || 'Sin registrar';
            
            // Delegar actualización visual del icono y llamada API al controlador
            callbacks.onEstadoChange(estado, estadoActual, estadoTexto);
        });
    });

    // Tooltips para los iconos de información
    const infoBtns = container.querySelectorAll('.info-btn');
    let activeTooltip = null;

    infoBtns.forEach(infoBtn => {
        infoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Cerrar tooltip activo si existe
            if (activeTooltip) {
                activeTooltip.remove();
                activeTooltip = null;
            }

            // Crear tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'position-absolute px-3 py-2 rounded-3 shadow-sm';
            tooltip.style.cssText = 'background: #1f2937; color: white; font-size: 0.8rem; z-index: 1000; top: 30px; right: 0; white-space: nowrap; animation: fadeIn 0.15s ease;';
            tooltip.textContent = infoBtn.dataset.tooltip;
            
            infoBtn.parentElement.appendChild(tooltip);
            activeTooltip = tooltip;

            // Cerrar al hacer clic fuera
            setTimeout(() => {
                document.addEventListener('click', function closeTooltip() {
                    if (activeTooltip) {
                        activeTooltip.remove();
                        activeTooltip = null;
                    }
                    document.removeEventListener('click', closeTooltip);
                }, { once: true });
            }, 10);

            // Auto-cerrar después de 3 segundos
            setTimeout(() => {
                if (activeTooltip === tooltip) {
                    tooltip.remove();
                    activeTooltip = null;
                }
            }, 3000);
        });
    });
}
