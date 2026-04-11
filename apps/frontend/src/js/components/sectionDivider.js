export function renderSectionDivider({ label, className = '' } = {}) {
  return `
    <div class="section-divider ${className}">
      <span class="section-divider-label">${label}</span>
      <span class="section-divider-line"></span>
    </div>
  `;
}
