// roaver-widget.js — Wix Custom Element for Roaver widget (with loader + single-init)
(() => {
  const LOADER_HTML = `
    <div class="roaver-loader" style="
      display:flex;align-items:center;gap:10px;padding:16px;
      font:14px/1.4 system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      color:#555; background:#fafafa; border:1px solid #eee; border-radius:10px;">
      <div class="spin" style="
        width:16px;height:16px;border-radius:50%;
        border:2px solid #ddd;border-top-color:#999;
        animation: roaverSpin 0.8s linear infinite;"></div>
      <span>Caricamento…</span>
      <style>
        @keyframes roaverSpin { to { transform: rotate(360deg); } }
      </style>
    </div>`;

  class RoaverWidget extends HTMLElement {
    constructor() {
      super();
      this._injectId =
        this.getAttribute('data-inject') ||
        `roaver-${Math.random().toString(36).slice(2)}`;
      this._initialized = false;
      this._observer = null;
    }

    static get observedAttributes() {
      return ['data-key', 'data-type', 'data-locale', 'min-height'];
    }

    connectedCallback() {
      if (!this.style.display) this.style.display = 'block';
      if (!this.style.width) this.style.width = '100%';

      // Build/ensure the REAL DOM host once
      let host = document.getElementById(this._injectId);
      if (!host) {
        host = document.createElement('div');
        host.id = this._injectId;
        host.setAttribute('data-roaver-host', '1');
        host.style.minHeight = this.getAttribute('min-height') || '1100px';
        host.style.position = 'relative';
        host.style.boxSizing = 'border-box';
        this.appendChild(host);
      }

      // Add loader if not present
      if (!host.querySelector('.roaver-loader')) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = LOADER_HTML;
        host.appendChild(wrapper.firstElementChild);
      }

      // Observe host to remove loader when vendor paints UI
      if (!this._observer) {
        this._observer = new MutationObserver(() => {
          const hasVendorUI = Array.from(host.children).some(
            (el) => el.classList && !el.classList.contains('roaver-loader')
          );
          if (hasVendorUI) {
            const loader = host.querySelector('.roaver-loader');
            if (loader) loader.remove();
            this._observer && this._observer.disconnect();
            this._observer = null;
          }
        });
        this._observer.observe(host, { childList: true, subtree: true });
      }

      if (!this._initialized) this._mount();
    }

    disconnectedCallback() {
      if (this._observer) {
        this._observer.disconnect();
        this._observer = null;
      }
    }

    attributeChangedCallback(name, oldVal, newVal) {
      if (!this.isConnected) return;
      if (oldVal === newVal) return;
      if (this._initialized && (name === 'data-type' || name === 'data-locale')) {
        this._remount(); // allow type/locale switches during editing
      }
      if (name === 'min-height') {
        const host = document.getElementById(this._injectId);
        if (host) host.style.minHeight = newVal || '1100px';
      }
    }

    _mount() {
      if (this._initialized) return;
      this._initialized = true;

      // Guard against a prior loader script under this element
      this.querySelectorAll('script[data-roaver-loader="1"]').forEach(n => n.remove());

      // Also avoid double-loading globally if someone added it via Custom Code
      // (We still attach our scoped loader with data-* so their init runs)
      const s = document.createElement('script');
      s.defer = true;
      s.src = 'https://app.roaver.com.au/assets/scripts/build/widget.js';
      s.setAttribute('data-key', (this.getAttribute('data-key') || '').trim());
      s.setAttribute('data-type', (this.getAttribute('data-type') || 'search').trim()); // "search" | "book"
      s.setAttribute('data-locale', (this.getAttribute('data-locale') || 'it').trim());
      s.setAttribute('data-inject', this._injectId);
      s.setAttribute('data-roaver-loader', '1');
      this.appendChild(s);
    }

    _remount() {
      const host = document.getElementById(this._injectId);
      if (host) {
        host.innerHTML = '';
        // re-add loader
        const wrapper = document.createElement('div');
        wrapper.innerHTML = LOADER_HTML;
        host.appendChild(wrapper.firstElementChild);
      }
      this._initialized = false;
      this._mount();
    }
  }

  customElements.define('roaver-widget', RoaverWidget);
})();

