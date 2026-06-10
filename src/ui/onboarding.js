/**
 * Onboarding interattivo al primo avvio
 * Tour guidato in 4 step con overlay trasparente
 */
import { t } from '../i18n/index.js';

const STORAGE_KEY = 'solar-system.onboarded';
const STEPS = [
  { id: 'welcome', icon: '🪐', titleKey: 'welcome_title', textKey: 'welcome_text' },
  { id: 'camera',  icon: '🎮', titleKey: 'step1_title',  textKey: 'step1_text'  },
  { id: 'select',  icon: '🖱️', titleKey: 'step2_title',  textKey: 'step2_text'  },
  { id: 'time',    icon: '⏰', titleKey: 'step3_title',  textKey: 'step3_text'  },
  { id: 'fun',     icon: '✨', titleKey: 'step4_title',  textKey: 'step4_text'  },
];

export class Onboarding {
  constructor() {
    this.currentStep = 0;
    this.container = null;
    this.overlay = null;
  }

  shouldShow() {
    return !localStorage.getItem(STORAGE_KEY);
  }

  show() {
    if (!this.shouldShow()) return;
    if (this.container) return;
    this._build();
    requestAnimationFrame(() => this._render());
  }

  _build() {
    // Overlay scuro
    this.overlay = document.createElement('div');
    this.overlay.id = 'onboardingOverlay';
    Object.assign(this.overlay.style, {
      position: 'fixed', inset: '0',
      background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.6), rgba(0,0,0,0.85))',
      backdropFilter: 'blur(4px)',
      zIndex: '9998',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.4s ease',
    });

    // Card
    this.container = document.createElement('div');
    this.container.id = 'onboardingCard';
    Object.assign(this.container.style, {
      width: 'min(440px, 90vw)',
      padding: '32px',
      background: 'rgba(8, 10, 20, 0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(91,196,207,0.3)',
      borderRadius: '20px',
      boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(91,196,207,0.2)',
      color: '#e4eaf8',
      textAlign: 'center',
    });

    this.overlay.appendChild(this.container);
    document.body.appendChild(this.overlay);

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this._next();
    });
  }

  _render() {
    const step = STEPS[this.currentStep];
    const isLast = this.currentStep === STEPS.length - 1;
    this.container.innerHTML = `
      <div style="font-size:3.5rem;margin-bottom:12px;animation: pulse 2s ease-in-out infinite;">${step.icon}</div>
      <h2 style="margin:0 0 12px;font-size:1.4rem;color:#5bc4cf;font-weight:800;">${t(step.titleKey)}</h2>
      <p style="margin:0 0 24px;font-size:0.95rem;line-height:1.6;color:rgba(228,234,248,0.8);">${t(step.textKey)}</p>
      <div style="display:flex;justify-content:center;gap:6px;margin-bottom:20px;">
        ${STEPS.map((_, i) => `
          <div style="width:8px;height:8px;border-radius:50%;
            background:${i === this.currentStep ? '#5bc4cf' : 'rgba(255,255,255,0.2)'};
            transition:all 0.3s;"></div>
        `).join('')}
      </div>
      <div style="display:flex;gap:8px;justify-content:center;align-items:center;flex-wrap:wrap;">
        <button id="obSkip" style="background:transparent;border:none;color:rgba(228,234,248,0.5);padding:8px 14px;cursor:pointer;font-size:13px;">
          ${t('skip_tour')}
        </button>
        <div style="flex:1;"></div>
        ${this.currentStep > 0 ? `
          <button id="obPrev" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.16);
            color:#e4eaf8;padding:8px 18px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:600;">
            ${t('prev')}
          </button>` : ''}
        <button id="obNext" style="background:linear-gradient(135deg,#5bc4cf,#8be0ea);border:none;
          color:#000;padding:10px 24px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:700;
          box-shadow:0 4px 20px rgba(91,196,207,0.4);">
          ${isLast ? t('finish') : t('next')}
        </button>
      </div>
    `;

    this.container.querySelector('#obNext').addEventListener('click', () => this._next());
    this.container.querySelector('#obSkip')?.addEventListener('click', () => this._complete());
    this.container.querySelector('#obPrev')?.addEventListener('click', () => this._prev());
  }

  _next() {
    if (this.currentStep < STEPS.length - 1) {
      this.currentStep++;
      this._render();
    } else {
      this._complete();
    }
  }

  _prev() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this._render();
    }
  }

  _complete() {
    localStorage.setItem(STORAGE_KEY, '1');
    this.overlay.style.opacity = '0';
    this.overlay.style.transition = 'opacity 0.3s';
    setTimeout(() => {
      this.overlay?.remove();
      this.container = null;
      this.overlay = null;
    }, 300);
  }

  reset() {
    localStorage.removeItem(STORAGE_KEY);
    this.currentStep = 0;
    this.show();
  }
}

export const onboarding = new Onboarding();
