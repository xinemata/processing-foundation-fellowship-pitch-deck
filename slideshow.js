/* slideshow.js — autoplay photo slideshow with prev/next + dot controls
   + a synced caption strip that updates from each slide's data-caption.
*/
(() => {
  function init(el) {
    if (el.__pf_slideshow_init) return;
    el.__pf_slideshow_init = true;

    const slides = el.querySelectorAll('.ps-slide');
    const dots = el.querySelectorAll('.ps-dot');
    const captionEl = el.querySelector('.ps-caption');
    const prev = el.querySelector('.ps-nav.prev');
    const next = el.querySelector('.ps-nav.next');
    const autoplay = parseInt(el.dataset.autoplay) || 0;
    if (slides.length === 0) return;

    let cur = 0;
    let timer = null;
    let hovered = false;

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
      if (autoplay > 0 && !hovered) {
        timer = setInterval(() => go(cur + 1), autoplay);
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

    go(0);
    start();
  }

  function initAll() {
    document.querySelectorAll('.photo-slideshow').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
  setTimeout(initAll, 5000);
  setTimeout(initAll, 30000);
})();
