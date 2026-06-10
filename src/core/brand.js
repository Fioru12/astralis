/**
 * Astralis - Brand & microinterazioni
 */
import { soundManager } from './soundManager.js';

export const BRAND = {
  name: 'ASTRALIS',
  tagline: 'Esplora il cosmo, un\'orbita alla volta',
  taglineEn: 'Explore the cosmos, one orbit at a time',
  version: '2.0.0',
  year: 2026,
};

const ACH_KEY = 'solar-system.achievements';
const ACHIEVEMENTS = [
  { id: 'first_visit', icon: '🚀', name: 'Primo Contatto', desc: 'Hai avviato Astralis', xp: 10 },
  { id: 'explorer',     icon: '🧭', name: 'Esploratore',     desc: '5 corpi visitati', xp: 25 },
  { id: 'astronomer',   icon: '🔭', name: 'Astronomo',       desc: 'Tutti i pianeti visitati', xp: 50 },
  { id: 'time_traveler',icon: '⏰', name: 'Viaggiatore del Tempo', desc: '100 anni nel passato', xp: 30 },
  { id: 'quiz_master',  icon: '🎓', name: 'Maestro Spaziale',desc: 'Quiz completato al 100%', xp: 40 },
  { id: 'sandbox_builder', icon: '🧪', name: 'Costruttore',  desc: '5+ corpi nel sandbox', xp: 20 },
  { id: 'screenshot_pro', icon: '📷', name: 'Fotografo Cosmico', desc: '3 screenshot', xp: 15 },
  { id: 'konami',       icon: '🎮', name: 'Cheater',         desc: 'Konami Code trovato', xp: 50 },
  { id: 'galaxy_viewer',icon: '🌌', name: 'Cartografo',      desc: 'Mappa galattica attivata', xp: 25 },
  { id: 'night_owl',    icon: '🦉', name: 'Civetta Notturna',desc: 'Usato tra 0-5 di notte', xp: 15 },
];

class AchievementManager {
  constructor() { this.unlocked = this._load(); this.stats = this._loadStats(); }
  _load() { try { return JSON.parse(localStorage.getItem(ACH_KEY) || '[]'); } catch { return []; } }
  _loadStats() { try { return JSON.parse(localStorage.getItem(ACH_KEY + '.stats') || '{}'); } catch { return {}; } }
  _save() { try { localStorage.setItem(ACH_KEY, JSON.stringify(this.unlocked)); localStorage.setItem(ACH_KEY + '.stats', JSON.stringify(this.stats)); } catch (e) { void e; } }
  unlock(id) {
    if (this.unlocked.includes(id)) return null;
    const ach = ACHIEVEMENTS.find(a => a.id === id);
    if (!ach) return null;
    this.unlocked.push(id); this._save(); this._showToast(ach);
    soundManager.beep('success'); return ach;
  }
  track(event, value) {
    this.stats[event] = (this.stats[event] || 0) + (value || 1);
    this._save();
    if (event === 'body_visited') { if (this.stats.body_visited >= 5) this.unlock('explorer'); if (this.stats.body_visited >= 8) this.unlock('astronomer'); }
    if (event === 'screenshot' && this.stats.screenshot >= 3) this.unlock('screenshot_pro');
    if (event === 'sandbox_bodies' && value >= 5) this.unlock('sandbox_builder');
  }
  _showToast(ach) {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position: 'fixed', top: '80px', right: '20px', padding: '14px 20px', minWidth: '280px',
      background: 'linear-gradient(135deg, rgba(91,196,207,0.95), rgba(167,139,250,0.95))',
      backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '14px',
      color: '#000', fontWeight: '600', zIndex: '10001',
      transform: 'translateX(120%)', transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      display: 'flex', alignItems: 'center', gap: '12px',
      fontFamily: '"Space Grotesk", system-ui, sans-serif',
    });
    el.innerHTML = `<div style="font-size:2rem;">${ach.icon}</div>
      <div style="flex:1;"><div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;opacity:0.7;">Achievement Sbloccato!</div>
      <div style="font-size:14px;font-weight:800;">${ach.name}</div>
      <div style="font-size:11px;opacity:0.7;margin-top:2px;">+${ach.xp} XP</div></div>`;
    document.body.appendChild(el);
    requestAnimationFrame(() => { el.style.transform = 'translateX(0)'; });
    setTimeout(() => { el.style.transform = 'translateX(120%)'; setTimeout(() => el.remove(), 500); }, 4000);
  }
  getProgress() {
    return { unlocked: this.unlocked.length, total: ACHIEVEMENTS.length, xp: this.unlocked.reduce((s, id) => s + (ACHIEVEMENTS.find(a => a.id === id)?.xp || 0), 0) };
  }
  list() { return ACHIEVEMENTS; }
  getUnlocked() { return this.unlocked; }
}
export const achievements = new AchievementManager();

// Konami Code
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
class KonamiWatcher {
  constructor() { this.buffer = []; this.hyperspaceMode = false;
    window.addEventListener('keydown', (e) => { this.buffer.push(e.key); if (this.buffer.length > KONAMI.length) this.buffer.shift(); if (KONAMI.every((k, i) => this.buffer[i] === k)) { this._trigger(); this.buffer = []; } }); }
  _trigger() {
    achievements.unlock('konami');
    this.hyperspaceMode = !this.hyperspaceMode;
    if (this.hyperspaceMode) {
      document.documentElement.setAttribute('data-hyperspace', '1');
      const flash = document.createElement('div');
      Object.assign(flash.style, { position: 'fixed', inset: '0', background: '#fff', zIndex: '99999', pointerEvents: 'none', opacity: '0.9', transition: 'opacity 0.6s' });
      document.body.appendChild(flash);
      requestAnimationFrame(() => { flash.style.opacity = '0'; });
      setTimeout(() => flash.remove(), 600);
      soundManager.whoosh(120);
    } else {
      document.documentElement.removeAttribute('data-hyperspace');
    }
  }
}
export const konami = new KonamiWatcher();

// Splash Screen
const SPLASH_STAGES = [
  { pct: 0,   msg: 'Inizializzazione orbite...',         sub: 'Elementi kepleriani' },
  { pct: 15,  msg: 'Mappatura stelle vicine...',         sub: 'Catalogo HYG' },
  { pct: 30,  msg: 'Generazione asteroidi...',           sub: 'Fascia principale e Kuiper' },
  { pct: 50,  msg: 'Download texture planetarie...',     sub: 'NASA / Solar System Scope' },
  { pct: 70,  msg: 'Calcolo orbite comete...',           sub: '6 comete storiche' },
  { pct: 85,  msg: 'Compilazione shaders...',            sub: 'Bloom + ACES' },
  { pct: 95,  msg: 'Quasi pronti...',                    sub: 'Prepariamo l\'universo' },
  { pct: 100, msg: 'Benvenuto in Astralis',              sub: 'Premi un tasto per iniziare' },
];

export class SplashScreen {
  constructor() { this.el = null; }
  show() {
    if (this.el) return;
    this.el = document.createElement('div');
    this.el.id = 'splash';
    Object.assign(this.el.style, {
      position: 'fixed', inset: '0',
      background: 'radial-gradient(ellipse at center, #0a0e1f 0%, #000 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: '99999', fontFamily: '"Space Grotesk", system-ui, sans-serif',
    });
    this.el.innerHTML = `
      <div style="position:absolute;top:30px;left:30px;font-size:11px;color:rgba(255,255,255,0.4);letter-spacing:2px;">ASTRALIS v${BRAND.version}</div>
      <div style="width:120px;height:120px;margin-bottom:24px;filter:drop-shadow(0 0 40px rgba(91,196,207,0.5));">
        <img src="./astralis-logo.svg" alt="Astralis" style="width:100%;height:100%;animation: rotate 8s linear infinite;" />
      </div>
      <h1 style="margin:0 0 4px;font-size:2.4rem;font-weight:700;letter-spacing:-0.5px;background:linear-gradient(135deg,#5bc4cf 0%,#a78bfa 50%,#f59e0b 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">ASTRALIS</h1>
      <p style="margin:0 0 36px;font-size:13px;color:rgba(255,255,255,0.5);letter-spacing:0.5px;font-weight:300;">${BRAND.tagline}</p>
      <div style="width:280px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <span id="splashMsg" style="font-size:12px;color:rgba(255,255,255,0.8);font-weight:500;">Inizializzazione...</span>
          <span id="splashPct" style="font-size:12px;color:#5bc4cf;font-weight:700;font-family:'JetBrains Mono',monospace;">0%</span>
        </div>
        <div style="height:3px;background:rgba(255,255,255,0.08);border-radius:99px;overflow:hidden;">
          <div id="splashBar" style="height:100%;width:0%;background:linear-gradient(90deg,#5bc4cf,#a78bfa,#f59e0b);background-size:200% 100%;animation:shimmer 2s linear infinite;border-radius:99px;transition:width 0.4s ease;"></div>
        </div>
        <div id="splashSub" style="margin-top:8px;font-size:10.5px;color:rgba(255,255,255,0.4);text-align:center;letter-spacing:0.3px;">Sistema Solare 3D Interattivo</div>
      </div>`;
    document.body.appendChild(this.el);
    this.msgEl = this.el.querySelector('#splashMsg');
    this.percentEl = this.el.querySelector('#splashPct');
    this.barEl = this.el.querySelector('#splashBar');
    this.subEl = this.el.querySelector('#splashSub');
  }
  setProgress(pct) {
    if (!this.el) return;
    const stage = [...SPLASH_STAGES].reverse().find(s => pct >= s.pct) || SPLASH_STAGES[0];
    this.barEl.style.width = pct + '%';
    this.percentEl.textContent = Math.round(pct) + '%';
    this.msgEl.textContent = stage.msg;
    this.subEl.textContent = stage.sub;
  }
  hide() {
    if (!this.el) return;
    this.el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    this.el.style.opacity = '0'; this.el.style.transform = 'scale(1.05)';
    soundManager.whoosh(180);
    setTimeout(() => { this.el?.remove(); this.el = null; }, 850);
  }
}
export const splash = new SplashScreen();

// Watermark
export function createWatermark() {
  const el = document.createElement('div');
  el.id = 'watermark';
  Object.assign(el.style, {
    position: 'fixed', bottom: '8px', right: '12px', zIndex: '40',
    display: 'flex', alignItems: 'center', gap: '6px',
    fontFamily: '"Space Grotesk", system-ui, sans-serif',
    fontSize: '10px', color: 'rgba(255,255,255,0.25)', letterSpacing: '2px', fontWeight: '500',
    pointerEvents: 'none', userSelect: 'none',
  });
  el.innerHTML = `<img src="./astralis-logo.svg" style="width:14px;height:14px;opacity:0.4;" /> ASTRALIS v${BRAND.version}`;
  document.body.appendChild(el);
  return el;
}

// Achievement panel (toggle con tasto Y)
export class AchievementPanel {
  constructor() { this.el = null; this.isOpen = false; }
  toggle() { this.isOpen ? this.hide() : this.show(); }
  show() {
    if (this.el) return;
    const list = achievements.list();
    const unlocked = achievements.getUnlocked();
    this.el = document.createElement('div');
    this.el.id = 'achievementPanel';
    Object.assign(this.el.style, {
      position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      width: 'min(560px, 92vw)', maxHeight: '80vh',
      background: 'rgba(8, 10, 20, 0.97)', backdropFilter: 'blur(24px)',
      border: '1px solid rgba(91,196,207,0.3)', borderRadius: '20px',
      boxShadow: '0 30px 80px rgba(0,0,0,0.7)', color: '#e4eaf8',
      zIndex: '9990', overflow: 'hidden', display: 'flex', flexDirection: 'column',
      fontFamily: '"Space Grotesk", system-ui, sans-serif',
    });
    const progress = achievements.getProgress();
    this.el.innerHTML = `
      <div style="padding:18px 22px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;">
        <div>
          <h2 style="margin:0;font-size:1.1rem;font-weight:800;color:#5bc4cf;">Achievement</h2>
          <div style="font-size:11px;color:rgba(228,234,248,0.6);margin-top:3px;">${progress.unlocked}/${progress.total} sbloccati · ${progress.xp} XP</div>
        </div>
        <button id="achClose" style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.16);color:rgba(228,234,248,0.7);width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:12px;">X</button></div><div id="achList" style="flex:1;overflow-y:auto;padding:12px 18px;">255,0.07);border:1px solid rgba(255,255,</div><div style="padding:12px 18px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;font-size:10.5px;color:rgba(228,234,248,0.4);">Premi Y per chiudere · Totale: ' + ACHIEVEMENTS.length + ' achievement</div></div>`;
    const items = list.map(a => {
      const ok = unlocked.includes(a.id);
      return `<div style="display:flex;align-items:center;gap:12px;padding:10px 12px;margin-bottom:6px;background:rgba(255,255,255,${ok ? '0.06' : '0.02'});border:1px solid rgba(255,255,255,${ok ? '0.12' : '0.05'});border-radius:10px;${ok ? '' : 'opacity:0.45;filter:grayscale(0.5);'}">
        <div style="font-size:24px;width:36px;text-align:center;">${a.icon}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:13px;font-weight:700;color:${ok ? '#e4eaf8' : 'rgba(228,234,248,0.5)'};">${a.name}</div>
          <div style="font-size:11px;color:rgba(228,234,248,0.5);">${a.desc}</div>
        </div>
        <div style="font-size:10px;color:#5bc4cf;font-weight:700;font-family:monospace;">+${a.xp} XP</div>
      </div>`;
    }).join('');
    this.el.querySelector('#achList').innerHTML = items;
    this.el.querySelector('#achClose').onclick = () => this.hide();
  }
  hide() {
    if (!this.el) return;
    this.el.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    this.el.style.opacity = '0';
    this.el.style.transform = 'translate(-50%, -50%) scale(0.95)';
    setTimeout(() => { this.el?.remove(); this.el = null; }, 220);
    this.isOpen = false;
  }
}

export const achievementPanel = new AchievementPanel();

// Night owl detection
if (new Date().getHours() >= 0 && new Date().getHours() < 5) {
  setTimeout(() => achievements.unlock('night_owl'), 5000);
}