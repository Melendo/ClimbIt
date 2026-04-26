import { registerSW } from 'virtual:pwa-register';
import { initRouter } from './core/router.js';
import { initConnectivityBanner } from './core/ui.js';

registerSW({ immediate: true });

function updateViewportHeightVariable() {
	const tag = document.activeElement?.tagName;
	if (tag === 'INPUT' || tag === 'TEXTAREA') return;

	const viewportHeight = window.visualViewport?.height || window.innerHeight;
	document.documentElement.style.setProperty('--vh', `${viewportHeight * 0.01}px`);
}

function initViewportHeightVariable() {
	updateViewportHeightVariable();

	window.addEventListener('resize', updateViewportHeightVariable, { passive: true });
	window.addEventListener('orientationchange', updateViewportHeightVariable, {
		passive: true,
	});
	window.addEventListener('pageshow', updateViewportHeightVariable, { passive: true });

	if (window.visualViewport) {
		window.visualViewport.addEventListener('resize', updateViewportHeightVariable, {
			passive: true,
		});
	}
}

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
initViewportHeightVariable();
lockPortraitOrientation();
initConnectivityBanner();
initRouter();
