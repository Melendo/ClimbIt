export function showToast(message, options = {}) {
  const { duration = 3500, variant = 'danger' } = options;
  const containerId = 'app-toast-container';
  let container = document.getElementById(containerId);

  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.className = 'app-toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `app-toast app-toast-${variant}`;
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('is-visible');
  });

  const timeoutId = window.setTimeout(() => {
    toast.classList.remove('is-visible');
    window.setTimeout(() => toast.remove(), 300);
  }, duration);

  toast.addEventListener('click', () => {
    window.clearTimeout(timeoutId);
    toast.classList.remove('is-visible');
    window.setTimeout(() => toast.remove(), 300);
  });
}
