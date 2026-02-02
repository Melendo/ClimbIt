import { renderHomeView } from './homeView.js';

export function homeCmd(container) {
    container.innerHTML = renderHomeView();
}
