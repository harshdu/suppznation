(() => {
  const navigation = document.querySelector('[data-mobile-bottom-nav]');
  if (!navigation) return;
  let previous = Math.max(0, window.scrollY);
  let scheduled = false;
  const update = () => {
    const current = Math.max(0, Math.min(window.scrollY, document.documentElement.scrollHeight - window.innerHeight));
    const delta = current - previous;
    if (current <= 10) navigation.classList.remove('is-hidden');
    else if (Math.abs(delta) >= 5) navigation.classList.toggle('is-hidden', delta < 0);
    if (Math.abs(delta) >= 5 || current <= 10) previous = current;
    scheduled = false;
  };
  window.addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
  }, { passive:true });
  navigation.addEventListener('focusin', () => navigation.classList.remove('is-hidden'));
})();
