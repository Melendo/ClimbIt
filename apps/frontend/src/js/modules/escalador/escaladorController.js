import { renderPerfil } from './escaladorView.js';
import { fetchClient, fetchImageObjectUrl, removeToken } from '../../core/client.js';
import { showLoading, showError } from '../../core/ui.js';
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
            }
        };

        renderPerfil(container, escalador, callbacks);
    } catch (err) {
        showError(`Error al obtener el perfil: ${err.message}`);
    }
}
