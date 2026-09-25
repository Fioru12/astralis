/**
 * @file grandTour.js
 * @description Cinematic Grand Tour of the Solar System.
 * Provides a guided, automated cinematic voyage through celestial bodies
 * with narrative subtitles, smooth camera transitions, and audio cues.
 */

import { getLang } from '../i18n/index.js';
import { soundManager } from './soundManager.js';

export const TOUR_STOPS = [
  {
    key: 'Sun',
    title: { it: '☀️ Il Sole', en: '☀️ The Sun' },
    subtitle: {
      it: 'La nostra stella madre, che racchiude il 99.86% della massa dell’intero sistema solare.',
      en: 'Our mother star, holding 99.86% of all mass in the entire solar system.',
    },
    distance: 400,
    duration: 10000,
  },
  {
    key: 'Mercury',
    title: { it: '🪨 Mercurio', en: '🪨 Mercury' },
    subtitle: {
      it: 'Il pianeta più vicino al Sole: craterizzato, privo di atmosfera e con escursioni termiche estreme.',
      en: 'The closest planet to the Sun: cratered, airless, with extreme temperature swings.',
    },
    distance: 35,
    duration: 9000,
  },
  {
    key: 'Venus',
    title: { it: '🌋 Venere', en: '🌋 Venus' },
    subtitle: {
      it: 'Un mondo infernale avvolto da nubi di acido solforico e un effetto serra devastante.',
      en: 'A hellish world blanketed by sulfuric acid clouds and a runaway greenhouse effect.',
    },
    distance: 50,
    duration: 9000,
  },
  {
    key: 'Earth',
    title: { it: '🌍 Terra', en: '🌍 Earth' },
    subtitle: {
      it: 'L’oasi blu dell’universo conosciuto: oceani liquidi, campo magnetico protettivo e vita fiorente.',
      en: 'The blue oasis of the known universe: liquid oceans, protective magnetosphere, and thriving life.',
    },
    distance: 55,
    duration: 10000,
  },
  {
    key: 'Moon',
    title: { it: '🌕 La Luna', en: '🌕 The Moon' },
    subtitle: {
      it: 'L’unico corpo celeste oltre alla Terra su cui ha camminato l’essere umano.',
      en: 'The only celestial body beyond Earth where humans have walked.',
    },
    distance: 25,
    duration: 8000,
  },
  {
    key: 'Mars',
    title: { it: '🔴 Marte', en: '🔴 Mars' },
    subtitle: {
      it: 'Il Pianeta Rosso: ospita il Monte Olimpo, il vulcano più alto del sistema solare.',
      en: 'The Red Planet: home to Olympus Mons, the largest volcano in the solar system.',
    },
    distance: 45,
    duration: 9000,
  },
  {
    key: 'Ceres',
    title: { it: '🪐 Cerere', en: '🪐 Ceres' },
    subtitle: {
      it: 'Il pianeta nano e corpo più massiccio della Fascia Principale degli Asteroidi.',
      en: 'The dwarf planet and largest object in the Main Asteroid Belt.',
    },
    distance: 30,
    duration: 8000,
  },
  {
    key: 'Jupiter',
    title: { it: '⚡ Giove', en: '⚡ Jupiter' },
    subtitle: {
      it: 'Il re dei giganti gassosi, famoso per la sua Grande Macchia Rossa e decine di lune.',
      en: 'The king of gas giants, famous for its Great Red Spot and dozens of moons.',
    },
    distance: 140,
    duration: 10000,
  },
  {
    key: 'Saturn',
    title: { it: '🪐 Saturno', en: '🪐 Saturn' },
    subtitle: {
      it: 'Il gioiello del sistema solare, circondato da un maestoso sistema di anelli di ghiaccio e roccia.',
      en: 'The jewel of the solar system, encircled by a majestic ring system of ice and dust.',
    },
    distance: 130,
    duration: 10000,
  },
  {
    key: 'Uranus',
    title: { it: '🧊 Urano', en: '🧊 Uranus' },
    subtitle: {
      it: 'Il gigante di ghiaccio inclinato su un fianco, con una gelida atmosfera di metano.',
      en: 'The ice giant tilted on its side, with a freezing methane-rich atmosphere.',
    },
    distance: 85,
    duration: 9000,
  },
  {
    key: 'Neptune',
    title: { it: '💨 Nettuno', en: '💨 Neptune' },
    subtitle: {
      it: 'Il pianeta più ventoso, dove raffiche supersoniche solcano nubi blu cobalto.',
      en: 'The windiest planet, where supersonic gusts sweep through deep cobalt-blue clouds.',
    },
    distance: 85,
    duration: 9000,
  },
  {
    key: 'Pluto',
    title: { it: '❄️ Plutone', en: '❄️ Pluto' },
    subtitle: {
      it: 'Il guardiano della Fascia di Kuiper, con pianure di azoto ghiacciato a forma di cuore.',
      en: 'The guardian of the Kuiper Belt, featuring heart-shaped plains of frozen nitrogen.',
    },
    distance: 30,
    duration: 9000,
  },
];

export class GrandTour {
  constructor(options = {}) {
    this.allBodies = options.allBodies || [];
    this.onSelectBody = options.onSelectBody || (() => {});
    this.currentIndex = 0;
    this.isActive = false;
    this.isPaused = false;
    this.timer = null;
    this.overlayEl = null;
    this.speed = 1.0;
  }

  setBodies(bodies) {
    this.allBodies = bodies;
  }

  start(startIndex = 0) {
    this.currentIndex = Math.max(0, Math.min(startIndex, TOUR_STOPS.length - 1));
    this.isActive = true;
    this.isPaused = false;
    this._createOrShowOverlay();
    this._goToCurrentStop();
    soundManager.whoosh(320);
  }

  stop() {
    this.isActive = false;
    this.isPaused = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.overlayEl) {
      this.overlayEl.style.display = 'none';
    }
  }

  toggle() {
    if (this.isActive) {
      this.stop();
    } else {
      this.start(0);
    }
  }

  togglePause() {
    if (!this.isActive) return;
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      if (this.timer) clearTimeout(this.timer);
    } else {
      this._scheduleNext(TOUR_STOPS[this.currentIndex].duration * 0.5);
    }
    this._updateUI();
  }

  next() {
    if (!this.isActive) return;
    if (this.currentIndex < TOUR_STOPS.length - 1) {
      this.currentIndex++;
      this._goToCurrentStop();
    } else {
      this.stop();
    }
  }

  prev() {
    if (!this.isActive) return;
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this._goToCurrentStop();
    }
  }

  _goToCurrentStop() {
    if (this.timer) clearTimeout(this.timer);
    const stop = TOUR_STOPS[this.currentIndex];
    const body = this.allBodies.find((b) => b.key === stop.key);
    if (body) {
      this.onSelectBody(body, stop.distance);
    }

    this._updateUI();
    soundManager.click();

    if (!this.isPaused) {
      this._scheduleNext(stop.duration / this.speed);
    }
  }

  _scheduleNext(durationMs) {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (this.isActive && !this.isPaused) {
        this.next();
      }
    }, durationMs);
  }

  _createOrShowOverlay() {
    if (!this.overlayEl) {
      this.overlayEl = document.createElement('div');
      this.overlayEl.id = 'grandTourOverlay';
      this.overlayEl.className = 'grand-tour-overlay';
      document.body.appendChild(this.overlayEl);
    }
    this.overlayEl.style.display = 'flex';
    this._updateUI();
  }

  _updateUI() {
    if (!this.overlayEl || !this.isActive) return;
    const stop = TOUR_STOPS[this.currentIndex];
    const lang = getLang() === 'it' ? 'it' : 'en';
    const title = stop.title[lang] || stop.title.it;
    const subtitle = stop.subtitle[lang] || stop.subtitle.it;
    const stepNumber = this.currentIndex + 1;
    const totalSteps = TOUR_STOPS.length;

    this.overlayEl.innerHTML = `
      <div class="grand-tour-card">
        <div class="grand-tour-header">
          <span class="grand-tour-badge">🌌 GRAND TOUR • ${stepNumber}/${totalSteps}</span>
          <button class="grand-tour-close" id="tourCloseBtn" aria-label="Esci dal tour">✕</button>
        </div>
        <div class="grand-tour-content">
          <h2 class="grand-tour-title">${title}</h2>
          <p class="grand-tour-desc">${subtitle}</p>
        </div>
        <div class="grand-tour-controls">
          <button class="grand-tour-btn" id="tourPrevBtn" ${
            this.currentIndex === 0 ? 'disabled' : ''
          } aria-label="Precedente">◀</button>
          <button class="grand-tour-btn grand-tour-play-btn" id="tourPauseBtn" aria-label="Pausa o Riprendi">
            ${this.isPaused ? '▶' : '⏸'}
          </button>
          <button class="grand-tour-btn" id="tourNextBtn" aria-label="Successivo">
            ${this.currentIndex === totalSteps - 1 ? 'Fine ✓' : '▶'}
          </button>
        </div>
      </div>
    `;

    document.getElementById('tourCloseBtn')?.addEventListener('click', () => this.stop());
    document.getElementById('tourPrevBtn')?.addEventListener('click', () => this.prev());
    document.getElementById('tourPauseBtn')?.addEventListener('click', () => this.togglePause());
    document.getElementById('tourNextBtn')?.addEventListener('click', () => this.next());
  }
}
