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
             <div class="mapa-rocodromo position-relative bg-dark" style="height: 650px; overflow: hidden;">
                <img 
                    src="/assets/mapaDefecto.jpg" 
                    alt="Mapa del rocódromo" 
                    class="w-100 h-100" 
                    style="object-fit: cover; opacity: 0.8;"
                />
                <div class="position-absolute bottom-0 start-0 end-0 p-3" style="background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);">
                    <h5 id="mapaTitulo" class="text-white mb-0 text-shadow">Mapa General</h5>
                </div>
            </div>

            <!-- Selector de Zona -->
            <div class="px-3 py-3 bg-light border-bottom">
                <label for="zonaSelector" class="form-label small text-muted fw-bold text-uppercase">Seleccionar Zona</label>
                <select id="zonaSelector" class="form-select shadow-sm">
                    ${zonas.map((z, index) => `<option value="${z.id}" ${index === 0 ? 'selected' : ''}>Zona ${z.tipo || z.id}</option>`).join('')}
                </select>
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

    const loadZonas = async (idZona) => {
        if (!idZona) return;

        // Actualizar título del mapa
        const textoZona = selector.options[selector.selectedIndex].text;
        const mapaTitulo = container.querySelector('#mapaTitulo');
        if (mapaTitulo) mapaTitulo.textContent = `Mapa ${textoZona}`;

        // Mostrar loading en el contenedor de pistas
        pistasContainer.innerHTML = `
            <div class="d-flex justify-content-center align-items-center h-100">
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
            <h6 class="text-muted mb-3 small fw-bold text-uppercase">Pistas Disponibles (${pistas.length})</h6>
            <div class="row g-3">
                ${pistas.map(pista => `
                    <div class="col-6 fade-in">
                        <a href="#infoPista?id=${pista.id}" class="text-decoration-none text-dark">
                            <div class="card h-100 border-0 shadow-sm zona-card overflow-hidden">
                                <div class="position-relative" style="aspect-ratio: 3/4;">
                                    <img src="/assets/placeholder.jpg" class="card-img-top w-100 h-100" style="object-fit: cover;" alt="${pista.nombre}">
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
                `).join('')}
            </div>
        `;
    };

    selector.addEventListener('change', (e) => loadZonas(e.target.value));

    // Cargar zona inicial si existe
    if (selector.value) {
        loadZonas(selector.value);
    }
}
