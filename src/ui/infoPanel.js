import { AU } from '../utils/constants.js';
import { escapeHtml } from '../utils/sanitize.js';
import { travelCalc } from './travelCalc.js';
import { STELLAR_DATA } from '../data/stellarData.js';
import {
  getBodyLabel,
  getBodyDesc,
  getBodyPeriod,
  getBodyDiscovery,
} from '../data/celestialData.js';
import { drawBlackbodyCurve, stellarInfoRows } from './starSpectrum.js';
import { getLang, t } from '../i18n/index.js';

export function setupInfoPanel(ui) {
  if (ui.infoClose) {
    ui.infoClose.onclick = () => {
      if (ui.infoPanel) ui.infoPanel.classList.remove('visible');
    };
  }
}

export function showInfo(ui, body, zoomToBody, enterFollow, selectBodyFn = null, allBodies = []) {
  if (!ui.infoPanel) return;
  const lang = getLang();
  if (ui.infoName) ui.infoName.textContent = (body.icon || '') + ' ' + getBodyLabel(body, lang);

  // Pannello "star facts" con spettro di corpo nero per le stelle note
  const stellar = body.type === 'star' ? STELLAR_DATA[body.key] : null;
  if (stellar) {
    renderStarPanel(ui, body, stellar, zoomToBody, enterFollow, selectBodyFn, allBodies);
    return;
  }

  const typeLabel =
    {
      planet: t('type_planet'),
      dwarf: t('type_dwarf'),
      moon: t('type_moon'),
      comet: t('type_comet'),
      asteroid: t('type_asteroid'),
      exoplanet: t('type_exoplanet'),
    }[body.type] || body.type;
  const localizedValue = (value) => {
    const key = {
      Sconosciuta: 'value_unknown',
      Confermato: 'value_confirmed',
      Candidato: 'value_candidate',
      'Troppo caldo': 'value_too_hot',
      'Troppo freddo': 'value_too_cold',
      'Potenzialmente abitabile': 'value_potentially_habitable',
      'Abitabilità non determinata': 'value_habitability_unknown',
      'Temperato, abitabilità non determinata': 'value_temperate_unknown',
    }[value];
    return key ? t(key) : value;
  };

  let rows = `<div class="info-row"><span>${escapeHtml(t('info_type'))}</span><strong>${escapeHtml(
    typeLabel
  )}</strong></div>`;

  let currentDist = '--';
  if ((body.type === 'star' || body.type === 'exoplanet') && body.distLY) {
    currentDist = `${body.distLY} ${getLang() === 'it' ? 'anni luce' : 'light-years'}`;
  } else if (body.pivot) {
    const d = body.pivot.position.length() / AU;
    currentDist = d < 0.01 ? '\u2605' : d.toFixed(3) + ' AU';
  }

  if (body.type === 'comet') {
    rows += `<div class="info-row"><span>${escapeHtml(t('info_period'))}</span><strong>${escapeHtml(
      String(getBodyPeriod(body, lang) ?? '')
    )}</strong></div>`;
    rows += `<div class="info-row"><span>${escapeHtml(
      t('info_perihelion')
    )}</span><strong>${escapeHtml(String(body.perielio))}</strong></div>`;
    rows += `<div class="info-row"><span>${escapeHtml(
      t('info_discovery')
    )}</span><strong>${escapeHtml(String(getBodyDiscovery(body, lang) ?? ''))}</strong></div>`;
    rows += `<div class="info-row"><span>${escapeHtml(t('info_eccentricity'))}</span><strong>${
      body.e ? escapeHtml(body.e.toFixed(4)) : '--'
    }</strong></div>`;
    rows += `<div class="info-row"><span>${escapeHtml(
      t('info_current_distance')
    )}</span><strong>${escapeHtml(currentDist)}</strong></div>`;
  } else {
    if (body.distAU) {
      const distanceLabel =
        body.type === 'exoplanet' ? t('info_host_distance') : t('info_mean_distance');
      const distanceValue = typeof body.distAU === 'number' ? `${body.distAU} AU` : body.distAU;
      rows += `<div class="info-row"><span>${distanceLabel}</span><strong>${escapeHtml(
        String(distanceValue)
      )}</strong></div>`;
    }
    const currentDistanceLabel =
      body.type === 'exoplanet' ? t('info_earth_distance') : t('info_current_distance');
    rows += `<div class="info-row"><span>${currentDistanceLabel}</span><strong>${escapeHtml(
      currentDist
    )}</strong></div>`;
    if (getBodyPeriod(body, lang) || body.periodDays) {
      const periodValue = body.periodDays
        ? `${body.periodDays.toLocaleString(lang === 'it' ? 'it-IT' : 'en-US', {
            maximumFractionDigits: 3,
          })} ${t('unit_days')}`
        : String(getBodyPeriod(body, lang));
      rows += `<div class="info-row"><span>${escapeHtml(
        t('info_orbital_period')
      )}</span><strong>${escapeHtml(periodValue)}</strong></div>`;
    }
    if (body.type !== 'asteroid')
      rows += `<div class="info-row"><span>${escapeHtml(t('info_moons'))}</span><strong>${
        body.moons || 0
      }</strong></div>`;
    if (body.day)
      rows += `<div class="info-row"><span>${escapeHtml(
        t('info_day_length')
      )}</span><strong>${escapeHtml(String(Math.abs(body.day).toFixed(1)))} h${
        body.day < 0 ? ` <em>(${escapeHtml(t('info_retrograde'))})</em>` : ''
      }</strong></div>`;
    if (body.tilt)
      rows += `<div class="info-row"><span>${escapeHtml(
        t('info_axial_tilt')
      )}</span><strong>${escapeHtml(body.tilt.toFixed(1))}°</strong></div>`;

    if (body.type === 'exoplanet') {
      if (body.mass)
        rows += `<div class="info-row"><span>${escapeHtml(
          t('info_mass')
        )}</span><strong>${escapeHtml(String(body.mass))}</strong></div>`;
      if (body.temp)
        rows += `<div class="info-row"><span>${escapeHtml(
          t('info_temperature')
        )}</span><strong>${escapeHtml(String(body.temp))}</strong></div>`;
      if (body.atmosphere)
        rows += `<div class="info-row"><span>${escapeHtml(
          t('info_atmosphere')
        )}</span><strong>${escapeHtml(String(localizedValue(body.atmosphere)))}</strong></div>`;
      if (body.habitability)
        rows += `<div class="info-row"><span>${escapeHtml(
          t('info_habitability')
        )}</span><strong>${escapeHtml(String(localizedValue(body.habitability)))}</strong></div>`;
      if (body.status)
        rows += `<div class="info-row"><span>${escapeHtml(
          t('info_status')
        )}</span><strong>${escapeHtml(String(localizedValue(body.status)))}</strong></div>`;
      if (body.source)
        rows += `<div class="info-row"><span>${escapeHtml(
          t('info_source')
        )}</span><strong>${escapeHtml(String(body.source))}</strong></div>`;
    }
  }
  const isHabitable =
    (body.type === 'planet' || body.type === 'exoplanet') &&
    (body.key === 'Earth' ||
      (body.distAU >= 0.95 && body.distAU <= 1.68 && (body.parent === 'Sun' || !body.parent)) ||
      (body.habitability && body.habitability.toLowerCase().includes('abitabile')));

  if (isHabitable) {
    rows += `<div style="margin:8px 0;padding:6px 12px;background:rgba(80,250,123,0.15);border:1px solid rgba(80,250,123,0.4);border-radius:8px;color:#50fa7b;font-size:12px;display:inline-flex;align-items:center;gap:6px;">🌿 <strong>${escapeHtml(
      t('info_goldilocks') || 'Zona Abitabile (Goldilocks Zone)'
    )}</strong></div>`;
  }

  rows += `<p class="info-desc">${escapeHtml(getBodyDesc(body, lang) || '')}</p>`;
  // Viaggio interstellare disponibile per stelle ed esopianeti (distanza nota)
  const canTravel =
    (body.type === 'star' || body.type === 'exoplanet') && (body.distLY || body.distAU);

  rows += `<div class="info-actions">`;
  rows += `<button class="zoom-btn" id="zoomBtn">${escapeHtml(t('info_approach'))}</button>`;
  rows += `<button class="follow-btn" id="followBtn">${escapeHtml(t('info_follow'))}</button>`;
  rows += `<button class="factsheet-btn" id="factsheetBtn">${escapeHtml(
    t('info_factsheet')
  )}</button>`;
  if (canTravel)
    rows += `<button class="travel-btn" id="travelBtn">${escapeHtml(t('info_travel'))}</button>`;
  rows += `</div>`;

  if (ui.infoBody) ui.infoBody.innerHTML = rows;
  ui.infoPanel.classList.add('visible');

  const zBtn = document.getElementById('zoomBtn');
  if (zBtn)
    zBtn.onclick = () => {
      zoomToBody(body, 1000);
    };
  const fBtn = document.getElementById('followBtn');
  if (fBtn) fBtn.onclick = () => enterFollow(body);
  const tBtn = document.getElementById('travelBtn');
  if (tBtn) tBtn.onclick = () => travelCalc.open(body);
  const fsBtn = document.getElementById('factsheetBtn');
  if (fsBtn) {
    fsBtn.onclick = async () => {
      const { openFactsheetModal } = await import('./factsheetModal.js');
      openFactsheetModal(body);
    };
  }
}

function renderStarPanel(
  ui,
  body,
  s,
  zoomToBody,
  enterFollow,
  selectBodyFn = null,
  allBodies = []
) {
  const lang = getLang();
  const wikiUrl = 'https://en.wikipedia.org/wiki/' + encodeURIComponent(s.wiki);
  let html = '';
  html += `<canvas id="starSpectrum" class="star-spectrum" width="292" height="94"></canvas>`;
  html += `<label class="star-visible"><input type="checkbox" id="showVisibleChk" checked> ${escapeHtml(
    t('info_show_visible')
  )}</label>`;
  html += `<div class="star-hr"></div>`;
  html += stellarInfoRows(s);

  // Find exoplanets orbiting this star
  const exoplanets = (allBodies || []).filter(
    (b) =>
      (b.type === 'exoplanet' || b.type === 'planet') &&
      (b.parent === body.key || b.hostLabel === body.label || b.parent === body.label)
  );

  if (exoplanets.length > 0) {
    html += `<div style="margin:10px 0;padding:10px;background:rgba(91,196,207,0.12);border-radius:10px;border:1px solid rgba(91,196,207,0.3);">
      <span style="font-size:11px;font-weight:700;color:#5bc4cf;display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">🪐 ${escapeHtml(
        t('info_system_planets')
      )} (${exoplanets.length})</span>
      <div style="display:flex;flex-wrap:wrap;gap:6px;">
        ${exoplanets
          .map(
            (p) =>
              `<button class="exo-chip-btn" data-exokey="${escapeHtml(
                p.key
              )}" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);color:#e4eaf8;padding:4px 9px;border-radius:12px;font-size:11.5px;cursor:pointer;display:inline-flex;align-items:center;gap:4px;">${escapeHtml(
                p.icon || '🪐'
              )} ${escapeHtml(getBodyLabel(p, lang))}</button>`
          )
          .join('')}
      </div>
    </div>`;
  }

  html += `<p class="info-desc">${escapeHtml(getBodyDesc(body, lang) || '')}</p>`;
  html += `<div class="info-actions">`;
  html += `<button class="zoom-btn" id="zoomBtn">${escapeHtml(t('info_approach'))}</button>`;
  html += `<button class="follow-btn" id="followBtn">${escapeHtml(t('info_follow'))}</button>`;
  if (body.distLY)
    html += `<button class="travel-btn" id="travelBtn">${escapeHtml(t('info_travel'))}</button>`;
  html += `</div>`;
  html += `<a class="wiki-link" href="${escapeHtml(
    wikiUrl
  )}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('info_wiki_link'))}</a>`;

  if (ui.infoBody) ui.infoBody.innerHTML = html;
  ui.infoPanel.classList.add('visible');

  // Bind click handlers for exoplanets
  if (selectBodyFn && ui.infoBody) {
    ui.infoBody.querySelectorAll('.exo-chip-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-exokey');
        const targetBody = allBodies.find((b) => b.key === key);
        if (targetBody) selectBodyFn(targetBody);
      });
    });
  }

  const canvas = document.getElementById('starSpectrum');
  const chk = document.getElementById('showVisibleChk');
  const redraw = () => {
    if (canvas) drawBlackbodyCurve(canvas, s.t, chk ? chk.checked : true);
  };
  redraw();
  if (chk) chk.onchange = redraw;

  const zBtn = document.getElementById('zoomBtn');
  if (zBtn) zBtn.onclick = () => zoomToBody(body, 1000);
  const fBtn = document.getElementById('followBtn');
  if (fBtn) fBtn.onclick = () => enterFollow(body);
  const tBtn = document.getElementById('travelBtn');
  if (tBtn) tBtn.onclick = () => travelCalc.open(body);
}
