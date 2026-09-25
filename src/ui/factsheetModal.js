/**
 * @file factsheetModal.js
 * @description Generates and exports detailed scientific factsheet cards for celestial bodies.
 */

import { escapeHtml } from '../utils/sanitize.js';
import { getLang, t } from '../i18n/index.js';
import { PHYSICAL_DATA, getBodyLabel, getBodyDesc } from '../data/celestialData.js';

export function openFactsheetModal(body) {
  let modal = document.getElementById('factsheetModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'factsheetModal';
    modal.className = 'factsheet-overlay';
    document.body.appendChild(modal);
  }

  const pData = PHYSICAL_DATA[body.key] || {};
  const lang = getLang() === 'it' ? 'it' : 'en';

  const formatMass = (m) =>
    m ? `${m.toLocaleString(lang === 'it' ? 'it-IT' : 'en-US')} × 10²⁴ kg` : '--';
  const formatRadius = (r) =>
    r ? `${r.toLocaleString(lang === 'it' ? 'it-IT' : 'en-US')} km` : '--';
  const formatGravity = (g) => (g ? `${g.toFixed(2)} m/s² (${(g / 9.81).toFixed(2)}g)` : '--');
  const formatTemp = (temp) => (temp ? `${temp} °C` : '--');

  const title = `${body.icon || '🪐'} ${getBodyLabel(body, lang)}`;
  const typeText =
    {
      planet: t('type_planet'),
      dwarf: t('type_dwarf'),
      moon: t('type_moon'),
      comet: t('type_comet'),
      asteroid: t('type_asteroid'),
      exoplanet: t('type_exoplanet'),
      star: t('type_star'),
    }[body.type] || body.type;

  modal.innerHTML = `
    <div class="factsheet-card" role="dialog" aria-modal="true">
      <div class="factsheet-header">
        <div class="factsheet-badge">🪐 ASTRALIS SCIENTIFIC FACTSHEET</div>
        <button class="factsheet-close" id="factsheetCloseBtn" aria-label="${escapeHtml(
          t('close')
        )}">✕</button>
      </div>

      <div class="factsheet-title-section">
        <h2 class="factsheet-title">${escapeHtml(title)}</h2>
        <span class="factsheet-subtitle">${escapeHtml(typeText)} • ${escapeHtml(body.key)}</span>
      </div>

      <div class="factsheet-grid">
        <div class="factsheet-stat-box">
          <span class="factsheet-stat-label">${escapeHtml(t('fs_radius'))}</span>
          <strong class="factsheet-stat-val">${escapeHtml(formatRadius(pData.radius))}</strong>
        </div>
        <div class="factsheet-stat-box">
          <span class="factsheet-stat-label">${escapeHtml(t('fs_mass'))}</span>
          <strong class="factsheet-stat-val">${escapeHtml(formatMass(pData.mass))}</strong>
        </div>
        <div class="factsheet-stat-box">
          <span class="factsheet-stat-label">${escapeHtml(t('fs_gravity'))}</span>
          <strong class="factsheet-stat-val">${escapeHtml(formatGravity(pData.gravity))}</strong>
        </div>
        <div class="factsheet-stat-box">
          <span class="factsheet-stat-label">${escapeHtml(t('fs_temp'))}</span>
          <strong class="factsheet-stat-val">${escapeHtml(formatTemp(pData.temp))}</strong>
        </div>
        <div class="factsheet-stat-box">
          <span class="factsheet-stat-label">${escapeHtml(t('fs_sun_dist'))}</span>
          <strong class="factsheet-stat-val">${escapeHtml(
            body.distAU ? `${body.distAU} AU` : '--'
          )}</strong>
        </div>
        <div class="factsheet-stat-box">
          <span class="factsheet-stat-label">${escapeHtml(t('fs_moons'))}</span>
          <strong class="factsheet-stat-val">${escapeHtml(String(body.moons || 0))}</strong>
        </div>
        <div class="factsheet-stat-box">
          <span class="factsheet-stat-label">${escapeHtml(t('fs_day'))}</span>
          <strong class="factsheet-stat-val">${escapeHtml(
            body.day ? `${Math.abs(body.day).toFixed(1)} h` : '--'
          )}</strong>
        </div>
        <div class="factsheet-stat-box">
          <span class="factsheet-stat-label">${escapeHtml(t('fs_tilt'))}</span>
          <strong class="factsheet-stat-val">${escapeHtml(
            body.tilt !== undefined ? `${body.tilt.toFixed(1)}°` : '--'
          )}</strong>
        </div>
      </div>

      <div class="factsheet-desc-box">
        <h3>${escapeHtml(t('fs_desc_title'))}</h3>
        <p>${escapeHtml(getBodyDesc(body, lang) || pData.desc || t('factsheet_no_desc'))}</p>
      </div>

      <div class="factsheet-footer">
        <button class="factsheet-btn factsheet-print-btn" id="factsheetPrintBtn">${escapeHtml(
          t('fs_print')
        )}</button>
        <button class="factsheet-btn" id="factsheetOkBtn">${escapeHtml(t('close'))}</button>
      </div>
    </div>
  `;

  modal.style.display = 'flex';

  const close = () => {
    modal.style.display = 'none';
  };

  document.getElementById('factsheetCloseBtn')?.addEventListener('click', close);
  document.getElementById('factsheetOkBtn')?.addEventListener('click', close);
  document.getElementById('factsheetPrintBtn')?.addEventListener('click', () => {
    window.print();
  });
}
