export const mainContainer = document.getElementById('app-container');

export function showLoading() {
    if (mainContainer) {
        mainContainer.innerHTML = `
        <div class="d-flex justify-content-center my-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
        </div>`;
    }
}

export function showError(message) {
    if (mainContainer) {
        mainContainer.innerHTML = `
        <div class="alert alert-danger" role="alert">
            <strong>Error:</strong> ${message}
        </div>`;
    }
}
