/* Event delegation also supports sections replaced by the theme editor. */
(() => {
  const motion = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const selector = '.sn-brands__card,.sn-articles__card,.sn-promo-grid__card';
  let active = null;
  let frame = 0;
  const reset = () => {
    if (!active) return;
    active.style.removeProperty('--sn-rx');
    active.style.removeProperty('--sn-ry');
    active = null;
  };
  document.addEventListener('pointermove', (event) => {
    if (!motion.matches || event.buttons || !document.body.classList.contains('sn-premium')) return reset();
    const card = event.target.closest(selector);
    if (active !== card) reset();
    if (!card) return;
    active = card;
    card.setAttribute('data-sn-depth', '');
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      if (active !== card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--sn-rx', `${(0.5 - (event.clientY - rect.top) / rect.height) * 4}deg`);
      card.style.setProperty('--sn-ry', `${((event.clientX - rect.left) / rect.width - 0.5) * 4}deg`);
    });
  }, { passive: true });
  document.addEventListener('pointerout', (event) => { if (!event.relatedTarget) reset(); }, { passive: true });
  window.addEventListener('blur', reset);
  window.addEventListener('scroll', reset, { passive: true });
  motion.addEventListener('change', reset);
})();
