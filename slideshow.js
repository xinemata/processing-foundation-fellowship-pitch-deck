/* slideshow.js — photo slideshow with prev/next + dot controls and a synced
   caption strip. Autoplay (7s per photo) starts when the deck navigates to
   the slide containing the slideshow, and pauses when the user navigates
   away. Hovering the slideshow also pauses on desktop.
*/
(() => {
  const AUTOPLAY_MS = 7000;
  const instances = new Set();

  function init(el) {
    if (el.__pf_slideshow_init) return;
    el.__pf_slideshow_init = true;

    const slides = el.querySelectorAll('.ps-slide');
    const dots = el.querySelectorAll('.ps-dot');
    const captionEl = el.querySelector('.ps-caption');
    const prev = el.querySelector('.ps-nav.prev');
    const next = el.querySelector('.ps-nav.next');
    if (slides.length === 0) return;

    let cur = 0;
    let timer = null;
    let hovered = false;
    let active = false;

    function go(i) {
      cur = (i + slides.length) % slides.length;
      slides.forEach((s, j) => s.classList.toggle('active', j === cur));
      dots.forEach((d, j) => d.classList.toggle('active', j === cur));
      if (captionEl) {
        const cap = slides[cur].getAttribute('data-caption') || '';
        captionEl.textContent = cap;
        captionEl.classList.toggle('empty', !cap);
      }
    }
    function start() {
      stop();
      if (active && !hovered && slides.length > 1) {
        timer = setInterval(() => go(cur + 1), AUTOPLAY_MS);
      }
    }
    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }
    function reset() { stop(); start(); }

    prev?.addEventListener('click', e => { e.stopPropagation(); go(cur - 1); reset(); });
    next?.addEventListener('click', e => { e.stopPropagation(); go(cur + 1); reset(); });
    dots.forEach((d, j) => d.addEventListener('click', e => {
      e.stopPropagation();
      go(j);
      reset();
    }));

    el.addEventListener('mouseenter', () => { hovered = true; stop(); });
    el.addEventListener('mouseleave', () => { hovered = false; start(); });

    el.tabIndex = -1;
    el.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); reset(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); reset(); }
    });

    el.__pf_slideshow_activate = () => { active = true; start(); };
    el.__pf_slideshow_deactivate = () => { active = false; stop(); };

    instances.add(el);
    go(0);
  }

  function initAll() {
    document.querySelectorAll('.photo-slideshow').forEach(init);
  }

  // Slide-level activation: deck-stage emits a 'slidechange' CustomEvent
  // when navigation happens. Activate any slideshow inside the new slide,
  // deactivate slideshows inside the slide being left.
  function activateInSlide(slide) {
    if (!slide) return;
    slide.querySelectorAll('.photo-slideshow').forEach(el => {
      if (el.__pf_slideshow_activate) el.__pf_slideshow_activate();
    });
  }
  function deactivateInSlide(slide) {
    if (!slide) return;
    slide.querySelectorAll('.photo-slideshow').forEach(el => {
      if (el.__pf_slideshow_deactivate) el.__pf_slideshow_deactivate();
    });
  }
  function activateCurrent() {
    // Initial activation: whichever slide currently has data-deck-active.
    const cur = document.querySelector('[data-deck-active]');
    activateInSlide(cur);
  }

  document.addEventListener('slidechange', e => {
    const d = e.detail || {};
    if (d.previousSlide && d.previousSlide !== d.slide) deactivateInSlide(d.previousSlide);
    if (d.slide) activateInSlide(d.slide);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { initAll(); activateCurrent(); });
  } else {
    initAll();
    activateCurrent();
  }
  // Late-mount safety nets (deck-stage may upgrade after our first pass).
  setTimeout(() => { initAll(); activateCurrent(); }, 1000);
  setTimeout(() => { initAll(); activateCurrent(); }, 5000);
})();
