import { renderNavbar } from '../../components/navbar.js';

export function renderMapaZona(container, data, onZonaSelect, initialZonaId = null, onMapaRender = null, onMapaToggle = null) {
    const { rocodromo, zonas, canCreateRuta = false } = data;
    const nombreRocodromo = rocodromo?.nombre || 'Rocódromo';

    // Determinar zona inicial
    const zonaInicial = initialZonaId
        ? zonas.find(z => z.id == initialZonaId)
        : zonas[0]; // Por defecto la primera

    // Crear estructura básica
    container.innerHTML = `
        <div id="mapaZonaCard" class="card shadow-sm d-flex flex-column" style="height: 100dvh; overflow: hidden;">
            
            <!-- Cabecera -->
            <div class="card-header bg-white d-flex align-items-center gap-2 py-3">
                 <a href="#misRocodromos" class="text-dark text-decoration-none">
                    <span class="material-icons align-middle">arrow_back</span>
                </a>
                <img src="/assets/rocodromoDefecto.jpg" alt="Icono rocódromo" class="rounded-circle" style="width: 32px; height: 32px; object-fit: cover;">
                <span class="fw-medium text-truncate">${nombreRocodromo}</span>
                <div class="ms-auto" style="max-width: 170px;">
                   <select id="zonaSelector" class="form-select form-select-sm shadow-sm fw-bold border-0" style="min-width: 150px; background-color: rgba(255, 255, 255, 0.95);">
                        ${zonas.map((z) => `<option value="${z.id}" ${z.id == (zonaInicial?.id) ? 'selected' : ''}>Zona ${z.nombre || z.id}</option>`).join('')}
                    </select>
                </div>
            </div>

            <!-- Componente de mapa SVG interactivo -->
             <div id="mapaRocodromoContainer" class="mapa-rocodromo position-relative bg-dark flex-shrink-0" style="height: 40dvh; min-height: 300px; overflow: hidden;">
                <div id="mapaSvgViewport" class="mapa-svg-viewport w-100 h-100" aria-label="Mapa del rocódromo">
                    <div class="d-flex justify-content-center align-items-center h-100 text-white-50">
                        <div class="spinner-border" role="status">
                            <span class="visually-hidden">Cargando mapa...</span>
                        </div>
                    </div>
                </div>

                <div class="position-absolute end-0 bottom-0 m-3 d-flex gap-2" style="z-index: 12;">
                    <button id="btnMapaExpandir" type="button" class="btn btn-sm btn-light shadow-sm d-flex align-items-center gap-1 mapa-toggle-btn" aria-label="Expandir mapa">
                        <span class="material-icons" style="font-size: 18px;">fullscreen</span>
                        <span class="small fw-semibold">Expandir</span>
                    </button>
                    <button id="btnMapaContraer" type="button" class="btn btn-sm btn-light shadow-sm d-none d-flex align-items-center gap-1 mapa-toggle-btn" aria-label="Contraer mapa">
                        <span class="material-icons" style="font-size: 18px;">fullscreen_exit</span>
                        <span class="small fw-semibold">Contraer</span>
                    </button>
                </div>
                
                <!-- Título del Mapa (Fondo) -->
                <div class="position-absolute bottom-0 start-0 end-0 p-3" style="background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);">
                    <h5 id="mapaTitulo" class="text-white mb-0 text-shadow">Mapa General</h5>
                </div>
            </div>



            <!-- Contenedor de Rutas (Dinámico) -->
            <div id="rutasContainer" class="card-body flex-grow-1 overflow-auto bg-light">
                ${zonas.length > 0 ? `
                <div class="text-center text-muted mt-5 fade-in">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                </div>` : `
                <div class="d-flex flex-column justify-content-center align-items-center h-100 text-muted fade-in">
                    <span class="material-icons mb-3" style="font-size: 48px; opacity: 0.5;">map</span>
                    <p class="mb-0">Este rocódromo no tiene zonas registradas.</p>
                </div>
                `}
            </div>

            <!-- Navbar -->
            ${renderNavbar()}
        </div>
    `;

    // Lógica del selector
    const selector = container.querySelector('#zonaSelector');
    const rutasContainer = container.querySelector('#rutasContainer');
    const mapaContainer = container.querySelector('#mapaRocodromoContainer');
    const btnMapaExpandir = container.querySelector('#btnMapaExpandir');
    const btnMapaContraer = container.querySelector('#btnMapaContraer');

    const setMapaExpandido = (expandido) => {
        mapaContainer.classList.toggle('mapa-rocodromo-fullscreen', expandido);
        rutasContainer.classList.toggle('d-none', expandido);
        btnMapaExpandir.classList.toggle('d-none', expandido);
        btnMapaContraer.classList.toggle('d-none', !expandido);

        if (typeof onMapaToggle === 'function') {
            onMapaToggle(expandido);
        }
    };

    btnMapaExpandir.addEventListener('click', () => setMapaExpandido(true));
    btnMapaContraer.addEventListener('click', () => setMapaExpandido(false));

    const updateUrl = (idZona) => {
        const currentUrl = new URL(window.location.href);
        // Usar replaceState para no llenar el historial de navegación con cada cambio de zona
        // Pero si queremos que el botón "Atrás" funcione entre zonas, usaríamos pushState.
        // El usuario pidió "cuando entras a una ruta al ir atrás te redirige siempre a la primera zona".
        // Esto sugiere que quiere que el estado se conserve. replaceState es suficiente para eso.
        // Si cambia de zona 1 -> zona 2, y luego entra a ruta X, al volver atrás, debería estar en zona 2.
        // Si usamos replaceState, al cambiar de zona 1 a 2, reemplazamos la entrada actual.
        // Al entrar a ruta X (nueva entrada), el historial es: [..., zona 2, ruta X].
        // Al volver, volvemos a zona 2. Correcto.
        currentUrl.hash = `#mapaZona?id=${rocodromo.id}&zona=${idZona}`;
        history.replaceState(null, '', currentUrl.toString());
    };

    const loadZonas = async (idZona, direction = null) => {
        if (!idZona) return;

        // Validar que la zona existe en la lista (para evitar errores si viene un id raro en URL)
        const zonaExists = zonas.some(z => z.id == idZona);
        if (!zonaExists && zonas.length > 0) {
            idZona = zonas[0].id; // Fallback
        } else if (!zonaExists) {
            return;
        }

        // Actualizar URL
        updateUrl(idZona);

        // Actualizar título del mapa
        const zonaObj = zonas.find(z => z.id == idZona);
        const textoZona = zonaObj ? `Zona ${zonaObj.nombre || zonaObj.id}` : 'Mapa General';

        const mapaTitulo = container.querySelector('#mapaTitulo');
        if (mapaTitulo) mapaTitulo.textContent = `Mapa ${textoZona}`;

        // Mostrar loading en el contenedor de rutas
        let animationClass = '';
        if (direction === 'next') animationClass = 'slide-in-right';
        if (direction === 'prev') animationClass = 'slide-in-left';

        rutasContainer.innerHTML = `
            <div class="d-flex justify-content-center align-items-center h-100 ${animationClass}">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
            </div>
        `;

        // Cargar rutas usando el callback
        const rutas = await onZonaSelect(idZona);

        if (typeof onMapaRender === 'function') {
            await onMapaRender(idZona, rutas || []);
        }

        // Renderizar rutas
        if (!rutas || rutas.length === 0) {
            rutasContainer.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-3 ${animationClass}">
                    <h6 class="text-muted small fw-bold text-uppercase mb-0">Rutas Disponibles (0)</h6>
                    ${canCreateRuta ? `
                    <a href="#crearRuta?idRocodromo=${rocodromo.id}&idZona=${idZona}" class="btn btn-sm btn-primary d-flex align-items-center gap-1">
                        <span class="material-icons" style="font-size: 18px;">add</span>
                        <span>Crear ruta</span>
                    </a>` : ''}
                </div>
                <div class="alert alert-info text-center mt-3">
                    No hay rutas registradas en esta zona.
                </div>
            `;
            return;
        }

        rutasContainer.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3 ${animationClass}">
                <h6 class="text-muted small fw-bold text-uppercase mb-0">Rutas Disponibles (${rutas.length})</h6>
                ${canCreateRuta ? `
                <a href="#crearRuta?idRocodromo=${rocodromo.id}&idZona=${idZona}" class="btn btn-sm btn-primary d-flex align-items-center gap-1">
                    <span class="material-icons" style="font-size: 18px;">add</span>
                    <span>Crear ruta</span>
                </a>` : ''}
            </div>
            <div class="row g-3 ${animationClass}">
                ${rutas.map(ruta => {
            const status = ruta.statusConfig;
            return `
                    <div class="col-6 fade-in">
                        <a href="#infoRuta?id=${ruta.id}" class="text-decoration-none text-dark">
                            <div class="card h-100 border-0 shadow-sm zona-card overflow-hidden">
                                <div class="position-relative" style="aspect-ratio: 3/4;">
                                    <img src="/assets/placeholder.jpg" class="card-img-top w-100 h-100" style="object-fit: cover;" alt="${ruta.nombre}">
                                    
                                    <!-- Estado Indicator -->
                                    <div class="position-absolute top-0 start-0 m-2 rounded-circle d-flex align-items-center justify-content-center shadow-sm" style="width: 32px; height: 32px; background: ${status.bg};">
                                        <span class="material-icons" style="color: ${status.color}; font-size: 20px;">${status.icon}</span>
                                    </div>

                                    <div class="position-absolute top-0 end-0 m-2">
                                        <span class="badge bg-primary shadow-sm">${ruta.dificultad}</span>
                                    </div>
                                    <div class="position-absolute bottom-0 start-0 end-0 p-3 zona-card-overlay">
                                        <h6 class="text-white mb-0 fw-bold text-truncate">${ruta.nombre}</h6>
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

    // Cargar zona inicial (si hay zonas)
    if (zonaInicial) {
        // No llamamos a loadZonas inmediatamente porque podría sobreescribir la URL
        // si initialZonaId es null. Solo la cargamos visualmente.
        // O mejor: simplemente llamamos a loadZonas con el ID inicial.
        // Si no habia ID en URL, updateUrl lo pondrá. Esto es deseable.
        loadZonas(zonaInicial.id);
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
          <label for="nombre" class="form-label">Nombre / Nombre</label>
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
