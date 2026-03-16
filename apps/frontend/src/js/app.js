import { registerSW } from 'virtual:pwa-register';
import { initRouter } from './core/router.js';

registerSW({ immediate: true });

async function lockPortraitOrientation() {
	// Only works on compatible browsers and mostly when running installed as PWA.
	if (!window.matchMedia('(display-mode: standalone)').matches) {
		return;
	}

	if (screen.orientation?.lock) {
		try {
			await screen.orientation.lock('portrait');
		} catch {
			// Ignore if browser blocks orientation lock.
		}
	}
}

// EntryPonint -> Inicializa el router
lockPortraitOrientation();
initRouter();
