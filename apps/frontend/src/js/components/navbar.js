// Componente de navegación inferior reutilizable
export function renderNavbar() {
    return `
        <div class="card-footer bg-white border-top py-2 mt-auto">
          <div class="d-flex justify-content-around text-center">
            <div class="nav-link-bottom text-muted d-flex flex-column align-items-center p-2 flex-fill">
              <span class="material-icons" style="font-size: 24px;">groups</span>
              <small>Social</small>
            </div>
            <a href="#misRocodromos" class="nav-link-bottom text-muted d-flex flex-column align-items-center p-2 flex-fill">
              <span class="material-icons" style="font-size: 24px;">favorite</span>
              <small>Mis Rocódromos</small>
            </a>
            <a href="#perfil" class="nav-link-bottom text-muted d-flex flex-column align-items-center p-2 flex-fill">
              <span class="material-icons" style="font-size: 24px;">person</span>
              <small>Perfil</small>
            </a>
          </div>
        </div>
    `;
}
