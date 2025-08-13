// roaver-widget.js — Custom Element with auto-detect + loader + single-init
(() => {
  const LOADER_HTML = `<div class="roaver-loader" style="display:flex;align-items:center;gap:10px;padding:16px;font:14px/1.4 system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#555;background:#fafafa;border:1px solid #eee;border-radius:10px;"><div class="spin" style="width:16px;height:16px;border-radius:50%;border:2px solid #ddd;border-top-color:#999;animation: roaverSpin .8s linear infinite;"></div><span>Caricamento…</span><style>@keyframes roaverSpin{to{transform:rotate(360deg)}}</style></div>`;
  const qs = () => new URLSearchParams(window.location.search);
  const inferType = (attr) => {
    const p = (qs().get('__p')||'').toLowerCase();
    const path = (location.pathname||'').toLowerCase();
    if (attr) return attr.trim().toLowerCase();
    if (path.includes('/bookings')) return 'book';
    if (p.startsWith('book_')) return 'book';
    return 'search';
  };

  class RoaverWidget extends HTMLElement {
    constructor(){ super();
      this._injectId=this.getAttribute('data-inject')||`roaver-${Math.random().toString(36).slice(2)}`;
      this._initialized=false; this._obs=null;
    }
    static get observedAttributes(){ return ['data-key','data-type','data-locale','min-height']; }
    connectedCallback(){
      if(!this.style.display) this.style.display='block';
      if(!this.style.width) this.style.width='100%';

      let host=document.getElementById(this._injectId);
      if(!host){ host=document.createElement('div'); host.id=this._injectId; host.setAttribute('data-roaver-host','1');
        host.style.minHeight=this.getAttribute('min-height')||'1100px'; host.style.position='relative'; host.style.boxSizing='border-box';
        this.appendChild(host);
      }
      if(!host.querySelector('.roaver-loader')){
        const w=document.createElement('div'); w.innerHTML=LOADER_HTML; host.appendChild(w.firstElementChild);
      }
      if(!this._obs){
        this._obs=new MutationObserver(()=>{ const hasUI=[...host.children].some(el=>el.classList&&!el.classList.contains('roaver-loader'));
          if(hasUI){ host.querySelector('.roaver-loader')?.remove(); this._obs?.disconnect(); this._obs=null; }
        });
        this._obs.observe(host,{childList:true,subtree:true});
      }
      if(!this._initialized) this._mount();
    }
    disconnectedCallback(){ this._obs?.disconnect(); this._obs=null; }
    attributeChangedCallback(name,o,n){
      if(!this.isConnected||o===n) return;
      if(this._initialized && (name==='data-type'||name==='data-locale')) this._remount();
      if(name==='min-height'){ const host=document.getElementById(this._injectId); if(host) host.style.minHeight=n||'1100px'; }
    }
    _mount(){
      if(this._initialized) return; this._initialized=true;
      this.querySelectorAll('script[data-roaver-loader="1"]').forEach(n=>n.remove());
      const key=(this.getAttribute('data-key')||'').trim();
      const type=inferType((this.getAttribute('data-type')||'').trim());
      const locale=(this.getAttribute('data-locale')||'it').trim();
      const s=document.createElement('script'); s.defer=true;
      s.src='https://app.roaver.com.au/assets/scripts/build/widget.js';
      s.setAttribute('data-key',key); s.setAttribute('data-type',type);
      s.setAttribute('data-locale',locale); s.setAttribute('data-inject',this._injectId);
      s.setAttribute('data-roaver-loader','1');
      s.onerror=()=>{ const host=document.getElementById(this._injectId);
        if(host){ const err=document.createElement('div'); err.textContent='Errore: impossibile caricare il widget Roaver.';
          err.style.cssText='margin-top:10px;color:#b00020;font:13px system-ui,Arial'; host.appendChild(err); }
      };
      this.appendChild(s);
    }
    _remount(){ const host=document.getElementById(this._injectId);
      if(host){ host.innerHTML=''; const w=document.createElement('div'); w.innerHTML=LOADER_HTML; host.appendChild(w.firstElementChild); }
      this._initialized=false; this._mount();
    }
  }
  customElements.define('roaver-widget', RoaverWidget);
})();
