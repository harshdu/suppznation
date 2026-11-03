if (!customElements.get('suppz-header')) {
  customElements.define('suppz-header', class extends HTMLElement {
    connectedCallback() {
      this.controller?.abort();
      this.controller = new AbortController();
      const options = { signal: this.controller.signal };
      this.addEventListener('click', (event) => {
        const opener = event.target.closest('[data-sn-open]');
        const switcher = event.target.closest('[data-sn-switch]');
        if (opener || switcher) {
          this.openPanel((opener || switcher).dataset[opener ? 'snOpen' : 'snSwitch'], opener || this.returnFocus);
        }
        if (event.target.closest('[data-sn-close]')) this.closePanel();
        if (event.target instanceof HTMLDialogElement) {
          const rect = event.target.getBoundingClientRect();
          if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) this.closePanel();
        }
      }, options);
      this.querySelectorAll('dialog').forEach((dialog) => {
        dialog.addEventListener('close', () => {
          if (this.activeDialog !== dialog) return;
          this.activeDialog = null;
          document.documentElement.classList.remove('sn-dialog-open');
          this.querySelector('[data-sn-open="menu"]')?.setAttribute('aria-expanded', 'false');
          this.returnFocus?.focus();
        }, options);
      });
      this.addEventListener('toggle', (event) => {
        const details = event.target;
        if (!details.matches('.sn-dropdown') || !details.open) return;
        this.querySelectorAll('.sn-dropdown[open]').forEach((other) => { if (other !== details) other.open = false; });
      }, { ...options, capture: true });
      document.addEventListener('click', (event) => {
        if (!event.target.closest('.sn-dropdown')) this.querySelectorAll('.sn-dropdown[open]').forEach((item) => { item.open = false; });
      }, options);
      this.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        const dropdown = event.target.closest('.sn-dropdown[open]');
        if (dropdown) { dropdown.open = false; dropdown.querySelector('summary').focus(); }
      }, options);
      this.desktopQuery = window.matchMedia('(min-width: 990px)');
      this.desktopQuery.addEventListener('change', () => {
        if (this.activeDialog?.dataset.snDialog === 'menu') this.closePanel();
      }, options);
    }
    openPanel(name, trigger) {
      const dialog = this.querySelector(`[data-sn-dialog="${name}"]`);
      if (!dialog) return;
      this.closePanel();
      this.returnFocus = trigger;
      this.activeDialog = dialog;
      dialog.showModal();
      document.documentElement.classList.add('sn-dialog-open');
      this.querySelector('[data-sn-open="menu"]')?.setAttribute('aria-expanded', String(name === 'menu'));
      dialog.querySelector('[data-sn-close]')?.focus();
    }
    closePanel() { this.activeDialog?.close(); }
    disconnectedCallback() {
      this.closePanel();
      document.documentElement.classList.remove('sn-dialog-open');
      this.controller?.abort();
    }
  });
}
