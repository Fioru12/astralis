/**
 * Sound Manager - Suoni sottili con Web Audio API
 * Nessun file audio esterno: tutto generato sinteticamente
 */
const STORAGE_KEY = 'solar-system.sound';

export class SoundManager {
  constructor() {
    this.enabled = localStorage.getItem(STORAGE_KEY) === '1';
    this.ctx = null;
    this.ambient = null;
  }

  _ensureCtx() {
    if (this.ctx) return this.ctx;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio not supported');
      return null;
    }
    return this.ctx;
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem(STORAGE_KEY, this.enabled ? '1' : '0');
    if (this.enabled) this.startAmbient();
    else this.stopAmbient();
    return this.enabled;
  }

  isEnabled() { return this.enabled; }

  /** Drone spaziale di fondo */
  startAmbient() {
    if (!this._ensureCtx()) return;
    if (this.ambient) return;
    const ctx = this.ctx;

    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);

    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 60;
    osc1.connect(gain);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 90.5;
    osc2.connect(gain);

    osc1.start();
    osc2.start();
    gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 1.5);

    this.ambient = { osc1, osc2, gain };
  }

  stopAmbient() {
    if (!this.ambient || !this.ctx) return;
    const { osc1, osc2, gain } = this.ambient;
    gain.gain.cancelScheduledValues(this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
    setTimeout(() => { osc1.stop(); osc2.stop(); }, 600);
    this.ambient = null;
  }

  /** Whoosh breve */
  whoosh(freq = 220) {
    if (!this.enabled || !this._ensureCtx()) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t + 0.25);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.06, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.35);
  }

  /** Click UI */
  click() {
    if (!this.enabled || !this._ensureCtx()) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.05);
    gain.gain.setValueAtTime(0.04, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  /** Beep success/error */
  beep(type = 'success') {
    if (!this.enabled || !this._ensureCtx()) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const freqs = type === 'success' ? [523, 659, 784] : [392, 311, 233];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      const start = t + i * 0.1;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.08, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.2);
    });
  }
}

export const soundManager = new SoundManager();
