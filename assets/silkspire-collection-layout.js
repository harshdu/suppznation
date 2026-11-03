(() => {
  if (!customElements.get('silkspire-price-slider')) {
    customElements.define('silkspire-price-slider', class extends HTMLElement {
      connectedCallback() {
        if (this.ready) return;
        this.ready = true;
        const low = this.querySelector('[data-range-min]');
        const high = this.querySelector('[data-range-max]');
        const fields = this.closest('price-range').querySelectorAll('input:not([type="range"])');
        const maximum = Number(this.dataset.max);
        const format = value => new Intl.NumberFormat(document.documentElement.lang || 'en', { style:'currency', currency:this.dataset.currency }).format(value);
        const update = () => {
          this.querySelector('[data-range-low]').textContent = format(Number(low.value));
          this.querySelector('[data-range-high]').textContent = format(Number(high.value));
          this.style.setProperty('--range-start', `${maximum ? Number(low.value) / maximum * 100 : 0}%`);
          this.style.setProperty('--range-end', `${maximum ? Number(high.value) / maximum * 100 : 0}%`);
        };
        [low, high].forEach(input => {
          input.addEventListener('input', event => {
            event.stopPropagation();
            if (Number(low.value) > Number(high.value)) input.value = input === low ? high.value : low.value;
            update();
          });
          input.addEventListener('change', event => {
            event.stopPropagation();
            fields[0].value = Number(low.value) === 0 ? '' : low.value;
            fields[1].value = Number(high.value) === maximum ? '' : high.value;
            fields[0].dispatchEvent(new Event('input', { bubbles:true }));
          });
        });
        update();
      }
    });
  }
  const apply = (columns) => {
    document.documentElement.dataset.collectionColumns = columns;
    document.querySelectorAll('[data-collection-columns]').forEach(button => {
      if (button.tagName === 'BUTTON') button.setAttribute('aria-pressed', String(button.dataset.collectionColumns === columns));
    });
  };
  let columns = '3';
  try { const saved = localStorage.getItem('silkspire-collection-columns'); if (['2','3','4'].includes(saved)) columns = saved; } catch {}
  apply(columns);
  document.addEventListener('click', event => {
    const button = event.target.closest('button[data-collection-columns]');
    if (!button) return;
    columns = button.dataset.collectionColumns;
    apply(columns);
    try { localStorage.setItem('silkspire-collection-columns', columns); } catch {}
  });
  document.addEventListener('change', event => {
    if (!event.target.matches('[data-collection-sort]')) return;
    const url = new URL(location.href);
    url.searchParams.set('sort_by', event.target.value);
    url.searchParams.delete('page');
    location.assign(url.toString());
  });
  document.addEventListener('shopify:section:load', () => apply(columns));
})();
