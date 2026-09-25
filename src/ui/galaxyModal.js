/**
 * @file galaxyModal.js
 * @description Dedicated Fullscreen Photorealistic Rotating Galaxy Map Screen.
 * Renders a crisp, high-DPI (Retina-ready) rotating view of the photorealistic Milky Way galaxy
 * powered by Three.js WebGL with anisotropic filtering and mipmapping to eliminate all graininess/pixelation.
 * Includes interactive dwarf satellite galaxies (LMC, SMC, Sagittarius Dwarf, Canis Major Dwarf, Fornax)
 * rendered as procedural star clusters & gas nebulae with astrophysics factsheets.
 */

import * as THREE from 'three';
import { getLang, t } from '../i18n/index.js';

const L = (localized) =>
  typeof localized === 'string' ? localized : localized?.[getLang()] ?? localized?.it;

export class GalaxyModal {
  constructor(options = {}) {
    this.onEnterSolarSystem = options.onEnterSolarSystem || (() => {});
    this.isOpen = false;
    this.modalEl = null;
    this.containerEl = null;
    this.overlayCanvas = null;
    this.overlayCtx = null;
    this.animationFrameId = null;

    // Three.js instances
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.galaxyMesh = null;
    this.starsPoints = null;

    this.rotationAngle = 0;
    this.rotationSpeed = 0.00012; // Extra slow, majestic cosmic rotation
    this.isPaused = false;
    this.showSatellites = true;
    this.hoveredSat = null;
    this.redDotPos = { x: 0, y: 0, r: 24 };
    this.sagittariusPos = { x: 0, y: 0, r: 26 };
    this.sagittariusModalEl = null;
    this.satelliteModalEl = null;
    this.satModalAnimId = null;

    // Satellite Galaxies of the Milky Way dataset (ordered strictly by distance from closest to furthest)
    this.satelliteGalaxies = [
      {
        id: 'cma_dwarf',
        name: { it: 'Galassia Nano del Cane Maggiore', en: 'Canis Major Dwarf Galaxy' },
        subtitle: {
          it: 'Galassia Nana Ellittica / Irregolare',
          en: 'Elliptical / Irregular Dwarf Galaxy',
        },
        dist: { it: '25.000 anni luce (dal Sole)', en: '25,000 light-years (from the Sun)' },
        stars: { it: '~1 Miliardo di stelle', en: '~1 Billion stars' },
        mass: '~1 × 10⁹ M☉',
        color: '#f59e0b',
        orbitRadiusRatio: 1.06,
        angle: 0.38,
        screenX: 0,
        screenY: 0,
        r: 25,
        details: {
          it: 'La galassia satellite in assoluto più vicina al Sistema Solare. Sta attraversando il disco galattico principale della Via Lattea proprio dietro la costellazione del Cane Maggiore.',
          en: 'The closest satellite galaxy to the Solar System. It is crossing the Milky Way’s main galactic disk right behind the Canis Major constellation.',
        },
      },
      {
        id: 'sgr_dsph',
        name: { it: 'Galassia Nano del Sagittario', en: 'Sagittarius Dwarf Galaxy' },
        subtitle: {
          it: 'Galassia Nano Sferoidale in Fusione',
          en: 'Merging Spheroidal Dwarf Galaxy',
        },
        dist: { it: '70.000 anni luce', en: '70.000 light-years' },
        stars: { it: '~1 Miliardo di stelle', en: '~1 Billion stars' },
        mass: '~4 × 10⁸ M☉',
        color: '#ec4899',
        orbitRadiusRatio: 1.18,
        angle: 5.1,
        screenX: 0,
        screenY: 0,
        r: 26,
        details: {
          it: 'Galassia in fase avanzata di marea ed assimilazione da parte del campo gravitazionale della Via Lattea. Le sue stelle stanno formando una colossale scia mareale attorno al disco galattico.',
          en: 'Galaxy in an advanced stage of tidal disruption and assimilation by the Milky Way’s gravitational field. Its stars are forming a colossal tidal stream around the galactic disk.',
        },
      },
      {
        id: 'lmc',
        name: { it: 'Grande Nube di Magellano (LMC)', en: 'Large Magellanic Cloud (LMC)' },
        subtitle: {
          it: 'Galassia Nana Magellanica (Irregolare / Spirale)',
          en: 'Magellanic Dwarf Galaxy (Irregular / Spiral)',
        },
        dist: { it: '163.000 anni luce', en: '163.000 light-years' },
        stars: { it: '~10 Miliardi di stelle', en: '~10 Billion stars' },
        mass: {
          it: '~1.38 × 10¹¹ M☉ (10% della Via Lattea)',
          en: '~1.38 × 10¹¹ M☉ (10% of the Milky Way)',
        },
        color: '#00f2fe',
        orbitRadiusRatio: 1.32,
        angle: 2.1,
        screenX: 0,
        screenY: 0,
        r: 28,
        details: {
          it: 'La più grande ed imponente galassia satellite della Via Lattea. Ospita la maestosa Nebulosa Tarantola (30 Doradus), la fucina stellare più gigantesca ed attiva di tutto il Gruppo Locale.',
          en: 'The largest and most imposing satellite galaxy of the Milky Way. Home to the majestic Tarantula Nebula (30 Doradus), the most gigantic and active stellar forge in the entire Local Group.',
        },
      },
      {
        id: 'smc',
        name: { it: 'Piccola Nube di Magellano (SMC)', en: 'Small Magellanic Cloud (SMC)' },
        subtitle: { it: 'Galassia Nana Irregolare', en: 'Irregular Dwarf Galaxy' },
        dist: { it: '200.000 anni luce', en: '200.000 light-years' },
        stars: { it: '~3 Miliardi di stelle', en: '~3 Billion stars' },
        mass: '~6.5 × 10⁹ M☉',
        color: '#a855f7',
        orbitRadiusRatio: 1.44,
        angle: 2.48,
        screenX: 0,
        screenY: 0,
        r: 26,
        details: {
          it: 'Galassia satellite nana ricca di gas e giovani ammassi stellari. È collegata alla Grande Nube di Magellano da un ponte idrodinamico di idrogeno neutro chiamato Ponte Magellanico.',
          en: 'Dwarf satellite galaxy rich in gas and young star clusters. It is linked to the Large Magellanic Cloud by a hydrodynamic bridge of neutral hydrogen called the Magellanic Bridge.',
        },
      },
      {
        id: 'fornax_dwarf',
        name: { it: 'Galassia Nano della Fornace', en: 'Fornax Dwarf Galaxy' },
        subtitle: {
          it: 'Galassia Nano Sferoidale dell Alone',
          en: 'Spheroidal Dwarf Galaxy of the Halo',
        },
        dist: { it: '460.000 anni luce', en: '460.000 light-years' },
        stars: { it: '~200 Milioni di stelle', en: '~200 Million stars' },
        mass: '~1.6 × 10⁸ M☉',
        color: '#10b981',
        orbitRadiusRatio: 1.52,
        angle: 3.85,
        screenX: 0,
        screenY: 0,
        r: 25,
        details: {
          it: 'Galassia sferoidale situata nell alone galattico esterno. Contiene ben 6 ammassi globulari propri ed un inusuale popolazione di stelle ricche di metalli.',
          en: 'Spheroidal galaxy in the outer galactic halo. It holds 6 of its own globular clusters and an unusual population of metal-rich stars.',
        },
      },
    ];

    // Build procedural star fields & gas nebulae for dwarf satellite galaxies
    this._initSatelliteStarFields();

    // High-definition photorealistic Milky Way spiral galaxy texture
    this.textureLoader = new THREE.TextureLoader();
    this.galaxyTexture = null;
    this._loadTexture();
  }

  /**
   * Generates deterministic star clusters & nebula clouds for dwarf satellite galaxies
   */
  _initSatelliteStarFields() {
    const makeRandom = (seed) => {
      let s = seed;
      return () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
      };
    };

    this.satelliteGalaxies.forEach((sat, satIndex) => {
      const rng = makeRandom(satIndex * 1337 + 42);
      sat.starField = [];
      sat.nebulaBlobs = [];

      if (sat.id === 'lmc') {
        // Large Magellanic Cloud: Irregular spiral bar + Tarantula Nebula
        sat.nebulaBlobs = [
          { dx: 0, dy: 0, r: 32, color: 'rgba(0, 242, 254, 0.38)' },
          { dx: -14, dy: 10, r: 24, color: 'rgba(59, 130, 246, 0.32)' },
          { dx: 16, dy: -12, r: 20, color: 'rgba(236, 72, 153, 0.70)' }, // Tarantula Nebula (30 Doradus)
          { dx: 22, dy: -16, r: 12, color: 'rgba(244, 114, 182, 0.55)' },
        ];

        for (let i = 0; i < 130; i++) {
          let dx, dy;
          if (i < 45) {
            dx = (rng() - 0.5) * 36;
            dy = (rng() - 0.5) * 16;
          } else if (i < 65) {
            dx = 16 + (rng() - 0.5) * 14;
            dy = -12 + (rng() - 0.5) * 14;
          } else {
            const ang = rng() * Math.PI * 2;
            const dist = Math.pow(rng(), 0.7) * 38;
            dx = Math.cos(ang) * dist;
            dy = Math.sin(ang) * dist;
          }

          const isHot = rng() < 0.35;
          const isMagenta = i >= 45 && i < 65;
          const color = isMagenta
            ? rng() < 0.6
              ? '#f472b6'
              : '#ffffff'
            : isHot
            ? rng() < 0.5
              ? '#00f2fe'
              : '#38bdf8'
            : rng() < 0.7
            ? '#ffffff'
            : '#a5f3fc';

          sat.starField.push({
            dx,
            dy,
            size: 0.7 + rng() * 2.1,
            color,
            alpha: 0.55 + rng() * 0.45,
            twinkleSpeed: 0.002 + rng() * 0.005,
            twinklePhase: rng() * Math.PI * 2,
          });
        }
      } else if (sat.id === 'smc') {
        // Small Magellanic Cloud: Irregular cloud + stream extension
        sat.nebulaBlobs = [
          { dx: 0, dy: 0, r: 26, color: 'rgba(168, 85, 247, 0.38)' },
          { dx: 14, dy: 14, r: 18, color: 'rgba(192, 132, 252, 0.28)' },
          { dx: 24, dy: 22, r: 12, color: 'rgba(0, 242, 254, 0.22)' },
        ];

        for (let i = 0; i < 100; i++) {
          let dx, dy;
          if (i < 30) {
            const t = rng();
            dx = t * 30;
            dy = t * 26 + (rng() - 0.5) * 8;
          } else {
            const ang = rng() * Math.PI * 2;
            const dist = Math.pow(rng(), 0.8) * 30;
            dx = Math.cos(ang) * dist;
            dy = Math.sin(ang) * dist;
          }

          const color =
            rng() < 0.4
              ? '#a855f7'
              : rng() < 0.7
              ? '#c084fc'
              : rng() < 0.85
              ? '#00f2fe'
              : '#ffffff';
          sat.starField.push({
            dx,
            dy,
            size: 0.6 + rng() * 2.0,
            color,
            alpha: 0.5 + rng() * 0.5,
            twinkleSpeed: 0.002 + rng() * 0.004,
            twinklePhase: rng() * Math.PI * 2,
          });
        }
      } else if (sat.id === 'sgr_dsph') {
        // Sagittarius Dwarf: Elongated tidal stream
        sat.nebulaBlobs = [
          { dx: 0, dy: 0, r: 28, color: 'rgba(236, 72, 153, 0.40)' },
          { dx: -18, dy: -6, r: 16, color: 'rgba(244, 114, 182, 0.25)' },
          { dx: 18, dy: 6, r: 16, color: 'rgba(244, 114, 182, 0.25)' },
        ];

        for (let i = 0; i < 90; i++) {
          const t = (rng() - 0.5) * 64;
          const dx = t;
          const dy = t * 0.3 + (rng() - 0.5) * (14 - Math.abs(t) * 0.15);

          const color = rng() < 0.45 ? '#ec4899' : rng() < 0.75 ? '#f472b6' : '#ffffff';
          sat.starField.push({
            dx,
            dy,
            size: 0.6 + rng() * 2.0,
            color,
            alpha: 0.5 + rng() * 0.5,
            twinkleSpeed: 0.003 + rng() * 0.005,
            twinklePhase: rng() * Math.PI * 2,
          });
        }
      } else if (sat.id === 'cma_dwarf') {
        // Canis Major Dwarf: Compact golden/orange elliptical cluster
        sat.nebulaBlobs = [
          { dx: 0, dy: 0, r: 24, color: 'rgba(245, 158, 11, 0.45)' },
          { dx: -8, dy: 4, r: 16, color: 'rgba(251, 191, 36, 0.30)' },
        ];

        for (let i = 0; i < 80; i++) {
          const ang = rng() * Math.PI * 2;
          const dist = Math.pow(rng(), 0.9) * 26;
          const dx = Math.cos(ang) * dist * 1.2;
          const dy = Math.sin(ang) * dist * 0.8;

          const color =
            rng() < 0.5
              ? '#f59e0b'
              : rng() < 0.8
              ? '#fbbf24'
              : rng() < 0.92
              ? '#f97316'
              : '#ffffff';
          sat.starField.push({
            dx,
            dy,
            size: 0.7 + rng() * 2.1,
            color,
            alpha: 0.55 + rng() * 0.45,
            twinkleSpeed: 0.002 + rng() * 0.004,
            twinklePhase: rng() * Math.PI * 2,
          });
        }
      } else if (sat.id === 'fornax_dwarf') {
        // Fornax Dwarf: Spheroidal emerald green cloud with 6 globular clusters
        sat.nebulaBlobs = [
          { dx: 0, dy: 0, r: 26, color: 'rgba(16, 185, 129, 0.40)' },
          { dx: 6, dy: -6, r: 18, color: 'rgba(52, 211, 153, 0.25)' },
        ];

        sat.globularClusters = [
          { dx: 14, dy: -10, name: 'Fornax 1' },
          { dx: -16, dy: 8, name: 'Fornax 2' },
          { dx: 8, dy: 16, name: 'Fornax 3' },
          { dx: -10, dy: -14, name: 'Fornax 4' },
          { dx: 18, dy: 12, name: 'Fornax 5' },
          { dx: -18, dy: -10, name: 'Fornax 6' },
        ];

        for (let i = 0; i < 85; i++) {
          const ang = rng() * Math.PI * 2;
          const dist = Math.pow(rng(), 0.8) * 28;
          const dx = Math.cos(ang) * dist;
          const dy = Math.sin(ang) * dist;

          const color =
            rng() < 0.45
              ? '#10b981'
              : rng() < 0.75
              ? '#34d399'
              : rng() < 0.9
              ? '#6ee7b7'
              : '#ffffff';
          sat.starField.push({
            dx,
            dy,
            size: 0.6 + rng() * 2.0,
            color,
            alpha: 0.5 + rng() * 0.5,
            twinkleSpeed: 0.002 + rng() * 0.004,
            twinklePhase: rng() * Math.PI * 2,
          });
        }
      }
    });
  }

  _loadTexture() {
    // WebP ottimizzato (~100KB) con fallback al JPG (~823KB) per browser datati.
    const apply = (texture) => {
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      this.galaxyTexture = texture;

      if (this.renderer && this.renderer.capabilities) {
        texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
        texture.needsUpdate = true;
      }
    };
    this.textureLoader.load('./milky_way_topdown.webp', apply, undefined, () =>
      this.textureLoader.load('./milky_way_topdown.jpg', apply)
    );
  }

  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this._buildModal();
    this._initThreeScene();
    this._startAnimation();
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this._closeSagittariusModal();
    this._closeSatelliteModal();
    this._disposeThree();

    if (this.modalEl) {
      this.modalEl.style.opacity = '0';
      setTimeout(() => {
        this.modalEl?.remove();
        this.modalEl = null;
      }, 300);
    }
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  _buildModal() {
    this.modalEl = document.createElement('div');
    this.modalEl.id = 'galaxyInteractiveModal';
    Object.assign(this.modalEl.style, {
      position: 'fixed',
      inset: '0',
      width: '100vw',
      height: '100vh',
      background: 'rgb(2, 4, 10)',
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
        <div style="background:rgba(8,12,24,0.85);backdrop-filter:blur(20px);padding:12px 20px;border-radius:16px;border:1px solid rgba(91,196,207,0.3);box-shadow:0 10px 30px rgba(0,0,0,0.6);pointer-events:auto;">
          <h1 style="margin:0;font-size:1.3rem;font-weight:800;background:linear-gradient(135deg,#eef2ff,#5bc4cf);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
            🌌 ${t('gal_title')}
          </h1>
          <div style="font-size:0.8rem;color:rgba(238,242,255,0.65);margin-top:2px;">
            ${t('gal_sub')}
          </div>
        </div>

        <div style="display:flex;align-items:center;gap:10px;pointer-events:auto;">
          <button id="toggleSatellitesBtn" style="background:rgba(8,12,24,0.85);backdrop-filter:blur(20px);border:1px solid rgba(91,196,207,0.3);color:#5bc4cf;padding:8px 14px;border-radius:12px;cursor:pointer;font-size:12px;font-weight:700;transition:all 0.2s;" title="${t(
            'gal_sat_title'
          )}">
            ${t('gal_sat_on')}
          </button>
          <button id="pauseRotationBtn" style="background:rgba(8,12,24,0.85);backdrop-filter:blur(20px);border:1px solid rgba(91,196,207,0.3);color:rgba(238,242,255,0.85);padding:8px 14px;border-radius:12px;cursor:pointer;font-size:12px;font-weight:600;transition:all 0.2s;" title="${t(
            'gal_pause_title'
          )}">
            ${t('gal_pause')}
          </button>
          <button id="galaxyModalClose" style="background:rgba(8,12,24,0.85);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.2);color:#fff;width:42px;height:42px;border-radius:50%;cursor:pointer;font-size:18px;transition:all 0.25s;" title="${t(
            'gal_close_title'
          )}">✕</button>
        </div>
      </div>

      <!-- WebGL & Overlay Container -->
      <div id="galaxyCanvasContainer" style="position:relative;width:100%;height:100%;flex:1;">
        <canvas id="galaxy2DOverlay" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:5;pointer-events:auto;cursor:default;"></canvas>
        
        <div id="galaxyTooltip" style="position:absolute;display:none;pointer-events:none;padding:8px 16px;background:rgba(255,34,68,0.95);color:#fff;border-radius:10px;font-size:12.5px;font-weight:800;box-shadow:0 0 24px rgba(255,34,68,0.8);transform:translate(-50%, -150%);white-space:nowrap;z-index:20;letter-spacing:0.5px;">
          ${t('gal_tip_solar')}
        </div>
      </div>

      <!-- Bottom Floating Action Bar -->
      <div style="position:absolute;bottom:24px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:20px;background:rgba(8,12,24,0.88);backdrop-filter:blur(24px);padding:10px 24px;border-radius:999px;border:1px solid rgba(91,196,207,0.35);box-shadow:0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(91,196,207,0.2);z-index:10;pointer-events:auto;">
        <span style="font-size:0.82rem;color:rgba(238,242,255,0.85);display:flex;align-items:center;gap:8px;">
          <span style="width:10px;height:10px;background:#f59e0b;border-radius:50%;box-shadow:0 0 10px #f59e0b;display:inline-block;"></span>
          <strong>${t(
            'gal_hud_center'
          )}</strong> <button id="hudSgrBtn" style="background:none;border:none;color:#f59e0b;font-weight:800;cursor:pointer;text-decoration:underline;padding:0;font-size:0.82rem;">${t(
      'gal_hud_bh'
    )}</button>
        </span>
        <span style="height:14px;width:1px;background:rgba(255,255,255,0.2);"></span>
        <span style="font-size:0.82rem;color:rgba(238,242,255,0.85);display:flex;align-items:center;gap:8px;">
          <span style="width:10px;height:10px;background:#ff2244;border-radius:50%;box-shadow:0 0 10px #ff2244;display:inline-block;"></span>
          <strong>${t('gal_hud_pos')}</strong> ${t('gal_hud_earth')}
        </span>
        <span style="height:14px;width:1px;background:rgba(255,255,255,0.2);"></span>
        <span style="font-size:0.82rem;color:#00f2fe;display:flex;align-items:center;gap:6px;font-weight:700;">
          ${t('gal_hud_sats')}
        </span>
        <button id="enterSolarSystemBtn" style="padding:8px 18px;background:linear-gradient(135deg,#5bc4cf,#3b82f6);border:none;border-radius:999px;color:#fff;font-weight:800;font-size:0.85rem;cursor:pointer;box-shadow:0 0 24px rgba(91,196,207,0.5);transition:all 0.25s;">
          ${t('gal_enter')}
        </button>
      </div>
    `;

    document.body.appendChild(this.modalEl);

    requestAnimationFrame(() => {
      if (this.modalEl) {
        this.modalEl.style.opacity = '1';
      }
    });

    this.containerEl = this.modalEl.querySelector('#galaxyCanvasContainer');
    this.overlayCanvas = this.modalEl.querySelector('#galaxy2DOverlay');
    this.overlayCtx = this.overlayCanvas.getContext('2d');
    const tooltip = this.modalEl.querySelector('#galaxyTooltip');
    const pauseBtn = this.modalEl.querySelector('#pauseRotationBtn');
    const satToggleBtn = this.modalEl.querySelector('#toggleSatellitesBtn');

    const triggerTravel = () => {
      this.close();
      this.onEnterSolarSystem();
    };

    pauseBtn.addEventListener('click', () => {
      this.isPaused = !this.isPaused;
      pauseBtn.textContent = this.isPaused ? t('gal_resume') : t('gal_pause');
    });

    satToggleBtn.addEventListener('click', () => {
      this.showSatellites = !this.showSatellites;
      satToggleBtn.textContent = this.showSatellites ? t('gal_sat_on') : t('gal_sat_off');
      satToggleBtn.style.color = this.showSatellites ? '#5bc4cf' : 'rgba(238,242,255,0.5)';
    });

    // Close handlers & HUD Sagittarius button
    this.modalEl.querySelector('#galaxyModalClose').addEventListener('click', () => this.close());
    this.modalEl.querySelector('#enterSolarSystemBtn').addEventListener('click', triggerTravel);
    this.modalEl
      .querySelector('#hudSgrBtn')
      .addEventListener('click', () => this._openSagittariusModal());

    // Overlay Canvas click & hover handlers
    this.overlayCanvas.addEventListener('mousemove', (e) => {
      const rect = this.overlayCanvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const distRed = Math.hypot(mouseX - this.redDotPos.x, mouseY - this.redDotPos.y);
      const distSgr = Math.hypot(mouseX - this.sagittariusPos.x, mouseY - this.sagittariusPos.y);

      // Check satellite galaxies hover if active
      let hoveredSat = null;
      if (this.showSatellites) {
        for (const sat of this.satelliteGalaxies) {
          const dSat = Math.hypot(mouseX - sat.screenX, mouseY - sat.screenY);
          if (dSat <= sat.r + 18) {
            hoveredSat = sat;
            break;
          }
        }
      }

      this.hoveredSat = hoveredSat;

      if (hoveredSat) {
        this.overlayCanvas.style.cursor = 'pointer';
        tooltip.style.display = 'block';
        tooltip.style.background = `rgba(12, 18, 34, 0.95)`;
        tooltip.style.border = `1px solid ${hoveredSat.color}`;
        tooltip.style.boxShadow = `0 0 24px ${hoveredSat.color}88`;
        tooltip.innerHTML = `<strong>${L(hoveredSat.name)}</strong> (${L(hoveredSat.dist)}) — ${t(
          'gal_tip_sat'
        )}`;
        tooltip.style.left = `${e.clientX}px`;
        tooltip.style.top = `${e.clientY}px`;
      } else if (distSgr <= this.sagittariusPos.r + 14) {
        this.overlayCanvas.style.cursor = 'pointer';
        tooltip.style.display = 'block';
        tooltip.style.background = 'rgba(245, 158, 11, 0.95)';
        tooltip.style.border = 'none';
        tooltip.style.boxShadow = '0 0 24px rgba(245, 158, 11, 0.8)';
        tooltip.innerHTML = t('gal_tip_sgr');
        tooltip.style.left = `${e.clientX}px`;
        tooltip.style.top = `${e.clientY}px`;
      } else if (distRed <= this.redDotPos.r + 14) {
        this.overlayCanvas.style.cursor = 'pointer';
        tooltip.style.display = 'block';
        tooltip.style.background = 'rgba(255, 34, 68, 0.95)';
        tooltip.style.border = 'none';
        tooltip.style.boxShadow = '0 0 24px rgba(255, 34, 68, 0.8)';
        tooltip.innerHTML = t('gal_tip_solar');
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

      const distRed = Math.hypot(mouseX - this.redDotPos.x, mouseY - this.redDotPos.y);
      const distSgr = Math.hypot(mouseX - this.sagittariusPos.x, mouseY - this.sagittariusPos.y);

      if (this.showSatellites) {
        for (const sat of this.satelliteGalaxies) {
          const dSat = Math.hypot(mouseX - sat.screenX, mouseY - sat.screenY);
          if (dSat <= sat.r + 20) {
            this._openSatelliteModal(sat);
            return;
          }
        }
      }

      if (distSgr <= this.sagittariusPos.r + 20) {
        this._openSagittariusModal();
      } else if (distRed <= this.redDotPos.r + 20) {
        triggerTravel();
      }
    });

    window.addEventListener('resize', (this._onResizeBound = () => this._handleResize()));
  }

  _openSatelliteModal(sat) {
    this._closeSatelliteModal();

    this.satelliteModalEl = document.createElement('div');
    this.satelliteModalEl.id = 'satelliteDetailModal';
    Object.assign(this.satelliteModalEl.style, {
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

    this.satelliteModalEl.innerHTML = `
      <div style="background:rgba(12,18,34,0.96);border:1px solid ${
        sat.color
      }77;box-shadow:0 0 50px ${
      sat.color
    }44, 0 20px 60px rgba(0,0,0,0.8);border-radius:24px;max-width:640px;width:100%;max-height:90vh;overflow-y:auto;padding:28px;color:#eef2ff;position:relative;">
        
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
          <div>
            <div style="font-size:0.75rem;letter-spacing:1px;font-weight:800;color:${
              sat.color
            };text-transform:uppercase;margin-bottom:4px;">
              ${t('gal_sat_eyebrow')}
            </div>
            <h2 style="margin:0;font-size:1.7rem;font-weight:900;background:linear-gradient(135deg,#ffffff,${
              sat.color
            });-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
              ${L(sat.name)}
            </h2>
            <div style="font-size:0.88rem;color:rgba(238,242,255,0.7);margin-top:2px;">
              ${L(sat.subtitle)}
            </div>
          </div>
          <button id="closeSatModal" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:16px;transition:all 0.2s;" title="${t(
            'close'
          )}">✕</button>
        </div>

        <!-- Live Star Cluster Preview Banner -->
        <div style="background:radial-gradient(circle at center, ${
          sat.color
        }25 0%, rgba(2,4,10,0.95) 80%);border-radius:16px;border:1px solid ${
      sat.color
    }45;padding:12px;text-align:center;margin-bottom:20px;position:relative;overflow:hidden;display:flex;flex-direction:column;align-items:center;">
          <canvas id="satModalCanvas" width="480" height="130" style="width:100%;max-width:480px;height:130px;border-radius:10px;"></canvas>
          <div style="font-size:0.75rem;color:rgba(238,242,255,0.75);margin-top:6px;font-weight:600;">
            ${t('gal_sat_preview')}
          </div>
        </div>

        <!-- Satellite Facts Grid -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:12px;margin-bottom:24px;">
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:12px 16px;">
            <div style="font-size:0.75rem;color:rgba(238,242,255,0.6);text-transform:uppercase;font-weight:600;">${t(
              'gal_sat_dist'
            )}</div>
            <div style="font-size:1.05rem;font-weight:800;color:${sat.color};margin-top:2px;">${L(
      sat.dist
    )}</div>
          </div>
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:12px 16px;">
            <div style="font-size:0.75rem;color:rgba(238,242,255,0.6);text-transform:uppercase;font-weight:600;">${t(
              'gal_sat_pop'
            )}</div>
            <div style="font-size:1.05rem;font-weight:800;color:#eef2ff;margin-top:2px;">${L(
              sat.stars
            )}</div>
          </div>
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:12px 16px;">
            <div style="font-size:0.75rem;color:rgba(238,242,255,0.6);text-transform:uppercase;font-weight:600;">${t(
              'gal_sat_mass'
            )}</div>
            <div style="font-size:1.05rem;font-weight:800;color:#5bc4cf;margin-top:2px;">${L(
              sat.mass
            )}</div>
          </div>
        </div>

        <!-- Description Card -->
        <div style="background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:18px;margin-bottom:24px;line-height:1.6;font-size:0.9rem;color:rgba(238,242,255,0.88);">
          <h3 style="margin:0 0 8px 0;font-size:1rem;color:${sat.color};font-weight:800;">${t(
      'gal_sat_features'
    )}</h3>
          <p style="margin:0;">${L(sat.details)}</p>
        </div>

        <div style="display:flex;justify-content:flex-end;">
          <button id="okSatBtn" style="padding:10px 24px;background:linear-gradient(135deg,${
            sat.color
          },#3b82f6);border:none;border-radius:12px;color:#fff;font-weight:800;font-size:0.9rem;cursor:pointer;box-shadow:0 0 20px ${
      sat.color
    }44;transition:all 0.2s;">
            ${t('gal_sat_close')}
          </button>
        </div>

      </div>
    `;

    document.body.appendChild(this.satelliteModalEl);

    requestAnimationFrame(() => {
      if (this.satelliteModalEl) {
        this.satelliteModalEl.style.opacity = '1';
      }
    });

    // Start Live Preview Canvas inside Satellite Modal
    const satCanvas = this.satelliteModalEl.querySelector('#satModalCanvas');
    if (satCanvas) {
      const sCtx = satCanvas.getContext('2d');
      const renderPreview = () => {
        if (!this.satelliteModalEl) return;
        const w = satCanvas.width;
        const h = satCanvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const time = performance.now();
        sCtx.clearRect(0, 0, w, h);

        // Deep space background glow
        const bgGrad = sCtx.createRadialGradient(cx, cy, 0, cx, cy, 140);
        bgGrad.addColorStop(0, `${sat.color}25`);
        bgGrad.addColorStop(1, 'rgba(2, 4, 10, 0.95)');
        sCtx.fillStyle = bgGrad;
        sCtx.fillRect(0, 0, w, h);

        // Draw nebula blobs
        if (sat.nebulaBlobs) {
          sat.nebulaBlobs.forEach((b) => {
            const bx = cx + b.dx * 2.4;
            const by = cy + b.dy * 2.4;
            const br = b.r * 2.4;
            const g = sCtx.createRadialGradient(bx, by, 0, bx, by, br);
            g.addColorStop(0, b.color);
            g.addColorStop(1, 'rgba(0,0,0,0)');
            sCtx.fillStyle = g;
            sCtx.beginPath();
            sCtx.arc(bx, by, br, 0, Math.PI * 2);
            sCtx.fill();
          });
        }

        // Draw globular clusters
        if (sat.globularClusters) {
          sat.globularClusters.forEach((gc) => {
            const gcx = cx + gc.dx * 2.4;
            const gcy = cy + gc.dy * 2.4;
            const g = sCtx.createRadialGradient(gcx, gcy, 0, gcx, gcy, 10);
            g.addColorStop(0, '#ffffff');
            g.addColorStop(0.4, sat.color);
            g.addColorStop(1, 'rgba(0,0,0,0)');
            sCtx.fillStyle = g;
            sCtx.beginPath();
            sCtx.arc(gcx, gcy, 10, 0, Math.PI * 2);
            sCtx.fill();
          });
        }

        // Draw star field
        if (sat.starField) {
          sat.starField.forEach((st) => {
            const sx = cx + st.dx * 2.4;
            const sy = cy + st.dy * 2.4;
            const tw = 0.7 + 0.3 * Math.sin(time * st.twinkleSpeed + st.twinklePhase);
            sCtx.save();
            sCtx.globalAlpha = st.alpha * tw;
            sCtx.fillStyle = st.color;
            sCtx.beginPath();
            sCtx.arc(sx, sy, st.size * 1.3, 0, Math.PI * 2);
            sCtx.fill();

            if (st.size >= 2.0) {
              sCtx.strokeStyle = st.color;
              sCtx.lineWidth = 0.9;
              sCtx.beginPath();
              sCtx.moveTo(sx - st.size * 3.2, sy);
              sCtx.lineTo(sx + st.size * 3.2, sy);
              sCtx.moveTo(sx, sy - st.size * 3.2);
              sCtx.lineTo(sx, sy + st.size * 3.2);
              sCtx.stroke();
            }
            sCtx.restore();
          });
        }

        this.satModalAnimId = requestAnimationFrame(renderPreview);
      };
      renderPreview();
    }

    const closeSat = () => this._closeSatelliteModal();
    this.satelliteModalEl.querySelector('#closeSatModal')?.addEventListener('click', closeSat);
    this.satelliteModalEl.querySelector('#okSatBtn')?.addEventListener('click', closeSat);
  }

  _closeSatelliteModal() {
    if (this.satModalAnimId) {
      cancelAnimationFrame(this.satModalAnimId);
      this.satModalAnimId = null;
    }
    if (this.satelliteModalEl) {
      this.satelliteModalEl.style.opacity = '0';
      const el = this.satelliteModalEl;
      this.satelliteModalEl = null;
      setTimeout(() => el.remove(), 300);
    }
  }

  _openSagittariusModal() {
    this._closeSagittariusModal();

    this.sagittariusModalEl = document.createElement('div');
    this.sagittariusModalEl.id = 'sagittariusDetailModal';
    Object.assign(this.sagittariusModalEl.style, {
      position: 'fixed',
      inset: '0',
      background: 'rgba(2, 4, 10, 0.85)',
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

    this.sagittariusModalEl.innerHTML = `
      <div style="background:rgba(12,18,34,0.96);border:1px solid rgba(245,158,11,0.45);box-shadow:0 0 50px rgba(245,158,11,0.25), 0 20px 60px rgba(0,0,0,0.8);border-radius:24px;max-width:680px;width:100%;max-height:90vh;overflow-y:auto;padding:28px;color:#eef2ff;position:relative;">
        
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;">
          <div>
            <div style="font-size:0.75rem;letter-spacing:1px;font-weight:800;color:#f59e0b;text-transform:uppercase;margin-bottom:4px;">
              COMPACT RADIO SOURCE • SUPERMASSIVE BLACK HOLE
            </div>
            <h2 style="margin:0;font-size:1.8rem;font-weight:900;background:linear-gradient(135deg,#ffffff,#f59e0b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
              SAGITTARIUS A (Sgr A)
            </h2>
            <div style="font-size:0.88rem;color:rgba(238,242,255,0.7);margin-top:2px;">
              ${t('gal_sgr_sub')}
            </div>
          </div>
          <button id="closeSgrModal" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:16px;transition:all 0.2s;" title="${t(
            'close'
          )}">✕</button>
        </div>

        <!-- Image / Event Horizon Telescope Banner -->
        <div style="background:radial-gradient(circle at center, rgba(245,158,11,0.25) 0%, rgba(2,4,10,0.95) 75%);border-radius:16px;border:1px solid rgba(245,158,11,0.35);padding:22px;text-align:center;margin-bottom:24px;position:relative;overflow:hidden;">
          <div style="font-size:1rem;font-weight:800;color:#f59e0b;">${t('gal_sgr_eht')}</div>
          <div style="font-size:0.82rem;color:rgba(238,242,255,0.7);margin-top:4px;">${t(
            'gal_sgr_eht_sub'
          )}</div>
        </div>

        <!-- Scientific Stats Grid -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:12px;margin-bottom:24px;">
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:12px 16px;">
            <div style="font-size:0.75rem;color:rgba(238,242,255,0.6);text-transform:uppercase;font-weight:600;">${t(
              'gal_sgr_mass'
            )}</div>
            <div style="font-size:1.05rem;font-weight:800;color:#f59e0b;margin-top:2px;">4,154,000 M☉</div>
            <div style="font-size:0.72rem;color:rgba(238,242,255,0.45);">(~8.26 × 10³⁶ kg)</div>
          </div>
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:12px 16px;">
            <div style="font-size:0.75rem;color:rgba(238,242,255,0.6);text-transform:uppercase;font-weight:600;">${t(
              'gal_sgr_dist'
            )}</div>
            <div style="font-size:1.05rem;font-weight:800;color:#5bc4cf;margin-top:2px;">${t(
              'gal_sgr_dist_val'
            )}</div>
            <div style="font-size:0.72rem;color:rgba(238,242,255,0.45);">(8,188 parsec)</div>
          </div>
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:12px 16px;">
            <div style="font-size:0.75rem;color:rgba(238,242,255,0.6);text-transform:uppercase;font-weight:600;">${t(
              'gal_sgr_schw'
            )}</div>
            <div style="font-size:1.05rem;font-weight:800;color:#a78bfa;margin-top:2px;">${t(
              'gal_sgr_schw_val'
            )}</div>
            <div style="font-size:0.72rem;color:rgba(238,242,255,0.45);">(~0.08 AU / < Mercurio)</div>
          </div>
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:12px 16px;">
            <div style="font-size:0.75rem;color:rgba(238,242,255,0.6);text-transform:uppercase;font-weight:600;">${t(
              'gal_sgr_const'
            )}</div>
            <div style="font-size:1.05rem;font-weight:800;color:#eef2ff;margin-top:2px;">${t(
              'gal_sgr_const_val'
            )}</div>
            <div style="font-size:0.72rem;color:rgba(238,242,255,0.45);">(AR 17h 45m / Dec -29°)</div>
          </div>
        </div>

        <!-- Detailed Scientific Description -->
        <div style="background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:18px;margin-bottom:24px;line-height:1.6;font-size:0.9rem;color:rgba(238,242,255,0.88);">
          <h3 style="margin:0 0 8px 0;font-size:1rem;color:#f59e0b;font-weight:800;">${t(
            'gal_sgr_desc_title'
          )}</h3>
          <p style="margin:0 0 10px 0;">
            <strong>Sagittarius A</strong> ${t('gal_sgr_p1')}
          </p>
          <p style="margin:0;">
            ${t('gal_sgr_p2')}
          </p>
        </div>

        <div style="display:flex;justify-content:flex-end;">
          <button id="okSgrBtn" style="padding:10px 24px;background:linear-gradient(135deg,#f59e0b,#d97706);border:none;border-radius:12px;color:#fff;font-weight:800;font-size:0.9rem;cursor:pointer;box-shadow:0 0 20px rgba(245,158,11,0.4);transition:all 0.2s;">
            ${t('gal_sgr_ok')}
          </button>
        </div>

      </div>
    `;

    document.body.appendChild(this.sagittariusModalEl);

    requestAnimationFrame(() => {
      if (this.sagittariusModalEl) {
        this.sagittariusModalEl.style.opacity = '1';
      }
    });

    const closeSgr = () => this._closeSagittariusModal();
    this.sagittariusModalEl.querySelector('#closeSgrModal')?.addEventListener('click', closeSgr);
    this.sagittariusModalEl.querySelector('#okSgrBtn')?.addEventListener('click', closeSgr);
  }

  _closeSagittariusModal() {
    if (this.sagittariusModalEl) {
      this.sagittariusModalEl.style.opacity = '0';
      const el = this.sagittariusModalEl;
      this.sagittariusModalEl = null;
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

    // Galaxy Plane Geometry with Custom Radial Alpha Shader for Seamless Deep Space Blending
    const size = Math.min(width, height) * 0.68;
    const geometry = new THREE.PlaneGeometry(size, size);

    if (this.galaxyTexture) {
      this.galaxyTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    }

    const galaxyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tGalaxy: { value: this.galaxyTexture },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tGalaxy;
        varying vec2 vUv;
        void main() {
          vec4 texColor = texture2D(tGalaxy, vUv);
          float dist = length(vUv - vec2(0.5));
          
          // Smooth radial fade out towards edges (starts fading at 0.32, fully transparent at 0.485)
          float alpha = 1.0 - smoothstep(0.32, 0.485, dist);
          
          gl_FragColor = vec4(texColor.rgb, texColor.a * alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
    });

    this.galaxyMesh = new THREE.Mesh(geometry, galaxyMaterial);
    this.scene.add(this.galaxyMesh);

    // Add crisp background star particles
    this._createBackgroundStarfield(width, height);
  }

  _createBackgroundStarfield(w, h) {
    const starCount = 600;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * w * 1.5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * h * 1.5;
      positions[i * 3 + 2] = -5; // Behind galaxy plane

      const col =
        Math.random() < 0.7
          ? [1, 1, 1]
          : Math.random() < 0.85
          ? [0.65, 0.55, 0.98]
          : [0.35, 0.76, 0.81];
      colors[i * 3] = col[0];
      colors[i * 3 + 1] = col[1];
      colors[i * 3 + 2] = col[2];
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });

    this.starsPoints = new THREE.Points(geometry, material);
    this.scene.add(this.starsPoints);
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

    if (this.galaxyMesh) {
      const size = Math.min(w, h) * 0.68;
      this.galaxyMesh.geometry.dispose();
      this.galaxyMesh.geometry = new THREE.PlaneGeometry(size, size);
    }
  }

  _startAnimation() {
    const render = () => {
      if (!this.isOpen) return;

      if (!this.isPaused && this.galaxyMesh) {
        this.rotationAngle += this.rotationSpeed;
        this.galaxyMesh.rotation.z = -this.rotationAngle; // Smooth clockwise rotation
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
    const size = Math.min(cssW, cssH) * 0.68;
    const time = performance.now();

    // Set Sagittarius A center position
    this.sagittariusPos.x = cx;
    this.sagittariusPos.y = cy;

    // Solar System Red Dot position in local texture space
    const solarDistance = (size / 2) * 0.54;
    const solarAngle = 0.85;
    const localX = Math.cos(solarAngle) * solarDistance;
    const localY = Math.sin(solarAngle) * solarDistance;

    const zRot = -this.rotationAngle;
    const cosR = Math.cos(zRot);
    const sinR = Math.sin(zRot);
    const worldX = localX * cosR - localY * sinR;
    const worldY = localX * sinR + localY * cosR;

    this.redDotPos.x = cx + worldX;
    this.redDotPos.y = cy - worldY;

    // Pulsing factor for beacons
    const pulse = 1 + Math.sin(time * 0.006) * 0.28;

    // 1. Draw Sagittarius A Center Glowing Yellow Beacon Button
    ctx.save();
    ctx.translate(cx, cy);

    ctx.beginPath();
    ctx.arc(0, 0, 20 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(245, 158, 11, 0.38)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, 11 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(245, 158, 11, 0.88)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();

    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
    ctx.shadowBlur = 8;
    ctx.fillText('SAGITTARIUS A (Centro Galattico)', cx + 18, cy + 5);
    ctx.shadowBlur = 0;

    // 2. Draw Red Dot Beacon for Solar System
    ctx.save();
    ctx.translate(this.redDotPos.x, this.redDotPos.y);

    ctx.beginPath();
    ctx.arc(0, 0, 20 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 34, 68, 0.38)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, 11 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 34, 68, 0.88)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();

    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = '#ff3355';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
    ctx.shadowBlur = 8;
    ctx.fillText('SISTEMA SOLARE (TERRA)', this.redDotPos.x + 18, this.redDotPos.y + 5);
    ctx.shadowBlur = 0;

    // 3. Draw Dwarf Satellite Galaxies of the Milky Way (Procedural Star Clusters & Nebulae)
    if (this.showSatellites) {
      this.satelliteGalaxies.forEach((sat) => {
        const satDist = (size / 2) * sat.orbitRadiusRatio;
        const satAngle = sat.angle;
        const sLocX = Math.cos(satAngle) * satDist;
        const sLocY = Math.sin(satAngle) * satDist;

        const sWorldX = sLocX * cosR - sLocY * sinR;
        const sWorldY = sLocX * sinR + sLocY * cosR;

        sat.screenX = cx + sWorldX;
        sat.screenY = cy - sWorldY;

        // Draw translucent orbit ellipse line
        ctx.beginPath();
        ctx.arc(cx, cy, satDist, 0, Math.PI * 2);
        ctx.strokeStyle = `${sat.color}28`;
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 7]);
        ctx.stroke();
        ctx.setLineDash([]);

        const isHovered = this.hoveredSat === sat;
        const satScale = isHovered ? 1.35 : 1.0;

        // A. Draw Nebula Gas & Dust Blobs
        if (sat.nebulaBlobs) {
          sat.nebulaBlobs.forEach((blob) => {
            const bWorldX = blob.dx * satScale * cosR - blob.dy * satScale * sinR;
            const bWorldY = blob.dx * satScale * sinR + blob.dy * satScale * cosR;
            const bSx = sat.screenX + bWorldX;
            const bSy = sat.screenY - bWorldY;
            const bRad = blob.r * satScale;

            const grad = ctx.createRadialGradient(bSx, bSy, 0, bSx, bSy, bRad);
            grad.addColorStop(0, blob.color);
            grad.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(bSx, bSy, bRad, 0, Math.PI * 2);
            ctx.fill();
          });
        }

        // B. Draw Globular Clusters (e.g. Fornax Dwarf)
        if (sat.globularClusters) {
          sat.globularClusters.forEach((gc) => {
            const gcWorldX = gc.dx * satScale * cosR - gc.dy * satScale * sinR;
            const gcWorldY = gc.dx * satScale * sinR + gc.dy * satScale * cosR;
            const gcSx = sat.screenX + gcWorldX;
            const gcSy = sat.screenY - gcWorldY;

            const gcGrad = ctx.createRadialGradient(gcSx, gcSy, 0, gcSx, gcSy, 6 * satScale);
            gcGrad.addColorStop(0, '#ffffff');
            gcGrad.addColorStop(0.4, sat.color);
            gcGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = gcGrad;
            ctx.beginPath();
            ctx.arc(gcSx, gcSy, 6 * satScale, 0, Math.PI * 2);
            ctx.fill();
          });
        }

        // C. Draw Individual Stars of Dwarf Galaxy
        if (sat.starField) {
          sat.starField.forEach((star) => {
            const stWorldX = star.dx * satScale * cosR - star.dy * satScale * sinR;
            const stWorldY = star.dx * satScale * sinR + star.dy * satScale * cosR;
            const stSx = sat.screenX + stWorldX;
            const stSy = sat.screenY - stWorldY;

            const tw = 0.7 + 0.3 * Math.sin(time * star.twinkleSpeed + star.twinklePhase);
            const alpha = star.alpha * tw;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = star.color;

            ctx.beginPath();
            ctx.arc(stSx, stSy, star.size * satScale, 0, Math.PI * 2);
            ctx.fill();

            // Cross diffraction spikes on bright stars
            if (star.size >= 2.0) {
              ctx.strokeStyle = star.color;
              ctx.lineWidth = 0.7 * satScale;
              ctx.beginPath();
              ctx.moveTo(stSx - star.size * 2.6 * satScale, stSy);
              ctx.lineTo(stSx + star.size * 2.6 * satScale, stSy);
              ctx.moveTo(stSx, stSy - star.size * 2.6 * satScale);
              ctx.lineTo(stSx, stSy + star.size * 2.6 * satScale);
              ctx.stroke();
            }
            ctx.restore();
          });
        }

        // D. Draw Bright Core Nucleus & Target Ring
        ctx.save();
        ctx.translate(sat.screenX, sat.screenY);

        ctx.beginPath();
        ctx.arc(0, 0, 10 * pulse * satScale, 0, Math.PI * 2);
        ctx.fillStyle = `${sat.color}44`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, 5 * pulse * satScale, 0, Math.PI * 2);
        ctx.fillStyle = `${sat.color}ee`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, 2.5 * satScale, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        if (isHovered) {
          ctx.beginPath();
          ctx.arc(0, 0, 36 * satScale, 0, Math.PI * 2);
          ctx.strokeStyle = sat.color;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([5, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        ctx.restore();

        // E. Satellite Text Label & Badge
        ctx.save();
        const labelX = sat.screenX + 24 * satScale;
        const labelY = sat.screenY + 4;

        ctx.font = 'bold 12px "Space Grotesk", sans-serif';
        ctx.fillStyle = sat.color;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
        ctx.shadowBlur = 10;
        ctx.fillText(L(sat.name), labelX, labelY);

        ctx.font = '500 10px sans-serif';
        ctx.fillStyle = 'rgba(238, 242, 255, 0.65)';
        ctx.fillText(`${t('gal_cluster_label')} (${L(sat.dist)})`, labelX, labelY + 14);
        ctx.shadowBlur = 0;

        ctx.restore();
      });
    }

    ctx.restore();
  }

  _disposeThree() {
    if (this._onResizeBound) {
      window.removeEventListener('resize', this._onResizeBound);
    }
    if (this.galaxyMesh) {
      this.galaxyMesh.geometry.dispose();
      if (this.galaxyMesh.material) {
        this.galaxyMesh.material.dispose();
      }
    }
    if (this.starsPoints) {
      this.starsPoints.geometry.dispose();
      if (this.starsPoints.material) {
        this.starsPoints.material.dispose();
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
