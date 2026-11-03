(() => {
  const key = 'silkspire-wishlist-v1';
  const read = () => {
    try {
      const items = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(items) ? items.filter(item => item && typeof item.id === 'string' && typeof item.title === 'string' && typeof item.url === 'string' && item.url.startsWith('/products/')) : [];
    } catch { return []; }
  };
  let items = read();
  const sync = () => {
    document.querySelectorAll('[data-wishlist-toggle]').forEach(button => {
      const saved = items.some(item => item.id === button.dataset.productId);
      button.setAttribute('aria-pressed', String(saved));
      button.setAttribute('aria-label', saved ? 'Remove from wishlist' : 'Add to wishlist');
    });
    document.querySelectorAll('[data-wishlist-count]').forEach(badge => {
      if (badge.textContent !== String(items.length)) badge.textContent = String(items.length);
      badge.hidden = !items.length;
    });
  };
  const cards = new Map();
  let renderVersion = 0;
  const loadCard = (item) => {
    if (!cards.has(item.url)) {
      cards.set(item.url, fetch(`${item.url}?view=wishlist-card`).then(response => {
        if (!response.ok) throw new Error('Product unavailable');
        return response.text();
      }).then(html => {
        const card = new DOMParser().parseFromString(html, 'text/html').querySelector('silkspire-collection-card');
        if (!card) throw new Error('Product unavailable');
        return card;
      }).catch(error => { cards.delete(item.url); throw error; }));
    }
    return cards.get(item.url);
  };
  const render = async () => {
    const grid = document.querySelector('[data-wishlist-grid]');
    if (!grid) return;
    const version = ++renderVersion;
    grid.replaceChildren();
    document.querySelector('[data-wishlist-empty]').hidden = items.length > 0;
    await Promise.all(items.map(async item => {
      const card = document.createElement('article');
      card.className = 'wishlist-card';
      const status = document.createElement('p');
      status.textContent = `Loading ${item.title}…`;
      card.append(status);
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'wishlist-toggle';
      button.dataset.wishlistToggle = ''; button.dataset.productId = item.id;
      const heart = document.querySelector('.header__icon--wishlist > svg');
      if (heart) button.append(heart.cloneNode(true));
      card.append(button); grid.append(card);
      try {
        const productCard = await loadCard(item);
        if (version !== renderVersion) return;
        status.replaceWith(document.importNode(productCard, true));
      } catch {
        if (version !== renderVersion) return;
        const link = document.createElement('a');
        link.href = item.url; link.textContent = item.title;
        status.replaceChildren(link, document.createTextNode(' — Unable to load product. Please refresh to try again.'));
      }
    }));
    sync();
  };
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-wishlist-toggle]');
    if (!button) return;
    const id = button.dataset.productId;
    const next = items.some(item => item.id === id)
      ? items.filter(item => item.id !== id)
      : [...items, { id, handle:button.dataset.productHandle, title:button.dataset.productTitle, url:button.dataset.productUrl, image:button.dataset.productImage, price:button.dataset.productPrice }];
    try { localStorage.setItem(key, JSON.stringify(next)); }
    catch { alert('Wishlist could not be saved. Please allow browser storage and try again.'); return; }
    items = next; render(); sync();
  });
  window.addEventListener('storage', event => { if (event.key === key || event.key === null) { items = read(); render(); sync(); } });
  document.addEventListener('shopify:section:load', sync);
  // Variant changes can replace the product information without a page reload.
  new MutationObserver(sync).observe(document.body, { childList:true, subtree:true });
  render(); sync();
})();
