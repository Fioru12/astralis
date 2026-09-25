/**
 * Sound Manager - Paesaggio Sonoro Cosmico Generativo & Audio 8D
 * Nessun file audio esterno: sintetizzato interamente via Web Audio API.
 * Include:
 *  - Drone d ambiente generativo 8D con panning stereofonico orbitale
 *  - Frequenze e risonanze armoniche per classe spettrale stellare (O, B, A, F, G, K, M, Nana Bianca, Buco Nero)
 *  - Effetto cinematico di salto iperspaziale (Warp Jump)
 */

const STORAGE_KEY = 'solar-system.sound';
const VOLUME_KEY = 'solar-system.volume';

export class SoundManager {
  constructor() {
    this.enabled =
      typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) === '1' : false;
    this.volume =
      typeof localStorage !== 'undefined'
        ? parseFloat(localStorage.getItem(VOLUME_KEY) || '0.7')
        : 0.7;
    this.ctx = null;
    this.masterGain = null;
    this.ambient = null;
    this.ambient8D = null;
    this.pannerNode = null;
    this.filterNode = null;
    this.currentSpectralClass = 'G';
  }

  _ensureCtx() {
    if (this.ctx) return this.ctx;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);
    } catch {
      return null;
    }
    return this.ctx;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(VOLUME_KEY, String(this.volume));
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  getVolume() {
    return this.volume;
  }

  toggle() {
    this.enabled = !this.enabled;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, this.enabled ? '1' : '0');
    }
    if (this.enabled) {
      this.start8DAmbient();
    } else {
      this.stop8DAmbient();
    }
    return this.enabled;
  }

  isEnabled() {
    return this.enabled;
  }

  /**
   * Avvia il Paesaggio Sonoro Cosmico Generativo 8D
   */
  start8DAmbient() {
    if (!this._ensureCtx()) return;
    if (this.ambient8D) return;
    const ctx = this.ctx;

    // Master 8D Panner Node (Stereo Panning Orbitale 8D)
    let panner = null;
    if (ctx.createStereoPanner) {
      panner = ctx.createStereoPanner();
    }
    this.pannerNode = panner;

    // Low-Pass Filter Risonante per calore cosmico
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    filter.Q.value = 2.2;
    this.filterNode = filter;

    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 2.0);

    // Connessioni Web Audio: Osc -> Filter -> Panner -> MasterGain -> Destination
    if (panner) {
      filter.connect(panner);
      panner.connect(gain);
    } else {
      filter.connect(gain);
    }
    gain.connect(this.masterGain || ctx.destination);

    // Accordi d ambiente generativi (Frequenza base 55Hz Eb minor 9th chord)
    const baseFreqs = [55.0, 82.41, 123.47, 164.81, 246.94];
    const oscs = baseFreqs.map((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      osc.connect(filter);
      osc.start();
      return osc;
    });

    // LFO per respirazione/pulsazione lenta del filtro (0.05 Hz)
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.05;
    lfoGain.gain.value = 140;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    this.ambient8D = { oscs, lfo, lfoGain, filter, gain, panner };
  }

  /**
   * Aggiorna il Panning 8D e modula la musica generativa in tempo reale
   * @param {number} timeMs - Performance timestamp
   * @param {number} dist - Distanza della telecamera al corpo celeste
   * @param {object} body - Corpo celeste target (per classe spettrale)
   */
  update8DAudio(timeMs = 0, dist = 1000, body = null) {
    if (!this.enabled || !this.ambient8D || !this.ctx) return;
    const ctx = this.ctx;

    // 1. Audio 8D Panning Orbitale (rotazione 3D continua attorno all ascoltatore)
    if (this.ambient8D.panner) {
      const panVal = Math.sin(timeMs * 0.00018); // Panning circolare 8D
      this.ambient8D.panner.pan.setTargetAtTime(panPanClamp(panVal), ctx.currentTime, 0.1);
    }

    // 2. Modulazione della frequenza in base alla vicinanza
    const proximityFactor = Math.max(0, Math.min(1, 1 - dist / 6000));
    const targetCutoff = 350 + proximityFactor * 500;
    this.ambient8D.filter.frequency.setTargetAtTime(targetCutoff, ctx.currentTime, 0.3);

    // 3. Adattamento Frequenza Spettrale in prossimità delle stelle
    if (body && body.type === 'star') {
      this.updateStarSpectralAudio(body);
    }
  }

  /**
   * Modula le frequenze armoniche in base alla Classe Spettrale della Stella (O, B, A, F, G, K, M, Nana Bianca, Buco Nero)
   */
  updateStarSpectralAudio(starDef) {
    if (!this.ambient8D || !this.ctx) return;
    const key = starDef.key || starDef.name || '';
    let spectral = 'G';

    if (key.includes('Sagittarius') || key.includes('Sgr')) spectral = 'BH';
    else if (key.includes('SiriusB')) spectral = 'WD';
    else if (key.includes('Vega') || key.includes('Sirius') || key.includes('Deneb'))
      spectral = 'O_B';
    else if (
      key.includes('Proxima') ||
      key.includes('TRAPPIST') ||
      key.includes('Ross') ||
      key.includes('Barnard') ||
      key.includes('Betelgeuse')
    )
      spectral = 'M';
    else if (
      key.includes('AlphaCentauriB') ||
      key.includes('Kepler62') ||
      key.includes('Kepler442')
    )
      spectral = 'K';
    else spectral = 'G'; // Sun, Alpha Centauri A, Kepler-452

    if (this.currentSpectralClass === spectral) return;
    this.currentSpectralClass = spectral;
    this.playSpectralStarResonance(spectral);
  }

  /**
   * Risonanza Sintetica per Classe Spettrale Stellare
   */
  playSpectralStarResonance(spectral = 'G') {
    if (!this.enabled || !this._ensureCtx()) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;

    const spectralPresets = {
      // Classe O/B: Giganti e nane azzurre veloci — Suono cristallino, alto e glaciale
      O_B: { freqs: [783.99, 1046.5, 1567.98], type: 'sine', gainVal: 0.03 },
      // Classe A/F: Stelle bianche luminose (es. Sirio, Vega) — Risonanza brillante
      A: { freqs: [440, 659.25, 880], type: 'sine', gainVal: 0.04 },
      // Classe G: Nane Gialle (Sole, Alpha Centauri A) — Frequenza solare dorata Ohm (136.1Hz)
      G: { freqs: [136.1, 272.2, 544.4], type: 'sine', gainVal: 0.05 },
      // Classe K/M: Nane Rosse e Supergiganti (Proxima, TRAPPIST, Betelgeuse) — Bassi profondi caldi
      M: { freqs: [55.0, 82.41, 123.47], type: 'triangle', gainVal: 0.06 },
      // Nana Bianca (Sirio B) — Pulsazione graviterrestre ultra-densa ad alta frequenza
      WD: { freqs: [1760, 2637], type: 'sine', gainVal: 0.02 },
      // Buco Nero (Sagittarius A*) — Ruggito gravitazionale sub-basso profundo
      BH: { freqs: [32.7, 49.0, 65.4], type: 'sawtooth', gainVal: 0.07 },
    };

    const preset = spectralPresets[spectral] || spectralPresets.G;
    preset.freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = preset.type;
      osc.frequency.setValueAtTime(freq, t);

      const start = t + i * 0.08;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(preset.gainVal, start + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 2.4);

      osc.connect(gain).connect(this.masterGain || ctx.destination);
      osc.start(start);
      osc.stop(start + 2.5);
    });
  }

  stop8DAmbient() {
    if (!this.ambient8D || !this.ctx) return;
    const { oscs, lfo, gain } = this.ambient8D;
    gain.gain.cancelScheduledValues(this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.8);
    setTimeout(() => {
      oscs.forEach((o) => o.stop());
      lfo.stop();
    }, 850);
    this.ambient8D = null;
  }

  /** Alias di compatibilità */
  startAmbient() {
    this.start8DAmbient();
  }

  stopAmbient() {
    this.stop8DAmbient();
  }

  updateSpatialAudio(dist = 1000) {
    this.update8DAudio(performance.now(), dist);
  }

  /** Whoosh breve per transizioni */
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
    osc.connect(gain).connect(this.masterGain || ctx.destination);
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
    osc.connect(gain).connect(this.masterGain || ctx.destination);
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
      osc.connect(gain).connect(this.masterGain || ctx.destination);
      osc.start(start);
      osc.stop(start + 0.2);
    });
  }

  /** Risonanza audio sintetica specifica per pianeta / stella */
  playBodyResonance(bodyKey) {
    if (!this.enabled || !this._ensureCtx()) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;

    const chords = {
      Sun: [136.1, 272.2, 544.4],
      Jupiter: [146.83, 220, 293.66],
      Saturn: [220, 329.63, 440, 659.25],
      Earth: [136.1, 272.2, 544.4],
      Mars: [185, 277.18, 369.99],
      Neptune: [164.81, 246.94, 392],
      Uranus: [174.61, 261.63, 349.23],
    };

    const freqs = chords[bodyKey] || [196, 293.66, 392];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const start = t + idx * 0.04;
      const dur = 0.8;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.05 / freqs.length, start + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

      osc.connect(gain).connect(this.masterGain || ctx.destination);
      osc.start(start);
      osc.stop(start + dur + 0.05);
    });
  }

  /** Effetto sonoro cinematico di salto iperspaziale (Warp Jump) */
  warpJump() {
    if (!this.enabled || !this._ensureCtx()) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;

    // Sub-bass sweep up then deep release
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(40, t);
    subOsc.frequency.exponentialRampToValueAtTime(320, t + 0.45);
    subOsc.frequency.exponentialRampToValueAtTime(50, t + 1.2);

    subGain.gain.setValueAtTime(0, t);
    subGain.gain.linearRampToValueAtTime(0.12, t + 0.35);
    subGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);

    subOsc.connect(subGain).connect(this.masterGain || ctx.destination);
    subOsc.start(t);
    subOsc.stop(t + 1.35);

    // Resonant hyperdrive shimmer
    const noiseOsc = ctx.createOscillator();
    const noiseGain = ctx.createGain();
    noiseOsc.type = 'sawtooth';
    noiseOsc.frequency.setValueAtTime(150, t);
    noiseOsc.frequency.exponentialRampToValueAtTime(1200, t + 0.4);
    noiseOsc.frequency.exponentialRampToValueAtTime(80, t + 1.1);

    noiseGain.gain.setValueAtTime(0, t);
    noiseGain.gain.linearRampToValueAtTime(0.04, t + 0.3);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

    noiseOsc.connect(noiseGain).connect(this.masterGain || ctx.destination);
    noiseOsc.start(t);
    noiseOsc.stop(t + 1.25);
  }
}

function panPanClamp(val) {
  return Math.max(-1, Math.min(1, val));
}

export const soundManager = new SoundManager();
