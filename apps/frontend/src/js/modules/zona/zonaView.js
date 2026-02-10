import { renderNavbar } from '../../components/navbar.js';

export function renderMapaZona(container, data, onZonaSelect) {
    const { rocodromo, zonas } = data;
    const nombreRocodromo = rocodromo?.nombre || 'Rocódromo';

    // Crear estructura básica
    container.innerHTML = `
        <div class="card shadow-sm d-flex flex-column" style="height: 100vh; overflow: hidden;">
            
            <!-- Cabecera -->
            <div class="card-header bg-white d-flex align-items-center gap-2 py-3">
                 <a href="#misRocodromos" class="text-dark text-decoration-none">
                    <span class="material-icons align-middle">arrow_back</span>
                </a>
                <img src="/assets/rocodromoDefecto.jpg" alt="Icono rocódromo" class="rounded-circle" style="width: 32px; height: 32px; object-fit: cover;">
                <span class="fw-medium text-truncate">${nombreRocodromo}</span>
            </div>

            <!-- Mapa (Imagen estática por ahora) -->
             <div class="mapa-rocodromo position-relative bg-dark flex-shrink-0" style="height: 40vh; min-height: 300px; overflow: hidden;">
                <img 
                    src="/assets/mapaDefecto.jpg" 
                    alt="Mapa del rocódromo" 
                    class="w-100 h-100" 
                    style="object-fit: cover; opacity: 0.8;"
                />
                
                <!-- Título del Mapa (Fondo) -->
                <div class="position-absolute bottom-0 start-0 end-0 p-3" style="background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);">
                    <h5 id="mapaTitulo" class="text-white mb-0 text-shadow">Mapa General</h5>
                </div>
                
                <!-- Selector de Zona (Overlay Superior Izquierda) -->
                <div class="position-absolute top-0 start-0 m-3" style="z-index: 10;">
                   <select id="zonaSelector" class="form-select form-select-sm shadow-sm opacity-90 fw-bold border-0" style="min-width: 150px; backdrop-filter: blur(4px); background-color: rgba(255, 255, 255, 0.9);">
                        ${zonas.map((z, index) => `<option value="${z.id}" ${index === 0 ? 'selected' : ''}>Zona ${z.tipo || z.id}</option>`).join('')}
                    </select>
                </div>
            </div>



            <!-- Contenedor de Pistas (Dinámico) -->
            <div id="pistasContainer" class="card-body flex-grow-1 overflow-auto bg-light">
                <div class="text-center text-muted mt-5 fade-in">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                </div>
            </div>

            <!-- Navbar -->
            ${renderNavbar()}
        </div>
    `;

    // Lógica del selector
    const selector = container.querySelector('#zonaSelector');
    const pistasContainer = container.querySelector('#pistasContainer');

    const loadZonas = async (idZona, direction = null) => {
        if (!idZona) return;

        // Actualizar título del mapa
        const textoZona = selector.options[selector.selectedIndex].text;
        const mapaTitulo = container.querySelector('#mapaTitulo');
        if (mapaTitulo) mapaTitulo.textContent = `Mapa ${textoZona}`;

        // Mostrar loading en el contenedor de pistas
        let animationClass = '';
        if (direction === 'next') animationClass = 'slide-in-right';
        if (direction === 'prev') animationClass = 'slide-in-left';

        pistasContainer.innerHTML = `
            <div class="d-flex justify-content-center align-items-center h-100 ${animationClass}">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
            </div>
        `;

        // Cargar pistas usando el callback
        const pistas = await onZonaSelect(idZona);

        // Renderizar pistas
        if (!pistas || pistas.length === 0) {
            pistasContainer.innerHTML = `
                <div class="alert alert-info text-center mt-3">
                    No hay pistas registradas en esta zona.
                </div>
            `;
            return;
        }

        pistasContainer.innerHTML = `
            <h6 class="text-muted mb-3 small fw-bold text-uppercase ${animationClass}">Pistas Disponibles (${pistas.length})</h6>
            <div class="row g-3 ${animationClass}">
                ${pistas.map(pista => {
            const status = pista.statusConfig;
            return `
                    <div class="col-6 fade-in">
                        <a href="#infoPista?id=${pista.id}" class="text-decoration-none text-dark">
                            <div class="card h-100 border-0 shadow-sm zona-card overflow-hidden">
                                <div class="position-relative" style="aspect-ratio: 3/4;">
                                    <img src="/assets/placeholder.jpg" class="card-img-top w-100 h-100" style="object-fit: cover;" alt="${pista.nombre}">
                                    
                                    <!-- Estado Indicator -->
                                    <div class="position-absolute top-0 start-0 m-2 rounded-circle d-flex align-items-center justify-content-center shadow-sm" style="width: 32px; height: 32px; background: ${status.bg};">
                                        <span class="material-icons" style="color: ${status.color}; font-size: 20px;">${status.icon}</span>
                                    </div>

                                    <div class="position-absolute top-0 end-0 m-2">
                                        <span class="badge bg-primary shadow-sm">${pista.dificultad}</span>
                                    </div>
                                    <div class="position-absolute bottom-0 start-0 end-0 p-3 zona-card-overlay">
                                        <h6 class="text-white mb-0 fw-bold text-truncate">${pista.nombre}</h6>
                                    </div>
                                </div>
                            </div>

                        </a>
                    </div>
                `;
        }).join('')}
            </div>
        `;
    };

    selector.addEventListener('change', (e) => loadZonas(e.target.value));

    // Lógica de Swipe para cambiar de zona
    const mapaContainer = container.querySelector('.mapa-rocodromo');
    let touchStartX = 0;
    let touchEndX = 0;

    mapaContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    mapaContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    const handleSwipe = () => {
        const threshold = 50; // Mínima distancia para considerar swipe
        if (touchEndX < touchStartX - threshold) {
            // Swipe Left -> Siguiente zona
            if (selector.selectedIndex < selector.options.length - 1) {
                selector.selectedIndex++;
                loadZonas(selector.value, 'next');
            }
        }
        if (touchEndX > touchStartX + threshold) {
            // Swipe Right -> Zona anterior
            if (selector.selectedIndex > 0) {
                selector.selectedIndex--;
                loadZonas(selector.value, 'prev');
            }
        }
    };

    // Cargar zona inicial si existe
    if (selector.value) {
        loadZonas(selector.value);
    }
}

// Vista para crear una nueva zona
export function renderCrearZona(container, callbacks) {
    container.innerHTML = `
  <div class="card shadow-sm">
    <div class="card-header bg-white d-flex align-items-center gap-2 py-3">
      <a href="#" onclick="history.back(); return false;" class="text-dark">
        <span class="material-icons align-middle">arrow_back</span>
      </a>
      <span class="fw-medium">Nueva Zona</span>
    </div>
    <div class="card-body">
      <form id="form-crear-zona" novalidate>
        <div class="mb-3">
          <label for="idRocodromo" class="form-label">ID Rocódromo</label>
          <input
            type="number"
            class="form-control"
            name="idRocodromo"
            id="idRocodromo"
            required
            placeholder="ID del rocódromo"
          />
          <div class="invalid-feedback"></div>
        </div>
        <div class="mb-3">
          <label for="nombre" class="form-label">Nombre / Tipo</label>
          <input
            type="text"
            class="form-control"
            name="nombre"
            id="nombre"
            required
            placeholder="Ej: Muro Principal, Boulder, etc."
          />
          <div class="invalid-feedback"></div>
        </div>
        <div id="form-alert" class="alert d-none" role="alert"></div>
        <button type="submit" class="btn btn-primary w-100">Crear Zona</button>
      </form>
    </div>
  </div>`;

    const form = container.querySelector('#form-crear-zona');
    const idRocodromoInput = container.querySelector('#idRocodromo');
    const nombreInput = container.querySelector('#nombre');
    const alertBox = container.querySelector('#form-alert');

    // Pre-fill ID Rocódromo if present in URL hack (optional, but good UX)
    // Pero como no tenemos acceso fácil a URL params aquí sin pasarlos, lo dejamos así.

    // Limpiar errores al escribir
    [idRocodromoInput, nombreInput].forEach((el) => {
        el.addEventListener('input', () => {
            el.classList.remove('is-invalid');
            alertBox.classList.add('d-none');
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const values = {
            idRoco: idRocodromoInput.value, // Backend expects 'idRoco' based on controller analysis
            nombre: nombreInput.value.trim(),
        };
        callbacks.onSubmit(values, {
            idRocodromoInput,
            nombreInput,
            alertBox
        });
    });
}
