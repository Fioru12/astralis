/**
 * Space News Widget - APOD + NEO widgets dalla NASA
 * Sanitizzato per XSS protection
 */
import { NASA } from '../core/nasaApi.js';
import { escapeHtml, isValidUrl, limitLength } from '../utils/sanitize.js';

export class SpaceNews {
  constructor() { this.panel = null; this.isOpen = false; }
  toggle() { this.isOpen ? this.hide() : this.show(); }
  show() {
    if (this.panel) return;
    this._build();
    this._load();
    this.isOpen = true;
  }
  hide() {
    if (!this.panel) return;
    this.panel.style.opacity = '0';
    setTimeout(() => { this.panel?.remove(); this.panel = null; }, 220);
    this.isOpen = false;
  }
  _build() {
    this.panel = document.createElement('div');
    this.panel.id = 'spaceNewsPanel';
    Object.assign(this.panel.style, {
      position: 'fixed', top: '60px', left: '20px',
      width: 'min(360px, 92vw)', maxHeight: '75vh',
      background: 'rgba(8, 10, 20, 0.95)', backdropFilter: 'blur(20px)',
      border: '1px solid rgba(91,196,207,0.25)', borderRadius: '18px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.6)', color: '#e4eaf8',
      zIndex: '9950', overflow: 'hidden', display: 'flex', flexDirection: 'column',
      opacity: '0', transition: 'opacity 0.25s ease',
    });
    this.panel.innerHTML = `<div style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;">
      <h2 style="margin:0;font-size:1.05rem;font-weight:800;color:#5bc4cf;">Space News</h2>
      <button id="snClose" style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.16);color:rgba(228,234,248,0.7);width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:12px;">X</button>
    </div>
    <div id="snBody" style="flex:1;overflow-y:auto;padding:14px 18px;">
      <div style="text-align:center;padding:30px 0;opacity:0.5;">Caricamento dalla NASA...</div>
    </div>`;
    document.body.appendChild(this.panel);
    this.panel.querySelector('#snClose').onclick = () => this.hide();
  }
  async _load() {
    const body = this.panel.querySelector('#snBody');
    try {
      const [apod, neo] = await Promise.all([
        NASA.apod().catch(() => null),
        NASA.neo().catch(() => null),
      ]);
      const neos = NASA.formatNeo(neo);
      // Sanitizza tutti i dati NASA prima dell'iniezione HTML
      const safeTitle = escapeHtml(limitLength(apod?.title || '', 200));
      const safeExplanation = escapeHtml(limitLength((apod?.explanation || '').slice(0, 220), 250));
      const safeImageUrl = (apod?.media_type === 'image' && isValidUrl(apod.url)) ? escapeHtml(apod.url) : '';

      let html = '';
      if (apod) {
        html += `<div style="margin-bottom:18px;">
          <div style="font-size:10.5px;color:rgba(228,234,248,0.5);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;">NASA APOD</div>
          ${safeImageUrl ? `<img src="${safeImageUrl}" alt="${safeTitle}" style="width:100%;border-radius:10px;margin-bottom:8px;" loading="lazy" referrerpolicy="no-referrer" />` : ''}
          <div style="font-size:13.5px;font-weight:700;color:#5bc4cf;margin-bottom:4px;">${safeTitle}</div>
          <div style="font-size:11.5px;color:rgba(228,234,248,0.6);line-height:1.5;">${safeExplanation}...</div>
        </div>`;
      }
      if (neos.length) {
        html += `<div>
          <div style="font-size:10.5px;color:rgba(228,234,248,0.5);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px;">Near Earth Objects oggi</div>
          ${neos.map(n => {
            const safeName = escapeHtml(limitLength(n.name, 100));
            return `<div style="padding:9px 10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:9px;margin-bottom:6px;font-size:11.5px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
              <span style="font-weight:700;color:#e4eaf8;">${safeName}</span>
              ${n.hazardous ? '<span style="color:#ff6b6b;font-size:10px;">HAZARDOUS</span>' : ''}
            </div>
            <div style="display:flex;gap:10px;opacity:0.7;font-size:10.5px;">
              <span>${escapeHtml(n.diameter)}</span><span>${escapeHtml(n.velocity)}</span><span>${escapeHtml(n.miss)}</span>
            </div>
          </div>`;
          }).join('')}
        </div>`;
      }
      if (!html) html = '<div style="text-align:center;padding:30px 0;opacity:0.5;">Impossibile caricare i dati NASA</div>';
      body.innerHTML = html;
    } catch (e) {
      console.error('SpaceNews load error:', e);
      body.innerHTML = '<div style="text-align:center;padding:30px 0;opacity:0.5;">Errore di caricamento</div>';
    }
  }
}
