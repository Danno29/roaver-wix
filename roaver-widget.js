// roaver-widget.js — one-time initialiser for Roaver widget on Wix
(() => {
  class RoaverWidget extends HTMLElement {
    constructor() {
      super();
      this._injectId =
        this.getAttribute('data-inject') ||
        `roaver-${Math.random().toString(36).slice(2)}`;
      this._initialized = false;
    }

    static get observedAttributes() {
      return ['data-key', 'data-type', 'data-locale'];
    }

    connectedCallback() {
      if (!this.style.display) this.style.display = 'block';
      if (!this.style.width) this.style.width = '100%';

      // Create/ensure the REAL DOM host container once
      let host = document.getElementById(this._injectId);
      if (!host) {
        host = document.createElement('div');
        host.id = this._injectId;
        host.setAttribute('data-roaver-host', '1');
        host.style.minHeight = this.getAttribute('min-height') || '900px';
        host.style.position = 'relative';
        host.style.boxSizing = 'border-box';
        this.appendChild(host);
      }

      // Initialise only once
      if (!this._initialized) this._mount();
    }

    attributeChangedCallback(name, oldVal, newVal) {
      if (!this.isConnected) return;
      if (!this._initialized) return;             // ignore pre-init attribute callbacks
      if (oldVal === newVal) return;
      // If you change type/locale in the Editor, we remount cleanly
      this._remount();
    }

    _mount() {
      if (this._initialized) return;
      this._initialized = true;

      // Clean any previous loader script under this element
      this.querySelectorAll('script[data-roaver-loader="1"]').forEach(n => n.remove());

      const s = document.createElement('script');
      s.defer = true;
      s.src = 'https://app.roaver.com.au/assets/scripts/build/widget.js';
      s.setAttribute('data-key', (this.getAttribute('data-key') || '').trim());
      s.setAttribute('data-type', (this.getAttribute('data-type') || 'search').trim()); // "search" | "book"
      s.setAttribute('data-locale', (this.getAttribute('data-locale') || 'it').trim()); // site is Italian
      s.setAttribute('data-inject', this._injectId);
      s.setAttribute('data-roaver-loader', '1');
      this.appendChild(s);
    }

    _remount() {
      const host = document.getElementById(this._injectId);
      if (host) host.innerHTML = '';  // clear vendor UI
      this._initialized = false;
      this._mount();
    }
  }

  customElements.define('roaver-widget', RoaverWidget);
})();

