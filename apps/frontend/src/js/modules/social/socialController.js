import { renderSocialView, renderAmigoPerfil } from './socialView.js';
import { fetchClient, fetchImageObjectUrl } from '../../core/client.js';
import { showLoading, showError } from '../../core/ui.js';

const PERFIL_PLACEHOLDER = '/assets/johnDoe.png';

function buildActividadParams() {
  const now = new Date();
  const params = new URLSearchParams({
    year: String(now.getFullYear()),
    month: String(now.getMonth() + 1),
  });
  return params.toString();
}

function buildActividadStats(actividadMensual) {
  const actividad = Array.isArray(actividadMensual) ? actividadMensual : [];
  const rutasEsteMes = actividad.reduce(
    (total, diaInfo) => total + (Number(diaInfo?.rutas) || 0),
    0
  );
  const diasActivos = actividad.filter(
    (diaInfo) => Number(diaInfo?.rutas) > 0
  ).length;

  return {
    rutasEsteMes,
    diasActivos,
  };
}

async function resolverFotoPerfil(usuario) {
  if (!usuario?.idFotoPerfil) {
    return { ...usuario, fotoSrc: PERFIL_PLACEHOLDER };
  }

  try {
    const fotoSrc = await fetchImageObjectUrl(
      `/escaladores/fotos-perfil/${usuario.idFotoPerfil}`
    );
    return { ...usuario, fotoSrc };
  } catch (err) {
    console.warn('No se pudo cargar la foto de perfil:', err.message);
    return { ...usuario, fotoSrc: PERFIL_PLACEHOLDER };
  }
}

async function resolverAmigoCompleto(amigo) {
  const amigoConFoto = await resolverFotoPerfil(amigo);

  try {
    const actividadParams = buildActividadParams();
    const statsRes = await fetchClient(
      `/escaladores/public/${amigo.apodo}/stats/actividad-mensual?${actividadParams}`
    );
    if (statsRes.ok) {
      const mensualBody = await statsRes.json();
      const actividad = mensualBody.actividadMensual;
      const { rutasEsteMes, diasActivos } = buildActividadStats(actividad);
      return { ...amigoConFoto, rutasEsteMes, diasActivos };
    }
    return { ...amigoConFoto, rutasEsteMes: 0, diasActivos: 0 };
  } catch (err) {
    console.warn(
      `No se pudo cargar la actividad mensual de ${amigo.apodo}:`,
      err.message
    );
    return { ...amigoConFoto, rutasEsteMes: 0, diasActivos: 0 };
  }
}

async function resolverEscaladorActual() {
  try {
    const perfilRes = await fetchClient('/escaladores/perfil');
    if (!perfilRes.ok) {
      return null;
    }
    const perfil = await perfilRes.json();
    const escaladorConFoto = await resolverFotoPerfil(perfil);
    const actividadParams = buildActividadParams();
    const actividadRes = await fetchClient(
      `/escaladores/stats/actividad-mensual?${actividadParams}`
    );
    let actividadMensual = [];
    if (actividadRes.ok) {
      const actividadBody = await actividadRes.json();
      actividadMensual = actividadBody?.actividadMensual || [];
    }
    const { rutasEsteMes, diasActivos } = buildActividadStats(actividadMensual);
    return {
      ...escaladorConFoto,
      rutasEsteMes,
      diasActivos,
    };
  } catch (err) {
    console.warn('No se pudo cargar el escalador actual:', err.message);
    return null;
  }
}

async function safeGetArray(endpoint, warningMessage) {
  try {
    const response = await fetchClient(endpoint);
    const parsed = await response.json();
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn(`${warningMessage}:`, err.message);
    return [];
  }
}

async function responderSolicitud(idSolicitud, respuesta) {
  const res = await fetchClient('/amistades/responder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idSolicitud, respuesta }),
  });
  return await res.json();
}

function buildSocialCallbacks(amigosConFoto) {
  return {
    onSearch: (query) => {
      if (!query || query.length < 2) {
        return amigosConFoto;
      }
      const lowerQuery = query.toLowerCase();
      return amigosConFoto.filter(
        (amigo) => amigo.apodo && amigo.apodo.toLowerCase().includes(lowerQuery)
      );
    },
    onSearchNewFriends: async (query) => {
      if (!query || query.length < 2) return [];
      try {
        const searchRes = await fetchClient(
          `/escaladores/buscar?q=${encodeURIComponent(query)}`
        );
        const resultados = await searchRes.json();
        return await Promise.all(
          resultados.map((usuario) => resolverFotoPerfil(usuario))
        );
      } catch (err) {
        console.error('Error al buscar nuevos amigos:', err);
        return [];
      }
    },
    onSendFriendRequest: async (apodoDestinatario) => {
      try {
        const res = await fetchClient('/amistades/enviar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ apodoDestinatario }),
        });
        return await res.json();
      } catch (err) {
        if (err.response) {
          try {
            const errorBody = await err.response.json();
            if (errorBody && errorBody.error) {
              throw new Error(errorBody.error);
            }
          } catch (e) {
            if (e.message !== err.message) {
              throw e;
            }
          }
        }
        console.error('Error al enviar solicitud de amistad:', err);
        throw err;
      }
    },
    onAcceptRequest: async (idSolicitud) =>
      await responderSolicitud(idSolicitud, 'aceptada'),
    onRejectRequest: async (idSolicitud) =>
      await responderSolicitud(idSolicitud, 'rechazada'),
    onRefreshFriends: async () => {
      const nuevosAmigos = await safeGetArray(
        '/amistades/mis-amigos',
        'No se pudo refrescar la lista de amigos'
      );
      if (!nuevosAmigos.length) {
        return amigosConFoto;
      }
      return await Promise.all(
        nuevosAmigos.map((amigo) => resolverAmigoCompleto(amigo))
      );
    },
  };
}

export async function socialCmd(container) {
  showLoading();

  try {
    const [amigos, solicitudes, escaladorActual] = await Promise.all([
      safeGetArray(
        '/amistades/mis-amigos',
        'No se pudo cargar la lista de amigos'
      ),
      safeGetArray(
        '/amistades/solicitudes-pendientes',
        'No se pudo cargar el buzón de solicitudes'
      ),
      resolverEscaladorActual(),
    ]);

    const amigosConFoto = await Promise.all(
      amigos.map((amigo) => resolverAmigoCompleto(amigo))
    );

    const solicitudesConFoto = await Promise.all(
      solicitudes.map(async (sol) => {
        // Ensure we handle 'remitente' properly as per the use case return format
        let remitenteBase = sol;
        if (sol.remitente) {
          remitenteBase = sol.remitente;
        } else if (sol.idRemitente) {
          // Fallback to flattened structure
          remitenteBase = {
            id: sol.idRemitente,
            apodo: sol.apodo,
            descripcion: sol.descripcion,
            idFotoPerfil: sol.idFotoPerfil,
          };
        }
        const remitenteConFoto = await resolverFotoPerfil(remitenteBase);
        return { ...sol, remitente: remitenteConFoto };
      })
    );
    const callbacks = buildSocialCallbacks(amigosConFoto);
    renderSocialView(
      container,
      amigosConFoto,
      solicitudesConFoto,
      escaladorActual,
      callbacks
    );
  } catch (err) {
    console.warn('Error al cargar sección social:', err.message);
    renderSocialView(container, [], [], null, buildSocialCallbacks([]));
  }
}

export async function amigoPerfilCmd(container, apodo) {
  if (!apodo) {
    showError('No se especificó un amigo.');
    return;
  }

  showLoading();
  try {
    const [perfilRes, resumenRes, tiposRes, mensualRes] = await Promise.all([
      fetchClient(`/amistades/perfil/${apodo}`),
      fetchClient(`/escaladores/public/${apodo}/stats/resumen`),
      fetchClient(`/escaladores/public/${apodo}/stats/tipos`),
      fetchClient(`/escaladores/public/${apodo}/stats/actividad-mensual`),
    ]);

    const perfilBase = await perfilRes.json();
    const resumen = await resumenRes.json();
    const tipos = await tiposRes.json();
    const mensualBody = await mensualRes.json();
    const mensual = mensualBody.actividadMensual || [];

    const escaladorData = await resolverFotoPerfil(perfilBase);

    escaladorData.estadisticas = {
      totalRutas: resumen.totalRutas,
      totalFlash: resumen.totalFlash,
      totalBloques: tipos.totalBloques,
      totalVias: tipos.totalVias,
      actividadMensual: mensual,
    };

    const callbacks = {
      onDeleteFriend: async (amigoApodo) => {
        try {
          await fetchClient(`/amistades/${amigoApodo}`, {
            method: 'DELETE',
          });
          import('../../components/toast.js').then(({ showToast }) => {
            showToast(`Has eliminado a ${amigoApodo} de tus amigos`, {
              variant: 'success',
            });
          });
          window.location.hash = '#social';
        } catch (err) {
          import('../../components/toast.js').then(({ showToast }) => {
            showToast(`Error al eliminar amigo: ${err.message}`, {
              variant: 'danger',
            });
          });
        }
      },
    };

    renderAmigoPerfil(container, escaladorData, callbacks);
  } catch (err) {
    showError(`Error al cargar el perfil del amigo: ${err.message}`);
  }
}
