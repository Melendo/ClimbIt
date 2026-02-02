import { error404View, error500View, errorGenericoView } from './errorView.js';

// Controladores para las vistas de error 404
export function error404Cmd(container) {
    container.innerHTML = error404View();
}

// Controladores para las vistas de error 500
export function error500Cmd(container) {
    container.innerHTML = error500View();
}

// Controladores para vistas de error generico
export function errorGenericoCmd(container, mensaje) {
    container.innerHTML = errorGenericoView(mensaje);
}
