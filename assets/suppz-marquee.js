if (!customElements.get('suppz-marquee')) {
  customElements.define('suppz-marquee', class extends HTMLElement {
    connectedCallback() {
      this.controller?.abort();this.controller=new AbortController();const opts={signal:this.controller.signal};
      this.button=this.querySelector('.sn-marquee__toggle');if(!this.button)return;
      this.button.hidden=false;
      this.button.addEventListener('click',()=>{const paused=this.classList.toggle('is-paused');this.button.setAttribute('aria-label',paused?'Play scrolling announcements':'Pause scrolling announcements');},opts);
      document.addEventListener('shopify:block:select',event=>{if(this.contains(event.target))this.classList.add('is-editing');},opts);
      document.addEventListener('shopify:block:deselect',event=>{if(this.contains(event.target))this.classList.remove('is-editing');},opts);
    }
    disconnectedCallback(){this.controller?.abort();}
  });
}
