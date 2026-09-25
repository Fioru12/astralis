/**
 * Comparison Mode - Confronta 2 pianeti side-by-side
 */
import { getLang, t } from '../i18n/index.js';
import { escapeHtml } from '../utils/sanitize.js';
import { trapFocus } from '../utils/focusTrap.js';
import { getBodyLabel } from '../data/celestialData.js';

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
    this.lastFocused = document.activeElement;
    this._build();
    this.isOpen = true;
  }

  hide() {
    if (!this.panel) return;
    this.panel.style.opacity = '0';
    setTimeout(() => {
      this.panel?.remove();
      this.panel = null;
      this.lastFocused?.focus?.();
      this.lastFocused = null;
    }, 220);
    this.isOpen = false;
  }

  _build() {
    this.panel = document.createElement('div');
    this.panel.id = 'comparisonPanel';
    this.panel.setAttribute('role', 'dialog');
    this.panel.setAttribute('aria-modal', 'true');
    this.panel.setAttribute('aria-labelledby', 'comparisonTitle');
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
        <h2 id="comparisonTitle" style="margin:0;font-size:1.2rem;font-weight:800;color:#5bc4cf;">${escapeHtml(
          t('comparison_title') || 'Confronta Pianeti'
        )}</h2>
        <button id="cmpClose" style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.16);color:rgba(228,234,248,0.7);width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:14px;">✕</button>
      </div>
      <div style="flex:1;overflow-y:auto;padding:20px;">
        <div class="comparison-selectors" style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
          <div>
            <label style="display:block;font-size:12px;color:rgba(228,234,248,0.6);margin-bottom:6px;">${
              t('comparison_body1') || 'Pianeta 1'
            }</label>
            <select id="cmpBody1" style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#e4eaf8;font-size:14px;">
              <option value="">${escapeHtml(t('comparison_select'))}</option>
            </select>
          </div>
          <div>
            <label style="display:block;font-size:12px;color:rgba(228,234,248,0.6);margin-bottom:6px;">${
              t('comparison_body2') || 'Pianeta 2'
            }</label>
            <select id="cmpBody2" style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#e4eaf8;font-size:14px;">
              <option value="">${escapeHtml(t('comparison_select'))}</option>
            </select>
          </div>
        </div>
        <div id="cmpResult" style="min-height:300px;"></div>
      </div>
    `;

    document.body.appendChild(this.panel);
    this.panel.querySelector('#cmpClose')?.focus();
    requestAnimationFrame(() => {
      this.panel.style.opacity = '1';
    });

    this.panel.querySelector('#cmpClose').onclick = () => this.hide();
    this.panel.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') this.hide();
      else trapFocus(this.panel, event);
    });

    // Popola select con pianeti
    const bodies = this.allBodies;
    const planets = bodies.filter((b) => b.type === 'planet' || b.type === 'dwarf');
    const select1 = this.panel.querySelector('#cmpBody1');
    const select2 = this.panel.querySelector('#cmpBody2');

    const lang = getLang();
    planets.forEach((p) => {
      const opt1 = document.createElement('option');
      opt1.value = p.key;
      opt1.textContent = getBodyLabel(p, lang);
      select1.appendChild(opt1);

      const opt2 = document.createElement('option');
      opt2.value = p.key;
      opt2.textContent = getBodyLabel(p, lang);
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
      result.innerHTML = `<div style="text-align:center;padding:40px;opacity:0.5;">${escapeHtml(
        t('comparison_empty')
      )}</div>`;
      return;
    }

    const bodies = this.allBodies;
    const body1 = bodies.find((b) => b.key === key1);
    const body2 = bodies.find((b) => b.key === key2);

    if (!body1 || !body2) {
      result.innerHTML = `<div style="text-align:center;padding:40px;opacity:0.5;">${escapeHtml(
        t('comparison_not_found')
      )}</div>`;
      return;
    }
    if (body1.key === body2.key) {
      result.innerHTML = `<div style="text-align:center;padding:40px;opacity:0.65;">${escapeHtml(
        t('comparison_same')
      )}</div>`;
      return;
    }

    const finite = (value) => Number.isFinite(value);
    const lang = getLang();
    const locale = lang === 'it' ? 'it-IT' : 'en-US';
    const metrics = [
      {
        label: t('metric_radius'),
        key: 'radiusKm',
        unit: 'km',
        format: (v) => (finite(v) ? v.toLocaleString(locale, { maximumFractionDigits: 1 }) : 'N/D'),
      },
      {
        label: t('metric_distance'),
        key: 'semiMajorAxisAU',
        unit: 'AU',
        format: (v) => (finite(v) ? v.toLocaleString(locale, { maximumFractionDigits: 3 }) : 'N/D'),
      },
      {
        label: t('metric_period'),
        key: 'orbitalPeriodDays',
        unit: '',
        format: (v) =>
          finite(v)
            ? `${(v / 365.25).toLocaleString(locale, { maximumFractionDigits: 2 })} ${
                Math.abs(v / 365.25 - 1) < 0.005 ? t('unit_year_one') : t('unit_year_other')
              }`
            : 'N/D',
      },
      {
        label: t('metric_tilt'),
        key: 'tilt',
        unit: '°',
        format: (v) => (finite(v) ? v.toLocaleString(locale, { maximumFractionDigits: 1 }) : 'N/D'),
      },
      {
        label: t('metric_eccentricity'),
        key: 'eccentricity',
        unit: '',
        format: (v) => (finite(v) ? v.toLocaleString(locale, { maximumFractionDigits: 4 }) : 'N/D'),
      },
    ];

    const name1 = getBodyLabel(body1, lang);
    const name2 = getBodyLabel(body2, lang);
    let html = `
      <div class="comparison-cards" style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
        <div style="text-align:center;padding:20px;background:rgba(91,196,207,0.1);border:1px solid rgba(91,196,207,0.3);border-radius:12px;">
          <div style="font-size:48px;margin-bottom:8px;">${escapeHtml(body1.icon || '🪐')}</div>
          <div style="font-size:20px;font-weight:700;color:#5bc4cf;">${escapeHtml(name1)}</div>
        </div>
        <div style="text-align:center;padding:20px;background:rgba(167,139,250,0.1);border:1px solid rgba(167,139,250,0.3);border-radius:12px;">
          <div style="font-size:48px;margin-bottom:8px;">${escapeHtml(body2.icon || '🪐')}</div>
          <div style="font-size:20px;font-weight:700;color:#a78bfa;">${escapeHtml(name2)}</div>
        </div>
      </div>
      <div class="comparison-table-wrap"><table style="width:100%;border-collapse:collapse;min-width:620px;">
        <thead>
          <tr style="border-bottom:2px solid rgba(255,255,255,0.1);">
            <th style="padding:12px;text-align:left;font-size:12px;color:rgba(228,234,248,0.6);text-transform:uppercase;letter-spacing:1px;">${escapeHtml(
              t('comparison_metric')
            )}</th>
            <th style="padding:12px;text-align:right;font-size:12px;color:#5bc4cf;text-transform:uppercase;letter-spacing:1px;">${escapeHtml(
              name1
            )}</th>
            <th style="padding:12px;text-align:right;font-size:12px;color:#a78bfa;text-transform:uppercase;letter-spacing:1px;">${escapeHtml(
              name2
            )}</th>
            <th style="padding:12px;text-align:right;font-size:12px;color:rgba(228,234,248,0.6);text-transform:uppercase;letter-spacing:1px;">Δ vs ${escapeHtml(
              name2
            )}</th>
          </tr>
        </thead>
        <tbody>
    `;

    metrics.forEach((m) => {
      const v1 = body1[m.key];
      const v2 = body2[m.key];
      const hasDifference = finite(v1) && finite(v2) && v2 !== 0;
      const diffValue = hasDifference ? ((v1 - v2) / v2) * 100 : null;
      const diff = diffValue === null ? 'N/D' : diffValue.toFixed(1);
      const diffColor =
        diffValue > 0 ? '#5bc4cf' : diffValue < 0 ? '#a78bfa' : 'rgba(228,234,248,0.6)';

      html += `
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
          <td style="padding:12px;font-size:13px;">${m.label}</td>
          <td style="padding:12px;text-align:right;font-size:13px;font-weight:600;">${m.format(
            v1
          )} ${m.unit}</td>
          <td style="padding:12px;text-align:right;font-size:13px;font-weight:600;">${m.format(
            v2
          )} ${m.unit}</td>
          <td style="padding:12px;text-align:right;font-size:12px;color:${diffColor};">${
        diffValue !== null ? (diffValue > 0 ? '+' : '') + diff + '%' : 'N/D'
      }</td>
        </tr>
      `;
    });

    html += `</tbody></table></div><p style="margin:12px 2px 0;font-size:11px;opacity:0.55;">${escapeHtml(
      t('cmp_footnote')
    )}</p>`;
    result.innerHTML = html;
  }
}
