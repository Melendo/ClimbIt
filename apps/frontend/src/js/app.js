import { registerSW } from 'virtual:pwa-register';
import { initRouter } from './core/router.js';

registerSW({ immediate: true });

// EntryPonint -> Inicializa el router
initRouter();
