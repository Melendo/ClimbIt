import { renderPerfil } from './escaladorView.js';
import { fetchClient, fetchImageObjectUrl, removeToken, saveToken } from '../../core/client.js';
import { showLoading, showError } from '../../core/ui.js';
import { showToast } from '../../components/toast.js';
import { showProfilePhotoModal } from '../../components/profilePhotoModal.js';

const PERFIL_PLACEHOLDER = '/assets/johnDoe.png';
let perfilPhotoObjectUrl = null;

function revokeObjectUrl(url) {
    if (typeof url === 'string' && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
    }
}

async function cargarFotosPerfilDisponibles() {
    const response = await fetchClient('/escaladores/fotos-perfil');
    const fotos = await response.json();

    if (!Array.isArray(fotos)) {
        return [];
    }

    const fotosConSrc = await Promise.all(
        fotos.map(async (foto) => {
            const id = Number(foto?.id);
            if (!Number.isInteger(id) || id < 1) {
                return null;
            }

            try {
                const src = await fetchImageObjectUrl(`/escaladores/fotos-perfil/${id}`);
                return { id, src };
            } catch (err) {
                console.warn(`No se pudo cargar la foto de perfil ${id}:`, err.message);
                return null;
            }
        })
    );

    return fotosConSrc.filter(Boolean);
}

async function actualizarFotoPerfil(idFotoPerfil) {
    await fetchClient('/escaladores/perfil/foto', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idFotoPerfil })
    });
}

async function abrirCambioFotoPerfil(container, escalador) {
    let fotoOptions = [];

    try {
        fotoOptions = await cargarFotosPerfilDisponibles();
        if (!fotoOptions.length) {
            throw new Error('No hay fotos de perfil disponibles ahora mismo.');
        }

        const selectedId = await showProfilePhotoModal({
            photos: fotoOptions,
            currentPhotoId: Number(escalador?.idFotoPerfil)
        });

        if (!Number.isInteger(selectedId) || selectedId < 1) {
            return;
        }

        await actualizarFotoPerfil(selectedId);
        await perfilCmd(container);
    } catch (err) {
        showError(`Error al cambiar la foto de perfil: ${err.message}`);
    } finally {
        fotoOptions.forEach((photo) => revokeObjectUrl(photo?.src));
    }
}

async function validarApodo(apodo) {
    try {
        const response = await fetchClient(`/escaladores/validarApodo/${encodeURIComponent(apodo)}`);
        const data = await response.json();
        if (data?.disponible === false) {
            return { ok: false, message: 'El apodo no esta disponible.' };
        }
        return { ok: true };
    } catch (err) {
        const errorMsg = await extractValidatorMessage(err);
        return { ok: false, message: errorMsg || err.message || 'No se pudo validar el apodo.' };
    }
}

async function extractValidatorMessage(err) {
    if (!err?.response) {
        return null;
    }

    try {
        const payload = await err.response.json();
        const errorMsg = payload?.errors?.[0]?.msg;
        if (errorMsg) {
            return errorMsg;
        }
        return payload?.message || payload?.error || null;
    } catch {
        return null;
    }
}

// Controlador para la vista de perfil del usuario
export async function perfilCmd(container) {
    showLoading();

    try {
        const response = await fetchClient('/escaladores/perfil');
        const escalador = await response.json();

        const idFotoPerfil = Number(escalador?.idFotoPerfil);
        if (Number.isInteger(idFotoPerfil) && idFotoPerfil > 0) {
            try {
                if (perfilPhotoObjectUrl) {
                    revokeObjectUrl(perfilPhotoObjectUrl);
                    perfilPhotoObjectUrl = null;
                }

                escalador.fotoSrc = await fetchImageObjectUrl(`/escaladores/fotos-perfil/${idFotoPerfil}`);
                perfilPhotoObjectUrl = escalador.fotoSrc;
            } catch (err) {
                console.warn('No se pudo cargar la foto de perfil:', err.message);
                escalador.fotoSrc = PERFIL_PLACEHOLDER;
            }
        } else {
            escalador.fotoSrc = PERFIL_PLACEHOLDER;
        }

        const callbacks = {
            onLogout: () => {
                removeToken();
                window.location.hash = '#home';
            },
            onOpenChangePhoto: async () => {
                await abrirCambioFotoPerfil(container, escalador);
            },
            onUpdateDescripcion: async (descripcion) => {
                try {
                    const response = await fetchClient('/escaladores/actualizarDescripcion', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ descripcion })
                    });

                    const updated = await response.json();
                    escalador.descripcion = updated?.descripcion ?? descripcion;
                    renderPerfil(container, escalador, callbacks);
                    showToast('Descripcion actualizada correctamente.', { variant: 'success' });
                } catch (err) {
                    const errorMsg = await extractValidatorMessage(err);
                    showToast(`No se ha podido completar el cambio: ${errorMsg || err.message}`);
                }
            },
            onUpdateApodo: async (apodo) => {
                try {
                    const validation = await validarApodo(apodo);
                    if (!validation.ok) {
                        showToast(`No se ha podido completar el cambio: ${validation.message}`);
                        return;
                    }

                    const response = await fetchClient('/escaladores/cambiarApodo', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ apodo })
                    });

                    const updated = await response.json();
                    if (updated?.token) {
                        saveToken(updated.token);
                    }
                    escalador.apodo = updated?.apodo ?? apodo;
                    renderPerfil(container, escalador, callbacks);
                    showToast('Apodo actualizado correctamente.', { variant: 'success' });
                } catch (err) {
                    const errorMsg = await extractValidatorMessage(err);
                    showToast(`No se ha podido completar el cambio: ${errorMsg || err.message}`);
                }
            }
        };

        renderPerfil(container, escalador, callbacks);
    } catch (err) {
        showError(`Error al obtener el perfil: ${err.message}`);
    }
}
