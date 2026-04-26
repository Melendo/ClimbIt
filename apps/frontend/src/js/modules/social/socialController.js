import { renderSocialView, renderAmigoPerfil } from './socialView.js';
import { fetchClient, fetchImageObjectUrl } from '../../core/client.js';
import { showLoading, showError } from '../../core/ui.js';

const PERFIL_PLACEHOLDER = '/assets/johnDoe.png';

async function resolverFotoPerfil(usuario) {
    if (!usuario?.idFotoPerfil) {
        return { ...usuario, fotoSrc: PERFIL_PLACEHOLDER };
    }
    
    try {
        const fotoSrc = await fetchImageObjectUrl(`/escaladores/fotos-perfil/${usuario.idFotoPerfil}`);
        return { ...usuario, fotoSrc };
    } catch (err) {
        console.warn('No se pudo cargar la foto de perfil:', err.message);
        return { ...usuario, fotoSrc: PERFIL_PLACEHOLDER };
    }
}

export async function socialCmd(container) {
    showLoading();
    try {
        const [amigosRes, solicitudesRes] = await Promise.all([
            fetchClient('/amistades/mis-amigos'),
            fetchClient('/amistades/solicitudes-pendientes')
        ]);
        const amigos = await amigosRes.json();
        const solicitudes = await solicitudesRes.json();
        
        const amigosConFoto = await Promise.all(
            amigos.map(amigo => resolverFotoPerfil(amigo))
        );

        const solicitudesConFoto = await Promise.all(
            solicitudes.map(async sol => {
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
                        idFotoPerfil: sol.idFotoPerfil
                    };
                }
                const remitenteConFoto = await resolverFotoPerfil(remitenteBase);
                return { ...sol, remitente: remitenteConFoto };
            })
        );

        const callbacks = {
            onSearch: (query) => {
                if (!query || query.length < 2) {
                    return amigosConFoto; // Mostramos lista base si el query es < 2
                }
                const lowerQuery = query.toLowerCase();
                return amigosConFoto.filter(amigo => 
                    amigo.apodo && amigo.apodo.toLowerCase().includes(lowerQuery)
                );
            },
            onSearchNewFriends: async (query) => {
                if (!query || query.length < 2) return [];
                try {
                    const searchRes = await fetchClient(`/escaladores/buscar?q=${encodeURIComponent(query)}`);
                    const resultados = await searchRes.json();
                    return await Promise.all(
                        resultados.map(usuario => resolverFotoPerfil(usuario))
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
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ apodoDestinatario })
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
            onAcceptRequest: async (idSolicitud) => {
                const res = await fetchClient('/amistades/responder', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idSolicitud, respuesta: 'aceptada' })
                });
                return await res.json();
            },
            onRejectRequest: async (idSolicitud) => {
                const res = await fetchClient('/amistades/responder', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idSolicitud, respuesta: 'rechazada' })
                });
                return await res.json();
            },
            onRefreshFriends: async () => {
                const response = await fetchClient('/amistades/mis-amigos');
                const nuevosAmigos = await response.json();
                return await Promise.all(
                    nuevosAmigos.map(amigo => resolverFotoPerfil(amigo))
                );
            }
        };

        renderSocialView(container, amigosConFoto, solicitudesConFoto, callbacks);
    } catch (err) {
        showError(`Error al cargar sección social: ${err.message}`);
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
            fetchClient(`/escaladores/public/${apodo}/stats/actividad-mensual`)
        ]);

        const perfilBase = await perfilRes.json();
        const resumen = await resumenRes.json();
        const tipos = await tiposRes.json();
        const mensual = await mensualRes.json();

        const escaladorData = await resolverFotoPerfil(perfilBase);

        escaladorData.estadisticas = {
            totalRutas: resumen.totalRutas,
            totalFlash: resumen.totalFlash,
            totalBloques: tipos.totalBloques,
            totalVias: tipos.totalVias,
            actividadMensual: mensual
        };

        const callbacks = {
            onDeleteFriend: async (amigoApodo) => {
                try {
                    await fetchClient(`/amistades/${amigoApodo}`, {
                        method: 'DELETE'
                    });
                    import('../../components/toast.js').then(({ showToast }) => {
                        showToast(`Has eliminado a ${amigoApodo} de tus amigos`, { variant: 'success' });
                    });
                    window.location.hash = '#social';
                } catch (err) {
                    import('../../components/toast.js').then(({ showToast }) => {
                        showToast(`Error al eliminar amigo: ${err.message}`, { variant: 'danger' });
                    });
                }
            }
        };

        renderAmigoPerfil(container, escaladorData, callbacks);
    } catch (err) {
        showError(`Error al cargar el perfil del amigo: ${err.message}`);
    }
}