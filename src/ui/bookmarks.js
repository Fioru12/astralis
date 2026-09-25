import { t } from '../i18n/index.js';

export class CameraBookmarks {
  constructor() {
    this.bookmarks = JSON.parse(localStorage.getItem('astralis_bookmarks') || '[]');
    this.panel = null;
    this.isOpen = false;
    this._cam = null;
  }

  save(CAM, name) {
    const entry = {
      name: name || `${t('bmk_default')} ${this.bookmarks.length + 1}`,
      pivot: CAM.pivot.toArray(),
      radius: CAM.radius,
      phi: CAM.phi,
      theta: CAM.theta,
    };
    this.bookmarks.push(entry);
    this._persist();
    return entry;
  }

  load(CAM, index) {
    const entry = this.bookmarks[index];
    if (!entry) return;
    CAM.tRadius = entry.radius;
    CAM.tPhi = entry.phi;
    CAM.tTheta = entry.theta;
    CAM.tPivot.fromArray(entry.pivot);
    CAM.mode = 'orbit';
    CAM.followBody = null;
  }

  remove(index) {
    this.bookmarks.splice(index, 1);
    this._persist();
    if (this.isOpen) this._render();
  }

  _persist() {
    localStorage.setItem('astralis_bookmarks', JSON.stringify(this.bookmarks));
  }

  toggle(CAM) {
    this.isOpen ? this._hide() : this._show(CAM);
  }

  _show(CAM) {
    if (this.panel) return;
    this._cam = CAM;
    this.panel = document.createElement('div');
    this.panel.id = 'bookmarksPanel';
    Object.assign(this.panel.style, {
      position: 'fixed',
      bottom: '80px',
      right: '20px',
      width: '280px',
      maxHeight: '320px',
      background: 'rgba(8, 10, 20, 0.92)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(91,196,207,0.25)',
      borderRadius: '12px',
      color: '#e4eaf8',
      zIndex: '9900',
      fontFamily: '"Space Grotesk", system-ui, sans-serif',
      opacity: '0',
      transition: 'opacity 0.2s ease',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    });
    this.panel.innerHTML = `
      <div style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:13px;font-weight:700;color:#5bc4cf;">Camera Bookmarks</span>
        <button id="bmkClose" style="background:none;border:none;color:rgba(228,234,248,0.5);cursor:pointer;font-size:16px;">✕</button>
      </div>
      <div id="bmkSaveRow" style="padding:10px 12px;display:flex;gap:6px;border-bottom:1px solid rgba(255,255,255,0.05);">
        <input id="bmkNameInput" type="text" placeholder="${t(
          'bmk_placeholder'
        )}" style="flex:1;padding:6px 8px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:6px;color:#e4eaf8;font-size:12px;">
        <button id="bmkSaveBtn" style="padding:6px 12px;background:#5bc4cf;border:none;border-radius:6px;color:#0a0c18;font-size:12px;font-weight:700;cursor:pointer;">Save</button>
      </div>
      <div id="bmkList" style="flex:1;overflow-y:auto;padding:4px 0;"></div>
    `;
    document.body.appendChild(this.panel);

    this.panel.querySelector('#bmkClose').onclick = () => this._hide();
    this.panel.querySelector('#bmkSaveBtn').onclick = () => {
      const input = this.panel.querySelector('#bmkNameInput');
      const name = input.value.trim() || `${t('bmk_default')} ${this.bookmarks.length + 1}`;
      this.save(CAM, name);
      input.value = '';
      this._render();
    };
    this.panel.querySelector('#bmkNameInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.panel.querySelector('#bmkSaveBtn').click();
    });

    this._render();
    requestAnimationFrame(() => {
      this.panel.style.opacity = '1';
    });
    this.isOpen = true;
  }

  _hide() {
    if (!this.panel) return;
    this.panel.style.opacity = '0';
    setTimeout(() => {
      this.panel?.remove();
      this.panel = null;
    }, 220);
    this.isOpen = false;
  }

  _render() {
    const list = this.panel?.querySelector('#bmkList');
    if (!list) return;
    if (this.bookmarks.length === 0) {
      list.innerHTML = `<div style="padding:20px;text-align:center;font-size:12px;color:rgba(228,234,248,0.4);">${t(
        'bmk_empty'
      )}</div>`;
      return;
    }
    list.innerHTML = this.bookmarks
      .map(
        (bm, i) => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 14px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.04);transition:background 0.15s;"
           onmouseover="this.style.background='rgba(91,196,207,0.08)'" onmouseout="this.style.background='transparent'">
        <span style="font-size:13px;flex:1;" data-index="${i}">${this._escape(bm.name)}</span>
        <button data-del="${i}" style="background:none;border:none;color:rgba(255,100,100,0.5);cursor:pointer;font-size:14px;padding:2px 6px;">🗑</button>
      </div>
    `
      )
      .join('');

    const cam = this._cam;
    list.querySelectorAll('[data-index]').forEach((el) => {
      el.addEventListener('click', () => {
        if (cam) this.load(cam, parseInt(el.dataset.index));
        this._hide();
      });
    });
    list.querySelectorAll('[data-del]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.remove(parseInt(el.dataset.del));
      });
    });
  }

  _escape(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }
}
