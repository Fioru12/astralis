/**
 * @file systemsExplorer.js
 * @description Star Systems & Exoplanet Worlds Explorer Hub for Astralis.
 * Provides a dedicated visual browser and Warp Jump mechanism for stellar systems and exoplanets.
 */

import { escapeHtml } from '../utils/sanitize.js';
import { getLang } from '../i18n/index.js';
import { soundManager } from '../core/soundManager.js';
import { toast } from './toast.js';

export const STAR_SYSTEMS = [
  {
    key: 'SolarSystem',
    starKey: 'Sun',
    name: { it: 'Sistema Solare', en: 'Solar System' },
    starType: 'G2V (Nana Gialla)',
    distLY: 0,
    planetsCount: 8,
    habitableCount: 1,
    tag: 'home',
    desc: {
      it: 'La nostra dimora cosmica: 8 pianeti principali, pianeti nani, fasce di asteroidi e comete.',
      en: 'Our cosmic home: 8 major planets, dwarf planets, asteroid belts, and comets.',
    },
    exoplanets: ['Terra', 'Marte', 'Giove', 'Saturno'],
    icon: '☀️',
  },
  {
    key: 'ProximaCentauri',
    starKey: 'ProximaCentauri',
    name: { it: 'Proxima Centauri', en: 'Proxima Centauri' },
    starType: 'M5.5V (Nana Rossa)',
    distLY: 4.24,
    planetsCount: 3,
    habitableCount: 1,
    tag: 'habitable',
    desc: {
      it: 'La stella più vicina al Sole, con Proxima b nella zona abitabile e Proxima d su un’orbita ultra-rapida.',
      en: 'The closest star to the Sun, hosting Proxima b in the habitable zone and Proxima d on a swift orbit.',
    },
    exoplanets: ['Proxima b', 'Proxima c', 'Proxima d'],
    icon: '🔴',
  },
  {
    key: 'AlphaCentauri',
    starKey: 'AlphaCentauriA',
    name: { it: 'Alpha Centauri A & B', en: 'Alpha Centauri A & B' },
    starType: 'G2V / K1V (Binaria Stretta)',
    distLY: 4.37,
    planetsCount: 1,
    habitableCount: 0,
    tag: 'binary',
    desc: {
      it: 'Il sistema binario principale del trio Centauri, simile al nostro Sole per massa e luminosità.',
      en: 'The primary binary system of the Centauri trio, strikingly similar to our Sun in mass and glow.',
    },
    exoplanets: ['Alpha Centauri'],
    icon: '🌟',
  },
  {
    key: 'Trappist1',
    starKey: 'Trappist1',
    name: { it: 'TRAPPIST-1', en: 'TRAPPIST-1' },
    starType: 'M8V (Nana Ultra-Fredda)',
    distLY: 39.46,
    planetsCount: 7,
    habitableCount: 3,
    tag: 'habitable',
    desc: {
      it: 'Famoso sistema compatto con 7 pianeti rocciosi di dimensioni terrestri, di cui 3 nella zona abitabile (e, f, g).',
      en: 'Famous compact system with 7 Earth-sized rocky planets, 3 of which reside in the habitable zone (e, f, g).',
    },
    exoplanets: ['TRAPPIST-1 b', 'c', 'd', 'e (Abitabile)', 'f (Abitabile)', 'g (Abitabile)', 'h'],
    icon: '🪐',
  },
  {
    key: 'BarnardsStar',
    starKey: 'BarnardsStar',
    name: { it: 'Stella di Barnard', en: "Barnard's Star" },
    starType: 'M4.0V (Nana Rossa)',
    distLY: 5.96,
    planetsCount: 3,
    habitableCount: 0,
    tag: 'nearby',
    desc: {
      it: 'Celebre per il suo moto proprio elevato. Ospita pianeti di piccola massa confermati da ESPRESSO.',
      en: 'Renowned for its high proper motion, hosting sub-Earth mass planets confirmed by ESPRESSO.',
    },
    exoplanets: ['Barnard b', 'Barnard c', 'Barnard d'],
    icon: '✨',
  },
  {
    key: 'Ross128',
    starKey: 'Ross128',
    name: { it: 'Ross 128', en: 'Ross 128' },
    starType: 'M4.0V (Nana Rossa Inattiva)',
    distLY: 11.03,
    planetsCount: 1,
    habitableCount: 1,
    tag: 'habitable',
    desc: {
      it: 'Una nana rossa tranquilla con rare eruzioni, ideale per la conservazione dell’atmosfera su Ross 128 b.',
      en: 'A quiescent red dwarf with minimal flare activity, promising for atmosphere retention on Ross 128 b.',
    },
    exoplanets: ['Ross 128 b (Temperato)'],
    icon: '🌍',
  },
  {
    key: 'Kepler186',
    starKey: 'Kepler186',
    name: { it: 'Kepler-186', en: 'Kepler-186' },
    starType: 'M1V (Nana Rossa)',
    distLY: 582,
    planetsCount: 5,
    habitableCount: 1,
    tag: 'habitable',
    desc: {
      it: 'Ospita Kepler-186 f, il primo esopianeta di dimensioni terrestri scoperto nella zona abitabile di un’altra stella.',
      en: 'Home to Kepler-186 f, the first Earth-sized exoplanet discovered in another star’s habitable zone.',
    },
    exoplanets: ['Kepler-186 f (Terra Gemella)', 'b', 'c', 'd', 'e'],
    icon: '💎',
  },
  {
    key: 'TauCeti',
    starKey: 'TauCeti',
    name: { it: 'Tau Ceti', en: 'Tau Ceti' },
    starType: 'G8.5V (Analogo Solare)',
    distLY: 11.9,
    planetsCount: 4,
    habitableCount: 2,
    tag: 'habitable',
    desc: {
      it: 'Singola stella solare vicina circondata da un denso disco di polvere e multipli candidati planetari.',
      en: 'Single solar-analog star nearby, surrounded by a dense debris disk and multiple exoplanets.',
    },
    exoplanets: ['Tau Ceti e', 'Tau Ceti f', 'g', 'h'],
    icon: '🌞',
  },
  {
    key: 'Sirius',
    starKey: 'Sirius',
    name: { it: 'Sirio A & B', en: 'Sirius A & B' },
    starType: 'A1V / DA2 (Binaria Bianca)',
    distLY: 8.6,
    planetsCount: 0,
    habitableCount: 0,
    tag: 'binary',
    desc: {
      it: 'La stella più luminosa del cielo notturno, con una compagna nana bianca densissima (Sirio B).',
      en: 'The brightest star in the night sky, accompanied by a dense white dwarf companion (Sirius B).',
    },
    exoplanets: [],
    icon: '⭐',
  },
  {
    key: 'Vega',
    starKey: 'Vega',
    name: { it: 'Vega', en: 'Vega' },
    starType: 'A0Va (Bianco-Azzurra)',
    distLY: 25.04,
    planetsCount: 0,
    habitableCount: 0,
    tag: 'nearby',
    desc: {
      it: 'Rotatore ultra-rapido con disco protoplanetario di polveri, vertice del Triangolo Estivo.',
      en: 'Rapid rotator with a prominent debris ring, apex of the Summer Triangle.',
    },
    exoplanets: [],
    icon: '💠',
  },
  {
    key: 'Betelgeuse',
    starKey: 'Betelgeuse',
    name: { it: 'Betelgeuse', en: 'Betelgeuse' },
    starType: 'M1-M2Ia-ab (Supergigante Rossa)',
    distLY: 642.5,
    planetsCount: 0,
    habitableCount: 0,
    tag: 'giant',
    desc: {
      it: 'Supergigante rossa titanica nella costellazione di Orione, destinata a esplodere come supernova.',
      en: 'Titanic red supergiant in Orion, destined to end its life in a brilliant supernova.',
    },
    exoplanets: [],
    icon: '🔥',
  },
];

export class SystemsExplorer {
  constructor(options = {}) {
    this.allBodies = options.allBodies || [];
    this.onWarpJump = options.onWarpJump || (() => {});
    this.onInspectSystem = options.onInspectSystem || (() => {});
    this.currentFilter = 'all';
    this.modalEl = null;
  }

  setBodies(bodies) {
    this.allBodies = bodies;
  }

  open() {
    if (!this.modalEl) {
      this._buildModal();
    }
    this.modalEl.style.display = 'flex';
    this._renderCards();
    soundManager.whoosh(280);
  }

  close() {
    if (this.modalEl) {
      this.modalEl.style.display = 'none';
    }
  }

  toggle() {
    if (this.modalEl && this.modalEl.style.display === 'flex') {
      this.close();
    } else {
      this.open();
    }
  }

  _buildModal() {
    this.modalEl = document.createElement('div');
    this.modalEl.id = 'systemsExplorerModal';
    this.modalEl.className = 'systems-modal-overlay';
    this.modalEl.setAttribute('role', 'dialog');
    this.modalEl.setAttribute('aria-modal', 'true');

    this.modalEl.innerHTML = `
      <div class="systems-modal-card">
        <div class="systems-modal-header">
          <div class="systems-badge">🌌 ESPLORATORE SISTEMI STELLARI & ESOPIANETI</div>
          <button class="systems-close" id="systemsCloseBtn" aria-label="Chiudi">✕</button>
        </div>

        <div class="systems-intro">
          <h2 class="systems-main-title">Mondi Alieni & Sistemi Stellari Vicini</h2>
          <p class="systems-main-desc">
            Esplora le stelle della nostra galassia e salta a velocità iperluce verso i sistemi con esopianeti rocciosi e zone abitabili.
          </p>
        </div>

        <div class="systems-filter-bar">
          <button class="systems-filter-btn active" data-filter="all">Tutti (${STAR_SYSTEMS.length})</button>
          <button class="systems-filter-btn" data-filter="habitable">🌿 Con Pianeti Abitabili</button>
          <button class="systems-filter-btn" data-filter="nearby">🚀 Vicini (< 15 ly)</button>
          <button class="systems-filter-btn" data-filter="binary">⭐ Binarie & Giganti</button>
        </div>

        <div class="systems-grid" id="systemsGrid"></div>
      </div>
    `;

    document.body.appendChild(this.modalEl);

    document.getElementById('systemsCloseBtn')?.addEventListener('click', () => this.close());
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });

    const filterBtns = this.modalEl.querySelectorAll('.systems-filter-btn');
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilter = btn.getAttribute('data-filter') || 'all';
        this._renderCards();
      });
    });
  }

  _renderCards() {
    const grid = document.getElementById('systemsGrid');
    if (!grid) return;

    const lang = getLang() === 'it' ? 'it' : 'en';
    const filtered = STAR_SYSTEMS.filter((sys) => {
      if (this.currentFilter === 'habitable') return sys.habitableCount > 0;
      if (this.currentFilter === 'nearby') return sys.distLY > 0 && sys.distLY < 15;
      if (this.currentFilter === 'binary') return sys.tag === 'binary' || sys.tag === 'giant';
      return true;
    });

    grid.innerHTML = filtered
      .map((sys) => {
        const title = sys.name[lang] || sys.name.it;
        const desc = sys.desc[lang] || sys.desc.it;
        const distStr = sys.distLY === 0 ? '0 ly (Sole)' : `${sys.distLY} ly`;

        const badges = [];
        if (sys.habitableCount > 0) {
          badges.push(
            `<span class="sys-chip chip-habitable">🌿 ${sys.habitableCount} Abitabili</span>`
          );
        }
        if (sys.planetsCount > 0) {
          badges.push(`<span class="sys-chip chip-planets">🪐 ${sys.planetsCount} Pianeti</span>`);
        } else {
          badges.push(`<span class="sys-chip chip-star">✨ Stella Singola</span>`);
        }

        return `
        <div class="system-card" data-key="${escapeHtml(sys.key)}">
          <div class="system-card-top">
            <span class="system-card-icon">${escapeHtml(sys.icon)}</span>
            <div class="system-card-title-wrap">
              <h3 class="system-card-name">${escapeHtml(title)}</h3>
              <span class="system-card-spec">${escapeHtml(sys.starType)} • ${escapeHtml(
                distStr
              )}</span>
            </div>
          </div>

          <div class="system-card-chips">
            ${badges.join('')}
          </div>

          <p class="system-card-desc">${escapeHtml(desc)}</p>

          <div class="system-card-footer" style="display:flex;gap:8px;justify-content:flex-end;">
            <button class="inspect-sys-btn" data-syskey="${escapeHtml(
              sys.key
            )}" style="padding:8px 14px;background:rgba(91,196,207,0.15);border:1px solid #5bc4cf;color:#5bc4cf;border-radius:10px;font-weight:700;font-size:0.8rem;cursor:pointer;transition:all 0.2s;">
              🔍 Vista 3D Sistema
            </button>
            <button class="warp-btn" data-starkey="${escapeHtml(
              sys.starKey
            )}" data-sysname="${escapeHtml(title)}" data-syskey="${escapeHtml(sys.key)}">
              🚀 Salto Warp
            </button>
          </div>
        </div>
      `;
      })
      .join('');

    grid.querySelectorAll('.inspect-sys-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const sysKey = e.currentTarget.getAttribute('data-syskey');
        this.close();
        this.onInspectSystem(sysKey);
      });
    });

    grid.querySelectorAll('.warp-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const starKey = e.currentTarget.getAttribute('data-starkey');
        const sysName = e.currentTarget.getAttribute('data-sysname');
        const sysKey = e.currentTarget.getAttribute('data-syskey');
        this._executeWarp(starKey, sysName, sysKey);
      });
    });
  }

  _executeWarp(starKey, sysName, sysKey) {
    this.close();

    // Trigger Hyperspace Warp Jump cinematic audio
    soundManager.warpJump();

    // Trigger visual hyperspace warp flash overlay
    let flash = document.getElementById('warpFlashOverlay');
    if (!flash) {
      flash = document.createElement('div');
      flash.id = 'warpFlashOverlay';
      flash.setAttribute('aria-hidden', 'true');
      document.body.appendChild(flash);
    }
    flash.classList.remove('warp-flash-active');
    // Force reflow
    void flash.offsetWidth;
    flash.classList.add('warp-flash-active');
    setTimeout(() => {
      flash.classList.remove('warp-flash-active');
    }, 1250);

    const starBody =
      this.allBodies.find((b) => b.key === starKey || b.label === starKey || b.name === starKey) ||
      (starKey === 'Sun' ? this.allBodies.find((b) => b.key === 'Sun') : null);

    if (starBody) {
      if (sysKey) {
        this.onWarpJump(starBody, sysKey);
      } else {
        this.onWarpJump(starBody);
      }
      toast.success(`Salto Warp completato: destinazione ${sysName}!`, 3500);
    } else {
      toast.info(`Rotta impostata su ${sysName}`);
    }
  }
}
