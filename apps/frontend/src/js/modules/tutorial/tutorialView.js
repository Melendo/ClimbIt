export function renderTutorial(container, slides) {
  const slidesMarkup = slides
    .map((slide) => {
      return `
        <article class="tutorial-slide" aria-hidden="true">
          <div class="tutorial-slide-media">
            <img class="tutorial-slide-image" src="${slide.image}" alt="${slide.alt}" draggable="false" />
          </div>
          <div class="tutorial-slide-content">
            <p class="tutorial-slide-title">${slide.title}</p>
            <p class="tutorial-slide-text">${slide.text}</p>
          </div>
        </article>
      `;
    })
    .join('');

  const dotsMarkup = slides
    .map((slide, index) => {
      const slideNumber = index + 1;
      return `
        <button
          type="button"
          class="tutorial-dot"
          data-tutorial-dot="${index}"
          aria-label="Ir a la diapositiva ${slideNumber}"
        ></button>
      `;
    })
    .join('');

  container.innerHTML = `
    <div class="card tutorial-shell">
      <div class="card-header bg-white d-flex align-items-center justify-content-between gap-2 py-3 tutorial-header">
        <div class="d-flex align-items-center gap-2">
          <img src="/icons/apple-touch-icon.png" alt="Logo de ClimbIt" style="width: 28px; height: 28px; object-fit: contain;" />
          <span class="fw-bold" style="font-size: 1.2rem;">ClimbIt</span>
        </div>
        <button type="button" class="btn btn-link p-0 tutorial-skip-btn">Saltar tutorial</button>
      </div>

      <div class="card-body tutorial-body">
        <div class="tutorial-carousel">
          <div class="tutorial-track">
            ${slidesMarkup}
          </div>
        </div>

        <div class="tutorial-footer">
          <div class="tutorial-progress" role="tablist" aria-label="Progreso del tutorial">
            ${dotsMarkup}
          </div>

          <div class="tutorial-actions">
            <button type="button" class="btn btn-outline-dark tutorial-prev-btn">Anterior</button>
            <button type="button" class="btn btn-primary tutorial-next-btn">Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const carousel = container.querySelector('.tutorial-carousel');
  const track = container.querySelector('.tutorial-track');
  const slidesItems = Array.from(container.querySelectorAll('.tutorial-slide'));
  const dots = Array.from(container.querySelectorAll('.tutorial-dot'));
  const prevBtn = container.querySelector('.tutorial-prev-btn');
  const nextBtn = container.querySelector('.tutorial-next-btn');
  const skipBtn = container.querySelector('.tutorial-skip-btn');

  return {
    carousel,
    track,
    slides: slidesItems,
    dots,
    prevBtn,
    nextBtn,
    skipBtn,
  };
}
