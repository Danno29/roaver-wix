// roaver-widget.js
// A Wix Custom Element that exposes a real DOM container for Roaver's widget.
// NOTE: No Shadow DOM; we want a normal DOM node Roaver can target.

(() => {
  class RoaverWidget extends HTMLElement {
    constructor() {
      super();
      // Do NOT call attachShadow().
      this._injectId =
        this.getAttribute('data-inject') ||
        `roaver-${Math.random().toString(36).slice(2)}`;
    }

    static get observedAttributes() {
      return ['data-key', 'data-type', 'data-locale'];
    }

    connectedCallback() {
      // Ensure block-level sizing
      if (!this.style.display) this.style.display = 'block';
      if (!this.style.width) this.style.width = '100%';

      // Build the target container in the REAL document
      let host = document.getElementById(this._injectId);
      if (!host) {
        host = document.createElement('div');
        host.id = this._injectId;
        host.style.minHeight = this.getAttribute('min-height') || '700px';
        host.style.boxSizing = 'border-box';
        this.appendChild(host);
      }

      this._loadRoaverScript();
    }

    attributeChangedCallback() {
      if (this.isConnected) this._loadRoaverScript(true);
    }

    _loadRoaverScript() {
      // If we reload, remove a previous loader inside this element
      const prev = this.querySelector('script[data-roaver-loader="1"]');
      if (prev) prev.remove();

      const key = (this.getAttribute('data-key') || '').trim();
      const type = (this.getAttribute('data-type') || 'search').trim(); // "search" or "book"
      const locale = (this.getAttribute('data-locale') || 'en').trim();

      const s = document.createElement('script');
      s.defer = true;
      s.src = 'https://app.roaver.com.au/assets/scripts/build/widget.js';
      s.setAttribute('data-key', key);
      s.setAttribute('data-type', type);
      s.setAttribute('data-locale', locale);
      s.setAttribute('data-inject', this._injectId);
      s.setAttribute('data-roaver-loader', '1');

      this.appendChild(s);
    }
  }

  customElements.define('roaver-widget', RoaverWidget);
})();
