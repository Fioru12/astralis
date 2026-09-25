/**
 * @file flightCockpit.js
 * @description Interfaccia di Viaggio da Navetta Spaziale (Cockpit HUD & Warp Flight Screen).
 * Fornisce un'esperienza immersiva con HUD di pilotaggio, effetto strisce di stelle a velocità iperluce,
 * telemetria in tempo reale e avanzamento continuo della data di volo.
 */

import { escapeHtml } from '../utils/sanitize.js';
import { soundManager } from '../core/soundManager.js';
import { toast } from './toast.js';
import { getLang, t } from '../i18n/index.js';
import { getBodyLabel } from '../data/celestialData.js';

export class FlightCockpit {
  constructor() {
    this.overlay = null;
    this.canvas = null;
    this.ctx = null;
    this.animHandler = null;
    this.stars = [];
    this.active = false;
    this.paused = false;

    this.originBody = null;
    this.targetBody = null;
    this.craft = null;
    this.totalDays = 0;
    this.arrivalDate = null;
    this.startDate = null;

    this.progress = 0; // 0 to 1
    this.flightDurationSec = 6; // Durata animata dell'esperienza HUD di volo in secondi
    this.startTime = 0;
    this.onComplete = null;
    this.onProgress = null;
    this.onCancel = null;
  }

  startFlight(options = {}) {
    this.originBody = options.originBody || { label: 'Terra', icon: '🌍' };
    this.targetBody = options.targetBody || { label: 'Marte', icon: '🔴' };
    this.craft = options.craft || { name: 'Parker Solar Probe', speedKmh: 692000, icon: '☀️' };
    this.totalDays = options.totalDays || 180;
    this.arrivalDate = options.arrivalDate || new Date(Date.now() + this.totalDays * 86400 * 1000);
    this.startDate = new Date();

    this.onComplete = options.onComplete || (() => {});
    this.onProgress = options.onProgress || (() => {});
    this.onCancel = options.onCancel || (() => {});

    // Scala la durata dell'animazione cockpit in base alla distanza (da 5s a 12s max)
    this.flightDurationSec = Math.min(
      12,
      Math.max(5, Math.log10(Math.max(1, this.totalDays)) * 2.5 + 4)
    );

    this._buildDOM();
    this._initStars();
    this.active = true;
    this.paused = false;
    this.progress = 0;
    this.startTime = performance.now();

    soundManager.warpJump();
    this._animate();
  }

  _buildDOM() {
    if (this.overlay) {
      this.overlay.remove();
    }

    this.overlay = document.createElement('div');
    this.overlay.id = 'flightCockpitOverlay';
    this.overlay.setAttribute('role', 'dialog');
    this.overlay.setAttribute('aria-label', t('cockpit_title'));

    Object.assign(this.overlay.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '10000',
      background: '#02040a',
      color: '#e4eaf8',
      fontFamily: "'Space Grotesk', system-ui, sans-serif",
      overflow: 'hidden',
      userSelect: 'none',
      display: 'flex',
      flexDirection: 'column',
      justify: 'space-between',
    });

    const lang = getLang();
    const locale = lang === 'it' ? 'it-IT' : 'en-US';
    const craftName = escapeHtml(
      (typeof this.craft.name === 'string' ? this.craft.name : this.craft.name?.[lang]) ||
        t('cockpit_craft_default')
    );
    const originLabel = escapeHtml(
      getBodyLabel(this.originBody, lang) || this.originBody.name || t('cockpit_point_a')
    );
    const targetLabel = escapeHtml(
      getBodyLabel(this.targetBody, lang) || this.targetBody.name || t('cockpit_point_b')
    );
    const speedStr = this.craft.speedKmh
      ? `${Math.round(this.craft.speedKmh).toLocaleString(locale)} km/h`
      : t('cockpit_rel');

    this.overlay.innerHTML = `
      <!-- Canvas Strisce Stellari (Tunnel Iperspazio) -->
      <canvas id="cockpitWarpCanvas" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;"></canvas>

      <!-- Vignettatura & Trame Vetro Cockpit -->
      <div style="position:absolute;inset:0;pointer-events:none;z-index:2;background:radial-gradient(circle at center, transparent 40%, rgba(2,6,16,0.85) 100%);box-shadow:inset 0 0 100px rgba(91,196,207,0.15);"></div>

      <!-- Cornici Mirino Cockpit / HUD Lines -->
      <div style="position:absolute;inset:20px;border:1px dashed rgba(91,196,207,0.25);pointer-events:none;z-index:3;border-radius:16px;"></div>
      <div style="position:absolute;top:30px;left:30px;font-size:16px;color:#5bc4cf;z-index:3;font-family:monospace;">┌ NAV_HUD v2.4</div>
      <div style="position:absolute;top:30px;right:30px;font-size:16px;color:#5bc4cf;z-index:3;font-family:monospace;">┐ ENGINE: ACTIVE</div>
      <div style="position:absolute;bottom:30px;left:30px;font-size:16px;color:#5bc4cf;z-index:3;font-family:monospace;">└ SYS: NOMINAL</div>
      <div style="position:absolute;bottom:30px;right:30px;font-size:16px;color:#5bc4cf;z-index:3;font-family:monospace;">┘ WARP_DRIVE</div>

      <!-- Mirino Centrale di Pilotaggio -->
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;z-index:3;text-align:center;">
        <div style="width:120px;height:120px;border:1px solid rgba(91,196,207,0.4);border-radius:50%;margin:0 auto;display:flex;align-items:center;justify-content:center;box-shadow:0 0 30px rgba(91,196,207,0.2);">
          <div style="width:12px;height:12px;background:#5bc4cf;border-radius:50%;box-shadow:0 0 15px #5bc4cf;"></div>
        </div>
        <div style="font-size:10px;letter-spacing:2px;color:rgba(91,196,207,0.7);margin-top:8px;font-weight:700;">TARGET LOCK ON ${targetLabel.toUpperCase()}</div>
      </div>

      <!-- Intestazione Telemetria Superiore -->
      <div style="position:relative;z-index:4;padding:24px 36px;display:flex;justify-content:space-between;align-items:center;background:linear-gradient(180deg, rgba(8,14,30,0.9), transparent);">
        <div style="display:flex;align-items:center;gap:14px;">
          <span style="font-size:28px;">${this.craft.icon || '🛸'}</span>
          <div>
            <div style="font-size:11px;font-weight:700;color:#5bc4cf;letter-spacing:1px;text-transform:uppercase;">${t(
              'cockpit_header'
            )}</div>
            <div style="font-size:18px;font-weight:800;color:#ffffff;">${craftName}</div>
          </div>
        </div>

        <div style="display:flex;align-items:center;gap:20px;background:rgba(8,16,36,0.75);padding:10px 20px;border-radius:12px;border:1px solid rgba(91,196,207,0.3);backdrop-filter:blur(10px);">
          <div style="text-align:right;">
            <div style="font-size:10px;color:rgba(228,234,248,0.5);text-transform:uppercase;">${t(
              'cockpit_origin'
            )}</div>
            <div style="font-size:14px;font-weight:700;color:#e4eaf8;">${
              this.originBody.icon || '📍'
            } ${originLabel}</div>
          </div>
          <div style="font-size:18px;color:#5bc4cf;">➔</div>
          <div>
            <div style="font-size:10px;color:rgba(228,234,248,0.5);text-transform:uppercase;">${t(
              'cockpit_dest'
            )}</div>
            <div style="font-size:14px;font-weight:700;color:#50fa7b;">${
              this.targetBody.icon || '🎯'
            } ${targetLabel}</div>
          </div>
        </div>
      </div>

      <!-- Dashboard Telemetria Inferiore & Barra Progresso -->
      <div style="position:relative;z-index:4;padding:24px 36px 30px;background:linear-gradient(0deg, rgba(8,14,30,0.95), transparent);">
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:14px;margin-bottom:16px;">
          <div style="background:rgba(255,255,255,0.04);padding:12px 16px;border-radius:10px;border-left:3px solid #5bc4cf;backdrop-filter:blur(8px);">
            <span style="font-size:10px;color:rgba(228,234,248,0.5);text-transform:uppercase;font-weight:700;">${t(
              'cockpit_speed'
            )}</span>
            <div style="font-size:16px;font-weight:800;color:#5bc4cf;margin-top:2px;" id="cockpitSpeedVal">⚡ ${speedStr}</div>
          </div>

          <div style="background:rgba(255,255,255,0.04);padding:12px 16px;border-radius:10px;border-left:3px solid #ffaa00;backdrop-filter:blur(8px);">
            <span style="font-size:10px;color:rgba(228,234,248,0.5);text-transform:uppercase;font-weight:700;">${t(
              'cockpit_date'
            )}</span>
            <div style="font-size:15px;font-weight:800;color:#ffdd44;margin-top:2px;" id="cockpitDateVal">📅 --</div>
          </div>

          <div style="background:rgba(255,255,255,0.04);padding:12px 16px;border-radius:10px;border-left:3px solid #50fa7b;backdrop-filter:blur(8px);">
            <span style="font-size:10px;color:rgba(228,234,248,0.5);text-transform:uppercase;font-weight:700;">${t(
              'cockpit_progress'
            )}</span>
            <div style="font-size:16px;font-weight:800;color:#50fa7b;margin-top:2px;" id="cockpitPctVal">0%</div>
          </div>
        </div>

        <!-- Barra di Progresso Animata -->
        <div style="width:100%;height:10px;background:rgba(255,255,255,0.1);border-radius:5px;overflow:hidden;margin-bottom:18px;box-shadow:inset 0 0 8px rgba(0,0,0,0.5);">
          <div id="cockpitProgressBar" style="width:0%;height:100%;background:linear-gradient(90deg, #5bc4cf, #50fa7b);transition:width 0.1s linear;box-shadow:0 0 15px #5bc4cf;"></div>
        </div>

        <!-- Controlli Volo del Cockpit -->
        <div style="display:flex;gap:12px;justify-content:center;align-items:center;">
          <button id="cockpitPauseBtn" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);color:#e4eaf8;padding:10px 18px;border-radius:8px;cursor:pointer;font-size:12.5px;font-weight:700;display:inline-flex;align-items:center;gap:6px;">
            ${t('cockpit_pause')}
          </button>
          <button id="cockpitSkipBtn" style="background:linear-gradient(135deg,#5bc4cf,#3ab0be);border:none;color:#040a14;padding:11px 24px;border-radius:8px;cursor:pointer;font-size:13.5px;font-weight:800;box-shadow:0 0 20px rgba(91,196,207,0.4);display:inline-flex;align-items:center;gap:6px;">
            ${t('cockpit_skip')}
          </button>
          <button id="cockpitAbortBtn" style="background:rgba(255,85,85,0.15);border:1px solid rgba(255,85,85,0.3);color:#ff6666;padding:10px 18px;border-radius:8px;cursor:pointer;font-size:12.5px;font-weight:700;">
            ${t('cockpit_abort')}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(this.overlay);
    this.canvas = this.overlay.querySelector('#cockpitWarpCanvas');
    this.ctx = this.canvas.getContext('2d');
    this._resizeCanvas();
    window.addEventListener('resize', () => this._resizeCanvas());

    this.overlay.querySelector('#cockpitSkipBtn').onclick = () => this._finishFlight(true);
    this.overlay.querySelector('#cockpitPauseBtn').onclick = (e) => {
      this.paused = !this.paused;
      e.target.textContent = this.paused ? t('resume') : t('cockpit_pause');
    };
    this.overlay.querySelector('#cockpitAbortBtn').onclick = () => this._abortFlight();
  }

  _resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  _initStars() {
    this.stars = [];
    const count = 300;
    const w = window.innerWidth;
    const h = window.innerHeight;
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: (Math.random() - 0.5) * w * 2,
        y: (Math.random() - 0.5) * h * 2,
        z: Math.random() * w,
        pz: Math.random() * w,
        size: 0.5 + Math.random() * 2,
      });
    }
  }

  _animate() {
    if (!this.active) return;

    if (!this.paused) {
      const now = performance.now();
      const elapsed = (now - this.startTime) / 1000;
      this.progress = Math.min(1.0, elapsed / this.flightDurationSec);

      // Calcola e aggiorna la data di volo interpolata
      const currentSimMs =
        this.startDate.getTime() + this.progress * (this.totalDays * 86400 * 1000);
      const currentSimDate = new Date(currentSimMs);

      const dateEl = this.overlay?.querySelector('#cockpitDateVal');
      const pctEl = this.overlay?.querySelector('#cockpitPctVal');
      const barEl = this.overlay?.querySelector('#cockpitProgressBar');

      if (dateEl) {
        dateEl.textContent = `📅 ${currentSimDate.toLocaleDateString(
          getLang() === 'it' ? 'it-IT' : 'en-US',
          {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }
        )}`;
      }
      if (pctEl) pctEl.textContent = `${Math.round(this.progress * 100)}%`;
      if (barEl) barEl.style.width = `${this.progress * 100}%`;

      if (this.onProgress) {
        this.onProgress(this.progress, currentSimDate);
      }

      if (this.progress >= 1.0) {
        this._finishFlight(false);
        return;
      }
    }

    // Render Canvas Strisce Stellari Iperspazio
    if (this.ctx && this.canvas) {
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.fillStyle = 'rgba(2, 4, 10, 0.4)';
      ctx.fillRect(0, 0, w, h);

      const speed = 25 + this.progress * 20;

      for (let i = 0; i < this.stars.length; i++) {
        const s = this.stars[i];
        s.z -= speed;
        if (s.z <= 0) {
          s.z = w;
          s.pz = w;
          s.x = (Math.random() - 0.5) * w * 2;
          s.y = (Math.random() - 0.5) * h * 2;
        }

        const k = 250 / s.z;
        const px = s.x * k + cx;
        const py = s.y * k + cy;

        const pk = 250 / (s.z + speed * 1.5);
        const ppx = s.x * pk + cx;
        const ppy = s.y * pk + cy;

        if (px >= 0 && px <= w && py >= 0 && py <= h) {
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(ppx, ppy);
          ctx.strokeStyle = '#5bc4cf';
          ctx.lineWidth = s.size * (1.5 - s.z / w);
          ctx.stroke();
        }
      }
    }

    this.animHandler = requestAnimationFrame(() => this._animate());
  }

  _finishFlight(skipped = false) {
    this.active = false;
    if (this.animHandler) cancelAnimationFrame(this.animHandler);

    if (this.overlay) {
      this.overlay.style.transition = 'opacity 0.5s ease';
      this.overlay.style.opacity = '0';
      setTimeout(() => {
        this.overlay?.remove();
        this.overlay = null;
      }, 500);
    }

    if (this.onComplete) {
      this.onComplete(skipped);
    }
  }

  _abortFlight() {
    this.active = false;
    if (this.animHandler) cancelAnimationFrame(this.animHandler);

    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }

    if (this.onCancel) {
      this.onCancel();
    }
    toast.info(t('cockpit_cancelled'));
  }
}

export const flightCockpit = new FlightCockpit();
