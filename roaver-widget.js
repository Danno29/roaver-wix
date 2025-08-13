(() => {
  class RoaverWidget extends HTMLElement {
    connectedCallback() {
      this.style.display = 'block';
      this.style.padding = '20px';
      this.style.background = '#ffe';
      this.style.border = '1px solid #cc9';
      this.textContent = 'Custom element INITIALISED – ready to load Roaver.';
    }
  }
  customElements.define('roaver-widget', RoaverWidget);
})();
