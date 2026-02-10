import { renderHomeView } from './homeView.js';
import { isAuthenticated } from '../../core/client.js';

// Controlador para la vista de home
export function homeCmd(container) {
    const callbacks = {
        isAuthenticated: () => isAuthenticated(),
        onAlreadyAuthenticated: () => {
            window.location.hash = '#misRocodromos';
        }
    };

    renderHomeView(container, callbacks);
}
