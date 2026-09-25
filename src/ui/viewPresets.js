/**
 * View Presets - Viste rapide con un click (tasto V)
 */
import { t } from '../i18n/index.js';

const PRESETS = [
  { id: 'home', icon: '🏠', labelKey: 'preset_home', pos: [0, 30, 80], target: 'earth' },
  { id: 'system', icon: '🪐', labelKey: 'preset_system', pos: [0, 800, 1200], target: 'sun' },
  { id: 'inner', icon: '🔥', labelKey: 'preset_inner', pos: [0, 50, 150], target: 'mars' },
  { id: 'outer', icon: '🌑', labelKey: 'preset_outer', pos: [0, 500, 1500], target: 'neptune' },
  { id: 'belt', icon: '☄️', labelKey: 'preset_belt', pos: [0, 200, 600], target: 'belt' },
  { id: 'kuiper', icon: '❄️', labelKey: 'preset_kuiper', pos: [0, 800, 2400], target: 'pluto' },
  { id: 'galaxy', icon: '🌌', labelKey: 'preset_galaxy', pos: [0, 5000, 10000], target: 'galaxy' },
];

export class ViewPresets {
  constructor(opts = {}) {
    this.onSelect = opts.onSelect || (() => {});
    this.isOpen = false;
    this.panel = null;
  }

  toggle() {
    this.isOpen ? this.hide() : this.show();
  }

  show() {
    if (this.panel) return;
    this._build();
    requestAnimationFrame(() => {
      this.panel.style.opacity = '1';
      this.panel.style.transform = 'translateY(0)';
    });
    this.isOpen = true;
  }

  hide() {
    if (!this.panel) return;
    this.panel.style.opacity = '0';
    this.panel.style.transform = 'translateY(20px)';
    setTimeout(() => {
      this.panel?.remove();
      this.panel = null;
    }, 220);
    this.isOpen = false;
  }

  _build() {
    this.panel = document.createElement('div');
    this.panel.id = 'viewPresetsPanel';
    Object.assign(this.panel.style, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%) translateY(20px)',
      width: 'min(420px, 92vw)',
      padding: '22px',
      background: 'rgba(8, 10, 20, 0.96)',
      backdropFilter: 'blur(24px)',
      border: '1px solid rgba(91,196,207,0.25)',
      borderRadius: '18px',
      boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
      color: '#e4eaf8',
      zIndex: '9970',
      opacity: '0',
      transition: 'opacity 0.2s ease, transform 0.2s ease',
    });

    this.panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
        <h2 style="margin:0;font-size:1.1rem;font-weight:800;color:#5bc4cf;">${t(
          'preset_title'
        )}</h2>
        <button id="vpClose" style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.16);
          color:rgba(228,234,248,0.7);width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:12px;">✕</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;">
        ${PRESETS.map(
          (p) => `
          <button data-preset="${p.id}"
            style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 8px;
            background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);
            border-radius:12px;cursor:pointer;transition:all 0.2s;">
            <span style="font-size:24px;">${p.icon}</span>
            <span style="color:#e4eaf8;font-size:11.5px;font-weight:600;">${t(p.labelKey)}</span>
          </button>
        `
        ).join('')}
      </div>
    `;

    document.body.appendChild(this.panel);
    this.panel.querySelector('#vpClose').addEventListener('click', () => this.hide());
    this.panel.querySelectorAll('[data-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const p = PRESETS.find((x) => x.id === btn.dataset.preset);
        if (p?.id === 'galaxy' && typeof window.openGalaxyModal === 'function') {
          window.openGalaxyModal();
        } else {
          this.onSelect(p);
        }
        this.hide();
      });
    });
  }
}
