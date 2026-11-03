if (!customElements.get('hanging-collection-slider')) {
  customElements.define('hanging-collection-slider', class extends HTMLElement {
    connectedCallback() {
      if (this.controller) return;
      this.controller = new AbortController();
      const options = { signal: this.controller.signal };
      this.track = this.querySelector('.hanging-rail__track');
      this.items = [...this.querySelectorAll('.hanging-rail__item')];
      this.previous = this.querySelector('[data-rail-prev]');
      this.next = this.querySelector('[data-rail-next]');
      if (!this.track || !this.items.length) return;

      this.addEventListener('click', (event) => {
        const button = event.target.closest('.hanging-rail__garment');
        if (!button || (this.slider && !this.slider.slick('getSlick').shouldClick)) return;
        if (button.hasAttribute('aria-pressed')) {
          button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true'));
        }
        this.select(button.closest('.hanging-rail__item'));
      }, options);
      this.items.forEach((item) => {
        item.addEventListener('pointerenter', () => this.select(item), options);
        item.addEventListener('focusin', () => this.select(item), options);
      });
      this.addEventListener('shopify:block:select', (event) => {
        const index = this.items.indexOf(event.target.closest('.hanging-rail__item'));
        if (this.slider && index >= 0) this.slider.slick('slickGoTo', index, true);
      }, options);

      const $ = window.jQuery;
      if (!$ || !$.fn.slick) {
        this.previous.disabled = this.next.disabled = true;
        this.select(this.items[0]);
        return;
      }
      this.slider = $(this.track);
      const desktopCount = Math.min(this.items.length, Math.max(1, Math.min(6, Number(this.dataset.desktopCount) || 3)));
      const mobileCount = Math.min(this.items.length, Math.max(1, Math.min(3, Number(this.dataset.mobileCount) || 1)));
      this.slider.on('init.hangingRail afterChange.hangingRail reInit.hangingRail breakpoint.hangingRail', (_event, slick) => {
        this.update(slick);
      });
      this.slider.slick({
        slidesToShow: desktopCount,
        slidesToScroll: 1,
        initialSlide: this.items.length > 2 ? 1 : 0,
        centerMode: this.items.length > 1,
        centerPadding: '60px',
        infinite: this.items.length > 1,
        arrows: true,
        prevArrow: $(this.previous),
        nextArrow: $(this.next),
        dots: false,
        speed: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 550,
        swipe: true,
        swipeToSlide: true,
        draggable: true,
        touchThreshold: 8,
        accessibility: true,
        adaptiveHeight: false,
        responsive: [
          { breakpoint: 990, settings: { slidesToShow: Math.min(2, desktopCount), centerPadding: '32px' } },
          { breakpoint: 750, settings: { slidesToShow: mobileCount, centerPadding: mobileCount === 1 ? '15%' : '12px' } }
        ]
      });
    }
    select(item) {
      if (!item) return;
      this.items.forEach((entry) => entry.toggleAttribute('data-active', entry === item));
      this.querySelector('.hanging-rail__selected').textContent = item.dataset.title;
      const link = this.querySelector('[data-rail-product-link]');
      if (link) link.href = item.dataset.url;
    }
    update(slick) {
      this.select(this.items[slick.currentSlide]);
      const last = slick.options.centerMode ? slick.slideCount - 1 : Math.max(0, slick.slideCount - slick.options.slidesToShow);
      this.previous.disabled = !slick.options.infinite && slick.currentSlide <= 0;
      this.next.disabled = !slick.options.infinite && slick.currentSlide >= last;
      this.previous.hidden = this.next.hidden = slick.slideCount <= slick.options.slidesToShow;
    }
    disconnectedCallback() {
      this.controller?.abort();
      this.controller = null;
      if (this.slider) {
        this.slider.off('.hangingRail');
        if (this.slider.hasClass('slick-initialized')) this.slider.slick('unslick');
        this.slider = null;
      }
    }
  });
}
