if (!customElements.get('suppz-deal-slider')) {
  customElements.define('suppz-deal-slider', class extends HTMLElement {
    connectedCallback() {
      this.controller?.abort();this.controller=new AbortController();const opts={signal:this.controller.signal};
      this.track=this.querySelector('.sn-deals__track');this.list=this.querySelector('.sn-deals__list');
      const step=()=>{const item=this.querySelector('.sn-deals__card');return (item?.getBoundingClientRect().width||260)+(parseFloat(getComputedStyle(this.list).gap)||16);};
      this.addEventListener('click',e=>{
        if(this.suppressClick&&e.detail!==0&&e.target.closest('.sn-deals__track')){e.preventDefault();e.stopPropagation();return;}
        if(e.target.closest('[data-next]'))this.track.scrollBy({left:step()});
        if(e.target.closest('[data-prev]'))this.track.scrollBy({left:-step()});
      },{...opts,capture:true});
      this.track.addEventListener('dragstart',e=>e.preventDefault(),opts);
      this.track.addEventListener('pointerdown',e=>{this.suppressClick=false;if(e.pointerType==='mouse'&&e.button===0)this.drag={id:e.pointerId,x:e.clientX,scroll:this.track.scrollLeft,moved:false};},opts);
      this.track.addEventListener('pointermove',e=>{
        if(!this.drag||this.drag.id!==e.pointerId)return;const delta=e.clientX-this.drag.x;if(!this.drag.moved&&Math.abs(delta)<6)return;
        if(!this.drag.moved){this.drag.moved=true;this.track.classList.add('is-dragging');this.track.setPointerCapture(e.pointerId);}
        e.preventDefault();this.track.scrollLeft=this.drag.scroll-delta;
      },opts);
      const end=e=>{if(!this.drag||this.drag.id!==e.pointerId)return;this.suppressClick=this.drag.moved;this.drag=null;this.track.classList.remove('is-dragging');if(this.track.hasPointerCapture(e.pointerId))this.track.releasePointerCapture(e.pointerId);};
      window.addEventListener('pointerup',end,opts);this.track.addEventListener('pointercancel',end,opts);this.track.addEventListener('lostpointercapture',end,opts);
      this.track.addEventListener('keydown',e=>{if(e.target!==this.track)return;if(['ArrowRight','ArrowLeft'].includes(e.key)){e.preventDefault();this.track.scrollBy({left:e.key==='ArrowRight'?step():-step()});}if(['Home','End'].includes(e.key)){e.preventDefault();this.track.scrollTo({left:e.key==='Home'?0:this.track.scrollWidth});}},opts);
      this.track.addEventListener('scroll',()=>this.update(),{...opts,passive:true});
      this.resize=new ResizeObserver(()=>this.update());this.resize.observe(this.track);this.resize.observe(this.list);
      document.addEventListener('shopify:block:select',e=>{const card=e.target.closest('.sn-deals__card');if(card&&this.contains(card))card.scrollIntoView({block:'nearest',inline:'center',behavior:'instant'});},opts);this.update();
    }
    update(){const position=Math.abs(this.track.scrollLeft),max=this.track.scrollWidth-this.track.clientWidth;this.querySelector('[data-prev]').disabled=position<=2;this.querySelector('[data-next]').disabled=position>=max-2;}
    disconnectedCallback(){this.controller?.abort();this.resize?.disconnect();this.drag=null;}
  });
}
