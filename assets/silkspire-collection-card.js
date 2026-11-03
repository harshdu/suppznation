if (!customElements.get('silkspire-collection-card')) {
  customElements.define('silkspire-collection-card', class extends HTMLElement {
    connectedCallback() {
      if (this.galleryReady) return;
      this.galleryReady = true;
      this.addEventListener('click', (event) => {
        const button = event.target.closest('[data-image-src]');
        const image = this.querySelector('.silkspire-card__main-image');
        if (!button || !image) return;
        image.removeAttribute('srcset');
        image.src = button.dataset.imageSrc;
        image.alt = button.dataset.imageAlt;
        this.querySelectorAll('[data-image-src]').forEach((thumbnail) => {
          thumbnail.setAttribute('aria-pressed', String(thumbnail === button));
        });
      });
    }
  });
}
