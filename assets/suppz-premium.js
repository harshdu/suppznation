/* Event delegation also supports sections replaced by the theme editor. */
(() => {
  const motion = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const selector = '.sn-tabs__media,.sn-deals__poster,.sn-brands__card,.sn-articles__card,.sn-promo-grid__card,.sn-wellness__card,.sn-about__portrait';
  let active = null;
  let bounds = null;
  let frame = 0;
  const reset = () => {
    if (!active) return;
    active.style.removeProperty('--sn-rx');
    active.style.removeProperty('--sn-ry');
    active.style.removeProperty('--sn-light');
    active = null;
    bounds = null;
  };
  document.addEventListener('pointermove', (event) => {
    if (!motion.matches || event.buttons || !document.body.classList.contains('sn-premium-motion')) return reset();
    const card = event.target.closest(selector);
    if (active !== card) reset();
    if (!card) return;
    if (!active) bounds = card.getBoundingClientRect();
    active = card;
    card.setAttribute('data-sn-depth', '');
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      if (active !== card) return;
      const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
      const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
      card.style.setProperty('--sn-rx', `${(0.5 - y) * 12}deg`);
      card.style.setProperty('--sn-ry', `${(x - 0.5) * 12}deg`);
      card.style.setProperty('--sn-light-x', `${x * 100}%`);
      card.style.setProperty('--sn-light-y', `${y * 100}%`);
      card.style.setProperty('--sn-light', '.8');
    });
  }, { passive: true });
  document.addEventListener('pointerout', (event) => { if (!event.relatedTarget) reset(); }, { passive: true });
  window.addEventListener('blur', reset);
  document.addEventListener('pointerdown', reset, { passive: true });
  window.addEventListener('resize', reset, { passive: true });
  window.addEventListener('scroll', reset, { passive: true });
  motion.addEventListener('change', reset);

  // Reveal the contents, never a sticky section or one of its ancestors.
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const revealSelector = '.sn-tabs__heading,.sn-tabs__media,.sn-deals__poster,.sn-hero__track,.sn-brands__panel,.sn-brands__card,.sn-articles__card,.sn-wellness__heading,.sn-wellness__link,.sn-promo-grid__card,.sn-about__content > h2,.sn-about__info,.sn-about__portrait,.sn-about__badge';
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      target.classList.toggle('sn-in-view', isIntersecting);
      if (!isIntersecting) return;
      if (!reduce.matches) target.classList.add('sn-motion-in');
      if (!target.classList.contains('sn-about__badge')) observer.unobserve(target);
    });
  }, { threshold: .12 }) : null;
  const mount = (root = document) => {
    if (!observer || !document.body.classList.contains('sn-premium-motion')) return;
    root.querySelectorAll(revealSelector).forEach((element) => {
      if (element.dataset.snObserved) return;
      element.dataset.snObserved = 'true';
      const siblings = element.parentElement.children;
      element.style.setProperty('--sn-enter-delay', `${Math.min(Array.prototype.indexOf.call(siblings, element), 4) * 65}ms`);
      observer.observe(element);
    });
  };
  mount();
  document.addEventListener('shopify:section:load', (event) => mount(event.target));
  document.addEventListener('shopify:section:unload', (event) => {
    event.target.querySelectorAll('[data-sn-observed]').forEach((element) => observer?.unobserve(element));
    if (active && event.target.contains(active)) reset();
  });
  reduce.addEventListener('change', () => {
    reset();
    if (reduce.matches) document.querySelectorAll('.sn-motion-in').forEach((element) => element.classList.remove('sn-motion-in'));
  });
})();
