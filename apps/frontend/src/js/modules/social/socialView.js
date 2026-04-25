import { renderNavbar } from '../../components/navbar.js';

export function renderSocialView(container, amigos, callbacks) {
    // Generar el HTML inicial
    container.innerHTML = `
        <div class="card-header bg-white d-flex align-items-center justify-content-center py-3 position-relative">
            <div class="d-flex align-items-center gap-2">
                <img src="/icons/apple-touch-icon.png" alt="Logo de ClimbIt" class="social-header-logo" />
                <span class="fw-bold fs-5">ClimbIt</span>
            </div>
        </div>
        
        <div class="bg-light border-bottom border-top py-2 px-3 d-flex align-items-center justify-content-center position-relative shadow-sm social-mis-amigos-bar">
            <span class="fw-bold text-dark social-mis-amigos-text">Mis Amigos</span>
            <button class="btn btn-link text-dark p-0 position-absolute end-0 me-3" id="btn-mailbox" aria-label="Buzón de solicitudes">
                <span class="material-icons social-mailbox-icon">markunread_mailbox</span>
            </button>
        </div>

        <div class="d-flex flex-column flex-grow-1 overflow-hidden bg-white">
            <div class="p-3">
                <div class="d-flex justify-content-between gap-2 mb-3 ${amigos.length === 0 ? 'd-none' : ''}">
                    <div class="d-flex gap-2 w-100">
                        <div class="position-relative flex-grow-1">
                            <span class="material-icons position-absolute top-50 start-0 translate-middle-y ms-2 social-search-icon" alt="Icono de búsqueda">search</span>
                            <input type="text" id="search-amigos-input" class="form-control fw-medium ps-4 social-search-input" placeholder="Buscar amigos" />
                        </div>
                        <button class="btn text-white fw-bold d-flex align-items-center gap-1 social-add-friend-btn">
                            <span class="material-icons" alt="Icono de añadir amigo" aria-label="Añadir amigo" style="font-size: 18px;">person_add</span>
                        </button>
                    </div>
                </div>
                
                <div id="lista-amigos-container" class="d-flex flex-column gap-3 overflow-auto pb-4 social-lista-container">
                    <!-- La lista se inserta aquí -->
                </div>
            </div>
        </div>
        ${renderNavbar()}
    `;

    const listaContainer = container.querySelector('#lista-amigos-container');
    const searchInput = container.querySelector('#search-amigos-input');

    const renderLista = (lista, isSearch = false) => {
        if (!lista || lista.length === 0) {
            if (isSearch) {
                listaContainer.innerHTML = `
                    <div class="text-center mt-4 px-2">
                        <h5 class="fst-italic mb-3 text-muted">No se encontraron amigos con ese apodo</h5>
                    </div>
                `;
            } else {
                listaContainer.innerHTML = `
                    <div class="text-center mt-4 px-2">
                        <h5 class="fst-italic mb-3">Aún no tienes ningún amigo</h5>
                        <p class="fst-italic mb-4">Envialé una solicitud a esa<br>persona especial del rocódromo</p>
                        <button class="btn text-white fw-bold d-inline-flex align-items-center gap-1 px-4 py-2" style="border-radius: 8px; background-color: #e57c2a; border-color: #e57c2a;">
                            <span class="material-icons">person_add</span> Añadir Amigo
                        </button>
                    </div>
                `;
            }
            return;
        }

        listaContainer.innerHTML = lista.map(amigo => {
            const descripcion = amigo.descripcion || 'Sin descripción...';

            return `
            <div class="border rounded-3 bg-white p-2 position-relative card-box-shadow social-amigo-card">
                <div class="card-body d-flex align-items-center p-2">
                    <img src="${amigo.fotoSrc}" alt="Foto de ${amigo.apodo}" class="rounded-circle ms-1 me-2 social-amigo-foto" />
                    <div class="flex-grow-1 overflow-hidden">
                        <p class="mb-1 py-1 fs-5 fw-bold text-dark social-amigo-text text-truncate">${amigo.apodo}</p>
                        <p class="text-muted small mb-0 social-amigo-desc">${descripcion}</p>
                    </div>
                    <div class="text-center border-start ps-3 py-1 pe-2 flex-shrink-0">
                        <small class="text-muted d-block mb-1 social-amigo-rutas-label">RUTAS<br>ESTE MES</small>
                        <span class="fs-4 fw-bold">0</span>
                    </div>
                </div>
            </div>
        `}).join('');
    };

    // Renderizado inicial
    renderLista(amigos, false);

    // Evento de búsqueda
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            if (query.length >= 2 || query.length === 0) {
                const resultados = await callbacks.onSearch(query);
                renderLista(resultados, query.length >= 2);
            }
        }, 300); // Pequeño debounce
    });
}