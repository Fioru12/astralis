/**
 * @file systemModal.js
 * @description Dedicated Fullscreen Interactive 3D Extrasolar System Inspector.
 * Renders a crisp 3D Three.js WebGL view of alien star systems (TRAPPIST-1, Proxima Centauri,
 * Kepler-186, Alpha Centauri, Ross 128, Tau Ceti, etc.) featuring:
 *  - Central star with dynamic solar flares and coronal glow
 *  - Real-time 3D orbiting exoplanets with custom atmospheric/surface shaders
 *  - Holographic green Habitable Zone (Goldilocks Zone) visualization ring
 *  - Interactive exoplanet clicking with astrophysical factsheets & "Fly to planet" action
 */

import * as THREE from 'three';
import { getLang, t } from '../i18n/index.js';

const L = (localized) =>
  typeof localized === 'string' ? localized : (localized?.[getLang()] ?? localized?.it);

export const EXTRASOLAR_SYSTEMS_DATA = {
  Trappist1: {
    name: 'TRAPPIST-1',
    subtitle: {
      it: 'Sistema Planetario Settuplo di Nani Rossi',
      en: 'Seven-planet red dwarf system',
    },
    dist: { it: '39.46 anni luce', en: '39.46 light-years' },
    starType: { it: 'M8V (Nana Rossa Ultra-Fredda)', en: 'M8V (ultra-cool red dwarf)' },
    temp: 2566,
    mass: '0.089 M☉',
    radius: '0.121 R☉',
    color: '#ff4500',
    habitableZone: { inner: 120, outer: 220 }, // screen units
    exoplanets: [
      {
        id: 't1_b',
        name: 'TRAPPIST-1 b',
        distAU: '0.0115 AU',
        period: { it: '1.51 giorni', en: '1.51 days' },
        mass: '1.37 M⊕',
        radius: '1.11 R⊕',
        temp: '400 K (127°C)',
        color: '#ef4444',
        dist: 55,
        r: 8,
        type: 'rocky_hot',
        desc: {
          it: 'Pianeta roccioso denso ed incandescente, fortemente sottoposto a maree gravitazionali stazionarie.',
          en: 'Dense, incandescent rocky planet, strongly locked by stationary gravitational tides.',
        },
      },
      {
        id: 't1_c',
        name: 'TRAPPIST-1 c',
        distAU: '0.0158 AU',
        period: { it: '2.42 giorni', en: '2.42 days' },
        mass: '1.31 M⊕',
        radius: '1.10 R⊕',
        temp: '342 K (69°C)',
        color: '#f97316',
        dist: 80,
        r: 8,
        type: 'rocky_venus',
        desc: {
          it: 'Pianeta roccioso ad alta densità con probabile atmosfera densa ad effetto serra analoga a Venere.',
          en: 'High-density rocky planet with a probably dense Venus-like greenhouse atmosphere.',
        },
      },
      {
        id: 't1_d',
        name: 'TRAPPIST-1 d',
        distAU: '0.0223 AU',
        period: { it: '4.05 giorni', en: '4.05 days' },
        mass: '0.39 M⊕',
        radius: '0.78 R⊕',
        temp: '288 K (15°C)',
        color: '#eab308',
        dist: 105,
        r: 6,
        type: 'rocky_warm',
        desc: {
          it: 'Pianeta leggero sul bordo interno della zona abitabile, con masse d acqua volatile in superficie.',
          en: 'Light planet on the inner edge of the habitable zone, with volatile water masses on its surface.',
        },
      },
      {
        id: 't1_e',
        name: 'TRAPPIST-1 e',
        distAU: '0.0293 AU',
        period: { it: '6.10 giorni', en: '6.10 days' },
        mass: '0.69 M⊕',
        radius: '0.92 R⊕',
        temp: '251 K (-22°C)',
        color: '#3b82f6',
        dist: 145,
        r: 9,
        habitable: true,
        type: 'ocean_habitable',
        desc: {
          it: '👑 Il candidato principe per la vita! Dimensioni quasi terrestri, mantello roccioso e probabili oceani d acqua liquida con atmosfera protettiva.',
          en: '👑 The prime candidate for life! Near-Earth size, rocky mantle and likely liquid-water oceans with a protective atmosphere.',
        },
      },
      {
        id: 't1_f',
        name: 'TRAPPIST-1 f',
        distAU: '0.0385 AU',
        period: { it: '9.21 giorni', en: '9.21 days' },
        mass: '1.04 M⊕',
        radius: '1.04 R⊕',
        temp: '219 K (-54°C)',
        color: '#06b6d4',
        dist: 175,
        r: 9,
        habitable: true,
        type: 'ice_habitable',
        desc: {
          it: 'Pianeta ricco d acqua nella zona abitabile esterna, coperto da calotte glaciali e oceani sotterranei liquidi.',
          en: 'Water-rich planet in the outer habitable zone, covered by ice caps and liquid subsurface oceans.',
        },
      },
      {
        id: 't1_g',
        name: 'TRAPPIST-1 g',
        distAU: '0.0469 AU',
        period: { it: '12.35 giorni', en: '12.35 days' },
        mass: '1.32 M⊕',
        radius: '1.13 R⊕',
        temp: '198 K (-75°C)',
        color: '#a855f7',
        dist: 205,
        r: 10,
        habitable: true,
        type: 'ice_habitable',
        desc: {
          it: 'Super-Terra ricca di elementi volatili nella fascia abitabile esterna, ricoperta da una crosta di ghiaccio e vapore.',
          en: 'Super-Earth rich in volatiles in the outer habitable belt, covered by an ice and vapor crust.',
        },
      },
      {
        id: 't1_h',
        name: 'TRAPPIST-1 h',
        distAU: '0.0619 AU',
        period: { it: '18.77 giorni', en: '18.77 days' },
        mass: '0.33 M⊕',
        radius: '0.76 R⊕',
        temp: '168 K (-105°C)',
        color: '#64748b',
        dist: 245,
        r: 6,
        type: 'frozen',
        desc: {
          it: 'Mondo glaciale periferico ed immoto sul bordo esterno del sistema, simile a una luna congelata.',
          en: 'Frozen peripheral world, motionless on the outer edge of the system, like a frozen moon.',
        },
      },
    ],
  },
  ProximaCentauri: {
    name: 'Proxima Centauri',
    subtitle: {
      it: 'La Stella Più Vicina al Sistema Solare',
      en: 'The closest star to the Solar System',
    },
    dist: { it: '4.24 anni luce', en: '4.24 light-years' },
    starType: {
      it: 'M5.5Ve (Nana Rossa Attiva con Brillamenti)',
      en: 'M5.5Ve (active flaring red dwarf)',
    },
    temp: 3042,
    mass: '0.122 M☉',
    radius: '0.154 R☉',
    color: '#ff3300',
    habitableZone: { inner: 100, outer: 170 },
    exoplanets: [
      {
        id: 'prox_d',
        name: 'Proxima d',
        distAU: '0.029 AU',
        period: { it: '5.12 giorni', en: '5.12 days' },
        mass: '0.26 M⊕',
        radius: '0.81 R⊕',
        temp: '360 K (87°C)',
        color: '#f43f5e',
        dist: 70,
        r: 6,
        type: 'rocky_hot',
        desc: {
          it: 'Sub-Terra ad altissima velocità orbitale, uno dei pianeti extrasolari più leggeri mai scoperti.',
          en: 'Sub-Earth with extremely fast orbital motion, one of the lightest exoplanets ever discovered.',
        },
      },
      {
        id: 'prox_b',
        name: 'Proxima b',
        distAU: '0.0485 AU',
        period: { it: '11.18 giorni', en: '11.18 days' },
        mass: '1.17 M⊕',
        radius: '1.03 R⊕',
        temp: '234 K (-39°C)',
        color: '#10b981',
        dist: 135,
        r: 9,
        habitable: true,
        type: 'ocean_habitable',
        desc: {
          it: '🌿 Mondo roccioso terrestre situato esattamente al centro della Zona Abitabile di Proxima Centauri! Riceve il 65% dell irraggiamento della Terra.',
          en: '🌿 Rocky Earth-like world right at the center of Proxima Centauri’s habitable zone! It receives 65% of Earth’s irradiation.',
        },
      },
      {
        id: 'prox_c',
        name: 'Proxima c',
        distAU: '1.48 AU',
        period: { it: '5.21 anni', en: '5.21 years' },
        mass: '7.0 M⊕',
        radius: '1.8 R⊕',
        temp: '39 K (-234°C)',
        color: '#38bdf8',
        dist: 230,
        r: 12,
        type: 'ice_giant',
        desc: {
          it: 'Candidata Super-Terra fredda ed isolata nelle regioni esterne del sistema di Proxima.',
          en: 'Cold, isolated super-Earth candidate in the outer regions of the Proxima system.',
        },
      },
    ],
  },
  Kepler186: {
    name: 'Kepler-186',
    subtitle: {
      it: 'Primo Sistema con una Terra Gemella Abitabile',
      en: 'First system with a habitable Earth twin',
    },
    dist: { it: '582 anni luce', en: '582 light-years' },
    starType: { it: 'M1V (Nana Rossa)', en: 'M1V (red dwarf)' },
    temp: 3788,
    mass: '0.54 M☉',
    radius: '0.52 R☉',
    color: '#ff6622',
    habitableZone: { inner: 160, outer: 240 },
    exoplanets: [
      {
        id: 'kep186_b',
        name: 'Kepler-186 b',
        distAU: '0.035 AU',
        period: { it: '3.88 giorni', en: '3.88 days' },
        mass: '1.24 M⊕',
        radius: '1.08 R⊕',
        temp: '600 K',
        color: '#dc2626',
        dist: 60,
        r: 7,
        type: 'rocky_hot',
        desc: {
          it: 'Pianeta roccioso interno caldissimo sottoposto a forte radiazione stellare.',
          en: 'Scorching inner rocky planet under strong stellar radiation.',
        },
      },
      {
        id: 'kep186_c',
        name: 'Kepler-186 c',
        distAU: '0.045 AU',
        period: { it: '7.27 giorni', en: '7.27 days' },
        mass: '1.5 M⊕',
        radius: '1.25 R⊕',
        temp: '500 K',
        color: '#ea580c',
        dist: 90,
        r: 8,
        type: 'rocky_hot',
        desc: {
          it: 'Super-Terra rocciosa su un orbita stretta attorno alla stella ospite.',
          en: 'Rocky super-Earth on a tight orbit around the host star.',
        },
      },
      {
        id: 'kep186_d',
        name: 'Kepler-186 d',
        distAU: '0.078 AU',
        period: { it: '13.34 giorni', en: '13.34 days' },
        mass: '1.4 M⊕',
        radius: '1.40 R⊕',
        temp: '400 K',
        color: '#d97706',
        dist: 120,
        r: 8,
        type: 'rocky_warm',
        desc: {
          it: 'Mondo roccioso intermedio con temperature calde.',
          en: 'Intermediate rocky world with warm temperatures.',
        },
      },
      {
        id: 'kep186_e',
        name: 'Kepler-186 e',
        distAU: '0.110 AU',
        period: { it: '22.41 giorni', en: '22.41 days' },
        mass: '1.4 M⊕',
        radius: '1.27 R⊕',
        temp: '320 K',
        color: '#ca8a04',
        dist: 150,
        r: 8,
        type: 'rocky_warm',
        desc: {
          it: 'Pianeta roccioso situato appena prima del bordo interno della zona abitabile.',
          en: 'Rocky planet just inside the inner edge of the habitable zone.',
        },
      },
      {
        id: 'kep186_f',
        name: 'Kepler-186 f',
        distAU: '0.432 AU',
        period: { it: '129.9 giorni', en: '129.9 days' },
        mass: '1.71 M⊕',
        radius: '1.17 R⊕',
        temp: '200 K (-73°C)',
        color: '#059669',
        dist: 205,
        r: 10,
        habitable: true,
        type: 'earth_twin',
        desc: {
          it: '💎 STORICO: La primissima Terra Gemella confermata nella zona abitabile di un altra stella! Ha un raggio identico al 117% della Terra.',
          en: '💎 HISTORIC: the very first confirmed Earth twin in another star’s habitable zone! Its radius is 117% of Earth’s.',
        },
      },
    ],
  },
  AlphaCentauri: {
    name: 'Alpha Centauri A & B',
    subtitle: {
      it: 'Sistema Binario Solare & Stella Tripla',
      en: 'Solar binary system & triple star',
    },
    dist: { it: '4.37 anni luce', en: '4.37 light-years' },
    starType: { it: 'G2V / K1V (Coppia Binaria Stretta)', en: 'G2V / K1V (close binary pair)' },
    temp: 5790,
    mass: '1.08 + 0.91 M☉',
    radius: '1.22 + 0.86 R☉',
    color: '#ffcc00',
    habitableZone: { inner: 130, outer: 210 },
    exoplanets: [
      {
        id: 'ac_a',
        name: 'Alpha Centauri A',
        distAU: '0 AU (Centro)',
        period: { it: '79.9 anni (orbita binaria)', en: '79.9 years (binary orbit)' },
        mass: '1.08 M☉',
        radius: '1.22 R☉',
        temp: '5790 K',
        color: '#facc15',
        dist: 0,
        r: 18,
        type: 'star_primary',
        desc: {
          it: 'Stella principale analoga al Sole, classe spettroscopica G2V.',
          en: 'Sun-like primary star, G2V spectral class.',
        },
      },
      {
        id: 'ac_b',
        name: 'Alpha Centauri B',
        distAU: '11.2 - 35.6 AU',
        period: { it: '79.9 anni', en: '79.9 years' },
        mass: '0.91 M☉',
        radius: '0.86 R☉',
        temp: '5260 K',
        color: '#fb923c',
        dist: 170,
        r: 14,
        type: 'star_binary',
        desc: {
          it: 'Stella compagna arancione di classe K1V che ruota in orbita ellittica attorno ad Alpha Centauri A.',
          en: 'Orange K1V companion star orbiting Alpha Centauri A on an elliptical orbit.',
        },
      },
    ],
  },
  Ross128: {
    name: 'Ross 128',
    subtitle: { it: 'Nana Rossa Silenziosa & Quieta', en: 'Quiet & silent red dwarf' },
    dist: { it: '11.03 anni luce', en: '11.03 light-years' },
    starType: { it: 'M4.0V (Nana Rossa Inattiva)', en: 'M4.0V (inactive red dwarf)' },
    temp: 3192,
    mass: '0.168 M☉',
    radius: '0.197 R☉',
    color: '#ff4444',
    habitableZone: { inner: 110, outer: 170 },
    exoplanets: [
      {
        id: 'ross128_b',
        name: 'Ross 128 b',
        distAU: '0.0496 AU',
        period: { it: '9.86 giorni', en: '9.86 days' },
        mass: '1.35 M⊕',
        radius: '1.11 R⊕',
        temp: '280 K (7°C)',
        color: '#22c55e',
        dist: 135,
        r: 9,
        habitable: true,
        type: 'ocean_habitable',
        desc: {
          it: '🌿 Uno dei migliori candidati per la vita! Ross 128 è una stella inattiva priva di brillamenti letali, proteggendo l atmosfera di Ross 128 b.',
          en: '🌿 One of the best candidates for life! Ross 128 is a quiet star with no lethal flares, protecting Ross 128 b’s atmosphere.',
        },
      },
    ],
  },
  TauCeti: {
    name: 'Tau Ceti',
    subtitle: {
      it: 'Analogo Solare Vicino con Disco di Polveri',
      en: 'Nearby solar analogue with dust disk',
    },
    dist: { it: '11.9 anni luce', en: '11.9 light-years' },
    starType: { it: 'G8.5V (Nana Giallo-Arancio)', en: 'G8.5V (yellow-orange dwarf)' },
    temp: 5518,
    mass: '0.78 M☉',
    radius: '0.79 R☉',
    color: '#fde047',
    habitableZone: { inner: 120, outer: 200 },
    exoplanets: [
      {
        id: 'tau_g',
        name: 'Tau Ceti g',
        distAU: '0.133 AU',
        period: { it: '20.0 giorni', en: '20.0 days' },
        mass: '1.75 M⊕',
        radius: '1.18 R⊕',
        temp: '500 K',
        color: '#ef4444',
        dist: 65,
        r: 7,
        type: 'rocky_hot',
        desc: {
          it: 'Super-Terra calda interna vicina alla stella ospite.',
          en: 'Hot inner super-Earth close to the host star.',
        },
      },
      {
        id: 'tau_h',
        name: 'Tau Ceti h',
        distAU: '0.243 AU',
        period: { it: '49.4 giorni', en: '49.4 days' },
        mass: '1.83 M⊕',
        radius: '1.20 R⊕',
        temp: '380 K',
        color: '#f97316',
        dist: 100,
        r: 8,
        type: 'rocky_warm',
        desc: {
          it: 'Super-Terra intermedia su un orbita circolare stazionaria.',
          en: 'Intermediate super-Earth on a stable circular orbit.',
        },
      },
      {
        id: 'tau_e',
        name: 'Tau Ceti e',
        distAU: '0.552 AU',
        period: { it: '162.9 giorni', en: '162.9 days' },
        mass: '3.93 M⊕',
        radius: '1.55 R⊕',
        temp: '282 K (9°C)',
        color: '#10b981',
        dist: 155,
        r: 10,
        habitable: true,
        type: 'ocean_habitable',
        desc: {
          it: '🌿 Super-Terra nella fascia abitabile interna di Tau Ceti con clima temperato ed aria respirabile.',
          en: '🌿 Super-Earth in Tau Ceti’s inner habitable belt with temperate climate and breathable air.',
        },
      },
      {
        id: 'tau_f',
        name: 'Tau Ceti f',
        distAU: '1.35 AU',
        period: { it: '640 giorni', en: '640 days' },
        mass: '3.93 M⊕',
        radius: '1.55 R⊕',
        temp: '190 K (-83°C)',
        color: '#3b82f6',
        dist: 215,
        r: 10,
        habitable: true,
        type: 'ice_habitable',
        desc: {
          it: 'Super-Terra fredda situata sul margine esterno della zona abitabile, ricoperta da oceani ghiacciati.',
          en: 'Cold super-Earth on the outer edge of the habitable zone, covered by frozen oceans.',
        },
      },
    ],
  },
};

export class SystemInspectorModal {
  constructor(options = {}) {
    this.onFlyToPlanet = options.onFlyToPlanet || (() => {});
    this.isOpen = false;
    this.modalEl = null;
    this.containerEl = null;
    this.overlayCanvas = null;
    this.overlayCtx = null;
    this.animationFrameId = null;

    // Three.js 3D System Inspector Engine
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.starMesh = null;
    this.starCoronaMesh = null;
    this.planetMeshes = [];
    this.orbitLines = [];
    this.habitableRingMesh = null;

    this.currentSystemKey = 'Trappist1';
    this.systemData = EXTRASOLAR_SYSTEMS_DATA.Trappist1;
    this.selectedExoplanet = null;
    this.rotationAngle = 0;
    this.showHabitableZone = true;
    this.isPaused = false;
    this.exoplanetModalEl = null;
  }

  open(systemKey = 'Trappist1') {
    if (this.isOpen) {
      this.loadSystem(systemKey);
      return;
    }
    this.currentSystemKey = EXTRASOLAR_SYSTEMS_DATA[systemKey] ? systemKey : 'Trappist1';
    this.systemData = EXTRASOLAR_SYSTEMS_DATA[this.currentSystemKey];
    this.isOpen = true;
    this._buildModal();
    this._initThreeScene();
    this._startAnimation();
  }

  loadSystem(systemKey) {
    if (!EXTRASOLAR_SYSTEMS_DATA[systemKey]) return;
    this.currentSystemKey = systemKey;
    this.systemData = EXTRASOLAR_SYSTEMS_DATA[systemKey];
    this.selectedExoplanet = null;
    this._updateHUDHeader();
    this._rebuildThreeScene();
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this._closeExoplanetModal();
    this._disposeThree();

    if (this.modalEl) {
      this.modalEl.style.opacity = '0';
      setTimeout(() => {
        this.modalEl?.remove();
        this.modalEl = null;
      }, 300);
    }
  }

  toggle(systemKey) {
    this.isOpen ? this.close() : this.open(systemKey);
  }

  _buildModal() {
    this.modalEl = document.createElement('div');
    this.modalEl.id = 'systemInspectorModal';
    Object.assign(this.modalEl.style, {
      position: 'fixed',
      inset: '0',
      width: '100vw',
      height: '100vh',
      background: 'rgb(3, 6, 14)',
      color: '#eef2ff',
      zIndex: '100000',
      opacity: '0',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transition: 'opacity 0.35s ease',
      fontFamily: "'Space Grotesk', system-ui, sans-serif",
    });

    this.modalEl.innerHTML = `
      <!-- Top HUD Header -->
      <div style="position:absolute;top:20px;left:24px;right:24px;display:flex;justify-content:space-between;align-items:center;z-index:10;pointer-events:none;">
        <div id="sysHudInfoCard" style="background:rgba(8,12,24,0.88);backdrop-filter:blur(20px);padding:12px 22px;border-radius:16px;border:1px solid rgba(91,196,207,0.35);box-shadow:0 10px 30px rgba(0,0,0,0.7);pointer-events:auto;">
          <h1 id="sysTitleEl" style="margin:0;font-size:1.35rem;font-weight:900;background:linear-gradient(135deg,#ffffff,${
            this.systemData.color
          });-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
            🪐 ${t('sys_star_system')}: ${this.systemData.name}
          </h1>
          <div id="sysSubTitleEl" style="font-size:0.8rem;color:rgba(238,242,255,0.75);margin-top:2px;">
            ${L(this.systemData.subtitle)} • ${L(this.systemData.dist)}
          </div>
        </div>

        <div style="display:flex;align-items:center;gap:10px;pointer-events:auto;">
          <select id="sysSelectorSelect" style="background:rgba(8,12,24,0.88);backdrop-filter:blur(20px);border:1px solid rgba(91,196,207,0.4);color:#5bc4cf;padding:8px 14px;border-radius:12px;cursor:pointer;font-size:12px;font-weight:700;outline:none;">
            ${Object.keys(EXTRASOLAR_SYSTEMS_DATA)
              .map(
                (key) => `
              <option value="${key}" ${key === this.currentSystemKey ? 'selected' : ''}>
                ${EXTRASOLAR_SYSTEMS_DATA[key].name} (${L(EXTRASOLAR_SYSTEMS_DATA[key].dist)})
              </option>
            `
              )
              .join('')}
          </select>

          <button id="toggleHabitableZoneBtn" style="background:rgba(8,12,24,0.88);backdrop-filter:blur(20px);border:1px solid rgba(16,185,129,0.5);color:#10b981;padding:8px 14px;border-radius:12px;cursor:pointer;font-size:12px;font-weight:700;transition:all 0.2s;" title="${t(
            'sys_hz_title'
          )}">
            ${t('sys_hz_on')}
          </button>

          <button id="pauseSysOrbitsBtn" style="background:rgba(8,12,24,0.88);backdrop-filter:blur(20px);border:1px solid rgba(91,196,207,0.3);color:rgba(238,242,255,0.85);padding:8px 14px;border-radius:12px;cursor:pointer;font-size:12px;font-weight:600;transition:all 0.2s;">
            ${t('sys_pause')}
          </button>

          <button id="sysModalCloseBtn" style="background:rgba(8,12,24,0.88);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.2);color:#fff;width:42px;height:42px;border-radius:50%;cursor:pointer;font-size:18px;transition:all 0.25s;" title="${t(
            'sys_close_title'
          )}">✕</button>
        </div>
      </div>

      <!-- WebGL & Overlay Canvas -->
      <div id="sysCanvasContainer" style="position:relative;width:100%;height:100%;flex:1;">
        <canvas id="sys2DOverlay" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:5;pointer-events:auto;cursor:default;"></canvas>
        
        <div id="sysTooltip" style="position:absolute;display:none;pointer-events:none;padding:8px 16px;background:rgba(12,18,34,0.96);color:#fff;border-radius:10px;font-size:12.5px;font-weight:800;box-shadow:0 0 24px rgba(91,196,207,0.8);transform:translate(-50%, -150%);white-space:nowrap;z-index:20;">
          ${t('sys_tooltip_default')}
        </div>
      </div>

      <!-- Bottom Floating Exoplanet Bar -->
      <div style="position:absolute;bottom:24px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:12px;background:rgba(8,12,24,0.90);backdrop-filter:blur(24px);padding:10px 20px;border-radius:999px;border:1px solid rgba(91,196,207,0.35);box-shadow:0 20px 60px rgba(0,0,0,0.8);z-index:10;pointer-events:auto;max-width:92vw;overflow-x:auto;">
        <span style="font-size:0.8rem;color:rgba(238,242,255,0.65);font-weight:700;margin-right:4px;">${t(
          'sys_exoplanets'
        )}</span>
        <div id="sysExoBarContainer" style="display:flex;align-items:center;gap:8px;"></div>
      </div>
    `;

    document.body.appendChild(this.modalEl);

    requestAnimationFrame(() => {
      if (this.modalEl) {
        this.modalEl.style.opacity = '1';
      }
    });

    this.containerEl = this.modalEl.querySelector('#sysCanvasContainer');
    this.overlayCanvas = this.modalEl.querySelector('#sys2DOverlay');
    this.overlayCtx = this.overlayCanvas.getContext('2d');
    const tooltip = this.modalEl.querySelector('#sysTooltip');
    const pauseBtn = this.modalEl.querySelector('#pauseSysOrbitsBtn');
    const hzToggleBtn = this.modalEl.querySelector('#toggleHabitableZoneBtn');
    const sysSelect = this.modalEl.querySelector('#sysSelectorSelect');

    sysSelect.addEventListener('change', (e) => {
      this.loadSystem(e.target.value);
    });

    pauseBtn.addEventListener('click', () => {
      this.isPaused = !this.isPaused;
      pauseBtn.textContent = this.isPaused ? t('sys_resume') : t('sys_pause');
    });

    hzToggleBtn.addEventListener('click', () => {
      this.showHabitableZone = !this.showHabitableZone;
      hzToggleBtn.textContent = this.showHabitableZone ? t('sys_hz_on') : t('sys_hz_off');
      hzToggleBtn.style.color = this.showHabitableZone ? '#10b981' : 'rgba(238,242,255,0.5)';
      hzToggleBtn.style.borderColor = this.showHabitableZone
        ? 'rgba(16,185,129,0.5)'
        : 'rgba(255,255,255,0.2)';
    });

    this.modalEl.querySelector('#sysModalCloseBtn').addEventListener('click', () => this.close());

    this.overlayCanvas.addEventListener('mousemove', (e) => {
      const rect = this.overlayCanvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let hovered = null;
      if (this.systemData && this.systemData.exoplanets) {
        for (const exo of this.systemData.exoplanets) {
          if (exo.screenX !== undefined && exo.screenY !== undefined) {
            const d = Math.hypot(mouseX - exo.screenX, mouseY - exo.screenY);
            if (d <= exo.r + 14) {
              hovered = exo;
              break;
            }
          }
        }
      }

      this.hoveredExo = hovered;

      if (hovered) {
        this.overlayCanvas.style.cursor = 'pointer';
        tooltip.style.display = 'block';
        tooltip.style.background = 'rgba(12, 18, 34, 0.96)';
        tooltip.style.border = `1px solid ${hovered.color}`;
        tooltip.style.boxShadow = `0 0 24px ${hovered.color}99`;
        tooltip.innerHTML = `<strong>${hovered.name}</strong> ${
          hovered.habitable ? t('sys_habitable_badge') : ''
        } — ${t('sys_click_card')}`;
        tooltip.style.left = `${e.clientX}px`;
        tooltip.style.top = `${e.clientY}px`;
      } else {
        this.overlayCanvas.style.cursor = 'default';
        tooltip.style.display = 'none';
      }
    });

    this.overlayCanvas.addEventListener('click', (e) => {
      const rect = this.overlayCanvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (this.systemData && this.systemData.exoplanets) {
        for (const exo of this.systemData.exoplanets) {
          if (exo.screenX !== undefined && exo.screenY !== undefined) {
            const d = Math.hypot(mouseX - exo.screenX, mouseY - exo.screenY);
            if (d <= exo.r + 18) {
              this._openExoplanetModal(exo);
              return;
            }
          }
        }
      }
    });

    this._renderExoplanetBar();
    window.addEventListener('resize', (this._onResizeBound = () => this._handleResize()));
  }

  _updateHUDHeader() {
    if (!this.modalEl) return;
    const titleEl = this.modalEl.querySelector('#sysTitleEl');
    const subTitleEl = this.modalEl.querySelector('#sysSubTitleEl');
    if (titleEl) {
      titleEl.textContent = `🪐 ${t('sys_star_system')}: ${this.systemData.name}`;
      titleEl.style.background = `linear-gradient(135deg, #ffffff, ${this.systemData.color})`;
      titleEl.style.webkitBackgroundClip = 'text';
      titleEl.style.webkitTextFillColor = 'transparent';
    }
    if (subTitleEl) {
      subTitleEl.textContent = `${L(this.systemData.subtitle)} • ${L(this.systemData.dist)}`;
    }
    this._renderExoplanetBar();
  }

  _renderExoplanetBar() {
    if (!this.modalEl) return;
    const bar = this.modalEl.querySelector('#sysExoBarContainer');
    if (!bar) return;

    bar.innerHTML = this.systemData.exoplanets
      .map(
        (exo) => `
      <button class="sys-exo-bar-btn" data-exoid="${exo.id}" style="background:${
        exo.habitable ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'
      };border:1px solid ${
        exo.color
      }77;color:#eef2ff;padding:6px 12px;border-radius:999px;cursor:pointer;font-size:0.78rem;font-weight:700;display:flex;align-items:center;gap:6px;transition:all 0.2s;white-space:nowrap;">
        <span style="width:8px;height:8px;border-radius:50%;background:${
          exo.color
        };box-shadow:0 0 8px ${exo.color};"></span>
        ${exo.name} ${exo.habitable ? '🌿' : ''}
      </button>
    `
      )
      .join('');

    bar.querySelectorAll('.sys-exo-bar-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const exoId = btn.getAttribute('data-exoid');
        const exo = this.systemData.exoplanets.find((x) => x.id === exoId);
        if (exo) this._openExoplanetModal(exo);
      });
    });
  }

  _openExoplanetModal(exo) {
    this._closeExoplanetModal();

    this.exoplanetModalEl = document.createElement('div');
    this.exoplanetModalEl.id = 'exoplanetDetailModal';
    Object.assign(this.exoplanetModalEl.style, {
      position: 'fixed',
      inset: '0',
      background: 'rgba(2, 4, 10, 0.88)',
      backdropFilter: 'blur(16px)',
      zIndex: '100010',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      opacity: '0',
      transition: 'opacity 0.3s ease',
      fontFamily: "'Space Grotesk', system-ui, sans-serif",
    });

    this.exoplanetModalEl.innerHTML = `
      <div style="background:rgba(12,18,34,0.96);border:1px solid ${
        exo.color
      }77;box-shadow:0 0 50px ${
        exo.color
      }44, 0 20px 60px rgba(0,0,0,0.8);border-radius:24px;max-width:620px;width:100%;max-height:90vh;overflow-y:auto;padding:28px;color:#eef2ff;position:relative;">
        
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
          <div>
            <div style="font-size:0.75rem;letter-spacing:1px;font-weight:800;color:${
              exo.color
            };text-transform:uppercase;margin-bottom:4px;">
              EXOPLANET FACTSHEET • ${this.systemData.name}
            </div>
            <h2 style="margin:0;font-size:1.7rem;font-weight:900;background:linear-gradient(135deg,#ffffff,${
              exo.color
            });-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
              ${exo.name} ${exo.habitable ? t('sys_hz_tag') : ''}
            </h2>
            <div style="font-size:0.85rem;color:rgba(238,242,255,0.7);margin-top:2px;">
              ${t('sys_semimajor')}: ${exo.distAU} • ${t('sys_period')}: ${L(exo.period)}
            </div>
          </div>
          <button id="closeExoModalBtn" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:16px;transition:all 0.2s;" title="${t(
            'close'
          )}">✕</button>
        </div>

        <!-- Exoplanet Stats Grid -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(170px, 1fr));gap:12px;margin-bottom:20px;">
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:12px 16px;">
            <div style="font-size:0.72rem;color:rgba(238,242,255,0.6);text-transform:uppercase;font-weight:600;">${t(
              'sys_mass'
            )}</div>
            <div style="font-size:1.05rem;font-weight:800;color:${exo.color};margin-top:2px;">${
              exo.mass
            }</div>
          </div>
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:12px 16px;">
            <div style="font-size:0.72rem;color:rgba(238,242,255,0.6);text-transform:uppercase;font-weight:600;">${t(
              'sys_radius'
            )}</div>
            <div style="font-size:1.05rem;font-weight:800;color:#eef2ff;margin-top:2px;">${
              exo.radius
            }</div>
          </div>
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:12px 16px;">
            <div style="font-size:0.72rem;color:rgba(238,242,255,0.6);text-transform:uppercase;font-weight:600;">${t(
              'sys_temp'
            )}</div>
            <div style="font-size:1.05rem;font-weight:800;color:${
              exo.habitable ? '#10b981' : '#5bc4cf'
            };margin-top:2px;">${exo.temp}</div>
          </div>
        </div>

        <!-- Description Card -->
        <div style="background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:18px;margin-bottom:24px;line-height:1.6;font-size:0.9rem;color:rgba(238,242,255,0.88);">
          <h3 style="margin:0 0 8px 0;font-size:1rem;color:${exo.color};font-weight:800;">${t(
            'sys_features'
          )}</h3>
          <p style="margin:0;">${L(exo.desc)}</p>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;">
          <button id="flyToExoBtn" style="padding:10px 20px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);border:none;border-radius:12px;color:#fff;font-weight:800;font-size:0.88rem;cursor:pointer;box-shadow:0 0 20px rgba(59,130,246,0.4);transition:all 0.2s;display:flex;align-items:center;gap:8px;">
            ${t('sys_fly')}
          </button>
          <button id="closeExoCardBtn" style="padding:10px 20px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:12px;color:#fff;font-weight:700;font-size:0.88rem;cursor:pointer;">
            ${t('close')}
          </button>
        </div>

      </div>
    `;

    document.body.appendChild(this.exoplanetModalEl);

    requestAnimationFrame(() => {
      if (this.exoplanetModalEl) {
        this.exoplanetModalEl.style.opacity = '1';
      }
    });

    const closeExo = () => this._closeExoplanetModal();
    this.exoplanetModalEl.querySelector('#closeExoModalBtn')?.addEventListener('click', closeExo);
    this.exoplanetModalEl.querySelector('#closeExoCardBtn')?.addEventListener('click', closeExo);

    this.exoplanetModalEl.querySelector('#flyToExoBtn')?.addEventListener('click', () => {
      this.close();
      this.onFlyToPlanet(exo, this.currentSystemKey);
    });
  }

  _closeExoplanetModal() {
    if (this.exoplanetModalEl) {
      this.exoplanetModalEl.style.opacity = '0';
      const el = this.exoplanetModalEl;
      this.exoplanetModalEl = null;
      setTimeout(() => el.remove(), 300);
    }
  }

  _initThreeScene() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      1,
      1000
    );
    this.camera.position.z = 10;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.containerEl.insertBefore(this.renderer.domElement, this.overlayCanvas);

    this._rebuildThreeScene();
  }

  _rebuildThreeScene() {
    if (!this.scene) return;

    // Clear old meshes
    while (this.scene.children.length > 0) {
      const obj = this.scene.children[0];
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
      this.scene.remove(obj);
    }

    const starColor = new THREE.Color(this.systemData.color);

    // Central Host Star Mesh
    const starGeo = new THREE.SphereGeometry(26, 32, 32);
    const starMat = new THREE.MeshBasicMaterial({ color: starColor });
    this.starMesh = new THREE.Mesh(starGeo, starMat);
    this.scene.add(this.starMesh);

    // Coronal Glow Mesh
    const coronaGeo = new THREE.SphereGeometry(36, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: starColor,
      transparent: true,
      opacity: 0.35,
      side: THREE.BackSide,
    });
    this.starCoronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    this.scene.add(this.starCoronaMesh);
  }

  _handleResize() {
    if (!this.isOpen || !this.renderer || !this.camera) return;
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.camera.left = w / -2;
    this.camera.right = w / 2;
    this.camera.top = h / 2;
    this.camera.bottom = h / -2;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  _startAnimation() {
    const render = () => {
      if (!this.isOpen) return;

      if (!this.isPaused) {
        this.rotationAngle += 0.005;
      }

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }

      this._drawOverlay();
      this.animationFrameId = requestAnimationFrame(render);
    };
    render();
  }

  _drawOverlay() {
    if (!this.overlayCtx) return;
    const ctx = this.overlayCtx;
    const cssW = window.innerWidth;
    const cssH = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    if (
      this.overlayCanvas.width !== Math.floor(cssW * dpr) ||
      this.overlayCanvas.height !== Math.floor(cssH * dpr)
    ) {
      this.overlayCanvas.width = Math.floor(cssW * dpr);
      this.overlayCanvas.height = Math.floor(cssH * dpr);
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, cssW, cssH);

    const cx = cssW / 2;
    const cy = cssH / 2;
    const time = performance.now();
    const pulse = 1 + Math.sin(time * 0.005) * 0.22;

    // 1. Draw Central Host Star Glow & Flares on Overlay
    ctx.save();
    ctx.translate(cx, cy);

    ctx.beginPath();
    ctx.arc(0, 0, 42 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = `${this.systemData.color}33`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, 24 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = `${this.systemData.color}aa`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();

    // Central Star Text Label
    ctx.font = 'bold 13px "Space Grotesk", sans-serif';
    ctx.fillStyle = this.systemData.color;
    ctx.shadowColor = 'rgba(0,0,0,0.95)';
    ctx.shadowBlur = 8;
    ctx.fillText(`${this.systemData.name} (${L(this.systemData.starType)})`, cx + 28, cy + 5);
    ctx.shadowBlur = 0;

    // 2. Draw Habitable Zone (Goldilocks Zone) Holographic Band if active
    if (this.showHabitableZone && this.systemData.habitableZone) {
      const hz = this.systemData.habitableZone;
      const hzInner = hz.inner;
      const hzOuter = hz.outer;
      const hzMid = (hzInner + hzOuter) / 2;
      const hzWidth = hzOuter - hzInner;

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, hzMid, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.28)';
      ctx.lineWidth = hzWidth;
      ctx.stroke();

      // Inner & Outer Borders
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);

      ctx.beginPath();
      ctx.arc(cx, cy, hzInner, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, hzOuter, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.restore();

      // HZ Badge Label
      ctx.font = 'bold 10px sans-serif';
      ctx.fillStyle = '#10b981';
      ctx.fillText(t('sys_hz_canvas'), cx + hzInner + 10, cy - 10);
    }

    // 3. Draw Exoplanets & Orbit Lines
    if (this.systemData && this.systemData.exoplanets) {
      const exoCount = this.systemData.exoplanets.length;
      this.systemData.exoplanets.forEach((exo, idx) => {
        const orbitR = exo.dist;
        const orbitSpeed = 0.0003 + (exoCount - idx) * 0.0002;
        const angle = idx * ((Math.PI * 2) / exoCount) + this.rotationAngle * orbitSpeed * 1200;

        exo.screenX = cx + Math.cos(angle) * orbitR;
        exo.screenY = cy + Math.sin(angle) * orbitR;

        // Orbit Line
        ctx.beginPath();
        ctx.arc(cx, cy, orbitR, 0, Math.PI * 2);
        ctx.strokeStyle = exo.habitable ? 'rgba(16, 185, 129, 0.35)' : `${exo.color}22`;
        ctx.lineWidth = exo.habitable ? 1.5 : 1;
        ctx.setLineDash(exo.habitable ? [] : [4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        const isHovered = this.hoveredExo === exo;
        const scale = isHovered ? 1.4 : 1.0;

        // Draw Exoplanet Body & Glow
        ctx.save();
        ctx.translate(exo.screenX, exo.screenY);

        ctx.beginPath();
        ctx.arc(0, 0, (exo.r + 6) * scale, 0, Math.PI * 2);
        ctx.fillStyle = `${exo.color}33`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, exo.r * scale, 0, Math.PI * 2);
        ctx.fillStyle = exo.color;
        ctx.fill();

        // Atmosphere / Specular Highlight
        ctx.beginPath();
        ctx.arc(-exo.r * 0.3, -exo.r * 0.3, exo.r * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fill();

        if (isHovered) {
          ctx.beginPath();
          ctx.arc(0, 0, (exo.r + 14) * scale, 0, Math.PI * 2);
          ctx.strokeStyle = exo.color;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        ctx.restore();

        // Label
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = exo.color;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
        ctx.shadowBlur = 8;
        ctx.fillText(
          `${exo.name} ${exo.habitable ? '🌿' : ''}`,
          exo.screenX + exo.r + 6,
          exo.screenY + 4
        );
        ctx.shadowBlur = 0;
      });
    }

    ctx.restore();
  }

  _disposeThree() {
    if (this._onResizeBound) {
      window.removeEventListener('resize', this._onResizeBound);
    }
    if (this.scene) {
      while (this.scene.children.length > 0) {
        const obj = this.scene.children[0];
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
        this.scene.remove(obj);
      }
    }
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.domElement.remove();
      this.renderer = null;
    }
    this.scene = null;
    this.camera = null;
  }
}
