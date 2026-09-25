/**
 * @file travelCalc.js
 * @description Simulatore di Viaggio Spaziale Interplanetario & Interstellare per Astralis.
 * Permette di calcolare e simulare il tempo di viaggio tra due punti del cosmo (A → B)
 * utilizzando veicoli spaziali reali (Parker Solar Probe, Voyager 1, Apollo, Starship)
 * o futuristiche navi ad alta velocità.
 */

import { escapeHtml } from '../utils/sanitize.js';
import { soundManager } from '../core/soundManager.js';
import { toast } from './toast.js';
import { flightCockpit } from './flightCockpit.js';
import { getLang, t } from '../i18n/index.js';
import { getBodyLabel } from '../data/celestialData.js';

const L = (localized) =>
  typeof localized === 'string' ? localized : (localized?.[getLang()] ?? localized?.it);
const localeOf = () => (getLang() === 'it' ? 'it-IT' : 'en-US');

// Costanti astronomiche e fisiche SI
const C_KMH = 1079252848.8; // Velocità della luce in km/h (299,792.458 km/s * 3600)
const C_MS = 299792458; // m/s
const G0 = 9.80665; // m/s²
const LY_KM = 9460730472580.8; // km per anno luce
const AU_KM = 149597870.7; // km per AU
const YR_SEC = 31557600; // secondi per anno giuliano

/**
 * Profilo dei veicoli spaziali reali, sperimentali e futuristici
 */
export const SPACECRAFT_PROFILES = [
  {
    id: 'parker',
    name: { it: 'Parker Solar Probe', en: 'Parker Solar Probe' },
    category: 'real',
    icon: '☀️',
    speedKmh: 692000,
    desc: {
      it: 'La sonda più veloce costruita dall’uomo (692.000 km/h al perielio).',
      en: 'The fastest probe ever built (692,000 km/h at perihelion).',
    },
    tech: {
      it: 'Assistenza gravitazionale Venere + Scudo termico carbonio',
      en: 'Venus gravity assists + carbon heat shield',
    },
  },
  {
    id: 'voyager',
    name: { it: 'Voyager 1', en: 'Voyager 1' },
    category: 'real',
    icon: '📡',
    speedKmh: 61200,
    speedC: 61200 / C_KMH,
    desc: {
      it: 'Sonda interstellare in viaggio dal 1977 alla velocità di 61.200 km/h.',
      en: 'Interstellar probe traveling since 1977 at 61,200 km/h.',
    },
    tech: {
      it: 'Generatore Termoelettrico a Radioisotopi (RTG)',
      en: 'Radioisotope Thermoelectric Generator (RTG)',
    },
  },
  {
    id: 'starship',
    name: {
      it: 'SpaceX Starship (Trasferimento Hohmann)',
      en: 'SpaceX Starship (Hohmann transfer)',
    },
    category: 'real',
    icon: '🚀',
    speedKmh: 38000,
    desc: {
      it: 'Nave riutilizzabile per il trasporto umano verso la Luna e Marte.',
      en: 'Reusable ship for human transport to the Moon and Mars.',
    },
    tech: { it: 'Propulsori Raptor Methane/LOX', en: 'Raptor Methane/LOX engines' },
  },
  {
    id: 'apollo',
    name: { it: 'Apollo 11 (Saturn V)', en: 'Apollo 11 (Saturn V)' },
    category: 'real',
    icon: '🌙',
    speedKmh: 39000,
    desc: {
      it: 'La storica astronave della missione lunare NASA del 1969.',
      en: 'The historic spacecraft of NASA’s 1969 Moon mission.',
    },
    tech: {
      it: 'Propulsione chimica Kerosene RP-1 & Idrogeno Liquido',
      en: 'Chemical propulsion: RP-1 kerosene & liquid hydrogen',
    },
  },
  {
    id: 'ion',
    name: { it: 'Propulsione Ionica (NSTAR / Dawn)', en: 'Ion Propulsion (NSTAR / Dawn)' },
    category: 'tech',
    icon: '⚡',
    speedKmh: 150000,
    desc: {
      it: 'Motori elettrici a xeno ad accelerazione continua nel vuoto.',
      en: 'Electric xenon engines with continuous acceleration in vacuum.',
    },
    tech: {
      it: 'Accelerazione elettrostatica di ioni di Xeno',
      en: 'Electrostatic acceleration of xenon ions',
    },
  },
  {
    id: 'nuclear',
    name: { it: 'Propulsione Nucleare Termica (NTP)', en: 'Nuclear Thermal Propulsion (NTP)' },
    category: 'tech',
    icon: '⚛️',
    speedKmh: 300000,
    desc: {
      it: 'Reattori nucleari per raddoppiare l’efficienza di impulso specifico.',
      en: 'Nuclear reactors doubling specific-impulse efficiency.',
    },
    tech: {
      it: 'Reattore nucleare a fissione ad idrogeno caldo',
      en: 'Hot-hydrogen fission nuclear reactor',
    },
  },
  {
    id: 'starshot',
    name: {
      it: 'Breakthrough Starshot (Laser Sail 0.2c)',
      en: 'Breakthrough Starshot (Laser Sail 0.2c)',
    },
    category: 'future',
    icon: '✨',
    speedKmh: 0.2 * C_KMH,
    speedC: 0.2,
    desc: {
      it: 'Micro-sonde spintesi a 0,2c tramite gigawatt di laser da terra.',
      en: 'Micro-probes pushed to 0.2c by gigawatts of ground-based lasers.',
    },
    tech: {
      it: 'Vela solare nanometrica spinta da phased array laser',
      en: 'Nanometric solar sail pushed by laser phased array',
    },
  },
  {
    id: 'fusion',
    name: { it: 'Nave a Fusione Nucleare (0.05c)', en: 'Nuclear Fusion Ship (0.05c)' },
    category: 'future',
    icon: '💥',
    speedKmh: 0.05 * C_KMH,
    speedC: 0.05,
    desc: {
      it: 'Nave interstellare a fusione Deuterio-Elio3 a contenimento magnetico.',
      en: 'Interstellar Deuterium-Helium3 fusion ship with magnetic confinement.',
    },
    tech: {
      it: 'Propulsione a Fusione ad impulso magnetico',
      en: 'Magnetically pulsed fusion propulsion',
    },
  },
  {
    id: 'photon',
    name: { it: 'Nave a Fotoni / Antimateria (1.0 G)', en: 'Photon / Antimatter Ship (1.0 G)' },
    category: 'future',
    icon: '🔮',
    isRelativistic: true,
    accelG: 1.0,
    speedKmh: C_KMH,
    desc: {
      it: 'Accelerazione e decelerazione costante a 1.0g (gravità artificiale).',
      en: 'Constant 1.0 g acceleration and deceleration (artificial gravity).',
    },
    tech: {
      it: 'Annichilazione materia-antimateria e motore a fotoni',
      en: 'Matter-antimatter annihilation and photon engine',
    },
  },
];

/**
 * Calcola i tempi di viaggio relativistici per 1.0g (accelerazione + decelerazione)
 */
export function computeRelativisticTrip(distLy, aG = 1.0) {
  const a = aG * G0;
  const halfD = (distLy * LY_KM * 1000) / 2;
  const phi = Math.acosh((a * halfD) / (C_MS * C_MS) + 1);

  const vPeak = C_MS * Math.tanh(phi);
  const shipS = 2 * (C_MS / a) * phi;
  const earthS = 2 * (C_MS / a) * Math.sinh(phi);

  return {
    distLy,
    vPeakC: vPeak / C_MS,
    shipDays: (shipS / YR_SEC) * 365.25,
    earthDays: (earthS / YR_SEC) * 365.25,
    earthYears: earthS / YR_SEC,
  };
}

/**
 * Formatta la durata del viaggio nella lingua corrente
 */
export function formatDuration(totalDays) {
  const locale = localeOf();
  if (totalDays < 1) {
    const hours = Math.round(totalDays * 24);
    return `${hours} ${t('dur_hours')}`;
  }
  if (totalDays < 30) {
    const days = Math.floor(totalDays);
    const hours = Math.round((totalDays - days) * 24);
    return hours > 0
      ? `${days} ${t('dur_days')} ${t('dur_and')} ${hours} h`
      : `${days} ${t('dur_days')}`;
  }
  if (totalDays < 365) {
    const months = Math.floor(totalDays / 30.4375);
    const days = Math.round(totalDays % 30.4375);
    return days > 0
      ? `${months} ${t('dur_months')} ${t('dur_and')} ${days} ${t('dur_days_short')}`
      : `${months} ${t('dur_months')}`;
  }
  const years = totalDays / 365.25;
  if (years < 100) {
    const y = Math.floor(years);
    const m = Math.round((years - y) * 12);
    return m > 0
      ? `${y} ${t('dur_years')} ${t('dur_and')} ${m} ${t('dur_months')}`
      : `${y} ${t('dur_years')}`;
  }
  if (years < 10000) {
    return `${Math.round(years).toLocaleString(locale)} ${t('dur_years')}`;
  }
  const centuries = years / 100;
  return `${centuries.toLocaleString(locale, { maximumFractionDigits: 1 })} ${t(
    'dur_centuries'
  )} (${Math.round(years).toLocaleString(locale)} ${t('dur_years')})`;
}

export class TravelCalc {
  constructor() {
    this.panel = null;
    this.allBodies = [];
    this.selectBody = null;
    this.zoomToBody = null;
    this.onTravelExecute = null;

    this.originKey = 'Earth';
    this.targetKey = 'Mars';
    this.spacecraftId = 'parker';
    this.isOpen = false;
  }

  init(options = {}) {
    this.allBodies = options.allBodies || [];
    this.selectBody = options.selectBody || null;
    this.zoomToBody = options.zoomToBody || null;
    this.onTravelExecute = options.onTravelExecute || null;
  }

  open(targetBody = null, originBody = null) {
    if (this.allBodies.length === 0 && window.__allBodies) {
      this.allBodies = window.__allBodies;
    }
    if (targetBody) {
      this.targetKey = targetBody.key || targetBody.id || 'Mars';
    }
    if (originBody) {
      this.originKey = originBody.key || originBody.id || 'Earth';
    }

    if (!this.panel) {
      this._buildModal();
    }
    this._populateDropdowns();
    this.panel.style.display = 'flex';
    this._render();
    this.isOpen = true;
    soundManager.whoosh(320);
  }

  close() {
    if (this.panel) {
      this.panel.style.display = 'none';
    }
    this.isOpen = false;
  }

  toggle(targetBody = null) {
    this.isOpen ? this.close() : this.open(targetBody);
  }

  /** Alias usato dal pulsante rapido 🚀: apre il modale senza cambiare rotta. */
  openModal() {
    this.open();
  }

  _buildModal() {
    this.panel = document.createElement('div');
    this.panel.id = 'spaceTravelModal';
    this.panel.className = 'systems-modal-overlay';
    this.panel.setAttribute('role', 'dialog');
    this.panel.setAttribute('aria-modal', 'true');

    this.panel.innerHTML = `
      <div class="systems-modal-card" style="max-width:680px;background:rgba(8,12,24,0.97);border:1px solid rgba(91,196,207,0.3);box-shadow:0 30px 90px rgba(0,0,0,0.8), 0 0 50px rgba(91,196,207,0.2);">
        <div class="systems-modal-header">
          <div class="systems-badge">${t('st_badge')}</div>
          <button class="systems-close" id="stCloseBtn" aria-label="${t('close')}">✕</button>
        </div>

        <div style="margin-bottom:16px;">
          <h2 style="margin:0 0 4px;font-size:1.3rem;font-weight:800;color:#5bc4cf;">${t(
            'st_title'
          )}</h2>
          <p style="margin:0;font-size:0.85rem;color:rgba(228,234,248,0.7);line-height:1.4;">
            ${t('st_sub')}
          </p>
        </div>

        <!-- Sezione Selezione Rotta (A -> B) -->
        <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:center;margin-bottom:16px;background:rgba(255,255,255,0.03);padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,0.08);">
          <div>
            <label style="display:block;font-size:11px;font-weight:700;color:rgba(228,234,248,0.5);text-transform:uppercase;margin-bottom:6px;">${t(
              'st_origin'
            )}</label>
            <select id="stOriginSelect" style="width:100%;padding:9px;background:rgba(12,18,34,0.9);border:1px solid rgba(91,196,207,0.4);border-radius:8px;color:#e4eaf8;font-size:13px;font-family:inherit;outline:none;cursor:pointer;"></select>
          </div>
          <div style="font-size:20px;color:#5bc4cf;text-align:center;padding-top:16px;">➔</div>
          <div>
            <label style="display:block;font-size:11px;font-weight:700;color:rgba(228,234,248,0.5);text-transform:uppercase;margin-bottom:6px;">${t(
              'st_dest'
            )}</label>
            <select id="stTargetSelect" style="width:100%;padding:9px;background:rgba(12,18,34,0.9);border:1px solid rgba(91,196,207,0.4);border-radius:8px;color:#e4eaf8;font-size:13px;font-family:inherit;outline:none;cursor:pointer;"></select>
          </div>
        </div>

        <!-- Sezione Selezione Veicolo / Propulsione -->
        <div style="margin-bottom:16px;">
          <label style="display:block;font-size:11px;font-weight:700;color:rgba(228,234,248,0.5);text-transform:uppercase;margin-bottom:8px;">${t(
            'st_vehicle'
          )}</label>
          <div id="stCraftGrid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(200px, 1fr));gap:8px;max-height:160px;overflow-y:auto;padding-right:4px;"></div>
        </div>

        <!-- Scheda Risultati & Calcolo -->
        <div id="stResultsCard" style="background:linear-gradient(135deg, rgba(14,24,48,0.8), rgba(8,14,30,0.95));padding:16px;border-radius:14px;border:1px solid rgba(91,196,207,0.3);margin-bottom:18px;"></div>

        <!-- Pulsante Esegui Viaggio -->
        <div style="display:flex;gap:10px;justify-content:flex-end;">
          <button id="stCancelBtn" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.16);color:#e4eaf8;padding:10px 18px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:600;">${t(
            'cancel'
          )}</button>
          <button id="stLaunchBtn" style="flex:1;background:linear-gradient(135deg,#5bc4cf,#3ab0be);border:none;color:#040a14;padding:12px 22px;border-radius:10px;cursor:pointer;font-size:14px;font-weight:800;box-shadow:0 0 25px rgba(91,196,207,0.4);display:flex;align-items:center;justify-content:center;gap:8px;">
            ${t('st_launch')}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(this.panel);

    this.panel.querySelector('#stCloseBtn')?.addEventListener('click', () => this.close());
    this.panel.querySelector('#stCancelBtn')?.addEventListener('click', () => this.close());
    this.panel.addEventListener('click', (e) => {
      if (e.target === this.panel) this.close();
    });

    const originSel = this.panel.querySelector('#stOriginSelect');
    const targetSel = this.panel.querySelector('#stTargetSelect');

    originSel.addEventListener('change', (e) => {
      this.originKey = e.target.value;
      this._render();
    });
    targetSel.addEventListener('change', (e) => {
      this.targetKey = e.target.value;
      this._render();
    });

    this.panel.querySelector('#stLaunchBtn').addEventListener('click', () => {
      this._executeTravel();
    });
  }

  _populateDropdowns() {
    const originSel = this.panel.querySelector('#stOriginSelect');
    const targetSel = this.panel.querySelector('#stTargetSelect');
    if (!originSel || !targetSel) return;

    const bodies = this.allBodies.length
      ? this.allBodies
      : [
          { key: 'Earth', label: 'Terra', icon: '🌍' },
          { key: 'Sun', label: 'Sole', icon: '☀️' },
          { key: 'Mars', label: 'Marte', icon: '🔴' },
          { key: 'Jupiter', label: 'Giove', icon: '🪐' },
          { key: 'Saturn', label: 'Saturno', icon: '🪐' },
          { key: 'Moon', label: 'Luna', icon: '🌙' },
          { key: 'ProximaCentauri', label: 'Proxima Centauri', icon: '⭐' },
          { key: 'Trappist1', label: 'TRAPPIST-1', icon: '🪐' },
        ];

    const lang = getLang();
    const makeOptions = (selectedKey) =>
      bodies
        .map(
          (b) =>
            `<option value="${escapeHtml(b.key)}" ${
              b.key === selectedKey ? 'selected' : ''
            }>${escapeHtml(b.icon || '🪐')} ${escapeHtml(
              getBodyLabel(b, lang) || b.name || b.key
            )}</option>`
        )
        .join('');

    originSel.innerHTML = makeOptions(this.originKey);
    targetSel.innerHTML = makeOptions(this.targetKey);

    const craftGrid = this.panel.querySelector('#stCraftGrid');
    if (craftGrid) {
      craftGrid.innerHTML = SPACECRAFT_PROFILES.map(
        (c) => `
        <div class="st-craft-card ${c.id === this.spacecraftId ? 'active' : ''}" data-craftid="${
          c.id
        }"
          style="padding:8px 10px;background:${
            c.id === this.spacecraftId ? 'rgba(91,196,207,0.18)' : 'rgba(255,255,255,0.04)'
          };
          border:${
            c.id === this.spacecraftId ? '1.5px solid #5bc4cf' : '1px solid rgba(255,255,255,0.1)'
          };
          border-radius:8px;cursor:pointer;transition:all 0.15s ease;">
          <div style="font-size:12px;font-weight:700;color:#e4eaf8;display:flex;align-items:center;gap:6px;">
            <span>${c.icon}</span> <span>${escapeHtml(L(c.name))}</span>
          </div>
          <div style="font-size:10.5px;color:#5bc4cf;margin-top:2px;">${
            c.speedKmh ? `${Math.round(c.speedKmh).toLocaleString(localeOf())} km/h` : t('st_rel')
          }</div>
        </div>
      `
      ).join('');

      craftGrid.querySelectorAll('.st-craft-card').forEach((card) => {
        card.addEventListener('click', () => {
          this.spacecraftId = card.getAttribute('data-craftid');
          craftGrid.querySelectorAll('.st-craft-card').forEach((c) => {
            c.style.background = 'rgba(255,255,255,0.04)';
            c.style.border = '1px solid rgba(255,255,255,0.1)';
          });
          card.style.background = 'rgba(91,196,207,0.18)';
          card.style.border = '1.5px solid #5bc4cf';
          this._render();
        });
      });
    }
  }

  _calculateDistance(originBody, targetBody) {
    // 1. Se entrambi sono corpi vicini nello stesso sistema o coordinate 3D disponibili
    if (originBody?.pivot && targetBody?.pivot) {
      const posA = originBody.pivot.position;
      const posB = targetBody.pivot.position;
      const distUnits = posA.distanceTo(posB);
      // Converti unità Three.js in AU (~30 unità = 1 AU)
      const distAU = distUnits / 30;
      const distKm = distAU * AU_KM;
      const distLY = distAU / 63241.077;
      return { distAU, distKm, distLY };
    }

    // 2. Se una o entrambe hanno distLY / distAU definite
    const lyA = originBody?.distLY || (originBody?.distAU ? originBody.distAU / 63241.077 : 0);
    const lyB = targetBody?.distLY || (targetBody?.distAU ? targetBody.distAU / 63241.077 : 0);
    const diffLY = Math.abs(lyB - lyA) || targetBody?.distLY || 1.0;
    const distKm = diffLY * LY_KM;
    const distAU = diffLY * 63241.077;
    return { distAU, distKm, distLY: diffLY };
  }

  _render() {
    const originBody = this.allBodies.find((b) => b.key === this.originKey) || {
      key: 'Earth',
      label: 'Terra',
      labelEn: 'Earth',
      icon: '🌍',
    };
    const targetBody = this.allBodies.find((b) => b.key === this.targetKey) || {
      key: 'Mars',
      label: 'Marte',
      labelEn: 'Mars',
      icon: '🔴',
    };
    const craft =
      SPACECRAFT_PROFILES.find((c) => c.id === this.spacecraftId) || SPACECRAFT_PROFILES[0];

    const distInfo = this._calculateDistance(originBody, targetBody);

    let totalDays = 0;

    if (craft.isRelativistic) {
      const trip = computeRelativisticTrip(distInfo.distLY, craft.accelG || 1.0);
      totalDays = trip.earthDays;
    } else {
      const hours = distInfo.distKm / craft.speedKmh;
      totalDays = hours / 24;
    }

    const formattedDuration = formatDuration(totalDays);
    const startDate = new Date();
    const arrivalDate = new Date(startDate.getTime() + totalDays * 86400 * 1000);

    const isInterstellar = distInfo.distLY > 0.05;
    const distDisplay = isInterstellar
      ? `${distInfo.distLY.toFixed(2)} ${t('st_ly')} (${(distInfo.distKm / 1e9).toFixed(1)} ${t(
          'st_bln_km'
        )})`
      : `${(distInfo.distKm / 1e6).toFixed(2)} ${t('st_mln_km')} (${distInfo.distAU.toFixed(
          2
        )} AU)`;

    const card = this.panel.querySelector('#stResultsCard');
    if (!card) return;

    this.calculatedTrip = {
      originBody,
      targetBody,
      craft,
      distInfo,
      totalDays,
      arrivalDate,
      formattedDuration,
    };

    const locale = localeOf();
    card.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:12px;margin-bottom:12px;">
        <div style="background:rgba(255,255,255,0.04);padding:10px 12px;border-radius:10px;border-left:3px solid #5bc4cf;">
          <span style="font-size:10px;color:rgba(228,234,248,0.5);text-transform:uppercase;font-weight:700;">${t(
            'st_route_dist'
          )}</span>
          <div style="font-size:13.5px;font-weight:800;color:#e4eaf8;margin-top:2px;">${escapeHtml(
            distDisplay
          )}</div>
        </div>

        <div style="background:rgba(255,255,255,0.04);padding:10px 12px;border-radius:10px;border-left:3px solid #ffaa00;">
          <span style="font-size:10px;color:rgba(228,234,248,0.5);text-transform:uppercase;font-weight:700;">${t(
            'st_travel_time'
          )}</span>
          <div style="font-size:14px;font-weight:900;color:#ffdd44;margin-top:2px;">⏱️ ${escapeHtml(
            formattedDuration
          )}</div>
        </div>

        <div style="background:rgba(255,255,255,0.04);padding:10px 12px;border-radius:10px;border-left:3px solid #50fa7b;">
          <span style="font-size:10px;color:rgba(228,234,248,0.5);text-transform:uppercase;font-weight:700;">${t(
            'st_cruise'
          )}</span>
          <div style="font-size:13.5px;font-weight:800;color:#50fa7b;margin-top:2px;">⚡ ${craft.speedKmh.toLocaleString(
            locale
          )} km/h</div>
        </div>
      </div>

      <div style="padding:10px;background:rgba(91,196,207,0.08);border-radius:8px;font-size:12px;color:rgba(228,234,248,0.85);line-height:1.45;">
        <strong style="color:#5bc4cf;">ℹ️ ${t('st_mission_detail')}:</strong> ${escapeHtml(
          L(craft.desc)
        )}<br>
        <span style="font-size:11px;color:rgba(228,234,248,0.6);">${t(
          'st_arrival_on'
        )} ${escapeHtml(
          getBodyLabel(targetBody, getLang()) || targetBody.key
        )}: <strong style="color:#e4eaf8;">${arrivalDate.toLocaleDateString(locale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}</strong></span>
      </div>
    `;
  }

  _executeTravel() {
    if (!this.calculatedTrip) return;
    const { originBody, targetBody, craft, totalDays, arrivalDate, formattedDuration } =
      this.calculatedTrip;

    this.close();

    flightCockpit.startFlight({
      originBody,
      targetBody,
      craft,
      totalDays,
      arrivalDate,
      onProgress: (progress, currentSimDate) => {
        if (typeof this.onTravelExecute === 'function') {
          const daysPassed = totalDays * progress;
          this.onTravelExecute(daysPassed, currentSimDate);
        }
      },
      onComplete: () => {
        if (this.selectBody && targetBody) {
          this.selectBody(targetBody);
        }
        if (this.zoomToBody && targetBody) {
          this.zoomToBody(targetBody, 1200);
        }
        if (typeof this.onTravelExecute === 'function') {
          this.onTravelExecute(totalDays, arrivalDate);
        }
        toast.success(
          `🚀 ${t('st_done')} ${getBodyLabel(targetBody, getLang()) || targetBody.key} ${t(
            'st_on'
          )} ${arrivalDate.toLocaleDateString(localeOf())}. ${t(
            'st_flight_time'
          )}: ${formattedDuration}.`,
          7000
        );
      },
    });
  }
}

export const travelCalc = new TravelCalc();
