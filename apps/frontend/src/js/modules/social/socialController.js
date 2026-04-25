import { renderSocialView } from './socialView.js';
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
        const response = await fetchClient('/amistades/mis-amigos');
        const amigos = await response.json();
        
        const amigosConFoto = await Promise.all(
            amigos.map(amigo => resolverFotoPerfil(amigo))
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
            }
        };

        renderSocialView(container, amigosConFoto, callbacks);
    } catch (err) {
        showError(`Error al cargar sección social: ${err.message}`);
    }
}