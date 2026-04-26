import { renderNavbar } from '../../components/navbar.js';
import { showConfirmModal } from '../../components/modal.js';
import { showToast } from '../../components/toast.js';

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
                        <button class="btn text-white fw-bold d-flex align-items-center gap-1 social-add-friend-btn btn-open-add-friend-modal">
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

        <!-- Modal Añadir nuevo Amigo -->
        <div class="modal fade" id="addFriendModal" tabindex="-1" aria-labelledby="addFriendModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-fullscreen modal-dialog-scrollable">
                <div class="modal-content border-0">
                    <div class="modal-header border-0 bg-white align-items-center px-4 py-3">
                        <button type="button" class="btn btn-link text-dark text-decoration-none p-0 d-flex align-items-center" data-bs-dismiss="modal">
                            <span class="material-icons me-2 fw-bold">arrow_back</span>
                            <span class="fw-bold fs-5 text-dark">Añadir nuevo Amigo</span>
                        </button>
                    </div>
                    <div class="modal-body bg-white p-3">
                        <div class="position-relative mb-4">
                            <span class="material-icons position-absolute top-50 start-0 translate-middle-y ms-2 social-search-icon">search</span>
                            <input type="text" id="modal-search-new-friends" class="form-control fw-medium ps-4 social-search-input font-monospace" placeholder="Buscar amigos" />
                        </div>
                        <div id="new-friends-results" class="d-flex flex-column gap-3">
                            <!-- Resultados de búsqueda -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
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
                        <button class="btn text-white fw-bold d-inline-flex align-items-center gap-1 px-4 py-2 social-add-friend-btn btn-open-add-friend-modal">
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

    // Configuración del modal para evitar que se quede bloqueada la pantalla en móviles al pulsar 'atrás'
    const modalEl = container.querySelector('#addFriendModal');
    if (modalEl) {
        const cleanupBootstrapModalArtifacts = () => {
            const backdrops = document.querySelectorAll('.modal-backdrop');
            backdrops.forEach((backdrop) => backdrop.remove());
            document.body.classList.remove('modal-open');
            document.body.style.removeProperty('padding-right');
            document.body.style.removeProperty('overflow');
        };

        let teardownController = null;

        const forceCloseAndCleanup = () => {
            if (!modalEl.isConnected || !modalEl.classList.contains('show')) {
                cleanupBootstrapModalArtifacts();
                if (teardownController) {
                    teardownController.abort();
                    teardownController = null;
                }
                return;
            }
            const modalInstance = window.bootstrap?.Modal?.getInstance(modalEl);
            if (modalInstance) {
                modalInstance.hide();
            } else {
                modalEl.classList.remove('show');
                modalEl.style.display = 'none';
                modalEl.setAttribute('aria-hidden', 'true');
            }
            cleanupBootstrapModalArtifacts();
            if (teardownController) {
                teardownController.abort();
                teardownController = null;
            }
        };

        const handlePopState = () => {
            if (modalEl.classList.contains('show')) {
                const modalInstance = window.bootstrap?.Modal?.getInstance(modalEl);
                if (modalInstance) modalInstance.hide();
            }
        };

        modalEl.addEventListener('show.bs.modal', () => {
            if (teardownController) teardownController.abort();
            teardownController = new AbortController();
            
            // Truco del historial para capturar el botón atrás del móvil
            history.pushState({ modal: 'addFriendModal' }, '', location.href);

            window.addEventListener('popstate', handlePopState, { signal: teardownController.signal });
            window.addEventListener('hashchange', forceCloseAndCleanup, { signal: teardownController.signal });
            window.addEventListener('pagehide', forceCloseAndCleanup, { signal: teardownController.signal });
        });

        modalEl.addEventListener('hide.bs.modal', () => {
            if (history.state && history.state.modal === 'addFriendModal') {
                history.back(); // Eliminar el estado del modal si se cierra por la UI
            }
        });

        modalEl.addEventListener('hidden.bs.modal', () => {
            cleanupBootstrapModalArtifacts();
            if (teardownController) {
                teardownController.abort();
                teardownController = null;
            }
        });
    }

    // Delegación de eventos global de la vista
    if (container._socialClickHandler) {
        container.removeEventListener('click', container._socialClickHandler);
    }

    container._socialClickHandler = async (e) => {
        // Botón Añadir Amigo
        if (e.target.closest('.btn-open-add-friend-modal')) {
            if (modalEl) {
                // Limpiar busquedas previas
                const input = modalEl.querySelector('#modal-search-new-friends');
                if (input) input.value = '';
                const results = modalEl.querySelector('#new-friends-results');
                if (results) results.innerHTML = '';

                let modal = window.bootstrap.Modal.getInstance(modalEl);
                if (!modal) {
                    modal = new window.bootstrap.Modal(modalEl);
                }
                modal.show();
            }
        }

        // Botón Enviar Solicitud
        const btn = e.target.closest('.btn-send-friend-request');
        if (btn) {
            const apodo = btn.getAttribute('data-apodo');
            const confirmado = await showConfirmModal({
                title: 'Añadir Amigo',
                message: `¿Deseas enviar una solicitud de amistad a <strong>${apodo}</strong>?`,
                confirmText: 'Enviar solicitud',
                confirmClass: 'btn-primary'
            });

            if (confirmado) {
                try {
                    await callbacks.onSendFriendRequest(apodo);
                    btn.disabled = true;
                    btn.innerHTML = '<span class="material-icons">check</span>';
                    btn.style.backgroundColor = '#198754'; // Success green
                    btn.style.borderColor = '#198754';
                } catch (err) {
                    showToast('Error al enviar la solicitud: ' + err.message, { variant: 'danger' });
                }
            }
        }
    };

    container.addEventListener('click', container._socialClickHandler);

    // Lógica del modal de nuevos amigos
    const modalSearchInput = container.querySelector('#modal-search-new-friends');
    const newFriendsResults = container.querySelector('#new-friends-results');

    const renderNewFriends = (lista) => {
        if (!lista || lista.length === 0) {
            newFriendsResults.innerHTML = `
                <div class="text-center mt-4 px-2">
                    <h5 class="fst-italic mb-3 font-monospace text-muted">No se encontraron usuarios</h5>
                </div>
            `;
            return;
        }

        newFriendsResults.innerHTML = lista.map(usuario => {
            const descripcion = usuario.descripcion || 'Sin descripción...';
            const isAmigo = amigos.some(a => a.apodo === usuario.apodo);
            const btnHTML = isAmigo 
                ? `<button class="btn ms-2 d-flex align-items-center justify-content-center flex-shrink-0 text-white" disabled style="width: 28px; height: 28px; padding: 0; background-color: #198754; border-color: #198754; border-radius: 4px;">
                        <span class="material-icons" style="font-size: 20px;">check</span>
                   </button>`
                : `<button class="btn social-add-friend-btn ms-2 d-flex align-items-center justify-content-center flex-shrink-0 text-white btn-send-friend-request" data-apodo="${usuario.apodo}" style="width: 28px; height: 28px; padding: 0; border-radius: 4px;">
                        <span class="material-icons" style="font-size: 20px;">person_add</span>
                   </button>`;

            return `
            <div class="border rounded-3 bg-light p-2 position-relative card-box-shadow mx-2">
                <div class="card-body d-flex align-items-center p-2">
                    <img src="${usuario.fotoSrc}" alt="Foto de ${usuario.apodo}" class="rounded-circle ms-1 me-3 social-amigo-foto" />
                    <div class="flex-grow-1 overflow-hidden pe-2">
                        <p class="mb-1 py-1 fs-6 fw-bold text-dark social-amigo-text text-truncate font-monospace">${usuario.apodo}</p>
                        <p class="text-muted small mb-0 social-amigo-desc font-monospace">${descripcion}</p>
                    </div>
                    ${btnHTML}
                </div>
            </div>
            `;
        }).join('');
    };

    let newSearchTimeout;
    if (modalSearchInput) {
        modalSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            clearTimeout(newSearchTimeout);
            newSearchTimeout = setTimeout(async () => {
                if (query.length >= 2) {
                    const resultados = await callbacks.onSearchNewFriends(query);
                    renderNewFriends(resultados);
                } else {
                    newFriendsResults.innerHTML = '';
                }
            }, 300);
        });
    }
}