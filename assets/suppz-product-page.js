(() => {
  if (window.suppzProductPageReady) return;
  window.suppzProductPageReady = true;
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-pdp-next],[data-pdp-prev]');
    if (!button) return;
    const gallery = button.closest('.product__media-wrapper')?.querySelector('media-gallery');
    if (!gallery) return;
    const items = [...gallery.querySelectorAll('[id^="Slider-Gallery-"] > [data-media-id]')]
      .filter((item) => !item.classList.contains('product__media-item--variant') || item.classList.contains('is-active'));
    if (items.length < 2) return;
    const current = Math.max(0, items.findIndex((item) => item.classList.contains('is-active')));
    const next = (current + (button.hasAttribute('data-pdp-next') ? 1 : -1) + items.length) % items.length;
    gallery.setActiveMedia(items[next].dataset.mediaId, false);
  });
})();
