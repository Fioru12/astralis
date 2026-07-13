/**
 * Comparison Mode - Confronta 2 pianeti side-by-side
 */
import { t } from '../i18n/index.js';
import { escapeHtml } from '../utils/sanitize.js';

export class ComparisonMode {
  constructor(allBodies) {
    this.panel = null;
    this.isOpen = false;
    this.body1 = null;
    this.body2 = null;
    this.allBodies = allBodies || [];
  }

  toggle() {
    this.isOpen ? this.hide() : this.show();
  }

  show() {
    if (this.panel) return;
    this._build();
    this.isOpen = true;
  }

  hide() {
    if (!this.panel) return;
    this.panel.style.opacity = '0';
    setTimeout(() => {
      this.panel?.remove();
      this.panel = null;
    }, 220);
    this.isOpen = false;
  }

  _build() {
    this.panel = document.createElement('div');
    this.panel.id = 'comparisonPanel';
    Object.assign(this.panel.style, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 'min(900px, 95vw)',
      maxHeight: '85vh',
      background: 'rgba(8, 10, 20, 0.97)',
      backdropFilter: 'blur(24px)',
      border: '1px solid rgba(91,196,207,0.3)',
      borderRadius: '20px',
      boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
      color: '#e4eaf8',
      zIndex: '9990',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '"Space Grotesk", system-ui, sans-serif',
      opacity: '0',
      transition: 'opacity 0.25s ease',
    });

    this.panel.innerHTML = `
      <div style="padding:18px 22px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;">
        <h2 style="margin:0;font-size:1.2rem;font-weight:800;color:#5bc4cf;">${escapeHtml(t('comparison_title') || 'Confronta Pianeti')}</h2>
        <button id="cmpClose" style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.16);color:rgba(228,234,248,0.7);width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:14px;">✕</button>
      </div>
      <div style="flex:1;overflow-y:auto;padding:20px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
          <div>
            <label style="display:block;font-size:12px;color:rgba(228,234,248,0.6);margin-bottom:6px;">${t('comparison_body1') || 'Pianeta 1'}</label>
            <select id="cmpBody1" style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#e4eaf8;font-size:14px;">
              <option value="">-- Seleziona --</option>
            </select>
          </div>
          <div>
            <label style="display:block;font-size:12px;color:rgba(228,234,248,0.6);margin-bottom:6px;">${t('comparison_body2') || 'Pianeta 2'}</label>
            <select id="cmpBody2" style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#e4eaf8;font-size:14px;">
              <option value="">-- Seleziona --</option>
            </select>
          </div>
        </div>
        <div id="cmpResult" style="min-height:300px;"></div>
      </div>
    `;

    document.body.appendChild(this.panel);
    requestAnimationFrame(() => {
      this.panel.style.opacity = '1';
    });

    this.panel.querySelector('#cmpClose').onclick = () => this.hide();

    // Popola select con pianeti
    const bodies = this.allBodies;
    const planets = bodies.filter(b => b.type === 'planet' || b.type === 'dwarf');
    const select1 = this.panel.querySelector('#cmpBody1');
    const select2 = this.panel.querySelector('#cmpBody2');

    planets.forEach(p => {
      const opt1 = document.createElement('option');
      opt1.value = p.key;
      opt1.textContent = p.label;
      select1.appendChild(opt1);

      const opt2 = document.createElement('option');
      opt2.value = p.key;
      opt2.textContent = p.label;
      select2.appendChild(opt2);
    });

    select1.onchange = () => this._update();
    select2.onchange = () => this._update();
  }

  _update() {
    const key1 = this.panel.querySelector('#cmpBody1').value;
    const key2 = this.panel.querySelector('#cmpBody2').value;
    const result = this.panel.querySelector('#cmpResult');

    if (!key1 || !key2) {
      result.innerHTML = '<div style="text-align:center;padding:40px;opacity:0.5;">Seleziona due pianeti per confrontarli</div>';
      return;
    }

    const bodies = this.allBodies;
    const body1 = bodies.find(b => b.key === key1);
    const body2 = bodies.find(b => b.key === key2);

    if (!body1 || !body2) {
      result.innerHTML = '<div style="text-align:center;padding:40px;opacity:0.5;">Pianeti non trovati</div>';
      return;
    }

    const metrics = [
      { label: 'Raggio', key: 'radius', unit: 'km', format: v => v?.toLocaleString() || 'N/A' },
      { label: 'Distanza dal Sole', key: 'dist', unit: 'AU', format: v => v?.toFixed(2) || 'N/A' },
      { label: 'Periodo orbitale', key: 'period', unit: 'anni', format: v => v ? (v / 365.25).toFixed(2) : 'N/A' },
      { label: 'Inclinazione assiale', key: 'tilt', unit: '°', format: v => v?.toFixed(1) || 'N/A' },
      { label: 'Eccentricità', key: 'ecc', unit: '', format: v => v?.toFixed(3) || 'N/A' },
    ];

    let html = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
        <div style="text-align:center;padding:20px;background:rgba(91,196,207,0.1);border:1px solid rgba(91,196,207,0.3);border-radius:12px;">
          <div style="font-size:48px;margin-bottom:8px;">${escapeHtml(body1.icon || '🪐')}</div>
          <div style="font-size:20px;font-weight:700;color:#5bc4cf;">${escapeHtml(body1.label)}</div>
        </div>
        <div style="text-align:center;padding:20px;background:rgba(167,139,250,0.1);border:1px solid rgba(167,139,250,0.3);border-radius:12px;">
          <div style="font-size:48px;margin-bottom:8px;">${escapeHtml(body2.icon || '🪐')}</div>
          <div style="font-size:20px;font-weight:700;color:#a78bfa;">${escapeHtml(body2.label)}</div>
        </div>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="border-bottom:2px solid rgba(255,255,255,0.1);">
            <th style="padding:12px;text-align:left;font-size:12px;color:rgba(228,234,248,0.6);text-transform:uppercase;letter-spacing:1px;">Metrica</th>
            <th style="padding:12px;text-align:right;font-size:12px;color:#5bc4cf;text-transform:uppercase;letter-spacing:1px;">${body1.label}</th>
            <th style="padding:12px;text-align:right;font-size:12px;color:#a78bfa;text-transform:uppercase;letter-spacing:1px;">${body2.label}</th>
            <th style="padding:12px;text-align:right;font-size:12px;color:rgba(228,234,248,0.6);text-transform:uppercase;letter-spacing:1px;">Differenza</th>
          </tr>
        </thead>
        <tbody>
    `;

    metrics.forEach(m => {
      const v1 = body1[m.key];
      const v2 = body2[m.key];
      const diff = v1 && v2 ? ((v1 - v2) / v2 * 100).toFixed(1) : 'N/A';
      const diffColor = diff > 0 ? '#4ade80' : diff < 0 ? '#f87171' : 'rgba(228,234,248,0.6)';

      html += `
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
          <td style="padding:12px;font-size:13px;">${m.label}</td>
          <td style="padding:12px;text-align:right;font-size:13px;font-weight:600;">${m.format(v1)} ${m.unit}</td>
          <td style="padding:12px;text-align:right;font-size:13px;font-weight:600;">${m.format(v2)} ${m.unit}</td>
          <td style="padding:12px;text-align:right;font-size:12px;color:${diffColor};">${diff !== 'N/A' ? (diff > 0 ? '+' : '') + diff + '%' : 'N/A'}</td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    result.innerHTML = html;
  }
}