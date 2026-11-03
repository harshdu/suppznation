if (!customElements.get('suppz-collection-tabs')) {
  customElements.define('suppz-collection-tabs', class extends HTMLElement {
    connectedCallback() {
      this.controller?.abort();this.controller=new AbortController();const opts={signal:this.controller.signal};
      this.tabs=[...this.querySelectorAll('[role="tab"]')];this.panels=[...this.querySelectorAll('[role="tabpanel"]')];
      this.addEventListener('click',event=>{const tab=event.target.closest('[role="tab"]');if(tab&&this.tabs.includes(tab))this.select(this.tabs.indexOf(tab));},opts);
      this.querySelector('[role="tablist"]')?.addEventListener('keydown',event=>{
        const current=this.tabs.indexOf(event.target);if(current<0)return;
        let next=current;const rtl=getComputedStyle(this).direction==='rtl';
        if(event.key==='ArrowRight')next=current+(rtl?-1:1);
        else if(event.key==='ArrowLeft')next=current+(rtl?1:-1);
        else if(event.key==='Home')next=0;else if(event.key==='End')next=this.tabs.length-1;else return;
        event.preventDefault();next=(next+this.tabs.length)%this.tabs.length;this.select(next);this.tabs[next].focus();
      },opts);
      document.addEventListener('shopify:block:select',event=>{const panel=event.target.closest('.sn-tabs__panel');const index=this.panels.indexOf(panel);if(index>=0)this.select(index);},opts);
      this.select(0,false);
    }
    select(index,scroll=true){
      if(!this.tabs[index]||!this.panels[index])return;
      this.tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
      this.panels.forEach((panel,i)=>{panel.hidden=i!==index;});
      const panel=this.panels[index];const viewAll=this.querySelector('[data-view-all]');if(viewAll)viewAll.href=panel.dataset.viewUrl;
      panel.querySelector('suppz-deal-slider')?.update?.();
      if(scroll)this.tabs[index].scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
    }
    disconnectedCallback(){this.controller?.abort();}
  });
}
