// Componente de navegación inferior reutilizable
export function renderNavbar() {
    const currentHash = window.location.hash || '';
    const isSocialActive = currentHash.startsWith('#social');
    const isMisRocodromosActive = currentHash.startsWith('#misRocodromos');
  const isPerfilActive = currentHash.startsWith('#perfil') || currentHash.startsWith('#fotosPerfil');

    return `
        <div class="card-footer bg-white border-top py-2 mt-auto">
          <div class="d-flex justify-content-around text-center">
            <a href="#social" class="nav-link-bottom ${isSocialActive ? 'active' : 'text-muted'} d-flex flex-column align-items-center p-2 flex-fill text-decoration-none" ${isSocialActive ? 'aria-current="page"' : ''}>
              <span class="material-icons" style="font-size: 24px;">groups</span>
              <small>Social</small>
            </a>
            <a href="#misRocodromos" class="nav-link-bottom ${isMisRocodromosActive ? 'active' : 'text-muted'} d-flex flex-column align-items-center p-2 flex-fill text-decoration-none" ${isMisRocodromosActive ? 'aria-current="page"' : ''}>
              <span class="material-icons" style="font-size: 24px;">favorite</span>
              <small>Mis Rocódromos</small>
            </a>
            <a href="#perfil" class="nav-link-bottom ${isPerfilActive ? 'active' : 'text-muted'} d-flex flex-column align-items-center p-2 flex-fill text-decoration-none" ${isPerfilActive ? 'aria-current="page"' : ''}>
              <span class="material-icons" style="font-size: 24px;">person</span>
              <small>Perfil</small>
            </a>
          </div>
        </div>
    `;
}
