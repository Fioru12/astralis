import { AU } from '../utils/constants.js';
import { escapeHtml } from '../utils/sanitize.js';

export function setupInfoPanel(ui) {
  if (ui.infoClose) {
    ui.infoClose.onclick = () => {
      if (ui.infoPanel) ui.infoPanel.classList.remove('visible');
    };
  }
}

export function showInfo(ui, body, zoomToBody, enterFollow) {
  if (!ui.infoPanel) return;
  if (ui.infoName) ui.infoName.textContent = (body.icon || '') + ' ' + body.label;

  const typeLabel = {
    planet: 'Planet', dwarf: 'Dwarf Planet', moon: 'Moon',
    comet: 'Comet', asteroid: 'Asteroid',
  }[body.type] || body.type;

  let rows = `<div class="info-row"><span>Type</span><strong>${escapeHtml(typeLabel)}</strong></div>`;

  let currentDist = '--';
  if (body.pivot) {
    const d = body.pivot.position.length() / AU;
    currentDist = d < 0.01 ? '\u2605' : d.toFixed(3) + ' AU';
  }

  if (body.type === 'comet') {
    rows += `<div class="info-row"><span>Period</span><strong>${escapeHtml(String(body.period))}</strong></div>`;
    rows += `<div class="info-row"><span>Perihelion</span><strong>${escapeHtml(String(body.perielio))}</strong></div>`;
    rows += `<div class="info-row"><span>Discovery</span><strong>${escapeHtml(String(body.scoperta))}</strong></div>`;
    rows += `<div class="info-row"><span>Eccentricity</span><strong>${body.e ? escapeHtml(body.e.toFixed(4)) : '--'}</strong></div>`;
    rows += `<div class="info-row"><span>Current distance</span><strong>${escapeHtml(currentDist)}</strong></div>`;
  } else {
    if (body.distAU) rows += `<div class="info-row"><span>Avg distance</span><strong>${escapeHtml(String(body.distAU))}</strong></div>`;
    rows += `<div class="info-row"><span>Current distance</span><strong>${escapeHtml(currentDist)}</strong></div>`;
    if (body.period) rows += `<div class="info-row"><span>Orbital period</span><strong>${escapeHtml(String(body.period))}</strong></div>`;
    if (body.type !== 'asteroid') rows += `<div class="info-row"><span>Moons</span><strong>${body.moons || 0}</strong></div>`;
    if (body.day) rows += `<div class="info-row"><span>Day length</span><strong>${escapeHtml(String(Math.abs(body.day).toFixed(1)))}h${body.day < 0 ? ' <em>(retrograde)</em>' : ''}</strong></div>`;
    if (body.tilt) rows += `<div class="info-row"><span>Axial tilt</span><strong>${escapeHtml(body.tilt.toFixed(1))}°</strong></div>`;

    if (body.type === 'exoplanet') {
      if (body.mass) rows += `<div class="info-row"><span>Mass</span><strong>${escapeHtml(String(body.mass))}</strong></div>`;
      if (body.temp) rows += `<div class="info-row"><span>Temperature</span><strong>${escapeHtml(String(body.temp))}</strong></div>`;
      if (body.atmosphere) rows += `<div class="info-row"><span>Atmosphere</span><strong>${escapeHtml(String(body.atmosphere))}</strong></div>`;
      if (body.habitability) rows += `<div class="info-row"><span>Habitability</span><strong>${escapeHtml(String(body.habitability))}</strong></div>`;
    }
  }
  rows += `<p class="info-desc">${escapeHtml(body.desc || '')}</p>`;
  rows += `<div class="info-actions">`;
  rows += `<button class="zoom-btn" id="zoomBtn">Zoom</button>`;
  rows += `<button class="follow-btn" id="followBtn">Follow</button>`;
  rows += `</div>`;

  if (ui.infoBody) ui.infoBody.innerHTML = rows;
  ui.infoPanel.classList.add('visible');

  const zBtn = document.getElementById('zoomBtn');
  if (zBtn) zBtn.onclick = () => { zoomToBody(body, 1000); };
  const fBtn = document.getElementById('followBtn');
  if (fBtn) fBtn.onclick = () => enterFollow(body);
}
