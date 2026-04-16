export function renderEditDivider({
  buttonId,
  label,
  title,
  iconSize = 18,
} = {}) {
  return `
    <div class="perfil-descripcion-divider-wrap">
      <div class="perfil-descripcion-divider"></div>
      <button
        type="button"
        id="${buttonId}"
        class="btn btn-sm d-inline-flex align-items-center justify-content-center perfil-descripcion-edit-btn"
        aria-label="${label}"
        title="${title}"
      >
        <span class="material-icons" style="font-size: ${iconSize}px;">edit</span>
      </button>
    </div>
  `;
}
