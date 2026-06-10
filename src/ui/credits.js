/**
 * Credits / About Page
 */
import { BRAND } from '../core/brand.js';
import { t } from '../i18n/index.js';

export class CreditsPage {
  constructor() {
    this.panel = null;
    this.isOpen = false;
  }

  toggle() {
    this.isOpen ? this.hide() : this.show();
  }

  show() {
    if (this.panel) return;
    this._build();
    this.isOpen = true;
  }

  hide() {
    if (!this.panel) return;
    this.panel.style.opacity = '0';
    setTimeout(() => {
      this.panel?.remove();
      this.panel = null;
    }, 220);
    this.isOpen = false;
  }

  _build() {
    this.panel = document.createElement('div');
    this.panel.id = 'creditsPanel';
    Object.assign(this.panel.style, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 'min(700px, 92vw)',
      maxHeight: '85vh',
      background: 'rgba(8, 10, 20, 0.97)',
      backdropFilter: 'blur(24px)',
      border: '1px solid rgba(91,196,207,0.3)',
      borderRadius: '20px',
      boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
      color: '#e4eaf8',
      zIndex: '9990',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '"Space Grotesk", system-ui, sans-serif',
      opacity: '0',
      transition: 'opacity 0.25s ease',
    });

    this.panel.innerHTML = `
      <div style="padding:18px 22px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;">
        <h2 style="margin:0;font-size:1.2rem;font-weight:800;color:#5bc4cf;">${t('credits_title') || 'Credits & About'}</h2>
        <button id="creditsClose" style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.16);color:rgba(228,234,248,0.7);width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:14px;">✕</button>
      </div>
      <div style="flex:1;overflow-y:auto;padding:24px;">
        <div style="text-align:center;margin-bottom:32px;">
          <img src="./astralis-logo.svg" alt="Astralis" style="width:80px;height:80px;margin-bottom:12px;filter:drop-shadow(0 0 20px rgba(91,196,207,0.5));" />
          <h1 style="margin:0;font-size:2rem;font-weight:700;background:linear-gradient(135deg,#5bc4cf 0%,#a78bfa 50%,#f59e0b 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">ASTRALIS</h1>
          <p style="margin:8px 0 0;font-size:13px;color:rgba(228,234,248,0.6);">${BRAND.tagline}</p>
          <p style="margin:4px 0 0;font-size:11px;color:rgba(228,234,248,0.4);">Version ${BRAND.version} · ${BRAND.year}</p>
        </div>

        <section style="margin-bottom:28px;">
          <h3 style="font-size:14px;font-weight:700;color:#5bc4cf;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">${t('credits_about') || 'About'}</h3>
          <p style="font-size:13px;line-height:1.7;color:rgba(228,234,248,0.8);margin:0;">
            ${t('credits_about_text') || 'Astralis è un visualizzatore 3D interattivo del Sistema Solare che utilizza dati orbitali reali dalla NASA/JPL. Esplora pianeti, lune, asteroidi, comete e stelle vicine con precisione scientifica.'}
          </p>
        </section>

        <section style="margin-bottom:28px;">
          <h3 style="font-size:14px;font-weight:700;color:#5bc4cf;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">${t('credits_features') || 'Features'}</h3>
          <ul style="font-size:13px;line-height:1.8;color:rgba(228,234,248,0.8);margin:0;padding-left:20px;">
            <li>40+ corpi celesti con orbite kepleriane NASA/JPL</li>
            <li>Time travel con eventi storici</li>
            <li>Quiz spaziale interattivo</li>
            <li>Gravity sandbox (simulatore N-body)</li>
            <li>Mappa galattica con stelle vicine</li>
            <li>Supporto WebXR/VR</li>
            <li>PWA installabile</li>
            <li>i18n IT/EN</li>
            <li>Accessibility completa</li>
          </ul>
        </section>

        <section style="margin-bottom:28px;">
          <h3 style="font-size:14px;font-weight:700;color:#5bc4cf;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">${t('credits_tech') || 'Technologies'}</h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;">
            <div style="padding:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;text-align:center;">
              <div style="font-size:13px;font-weight:600;">Three.js</div>
              <div style="font-size:11px;color:rgba(228,234,248,0.5);margin-top:4px;">3D Graphics</div>
            </div>
            <div style="padding:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;text-align:center;">
              <div style="font-size:13px;font-weight:600;">Vite</div>
              <div style="font-size:11px;color:rgba(228,234,248,0.5);margin-top:4px;">Build Tool</div>
            </div>
            <div style="padding:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;text-align:center;">
              <div style="font-size:13px;font-weight:600;">NASA APIs</div>
              <div style="font-size:11px;color:rgba(228,234,248,0.5);margin-top:4px;">Orbital Data</div>
            </div>
            <div style="padding:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;text-align:center;">
              <div style="font-size:13px;font-weight:600;">WebXR</div>
              <div style="font-size:11px;color:rgba(228,234,248,0.5);margin-top:4px;">VR Support</div>
            </div>
          </div>
        </section>

        <section style="margin-bottom:28px;">
          <h3 style="font-size:14px;font-weight:700;color:#5bc4cf;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">${t('credits_data') || 'Data Sources'}</h3>
          <ul style="font-size:13px;line-height:1.8;color:rgba(228,234,248,0.8);margin:0;padding-left:20px;">
            <li><strong>NASA/JPL</strong> - Orbital elements, APOD, NEO</li>
            <li><strong>HYG Database</strong> - Nearby stars catalog</li>
            <li><strong>NASA Exoplanet Archive</strong> - Exoplanet data</li>
            <li><strong>Solar System Scope</strong> - Planetary textures</li>
          </ul>
        </section>

        <section style="margin-bottom:28px;">
          <h3 style="font-size:14px;font-weight:700;color:#5bc4cf;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">${t('credits_team') || 'Team'}</h3>
          <p style="font-size:13px;line-height:1.7;color:rgba(228,234,248,0.8);margin:0;">
            ${t('credits_team_text') || 'Sviluppato con passione per l\'astronomia e l\'educazione scientifica.'}
          </p>
        </section>

        <section>
          <h3 style="font-size:14px;font-weight:700;color:#5bc4cf;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">${t('credits_license') || 'License'}</h3>
          <p style="font-size:13px;line-height:1.7;color:rgba(228,234,248,0.8);margin:0;">
            ${t('credits_license_text') || 'Open source under MIT License. Dati NASA di pubblico dominio.'}
          </p>
        </section>

        <div style="margin-top:32px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.08);text-align:center;">
          <p style="font-size:11px;color:rgba(228,234,248,0.4);margin:0;">
            Made with ❤️ for space exploration
          </p>
        </div>
      </div>
    `;

    document.body.appendChild(this.panel);
    requestAnimationFrame(() => {
      this.panel.style.opacity = '1';
    });

    this.panel.querySelector('#creditsClose').onclick = () => this.hide();
  }
}

export const creditsPage = new CreditsPage();