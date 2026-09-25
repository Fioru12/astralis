/**
 * Time Travel - Slider temporale con eventi astronomici salienti
 */
import { t } from '../i18n/index.js';

const EVENTS = [
  { id: 'apollo11', date: '1969-07-20T20:17:00Z', icon: '🌙', labelKey: 'ev_apollo11' },
  { id: 'voyager1', date: '2012-08-25T00:00:00Z', icon: '🚀', labelKey: 'ev_voyager1' },
  { id: 'halley', date: '1986-02-09T00:00:00Z', icon: '☄️', labelKey: 'ev_halley' },
  { id: 'mars2020', date: '2020-10-13T00:00:00Z', icon: '🔴', labelKey: 'ev_mars_close' },
  { id: 'eclipse2017', date: '2017-08-21T18:26:00Z', icon: '🌑', labelKey: 'ev_eclipse2017' },
  { id: 'pluto', date: '2015-07-14T11:49:00Z', icon: '🪐', labelKey: 'ev_pluto' },
  { id: 'jupiter_imp', date: '1994-07-16T20:00:00Z', icon: '💥', labelKey: 'ev_jupiter_impact' },
  { id: 'equinox2025', date: '2025-03-20T09:01:00Z', icon: '🌸', labelKey: 'ev_equinox' },
];

export class TimeTravel {
  constructor(opts = {}) {
    this.onDateChange = opts.onDateChange || (() => {});
    this.isOpen = false;
    this.panel = null;
    this.animInterval = null;
  }

  toggle() {
    this.isOpen ? this.hide() : this.show();
  }

  show() {
    if (this.panel) return;
    this._build();
    requestAnimationFrame(() => {
      this.panel.style.opacity = '1';
      this.panel.style.transform = 'translateX(0)';
    });
    this.isOpen = true;
  }

  hide() {
    if (!this.panel) return;
    this.panel.style.opacity = '0';
    this.panel.style.transform = 'translateX(20px)';
    setTimeout(() => {
      this.panel?.remove();
      this.panel = null;
    }, 250);
    this.isOpen = false;
    this._stopAnim();
  }

  _build() {
    this.panel = document.createElement('div');
    this.panel.id = 'timeTravelPanel';
    this.panel.setAttribute('role', 'dialog');
    this.panel.setAttribute('aria-modal', 'true');
    this.panel.setAttribute('aria-labelledby', 'timeTravelTitle');
    Object.assign(this.panel.style, {
      position: 'fixed',
      bottom: '80px',
      right: '20px',
      width: 'min(360px, 92vw)',
      maxHeight: '70vh',
      padding: '18px',
      background: 'rgba(8, 10, 20, 0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(91,196,207,0.25)',
      borderRadius: '18px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(91,196,207,0.15)',
      color: '#e4eaf8',
      zIndex: '9980',
      overflowY: 'auto',
      opacity: '0',
      transform: 'translateX(20px)',
      transition: 'opacity 0.25s ease, transform 0.25s ease',
    });

    this.panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
        <h2 id="timeTravelTitle" style="margin:0;font-size:1.05rem;font-weight:800;color:#5bc4cf;">${t(
          'timetravel_title'
        )}</h2>
        <button id="ttClose" style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.16);
          color:rgba(228,234,248,0.7);width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:12px;">✕</button>
      </div>
      <div style="margin-bottom:14px;">
        <label style="display:block;font-size:11px;color:rgba(228,234,248,0.5);
          text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;">${t(
            'timetravel_pick'
          )}</label>
        <input id="ttDate" type="datetime-local" value="${new Date().toISOString().slice(0, 16)}"
          style="width:100%;padding:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);
          border-radius:8px;color:#e4eaf8;font-size:13px;font-family:inherit;" />
      </div>
      <div style="display:flex;gap:6px;margin-bottom:16px;">
        <button id="ttJump" style="flex:1;background:linear-gradient(135deg,#5bc4cf,#8be0ea);border:none;
          color:#000;padding:9px;border-radius:8px;cursor:pointer;font-size:12.5px;font-weight:700;">${t(
            'timetravel_jump'
          )}</button>
        <button id="ttAnim" style="flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.16);
          color:#e4eaf8;padding:9px;border-radius:8px;cursor:pointer;font-size:12.5px;font-weight:600;">${t(
            'timetravel_play'
          )}</button>
      </div>
      <div>
        <div style="font-size:11px;color:rgba(228,234,248,0.5);text-transform:uppercase;
          letter-spacing:0.8px;margin-bottom:8px;">${t('timetravel_events')}</div>
        ${EVENTS.map(
          (ev) => `
          <button data-tt-event="${ev.id}" data-tt-date="${ev.date}"
            style="width:100%;display:flex;align-items:center;gap:10px;padding:9px 10px;
            margin-bottom:5px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);
            border-radius:9px;cursor:pointer;text-align:left;transition:all 0.2s;">
            <span style="font-size:18px;">${ev.icon}</span>
            <div style="flex:1;min-width:0;">
              <div style="color:#e4eaf8;font-size:12.5px;font-weight:600;">${t(ev.labelKey)}</div>
              <div style="color:rgba(228,234,248,0.5);font-size:10.5px;">${new Date(
                ev.date
              ).toLocaleDateString()}</div>
            </div>
            <span style="color:rgba(228,234,248,0.3);font-size:11px;">→</span>
          </button>
        `
        ).join('')}
      </div>
    `;

    document.body.appendChild(this.panel);
    this.panel.querySelector('#ttClose').addEventListener('click', () => this.hide());
    this.panel.querySelector('#ttJump').addEventListener('click', () => {
      const v = this.panel.querySelector('#ttDate').value;
      if (v) this.onDateChange(new Date(v));
    });
    this.panel.querySelector('#ttAnim').addEventListener('click', () => this._toggleAnim());
    this.panel.querySelectorAll('[data-tt-event]').forEach((btn) => {
      btn.addEventListener('click', () => this.onDateChange(new Date(btn.dataset.ttDate)));
    });
  }

  _toggleAnim() {
    if (this.animInterval) {
      this._stopAnim();
      return;
    }
    const dateInput = this.panel.querySelector('#ttDate');
    let t = Date.now();
    this.animInterval = setInterval(() => {
      t += 86400000 * 7; // +7 giorni per tick
      const d = new Date(t);
      dateInput.value = d.toISOString().slice(0, 16);
      this.onDateChange(d);
    }, 100);
  }

  _stopAnim() {
    if (this.animInterval) {
      clearInterval(this.animInterval);
      this.animInterval = null;
    }
  }
}
