import { renderTutorial } from './tutorialView.js';

const TUTORIAL_SLIDES = [
  {
    image: '/assets/slide1Tutorial.jpeg',
    alt: 'Logo de ClimbIt con el menu inferior resaltado',
    title: '¡Hola, escalador!',
    text: 'Estás a un clic de llevar tu progreso al siguiente nivel. Usa el menú inferior para moverte entre tus Rocódromos, ver tus Estadísticas o picarte con tus amigos en la sección Social.',
  },
  {
    image: '/assets/slide2Tutorial.jpeg',
    alt: 'Lista de búsqueda con estrellas para suscribirse a rocódromos',
    title: 'Busca tu rocódromo',
    text: 'Dale a la lupa y busca los centros donde escalas habitualmente. Pulsa la estrella para suscribirte; así aparecerán siempre en tu inicio para que no pierdas ni un segundo antes de empezar a calentar.',
  },
  {
    image: '/assets/slide3Tutorial.jpeg',
    alt: 'Mapa cenital con zonas del rocódromo',
    title: 'Explora las vías',
    text: 'Cada rocódromo se divide en zonas con un mapa dinámico. Filtra por dificultad con el embudo o cambia de zona para encontrar tu próximo reto. ¡Haz zoom para ver cuáles has encadenado ya!',
  },
  {
    image: '/assets/slide4Tutorial.jpeg',
    alt: 'Detalle de la ruta con botones de Flash y Completado',
    title: 'Marca tu progreso',
    text: '¿Te lo has sacado a la primera? Marca Flash. ¿Es tu cuenta pendiente? Guárdalo como Proyecto. Registra cada pegue, valora la calidad de la ruta y mira cómo sube tu nivel.',
  },
  {
    image: '/assets/slide5Tutorial.jpeg',
    alt: 'Perfil con mapa de calor y estadisticas',
    title: 'Analiza y compite',
    text: 'En tu perfil verás tu Mapa de Calor y estadísticas mensuales. ¿Quieres más motivación? Añade a tus amigos por su apodo y lucha por el número 1 en el Ranking Mensual. ¡A muerte!',
  },
];

function finishTutorial() {
  window.location.hash = '#misRocodromos';
}

export function tutorialCmd(container) {
  const view = renderTutorial(container, TUTORIAL_SLIDES);
  const totalSlides = TUTORIAL_SLIDES.length;
  let currentIndex = 0;

  const updateView = () => {
    view.track.style.transform = `translateX(-${currentIndex * 100}%)`;

    view.slides.forEach((slide, index) => {
      const isActive = index === currentIndex;
      slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      slide.tabIndex = isActive ? 0 : -1;
    });

    view.dots.forEach((dot, index) => {
      const isActive = index === currentIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });

    view.prevBtn.disabled = currentIndex === 0;

    if (currentIndex === totalSlides - 1) {
      view.nextBtn.textContent = '¡A escalar!';
      view.nextBtn.classList.add('tutorial-finish-btn');
    } else {
      view.nextBtn.textContent = 'Siguiente';
      view.nextBtn.classList.remove('tutorial-finish-btn');
    }
  };

  view.skipBtn.addEventListener('click', finishTutorial);

  view.prevBtn.addEventListener('click', () => {
    if (currentIndex === 0) {
      return;
    }
    currentIndex -= 1;
    updateView();
  });

  view.nextBtn.addEventListener('click', () => {
    if (currentIndex >= totalSlides - 1) {
      finishTutorial();
      return;
    }
    currentIndex += 1;
    updateView();
  });

  view.dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      currentIndex = index;
      updateView();
    });
  });

  updateView();
}
