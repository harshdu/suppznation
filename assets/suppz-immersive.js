if (!customElements.get('suppz-floating-carousel')) {
  customElements.define('suppz-floating-carousel', class extends HTMLElement {
    connectedCallback() {
      this.controller?.abort();
      this.controller = new AbortController();
      const opts = { signal: this.controller.signal };
      this.pin = this.querySelector('.sn-orbit__pin');
      this.stage = this.querySelector('.sn-orbit__stage');
      this.items = [...this.querySelectorAll('.sn-orbit__item')];
      this.motion = matchMedia('(prefers-reduced-motion: reduce)');
      this.position = 0;
      this.classList.add('is-scroll-driven');
      this.measure();
      this.sync();
      window.addEventListener('scroll', () => this.schedule(), { ...opts, passive: true });
      window.addEventListener('resize', () => { this.measure(); this.schedule(); }, opts);
      this.resize = new ResizeObserver(() => { this.measure(); this.schedule(); });
      this.resize.observe(this.pin);
      this.motion.addEventListener('change', () => this.schedule(), opts);
      this.addEventListener('click', event => {
        if (this.suppressClick && event.detail !== 0 && event.target.closest('.sn-orbit__products')) {
          event.preventDefault(); event.stopPropagation(); return;
        }
        if (event.target.closest('[data-prev]')) this.navigate(Math.round(this.position) - 1);
        if (event.target.closest('[data-next]')) this.navigate(Math.round(this.position) + 1);
        if (event.target.closest('[data-discover]')) {
          if (this.position < this.items.length - 1 - .01) this.navigate(Math.round(this.position) + 1);
          else window.scrollTo({ top: this.startY() + this.distance + this.pin.offsetHeight * .5, behavior: this.behavior() });
        }
      }, { ...opts, capture: true });
      this.stage.addEventListener('dragstart', event => event.preventDefault(), opts);
      this.stage.addEventListener('pointerdown', event => {
        if (event.button !== 0) return;
        this.suppressClick = false;
        this.drag = { id: event.pointerId, x: event.clientX, start: this.position, moved: false };
      }, opts);
      this.stage.addEventListener('pointermove', event => {
        const rect = this.stage.getBoundingClientRect();
        const cursor = this.querySelector('.sn-orbit__cursor');
        cursor.style.left = `${event.clientX - rect.left}px`;
        cursor.style.top = `${event.clientY - rect.top}px`;
        this.toggleAttribute('data-hovered', !!event.target.closest('a.sn-orbit__product') && !this.drag?.moved);
        if (!this.drag || this.drag.id !== event.pointerId) return;
        const dx = event.clientX - this.drag.x;
        if (!this.drag.moved && Math.abs(dx) < 7) return;
        if (!this.drag.moved) { this.drag.moved = true; this.stage.setPointerCapture(event.pointerId); }
        event.preventDefault();
        this.navigate(this.drag.start - dx / this.spacing(), 'instant');
      }, opts);
      const end = event => {
        if (!this.drag || this.drag.id !== event.pointerId) return;
        const moved = this.drag.moved;
        this.suppressClick = moved;
        this.drag = null;
        if (this.stage.hasPointerCapture(event.pointerId)) this.stage.releasePointerCapture(event.pointerId);
        if (moved) this.navigate(Math.round(this.position));
        this.removeAttribute('data-hovered');
      };
      window.addEventListener('pointerup', end, opts);
      this.stage.addEventListener('pointercancel', end, opts);
      this.stage.addEventListener('lostpointercapture', event => { if (event.target === this.stage) end(event); }, opts);
      this.stage.addEventListener('pointerleave', () => this.removeAttribute('data-hovered'), opts);
      this.stage.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        this.navigate(event.key === 'Home' ? 0 : event.key === 'End' ? this.items.length - 1 : Math.round(this.position) + (event.key === 'ArrowRight' ? 1 : -1));
      }, opts);
      document.addEventListener('shopify:block:select', event => {
        const index = this.items.indexOf(event.target.closest('.sn-orbit__item'));
        if (index >= 0) this.navigate(index);
      }, opts);
    }
    behavior() { return this.motion.matches ? 'instant' : 'smooth'; }
    spacing() { return this.stage.clientWidth * (this.stage.clientWidth < 750 ? .55 : .29); }
    startY() { return this.getBoundingClientRect().top + window.scrollY; }
    measure() {
      this.scrollStep = this.pin.offsetHeight * (Number(this.dataset.scrollLength) || 80) / 100;
      this.distance = Math.max(0, this.items.length - 1) * this.scrollStep;
      this.style.setProperty('--sn-orbit-run', `${this.pin.offsetHeight + this.distance}px`);
    }
    schedule() {
      if (this.frame) return;
      this.frame = requestAnimationFrame(() => { this.frame = null; this.sync(); });
    }
    sync() {
      this.position = Math.max(0, Math.min(this.items.length - 1, -this.getBoundingClientRect().top / Math.max(1, this.scrollStep)));
      this.render();
      const index = Math.round(this.position);
      if (this.lastIndex !== index && this.items.length) {
        this.lastIndex = index;
        this.querySelector('[data-status]').textContent = `Product ${index + 1} of ${this.items.length}`;
      }
      this.querySelector('[data-prev]').disabled = this.position <= .001;
      this.querySelector('[data-next]').disabled = this.position >= this.items.length - 1 - .001;
    }
    navigate(index, behavior = this.behavior()) {
      if (!this.items.length) return;
      const position = Math.max(0, Math.min(this.items.length - 1, index));
      window.scrollTo({ top: this.startY() + position * this.scrollStep, behavior });
      if (behavior === 'instant') this.sync();
    }
    render() {
      const spacing = this.spacing();
      const mobile = this.stage.clientWidth < 750;
      this.items.forEach((item, index) => {
        const relative = index - this.position;
        const distance = Math.abs(relative);
        const scale = Math.max(mobile ? .38 : .45, 1 - distance * (mobile ? .38 : .16));
        const x = relative * spacing;
        const y = Math.sin(relative * 1.15) * this.stage.clientHeight * (mobile ? .012 : .075);
        const tilt = this.motion.matches ? 0 : Math.sin(relative * 1.25 + this.position * .25) * 18;
        item.style.transform = `translate(-50%,-50%) translate3d(${x}px,${y}px,0) rotate(${tilt}deg) scale(${scale})`;
        item.style.zIndex = String(Math.round(30 - distance * 5));
        item.style.filter = mobile && !this.motion.matches ? `brightness(${1 - Math.min(distance, 1) * .22}) blur(${Math.min(distance, 1.6) * 1.5}px)` : '';
        const hidden = Math.abs(x) > this.stage.clientWidth * .9;
        item.style.visibility = hidden ? 'hidden' : 'visible';
        item.inert = hidden;
      });
      this.querySelector('.sn-orbit__ring').style.transform = this.motion.matches ? 'none' : `rotate(${-this.position * 22}deg)`;
    }
    disconnectedCallback() { cancelAnimationFrame(this.frame); this.controller?.abort(); this.resize?.disconnect(); }
  });
}

if(!customElements.get('suppz-product-scene')){
 customElements.define('suppz-product-scene',class extends HTMLElement{
  connectedCallback(){this.controller?.abort();this.controller=new AbortController();const opts={signal:this.controller.signal};this.motion=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>{if(this.frame)return;this.frame=requestAnimationFrame(()=>{this.frame=null;const rect=this.getBoundingClientRect();const range=Math.max(1,this.offsetHeight-innerHeight);const progress=this.motion.matches?1:Math.max(0,Math.min(1,-rect.top/range));this.style.setProperty('--scene-progress',progress.toFixed(4));});};window.addEventListener('scroll',update,{...opts,passive:true});window.addEventListener('resize',update,opts);this.motion.addEventListener('change',update,opts);update();}
  disconnectedCallback(){cancelAnimationFrame(this.frame);this.controller?.abort();}
 });
}
