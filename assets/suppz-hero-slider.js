if (!customElements.get('suppz-hero-slider')) {
  customElements.define('suppz-hero-slider', class extends HTMLElement {
    connectedCallback() {
      this.controller?.abort(); this.controller = new AbortController();
      const opts = { signal: this.controller.signal };
      this.track = this.querySelector('.sn-hero__track');
      this.slides = [...this.querySelectorAll('.sn-hero__slide')];
      this.dots = [...this.querySelectorAll('[data-slide]')];
      this.motion = matchMedia('(prefers-reduced-motion: reduce)');
      this.index = 0; this.paused = this.dataset.autoplay !== 'true' || this.motion.matches; this.visible = true; this.update();
      this.addEventListener('click', event => {
        if (this.suppressClick && event.detail !== 0 && event.target.closest('.sn-hero__track')) { event.preventDefault(); event.stopPropagation(); return; }
        if (event.target.closest('[data-next]')) this.go(this.index + 1, true);
        if (event.target.closest('[data-prev]')) this.go(this.index - 1, true);
        const dot = event.target.closest('[data-slide]'); if (dot) this.go(Number(dot.dataset.slide), true);
        if (event.target.closest('[data-play]')) { this.paused = !this.paused; this.update(); this.schedule(); }
      }, { ...opts, capture: true });
      this.track.addEventListener('dragstart', e => e.preventDefault(), opts);
      this.track.addEventListener('pointerdown', e => {
        this.suppressClick = false; clearTimeout(this.timer);
        if (e.pointerType === 'mouse' && e.button === 0) this.drag = {id:e.pointerId,x:e.clientX,scroll:this.track.scrollLeft,moved:false};
      }, opts);
      this.track.addEventListener('pointermove', e => {
        if (!this.drag || this.drag.id !== e.pointerId) return;
        const delta = e.clientX - this.drag.x; if (!this.drag.moved && Math.abs(delta) < 6) return;
        if (!this.drag.moved) { this.drag.moved = true; this.track.classList.add('is-dragging'); this.track.setPointerCapture(e.pointerId); }
        e.preventDefault(); this.track.scrollLeft = this.drag.scroll - delta;
      }, opts);
      const end = e => {
        if (!this.drag || this.drag.id !== e.pointerId) { this.schedule(); return; }
        const drag = this.drag; this.drag = null; this.suppressClick = drag.moved;
        const distance = this.track.scrollLeft - drag.scroll;
        this.track.classList.remove('is-dragging');
        if (this.track.hasPointerCapture(e.pointerId)) this.track.releasePointerCapture(e.pointerId);
        if (drag.moved) this.go(Math.round(Math.abs(drag.scroll) / this.track.clientWidth) + (Math.abs(distance) > this.track.clientWidth * .12 ? Math.sign(distance) : 0), true, false);
        else this.schedule();
      };
      window.addEventListener('pointerup', end, opts); this.track.addEventListener('pointercancel', end, opts);
      this.track.addEventListener('scroll', () => {
        clearTimeout(this.settle); this.settle = setTimeout(() => {
          if (this.drag) return; this.index = Math.round(Math.abs(this.track.scrollLeft) / this.track.clientWidth); this.update(); this.schedule();
        }, 120);
      }, { ...opts, passive:true });
      this.track.addEventListener('keydown', e => {
        if (!['ArrowRight','ArrowLeft','Home','End'].includes(e.key)) return;
        e.preventDefault(); this.go(e.key === 'Home' ? 0 : e.key === 'End' ? this.slides.length - 1 : this.index + (e.key === 'ArrowRight' ? 1 : -1), true);
      }, opts);
      this.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { this.hovered = true; clearTimeout(this.timer); } }, opts);
      this.addEventListener('pointerleave', () => { this.hovered = false; this.schedule(); }, opts);
      this.track.addEventListener('focusin', () => clearTimeout(this.timer), opts); this.track.addEventListener('focusout', () => this.schedule(), opts);
      document.addEventListener('visibilitychange', () => this.schedule(), opts);
      this.motion.addEventListener('change', () => { if (this.motion.matches) this.paused = true; this.update(); this.schedule(); }, opts);
      this.observer = new IntersectionObserver(entries => { this.visible = entries[0].isIntersecting; this.schedule(); }); this.observer.observe(this);
      this.resize = new ResizeObserver(() => this.track.scrollTo({left:this.index * this.track.clientWidth * (getComputedStyle(this.track).direction === 'rtl' ? -1 : 1),behavior:'instant'})); this.resize.observe(this.track);
      document.addEventListener('shopify:block:select', e => { const slide=e.target.closest('.sn-hero__slide'); if(slide && this.contains(slide)){this.paused=true;this.go(this.slides.indexOf(slide));this.update();} }, opts);
      this.schedule();
    }
    go(index, announce=false, wrap=true) {
      if (!this.slides.length) return;
      this.index = wrap ? (index + this.slides.length) % this.slides.length : Math.max(0,Math.min(index,this.slides.length-1));
      this.track.scrollTo({left:this.index*this.track.clientWidth*(getComputedStyle(this.track).direction==='rtl'?-1:1),behavior:this.motion.matches?'instant':'smooth'});
      this.update(); if(announce){const status=this.querySelector('[data-status]');if(status)status.textContent=`Slide ${this.index+1} of ${this.slides.length}`;} this.schedule();
    }
    update() {
      this.classList.toggle('is-paused',this.paused); this.querySelector('[data-play]')?.setAttribute('aria-label',this.paused?'Play slideshow':'Pause slideshow');
      this.dots.forEach((dot,i)=>{dot.classList.toggle('is-active',i===this.index);if(i===this.index)dot.setAttribute('aria-current','true');else dot.removeAttribute('aria-current');});
      this.slides.forEach((slide,i)=>{slide.inert=i!==this.index;});
    }
    schedule() {
      clearTimeout(this.timer);
      if(this.paused||this.hovered||this.drag||!this.visible||document.hidden||this.track?.contains(document.activeElement)||this.slides.length<2)return;
      this.timer=setTimeout(()=>this.go(this.index+1),Math.max(2000,Number(this.dataset.delay)||5000));
    }
    disconnectedCallback(){clearTimeout(this.timer);clearTimeout(this.settle);this.controller?.abort();this.observer?.disconnect();this.resize?.disconnect();}
  });
}
