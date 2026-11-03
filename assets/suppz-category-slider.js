if (!customElements.get('suppz-category-slider')) {
  customElements.define('suppz-category-slider', class extends HTMLElement {
    connectedCallback() {
      this.controller?.abort();
      this.controller = new AbortController();
      const options = { signal: this.controller.signal };
      this.track = this.querySelector('.sn-categories__track');
      if (!this.track) return;
      this.track.addEventListener('dragstart', event => event.preventDefault(), options);
      this.track.addEventListener('pointerdown', event => {
        this.suppressClick = false;
        if (event.pointerType !== 'mouse' || event.button !== 0) return;
        this.drag = { id: event.pointerId, start: event.clientX, scroll: this.track.scrollLeft, moved: false };
      }, options);
      this.track.addEventListener('pointermove', event => {
        const drag = this.drag;
        if (!drag || drag.id !== event.pointerId) return;
        const distance = event.clientX - drag.start;
        if (!drag.moved && Math.abs(distance) < 6) return;
        if (!drag.moved) {
          drag.moved = true;
          this.track.classList.add('is-dragging');
          this.track.setPointerCapture(event.pointerId);
        }
        event.preventDefault();
        this.track.scrollLeft = drag.scroll - distance;
      }, options);
      const finishDrag = event => {
        if (!this.drag || this.drag.id !== event.pointerId) return;
        this.suppressClick = this.drag.moved;
        this.drag = null;
        this.track.classList.remove('is-dragging');
        if (this.track.hasPointerCapture(event.pointerId)) this.track.releasePointerCapture(event.pointerId);
      };
      window.addEventListener('pointerup', finishDrag, options);
      this.track.addEventListener('pointercancel', finishDrag, options);
      this.track.addEventListener('lostpointercapture', finishDrag, options);
      this.track.addEventListener('click', event => {
        if (this.suppressClick && event.detail !== 0) { event.preventDefault(); event.stopPropagation(); return; }
        const storeLink = event.target.closest('[data-sn-store-link]');
        const header = document.querySelector('suppz-header');
        // A merchant-provided link takes priority over the shared store panel.
        if (storeLink && header?.openPanel && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
          event.preventDefault(); header.openPanel('store', storeLink);
        }
      }, { ...options, capture: true });
      this.track.addEventListener('keydown', event => {
        if (event.target !== this.track) return;
        const step = (this.track.querySelector('li')?.getBoundingClientRect().width || 76) + (parseFloat(getComputedStyle(this.track.querySelector('ul')).columnGap) || 32);
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault(); this.track.scrollBy({ left: event.key === 'ArrowRight' ? step : -step });
        }
        if (event.key === 'Home' || event.key === 'End') {
          event.preventDefault(); this.track.scrollTo({ left: event.key === 'Home' ? 0 : this.track.scrollWidth });
        }
      }, options);
      document.addEventListener('shopify:block:select', event => {
        const item = event.target.closest('.sn-categories__item');
        if (item && this.contains(item)) item.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'instant' });
      }, options);
    }
    disconnectedCallback() { this.controller?.abort(); this.drag = null; this.track?.classList.remove('is-dragging'); }
  });
}
