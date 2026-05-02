import { renderNavbar } from '../../components/navbar.js';
import { showConfirmModal } from '../../components/modal.js';
import { showToast } from '../../components/toast.js';
import { escapeHtml } from '../../components/formHelpers.js';
import { renderSectionDivider } from '../../components/sectionDivider.js';
import {
  buildEscaladorStatsViewModel,
  renderMonthlyActivityCards,
  renderRouteTypesStatsCard,
  renderStatsSection,
  renderTotalRoutesStatsCard,
} from '../../components/escaladorStats.js';

export function renderSocialView(
  container,
  amigos,
  solicitudes,
  escaladorActual,
  callbacks
) {
  // Generar el HTML inicial
  container.innerHTML = `
        <div class="card-header bg-white d-flex align-items-center justify-content-center py-3 position-relative social-header">
            <div class="d-flex align-items-center gap-2">
                <img src="/icons/apple-touch-icon.png" alt="Logo de ClimbIt" class="social-header-logo" />
                <span class="fw-bold" style="font-size: 1.5rem;">ClimbIt</span>
            </div>
            <button class="btn text-muted p-0 border-0 d-flex align-items-center position-absolute top-50 end-0 translate-middle-y me-3 position-relative btn-open-mailbox" id="btn-mailbox" aria-label="Buzón de solicitudes">
                <span class="material-icons social-mailbox-icon">markunread_mailbox</span>
                <span class="notification-dot ${solicitudes && solicitudes.length > 0 ? 'active' : ''}"></span>
            </button>
        </div>

        <div class="social-tabs-bar" role="tablist">
            <button type="button" class="social-tab-btn is-active" data-social-tab="amigos" aria-selected="true">Mis Amigos</button>
            <button type="button" class="social-tab-btn" data-social-tab="ranking" aria-selected="false">Ranking Mensual</button>
        </div>

        <div class="d-flex flex-column flex-grow-1 overflow-hidden bg-white social-content-body">
            <div class="social-tab-panels flex-grow-1 overflow-hidden">
                <div class="social-tab-panel is-active" data-social-panel="amigos">
                    <div class="p-3 d-flex flex-column h-100">
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

                <div class="social-tab-panel social-ranking-panel" data-social-panel="ranking">
                    <div class="p-3 d-flex flex-column h-100 social-ranking-panel-body">
                        <div class="d-flex align-items-center justify-content-between gap-2 mb-3 social-ranking-controls">
                            <span class="text-muted small fw-semibold social-ranking-title">Ranking mensual</span>
                            <select id="ranking-metric-select" class="form-select form-select-sm social-ranking-select" aria-label="Seleccionar estadística del ranking">
                                <option value="rutas" selected>Rutas Escaladas</option>
                                <option value="dias">Dias Activo</option>
                            </select>
                        </div>

                        <div id="ranking-list" class="d-flex flex-column gap-3 overflow-auto pb-4 social-lista-container social-ranking-list">
                            <!-- Ranking se inserta aquí -->
                        </div>
                        <div id="ranking-self-sticky" class="social-ranking-sticky d-none"></div>
                    </div>
                </div>
            </div>
        </div>
        ${renderNavbar()}

        <!-- Modal Buzón de Solicitudes -->
        <div class="modal fade" id="mailboxModal" tabindex="-1" aria-labelledby="mailboxModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-fullscreen modal-dialog-scrollable">
                <div class="modal-content border-0">
                    <div class="modal-header border-0 bg-white align-items-center px-4 py-3 border-bottom shadow-sm">
                        <button type="button" class="btn btn-link text-dark text-decoration-none p-0 d-flex align-items-center" data-bs-dismiss="modal">
                            <span class="material-icons me-2 fw-bold">arrow_back</span>
                            <span class="fw-bold fs-5 text-dark">Buzón</span>
                        </button>
                    </div>
                    <div class="modal-body bg-white p-0">
                        <div id="mailbox-solicitudes-container" class="d-flex flex-column">
                            <!-- Solicitudes se insertan aquí -->
                        </div>
                    </div>
                </div>
            </div>
        </div>

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
  const rankingList = container.querySelector('#ranking-list');
  const rankingSelect = container.querySelector('#ranking-metric-select');
  const tabButtons = Array.from(
    container.querySelectorAll('[data-social-tab]')
  );
  const tabPanels = Array.from(
    container.querySelectorAll('[data-social-panel]')
  );
  let amigosBase = Array.isArray(amigos) ? [...amigos] : [];
  const escaladorActualSafe =
    escaladorActual && escaladorActual.apodo ? escaladorActual : null;

  const rankingMetricMap = {
    rutas: { key: 'rutasEsteMes', label: 'Rutas' },
    dias: { key: 'diasActivo', label: 'Días activo' },
  };

  const getMetricValue = (item, metricKey) => {
    const value = Number(item?.[metricKey]);
    return Number.isFinite(value) ? value : 0;
  };

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

    listaContainer.innerHTML = lista
      .map((amigo) => {
        const descripcion = amigo.descripcion || 'Sin descripción...';

        return `
            <a href="#amigoPerfil?apodo=${encodeURIComponent(amigo.apodo)}" class="text-decoration-none text-dark d-block">
                <div class="border rounded-3 bg-white p-2 position-relative card-box-shadow social-amigo-card">
                    <div class="card-body d-flex align-items-center p-2">
                        <img src="${amigo.fotoSrc}" alt="Foto de ${amigo.apodo}" class="rounded-circle ms-1 me-2 social-amigo-foto" />
                        <div class="flex-grow-1 overflow-hidden">
                            <p class="mb-1 py-1 fs-5 fw-bold text-dark social-amigo-text text-truncate">${amigo.apodo}</p>
                            <p class="text-muted small mb-0 social-amigo-desc">${descripcion}</p>
                        </div>
                        <div class="text-center border-start ps-3 py-1 pe-2 flex-shrink-0">
                            <small class="text-muted d-block mb-1 social-amigo-rutas-label">RUTAS<br>ESTE MES</small>
                            <span class="fs-4 fw-bold">${amigo.rutasEsteMes || 0}</span>
                        </div>
                    </div>
                </div>
            </a>
        `;
      })
      .join('');
  };

  const buildRankingDataset = () => {
    const dataset = Array.isArray(amigosBase) ? [...amigosBase] : [];
    if (escaladorActualSafe) {
      const exists = dataset.some(
        (item) => item.apodo === escaladorActualSafe.apodo
      );
      if (!exists) {
        dataset.push(escaladorActualSafe);
      }
    }
    return dataset;
  };

  const renderRankingList = () => {
    if (!rankingList || !rankingSelect) {
      return;
    }
    const metricKey =
      rankingMetricMap[rankingSelect.value]?.key || 'rutasEsteMes';
    const metricLabel =
      rankingMetricMap[rankingSelect.value]?.label || 'Rutas este mes';
    const dataset = buildRankingDataset();
    const sorted = [...dataset].sort((a, b) => {
      const diff = getMetricValue(b, metricKey) - getMetricValue(a, metricKey);
      if (diff !== 0) return diff;
      const nameA = (a?.apodo || '').toString();
      const nameB = (b?.apodo || '').toString();
      return nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
    });

    if (!sorted.length) {
      rankingList.innerHTML = `
                <div class="text-center mt-4 px-2">
                    <h5 class="fst-italic mb-3 text-muted">Aún no hay datos para el ranking</h5>
                </div>
            `;
      return;
    }

    rankingList.innerHTML = sorted
      .map((item, index) => {
        const position = index + 1;
        const avatar = item.fotoSrc || '/assets/johnDoe.png';
        const apodo = escapeHtml(item.apodo || '');
        const metricValue = getMetricValue(item, metricKey);
        const rankClass =
          position === 1
            ? 'is-gold'
            : position === 2
              ? 'is-silver'
              : position === 3
                ? 'is-bronze'
                : 'is-default';
        const rankCardClass =
          position === 1
            ? 'is-rank-gold'
            : position === 2
              ? 'is-rank-silver'
              : position === 3
                ? 'is-rank-bronze'
                : '';
        const isSelf =
          escaladorActualSafe && item.apodo === escaladorActualSafe.apodo;

        return `
                <div class="social-ranking-card ${rankCardClass} ${isSelf ? 'is-self' : ''}" data-apodo="${apodo}" ${isSelf ? 'data-ranking-self="true"' : ''}>
                    <div class="social-ranking-rank ${rankClass}">
                        <span class="social-ranking-rank-number">${position}</span>
                    </div>
                    <div class="social-ranking-divider" aria-hidden="true"></div>
                    <div class="social-ranking-user">
                        <img src="${avatar}" alt="Foto de ${apodo}" class="social-ranking-avatar" />
                        <span class="social-ranking-name">${apodo}</span>
                    </div>
                    <div class="social-ranking-divider" aria-hidden="true"></div>
                    <div class="social-ranking-metric">
                        <span class="social-ranking-metric-label">${metricLabel}</span>
                        <span class="social-ranking-metric-value">${metricValue}</span>
                    </div>
                </div>
            `;
      })
      .join('');

    const stickyContainer = container.querySelector('#ranking-self-sticky');
    if (!stickyContainer) {
      return;
    }
    const selfCard = rankingList.querySelector('[data-ranking-self="true"]');
    if (!selfCard) {
      stickyContainer.classList.add('d-none');
      stickyContainer.innerHTML = '';
      stickyContainer.classList.remove('is-top', 'is-bottom');
      if (container._rankingScrollHandler) {
        rankingList.removeEventListener(
          'scroll',
          container._rankingScrollHandler
        );
        container._rankingScrollHandler = null;
      }
      return;
    }

    const stickyClone = selfCard.cloneNode(true);
    stickyClone.classList.add('is-sticky');
    stickyContainer.innerHTML = '';
    stickyContainer.appendChild(stickyClone);
    stickyContainer.classList.remove('d-none');

    const updateStickyPlacement = () => {
      const listRect = rankingList.getBoundingClientRect();
      const cardRect = selfCard.getBoundingClientRect();
      const isAbove = cardRect.top < listRect.top;
      const isBelow = cardRect.bottom > listRect.bottom;

      if (!isAbove && !isBelow) {
        stickyContainer.classList.add('d-none');
        stickyContainer.classList.remove('is-top', 'is-bottom');
        return;
      }

      stickyContainer.classList.remove('d-none');
      stickyContainer.classList.toggle('is-top', isAbove);
      stickyContainer.classList.toggle('is-bottom', isBelow);
    };

    updateStickyPlacement();
    if (container._rankingScrollHandler) {
      rankingList.removeEventListener(
        'scroll',
        container._rankingScrollHandler
      );
    }
    container._rankingScrollHandler = () => {
      updateStickyPlacement();
    };
    rankingList.addEventListener('scroll', container._rankingScrollHandler, {
      passive: true,
    });
    if (container._rankingResizeHandler) {
      window.removeEventListener('resize', container._rankingResizeHandler);
    }
    container._rankingResizeHandler = () => {
      updateStickyPlacement();
    };
    window.addEventListener('resize', container._rankingResizeHandler, {
      passive: true,
    });
  };

  const updateAmigosBase = (lista) => {
    amigosBase = Array.isArray(lista) ? [...lista] : [];
  };

  // Renderizado inicial
  updateAmigosBase(amigos);
  renderLista(amigosBase, false);
  renderRankingList();

  const mailboxContainer = container.querySelector(
    '#mailbox-solicitudes-container'
  );
  const notificationDot = container.querySelector('.notification-dot');

  const renderSolicitudes = (lista) => {
    if (!lista || lista.length === 0) {
      mailboxContainer.innerHTML = `
                <div class="text-center mt-5 px-3">
                    <span class="material-icons text-muted mb-3" style="font-size: 48px;">mark_email_read</span>
                    <h5 class="fw-bold text-dark mb-2">Bandeja vacía</h5>
                    <p class="text-muted small">No tienes solicitudes de amistad pendientes. ¡Busca nuevos amigos para escalar!</p>
                </div>
            `;
      if (notificationDot) notificationDot.classList.remove('active');
      return;
    }

    if (notificationDot) notificationDot.classList.add('active');
    mailboxContainer.innerHTML = lista
      .map((sol) => {
        const r = sol.remitente;
        const desc = r.descripcion || 'Sin descripción...';
        // Backend migth return `idSolicitud` or just `id` depending on how it's mapped in the usecase
        const sId = sol.idSolicitud || sol.id;
        return `
            <div class="solicitud-card" data-id="${sId}">
                <div class="solicitud-user-info">
                    <img src="${r.fotoSrc}" alt="Foto de ${r.apodo}" class="solicitud-avatar" />
                    <div class="solicitud-details">
                        <span class="solicitud-apodo font-monospace">${r.apodo}</span>
                        <span class="solicitud-desc font-monospace">${desc}</span>
                    </div>
                </div>
                <div class="solicitud-actions">
                    <button class="btn-solicitud-action btn-accept" aria-label="Aceptar">
                        <span class="material-icons">check</span>
                    </button>
                    <button class="btn-solicitud-action btn-reject" aria-label="Rechazar">
                        <span class="material-icons">close</span>
                    </button>
                </div>
            </div>
            `;
      })
      .join('');
  };
  renderSolicitudes(solicitudes);

  // Evento de búsqueda
  let searchTimeout;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();

      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        if (query.length >= 2 || query.length === 0) {
          const lowerQuery = query.toLowerCase();
          const resultados =
            query.length >= 2
              ? amigosBase.filter(
                  (amigo) =>
                    amigo.apodo &&
                    amigo.apodo.toLowerCase().includes(lowerQuery)
                )
              : amigosBase;
          renderLista(resultados, query.length >= 2);
        }
      }, 300); // Pequeño debounce
    });
  }

  if (rankingSelect) {
    rankingSelect.addEventListener('change', () => {
      renderRankingList();
    });
  }

  const setActiveTab = (tabId) => {
    tabButtons.forEach((btn) => {
      const isActive = btn.dataset.socialTab === tabId;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    tabPanels.forEach((panel) => {
      const isActive = panel.dataset.socialPanel === tabId;
      panel.classList.toggle('is-active', isActive);
    });
    if (tabId === 'ranking') {
      renderRankingList();
    } else {
      const stickyContainer = container.querySelector('#ranking-self-sticky');
      if (stickyContainer) {
        stickyContainer.classList.add('d-none');
        stickyContainer.classList.remove('is-top', 'is-bottom');
      }
    }
  };

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      setActiveTab(btn.dataset.socialTab);
    });
  });

  // Configuración de los modales para evitar que se quede bloqueada la pantalla en móviles al pulsar 'atrás'
  const modals = container.querySelectorAll('.modal');
  modals.forEach((modalEl) => {
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
      history.pushState({ modal: modalEl.id }, '', location.href);

      window.addEventListener('popstate', handlePopState, {
        signal: teardownController.signal,
      });
      window.addEventListener('hashchange', forceCloseAndCleanup, {
        signal: teardownController.signal,
      });
      window.addEventListener('pagehide', forceCloseAndCleanup, {
        signal: teardownController.signal,
      });
    });

    modalEl.addEventListener('hide.bs.modal', () => {
      if (history.state && history.state.modal === modalEl.id) {
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
  });

  // Delegación de eventos global de la vista
  if (container._socialClickHandler) {
    container.removeEventListener('click', container._socialClickHandler);
  }

  container._socialClickHandler = async (e) => {
    // Botón Buzón
    if (e.target.closest('.btn-open-mailbox')) {
      const mailboxModalEl = container.querySelector('#mailboxModal');
      if (mailboxModalEl) {
        let modal = window.bootstrap.Modal.getInstance(mailboxModalEl);
        if (!modal) modal = new window.bootstrap.Modal(mailboxModalEl);
        modal.show();
      }
      return;
    }

    // Botón Añadir Amigo
    if (e.target.closest('.btn-open-add-friend-modal')) {
      const modalEl = container.querySelector('#addFriendModal');
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
      return;
    }

    // Botón Enviar Solicitud
    const btnSend = e.target.closest('.btn-send-friend-request');
    if (btnSend) {
      const apodo = btnSend.getAttribute('data-apodo');
      const confirmado = await showConfirmModal({
        title: 'Añadir Amigo',
        message: `¿Deseas enviar una solicitud de amistad a <strong>${apodo}</strong>?`,
        confirmText: 'Enviar solicitud',
        confirmClass: 'btn-primary',
      });

      if (confirmado) {
        try {
          await callbacks.onSendFriendRequest(apodo);
          btnSend.disabled = true;
          btnSend.innerHTML = '<span class="material-icons">check</span>';
          btnSend.style.backgroundColor = '#198754'; // Success green
          btnSend.style.borderColor = '#198754';
        } catch (err) {
          showToast('Error al enviar la solicitud: ' + err.message, {
            variant: 'danger',
          });
        }
      }
      return;
    }

    // Acciones del Buzón (Aceptar / Rechazar)
    const btnAccept = e.target.closest('.btn-accept');
    const btnReject = e.target.closest('.btn-reject');

    if (btnAccept || btnReject) {
      const isAccept = !!btnAccept;
      const btn = isAccept ? btnAccept : btnReject;
      const card = btn.closest('.solicitud-card');
      const idSolicitud = card.getAttribute('data-id');
      const apodo = card.querySelector('.solicitud-apodo').textContent;

      const actionText = isAccept ? 'aceptar' : 'rechazar';
      const actionConfirmText = isAccept
        ? 'Aceptar solicitud'
        : 'Rechazar solicitud';
      const actionConfirmClass = isAccept ? 'btn-success' : 'btn-danger';

      const confirmado = await showConfirmModal({
        title: 'Solicitud de Amistad',
        message: `¿Seguro que deseas ${actionText} la solicitud de <strong>${apodo}</strong>?`,
        confirmText: actionConfirmText,
        confirmClass: actionConfirmClass,
      });

      if (confirmado) {
        try {
          btn.disabled = true;
          const otherBtn = card.querySelector(
            isAccept ? '.btn-reject' : '.btn-accept'
          );
          if (otherBtn) otherBtn.disabled = true;

          if (isAccept) {
            await callbacks.onAcceptRequest(idSolicitud);
            btn.classList.add('state-accepted');
            btn.innerHTML = '<span class="material-icons fw-bold">check</span>';
            if (otherBtn) otherBtn.style.display = 'none';
            showToast(`Has aceptado la solicitud de ${apodo}`, {
              variant: 'success',
            });

            // Recargar la lista de amigos principal
            const nuevosAmigos = await callbacks.onRefreshFriends();
            updateAmigosBase(nuevosAmigos);
            renderLista(amigosBase, false);
            renderRankingList();
          } else {
            await callbacks.onRejectRequest(idSolicitud);
            btn.classList.add('state-rejected');
            btn.innerHTML = '<span class="material-icons fw-bold">close</span>';
            if (otherBtn) otherBtn.style.display = 'none';
            showToast(`Has rechazado la solicitud de ${apodo}`, {
              variant: 'danger',
            });
          }

          // Quitar la solicitud de la lista en memoria local
          const index = solicitudes.findIndex(
            (s) => (s.idSolicitud || s.id) == idSolicitud
          );
          if (index !== -1) {
            solicitudes.splice(index, 1);
          }

          // Esperar un poco para que el usuario vea el cambio de estado antes de que desaparezca (opcional)
          setTimeout(() => {
            renderSolicitudes(solicitudes);
          }, 1500);
        } catch (err) {
          showToast(`Error al ${actionText} solicitud: ` + err.message, {
            variant: 'danger',
          });
          btn.disabled = false;
          const otherBtn = card.querySelector(
            isAccept ? '.btn-reject' : '.btn-accept'
          );
          if (otherBtn) otherBtn.disabled = false;
        }
      }
      return;
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

    newFriendsResults.innerHTML = lista
      .map((usuario) => {
        const descripcion = usuario.descripcion || 'Sin descripción...';
        const isAmigo = amigosBase.some((a) => a.apodo === usuario.apodo);
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
      })
      .join('');
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

// eslint-disable-next-line no-unused-vars
function renderPerfilFieldTitle(text) {
  return `<p class="text-muted small text-uppercase fw-semibold mb-1 perfil-field-title">${text}</p>`;
}

function renderPerfilStats(statsViewModel) {
  return `
    <div class="perfil-estadisticas-wrap mt-4">
      ${renderSectionDivider({ label: 'Estadisticas' })}
      <div class="perfil-estadisticas-view mt-3">
        ${renderStatsSection({
          title: 'Actividad mensual',
          content: renderMonthlyActivityCards(statsViewModel.monthly),
        })}
        ${renderStatsSection({
          title: 'Total de Rutas Escaladas',
          content: renderTotalRoutesStatsCard(statsViewModel.totals),
        })}
        ${renderStatsSection({
          title: 'Tipos de Rutas Escaladas',
          content: renderRouteTypesStatsCard(statsViewModel.totals),
        })}
      </div>
    </div>
  `;
}

export function renderAmigoPerfil(container, escalador, callbacks) {
  const { apodo, descripcion, fotoSrc, estadisticas = {} } = escalador;

  const avatar = fotoSrc || '/assets/johnDoe.png';
  const apodoLimpio = typeof apodo === 'string' ? apodo.trim() : '';
  const descripcionLimpia =
    typeof descripcion === 'string' ? descripcion.trim() : '';
  const descripcionVisible =
    descripcionLimpia && descripcionLimpia.toLowerCase() !== 'null'
      ? escapeHtml(descripcionLimpia)
      : '';
  const statsViewModel = buildEscaladorStatsViewModel(estadisticas);

  container.innerHTML = `
        <!-- Cabecera -->
        <div class="card-header bg-white d-flex align-items-center justify-content-between py-3 px-3 position-relative perfil-header shadow-sm border-bottom">
            <button class="btn btn-link text-dark p-0 me-2 d-flex align-items-center text-decoration-none" onclick="history.back()" aria-label="Volver atrás">
                <span class="material-icons me-2 fw-bold">arrow_back</span>
                <span class="fw-bold fs-5 text-dark font-monospace">Perfil de Amigo</span>
            </button>
            <button class="btn btn-danger d-flex align-items-center justify-content-center p-2 rounded-2 btn-delete-friend" aria-label="Eliminar amigo">
                <span class="material-icons">delete</span>
            </button>
        </div>

        <!-- Contenido del perfil -->
        <div class="card-body flex-grow-1 overflow-auto bg-light pb-5 pt-4">
            <!-- Sección de información del perfil -->
            <div class="text-center mb-4 bg-white rounded-4 p-4 shadow-sm mx-3">
                <div class="position-relative d-inline-block mb-3">
                    <img 
                        src="${avatar}" 
                        alt="Foto de perfil" 
                        class="rounded-circle perfil-avatar border border-3 border-light shadow-sm" 
                        style="width: 120px; height: 120px; object-fit: cover;"
                    />
                </div>
                <div class="perfil-apodo-wrap">
                    <div class="perfil-apodo-view w-100">
                        <div class="perfil-apodo-view-content">
                            <h5 class="fw-bold mb-0 font-monospace fs-4">${escapeHtml(apodoLimpio) || 'Sin apodo'}</h5>
                        </div>
                    </div>
                </div>

                <div class="perfil-descripcion-wrap mt-3">
                    ${renderSectionDivider({ label: 'Descripcion' })}
                    <div class="perfil-descripcion-view w-100 mt-2">
                        <div class="perfil-descripcion-view-content text-center">
                            ${
                              descripcionVisible
                                ? `<p class="text-muted mb-0 font-monospace">${descripcionVisible}</p>`
                                : '<p class="text-muted mb-0 small fst-italic font-monospace">Sin descripcion...</p>'
                            }
                        </div>
                    </div>
                </div>
            </div>

            <div class="px-3">
                ${renderPerfilStats(statsViewModel)}
            </div>
        </div>
    `;

  const btnDelete = container.querySelector('.btn-delete-friend');
  btnDelete.addEventListener('click', async () => {
    const confirmado = await showConfirmModal({
      title: 'Eliminar Amigo',
      message: `¿Estás seguro de que quieres eliminar a <strong>${escapeHtml(apodoLimpio)}</strong> de tu lista de amigos?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      confirmClass: 'btn-danger',
    });

    if (confirmado) {
      callbacks.onDeleteFriend(apodoLimpio);
    }
  });
}
