import { escapeHtml } from '../../components/formHelpers.js';

export function renderMapaZona(container, data, onZonaSelect, initialZonaId = null, onMapaRender = null, onMapaToggle = null, onFiltersApply = null) {
    const {
        rocodromo,
        zonas,
        canCreateRuta = false,
        dificultadOptionsByTipo = { boulder: [], via: [] },
        filtrosActivos = { tipo: 'all', dificultadMin: '', dificultadMax: '' },
    } = data;
    const nombreRocodromo = rocodromo?.nombre || 'Rocódromo';

    // Determinar zona inicial
    const zonaInicial = initialZonaId
        ? zonas.find(z => z.id == initialZonaId)
        : zonas[0]; // Por defecto la primera

    // Crear estructura básica
    container.innerHTML = `
        <div id="mapaZonaCard" class="d-flex flex-column" style="height: 100dvh; overflow: hidden;">
            
            <!-- Cabecera -->
            <div class="card-header bg-white d-flex align-items-center gap-2 py-3">
                 <a href="#misRocodromos" class="text-dark text-decoration-none">
                    <span class="material-icons align-middle">arrow_back</span>
                </a>
                <img src="${rocodromo?.logoSrc || '/assets/rocodromoDefecto.jpg'}" alt="Icono rocódromo" class="rounded-circle" style="width: 32px; height: 32px; object-fit: cover;">
                <span class="fw-medium text-truncate">${nombreRocodromo}</span>
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
                    </button>
                    <button id="btnMapaContraer" type="button" class="btn btn-sm btn-light shadow-sm d-none d-flex align-items-center gap-1 mapa-toggle-btn" aria-label="Contraer mapa">
                        <span class="material-icons" style="font-size: 18px;">fullscreen_exit</span>
                    </button>
                </div>
                
            </div>

            <div id="zonaToolbar" class="card-body bg-light py-2 border-bottom">
                <div class="d-flex align-items-center gap-2">
                    <select id="zonaSelector" class="form-select form-select-sm shadow-sm fw-bold" aria-label="Seleccionar zona">
                        ${zonas.map((z) => `<option value="${z.id}" ${z.id == (zonaInicial?.id) ? 'selected' : ''}>Zona ${z.nombre || z.id}</option>`).join('')}
                    </select>
                    <button id="btnZonaFiltros" type="button" class="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center position-relative" aria-label="Filtros" title="Filtrar rutas">
                        <span class="material-icons" style="font-size: 20px;">filter_alt</span>
                        <span id="filtrosActivosBadge" class="position-absolute top-0 start-100 translate-middle p-1 bg-primary border border-light rounded-circle d-none" style="width: 10px; height: 10px;"></span>
                    </button>
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
        </div>

        <div class="modal fade" id="zonaFiltrosModal" tabindex="-1" aria-labelledby="zonaFiltrosModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="zonaFiltrosModalLabel">Filtrar rutas</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="filtroTipoRuta" class="form-label">Tipo de ruta</label>
                            <select id="filtroTipoRuta" class="form-select">
                                <option value="all">Todas</option>
                                <option value="via">Vía</option>
                                <option value="boulder">Boulder</option>
                            </select>
                        </div>
                        <div class="row g-2">
                            <div class="col-6">
                                <label for="filtroDificultadMin" class="form-label">Dificultad mínima</label>
                                <select id="filtroDificultadMin" class="form-select">
                                    <option value="">Sin mínimo</option>
                                </select>
                            </div>
                            <div class="col-6">
                                <label for="filtroDificultadMax" class="form-label">Dificultad máxima</label>
                                <select id="filtroDificultadMax" class="form-select">
                                    <option value="">Sin máximo</option>
                                </select>
                            </div>
                        </div>
                        <small id="filtroHint" class="text-muted d-block mt-2">
                            Selecciona tipo para habilitar el rango de dificultad.
                        </small>
                    </div>
                    <div class="modal-footer">
                        <button type="button" id="btnLimpiarFiltros" class="btn btn-outline-secondary">Limpiar</button>
                        <button type="button" id="btnAplicarFiltros" class="btn btn-primary">Aplicar filtros</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Lógica del selector
    const selector = container.querySelector('#zonaSelector');
    const zonaToolbar = container.querySelector('#zonaToolbar');
    const rutasContainer = container.querySelector('#rutasContainer');
    const mapaContainer = container.querySelector('#mapaRocodromoContainer');
    const btnMapaExpandir = container.querySelector('#btnMapaExpandir');
    const btnMapaContraer = container.querySelector('#btnMapaContraer');
    const btnZonaFiltros = container.querySelector('#btnZonaFiltros');
    const filtrosActivosBadge = container.querySelector('#filtrosActivosBadge');
    const zonaFiltrosModalEl = container.querySelector('#zonaFiltrosModal');
    const filtroTipoRuta = container.querySelector('#filtroTipoRuta');
    const filtroDificultadMin = container.querySelector('#filtroDificultadMin');
    const filtroDificultadMax = container.querySelector('#filtroDificultadMax');
    const filtroHint = container.querySelector('#filtroHint');
    const btnAplicarFiltros = container.querySelector('#btnAplicarFiltros');
    const btnLimpiarFiltros = container.querySelector('#btnLimpiarFiltros');

    const filterState = {
        tipo: filtrosActivos?.tipo || 'all',
        dificultadMin: filtrosActivos?.dificultadMin || '',
        dificultadMax: filtrosActivos?.dificultadMax || '',
    };

    let currentZonaId = zonaInicial?.id || null;

    const setMapaExpandido = (expandido) => {
        mapaContainer.classList.toggle('mapa-rocodromo-fullscreen', expandido);
        zonaToolbar.classList.toggle('d-none', expandido);
        rutasContainer.classList.toggle('d-none', expandido);
        btnMapaExpandir.classList.toggle('d-none', expandido);
        btnMapaContraer.classList.toggle('d-none', !expandido);

        if (typeof onMapaToggle === 'function') {
            onMapaToggle(expandido);
        }
    };

    btnMapaExpandir.addEventListener('click', () => setMapaExpandido(true));
    btnMapaContraer.addEventListener('click', () => setMapaExpandido(false));

    const setSelectOptions = (selectEl, options, emptyLabel) => {
        selectEl.innerHTML = [
            `<option value="">${escapeHtml(emptyLabel)}</option>`,
            ...options.map((option) => {
                const value = escapeHtml(option.value);
                const label = escapeHtml(option.label || option.value);
                return `<option value="${value}">${label}</option>`;
            }),
        ].join('');
    };

    const getActiveDificultadOptions = () => {
        if (filterState.tipo !== 'boulder' && filterState.tipo !== 'via') {
            return [];
        }

        return Array.isArray(dificultadOptionsByTipo[filterState.tipo])
            ? dificultadOptionsByTipo[filterState.tipo]
            : [];
    };

    const updateFilterBadge = () => {
        const hasTipo = filterState.tipo === 'boulder' || filterState.tipo === 'via';
        const hasRango = Boolean(filterState.dificultadMin || filterState.dificultadMax);
        const hasFilters = hasTipo || hasRango;

        filtrosActivosBadge.classList.toggle('d-none', !hasFilters);
        btnZonaFiltros.classList.toggle('btn-outline-secondary', !hasFilters);
        btnZonaFiltros.classList.toggle('btn-primary', hasFilters);
    };

    const syncDificultadRange = () => {
        const options = getActiveDificultadOptions();
        const indexMap = new Map(options.map((opt, idx) => [opt.value, idx]));
        const minIndex = filterState.dificultadMin ? indexMap.get(filterState.dificultadMin) : null;
        const maxIndex = filterState.dificultadMax ? indexMap.get(filterState.dificultadMax) : null;

        if (Number.isInteger(minIndex) && Number.isInteger(maxIndex) && minIndex > maxIndex) {
            filterState.dificultadMax = filterState.dificultadMin;
        }
    };

    const updateFilterForm = () => {
        const options = getActiveDificultadOptions();
        const hasTipo = filterState.tipo === 'boulder' || filterState.tipo === 'via';

        filtroTipoRuta.value = filterState.tipo;
        setSelectOptions(filtroDificultadMin, options, 'Sin mínimo');
        setSelectOptions(filtroDificultadMax, options, 'Sin máximo');

        filtroDificultadMin.disabled = !hasTipo;
        filtroDificultadMax.disabled = !hasTipo;

        if (!hasTipo) {
            filterState.dificultadMin = '';
            filterState.dificultadMax = '';
            filtroHint.textContent = 'Selecciona tipo para habilitar el rango de dificultad.';
        } else if (options.length === 0) {
            filterState.dificultadMin = '';
            filterState.dificultadMax = '';
            filtroHint.textContent = 'No hay escala de dificultad configurada para este tipo.';
        } else {
            syncDificultadRange();
            filtroHint.textContent = 'Se usa el orden de la escala del rocódromo (de más fácil a más difícil).';
        }

        if (filterState.dificultadMin && options.some((opt) => opt.value === filterState.dificultadMin)) {
            filtroDificultadMin.value = filterState.dificultadMin;
        }

        if (filterState.dificultadMax && options.some((opt) => opt.value === filterState.dificultadMax)) {
            filtroDificultadMax.value = filterState.dificultadMax;
        }

        updateFilterBadge();
    };

    const updateUrl = (idZona) => {
        const currentUrl = new URL(window.location.href);
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
        currentZonaId = idZona;

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
            const hasDificultad = typeof ruta.dificultad === 'string'
                ? ruta.dificultad.trim().length > 0
                : Boolean(ruta.dificultad);
            return `
                    <div class="col-6 fade-in">
                        <a href="#infoRuta?id=${ruta.id}" class="text-decoration-none text-dark">
                            <div class="card h-100 border-0 shadow-sm zona-card overflow-hidden">
                                <div class="position-relative" style="aspect-ratio: 3/4;">
                                    <img src="${ruta.imagenSrc || '/assets/placeholder.jpg'}" class="card-img-top w-100 h-100" style="object-fit: cover;" alt="${ruta.nombre}">
                                    
                                    <!-- Estado Indicator -->
                                    <div class="position-absolute top-0 start-0 m-2 rounded-circle d-flex align-items-center justify-content-center shadow-sm" style="width: 32px; height: 32px; background: ${status.bg};">
                                        <span class="material-icons" style="color: ${status.color}; font-size: 20px;">${status.icon}</span>
                                    </div>

                                    ${hasDificultad ? `
                                    <div class="position-absolute top-0 end-0 m-2">
                                        <span class="badge bg-primary shadow-sm">${ruta.dificultad}</span>
                                    </div>` : ''}
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

    const modalInstance = zonaFiltrosModalEl && window.bootstrap
        ? new window.bootstrap.Modal(zonaFiltrosModalEl)
        : null;

    if (btnZonaFiltros && modalInstance) {
        btnZonaFiltros.addEventListener('click', () => {
            updateFilterForm();
            modalInstance.show();
        });
    }

    if (filtroTipoRuta) {
        filtroTipoRuta.addEventListener('change', () => {
            filterState.tipo = filtroTipoRuta.value;
            updateFilterForm();
        });
    }

    if (filtroDificultadMin) {
        filtroDificultadMin.addEventListener('change', () => {
            filterState.dificultadMin = filtroDificultadMin.value;
            syncDificultadRange();
            updateFilterForm();
        });
    }

    if (filtroDificultadMax) {
        filtroDificultadMax.addEventListener('change', () => {
            filterState.dificultadMax = filtroDificultadMax.value;
            syncDificultadRange();
            updateFilterForm();
        });
    }

    if (btnLimpiarFiltros) {
        btnLimpiarFiltros.addEventListener('click', async () => {
            filterState.tipo = 'all';
            filterState.dificultadMin = '';
            filterState.dificultadMax = '';

            updateFilterForm();

            if (typeof onFiltersApply === 'function') {
                await onFiltersApply({ ...filterState });
            }

            if (currentZonaId) {
                await loadZonas(currentZonaId);
            }

            if (modalInstance) {
                modalInstance.hide();
            }
        });
    }

    if (btnAplicarFiltros) {
        btnAplicarFiltros.addEventListener('click', async () => {
            if (typeof onFiltersApply === 'function') {
                await onFiltersApply({ ...filterState });
            }

            if (currentZonaId) {
                await loadZonas(currentZonaId);
            }

            if (modalInstance) {
                modalInstance.hide();
            }
        });
    }

    updateFilterForm();

    // Cargar zona inicial (si hay zonas)
    if (zonaInicial) {

        loadZonas(zonaInicial.id);
    }
}

// Vista para crear una nueva zona
export function renderCrearZona(container, callbacks) {
    container.innerHTML = `
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
