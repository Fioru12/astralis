/**
 * ASTRALIS Settings Panel
 * Pannello impostazioni con theme, lingua e accessibilità
 */

import { getLang, setLang, applyI18nToDOM } from '../i18n/index.js';

class SettingsPanel {
  constructor() {
    this.panel = null;
    this.isOpen = false;
    this.overlay = null;
    this.onChangeCallbacks = [];
  }

  init() {
    this._createPanel();
    this._bindEvents();
    this._loadPreferences();
  }

  _createPanel() {
    // Overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'settings-overlay';
    this.overlay.id = 'settingsOverlay';
    document.body.appendChild(this.overlay);

    // Panel
    this.panel = document.createElement('div');
    this.panel.className = 'settings-panel';
    this.panel.id = 'settingsPanel';
    this.panel.innerHTML = `
      <div class="settings-header">
        <h3>⚙️ Impostazioni</h3>
        <button class="settings-close" id="settingsClose" aria-label="Chiudi impostazioni">✕</button>
      </div>
      <div class="settings-content">
        <!-- Theme -->
        <div class="settings-section">
          <h4>🎨 Aspetto</h4>
          <div class="settings-row">
            <label for="themeSelect">Tema</label>
            <select id="themeSelect" class="settings-select">
              <option value="dark">🌙 Scuro</option>
              <option value="light">☀️ Chiaro</option>
            </select>
          </div>
          <div class="settings-row">
            <label for="hudSelect">Stile HUD</label>
            <select id="hudSelect" class="settings-select">
              <option value="standard">✨ Standard</option>
              <option value="nav">🛰️ Navigation Computer</option>
            </select>
          </div>
        </div>

        <!-- Lingua -->
        <div class="settings-section">
          <h4>🌐 Lingua</h4>
          <div class="settings-row">
            <label for="langSelect">Lingua interfaccia</label>
            <select id="langSelect" class="settings-select">
              <option value="it">🇮🇹 Italiano</option>
              <option value="en">🇬🇧 English</option>
            </select>
          </div>
        </div>

        <!-- Accessibilità -->
        <div class="settings-section">
          <h4>♿ Accessibilità</h4>
          <div class="settings-row">
            <label for="reduceMotion">Riduci animazioni</label>
            <input type="checkbox" id="reduceMotion" class="settings-toggle" />
          </div>
          <div class="settings-row">
            <label for="highContrast">Alto contrasto</label>
            <input type="checkbox" id="highContrast" class="settings-toggle" />
          </div>
          <div class="settings-row">
            <label for="largeText">Testo grande</label>
            <input type="checkbox" id="largeText" class="settings-toggle" />
          </div>
        </div>

        <!-- Performance -->
        <div class="settings-section">
          <h4>⚡ Performance</h4>
          <div class="settings-row">
            <label for="qualitySelect">Qualità grafica</label>
            <select id="qualitySelect" class="settings-select">
              <option value="low">Bassa (più FPS)</option>
              <option value="medium">Media</option>
              <option value="high" selected>Alta</option>
            </select>
          </div>
          <div class="settings-row">
            <label for="showFPS">Mostra FPS</label>
            <input type="checkbox" id="showFPS" class="settings-toggle" />
          </div>
        </div>

        <!-- Info -->
        <div class="settings-section settings-info">
          <h4>ℹ️ Informazioni</h4>
          <p class="settings-version">ASTRALIS v2.0</p>
          <p class="settings-hint">Le impostazioni vengono salvate automaticamente nel browser.</p>
        </div>
      </div>
    `;
    document.body.appendChild(this.panel);
  }

  _bindEvents() {
    // Close button
    const closeBtn = this.panel.querySelector('#settingsClose');
    closeBtn?.addEventListener('click', () => this.close());

    // Overlay click
    this.overlay.addEventListener('click', () => this.close());

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });

    // Theme select
    const themeSelect = this.panel.querySelector('#themeSelect');
    themeSelect?.addEventListener('change', (e) => {
      this._setTheme(e.target.value);
    });

    // HUD style select
    const hudSelect = this.panel.querySelector('#hudSelect');
    hudSelect?.addEventListener('change', (e) => {
      this._setHud(e.target.value);
    });

    // Language select
    const langSelect = this.panel.querySelector('#langSelect');
    langSelect?.addEventListener('change', (e) => {
      this._setLanguage(e.target.value);
    });

    // Reduce motion
    const reduceMotion = this.panel.querySelector('#reduceMotion');
    reduceMotion?.addEventListener('change', (e) => {
      this._setReduceMotion(e.target.checked);
    });

    // High contrast
    const highContrast = this.panel.querySelector('#highContrast');
    highContrast?.addEventListener('change', (e) => {
      this._setHighContrast(e.target.checked);
    });

    // Large text
    const largeText = this.panel.querySelector('#largeText');
    largeText?.addEventListener('change', (e) => {
      this._setLargeText(e.target.checked);
    });

    // Quality select
    const qualitySelect = this.panel.querySelector('#qualitySelect');
    qualitySelect?.addEventListener('change', (e) => {
      this._setQuality(e.target.value);
    });

    // Show FPS
    const showFPS = this.panel.querySelector('#showFPS');
    showFPS?.addEventListener('change', (e) => {
      this._setShowFPS(e.target.checked);
    });
  }

  _loadPreferences() {
    const prefs = this._getPreferences();
    
    // Theme
    const themeSelect = this.panel.querySelector('#themeSelect');
    if (themeSelect && prefs.theme) {
      themeSelect.value = prefs.theme;
    }

    // HUD style (apply to DOM, not just the control)
    const hudSelect = this.panel.querySelector('#hudSelect');
    const hud = prefs.hud || 'standard';
    if (hudSelect) hudSelect.value = hud;
    this._applyHud(hud);

    // Language
    const langSelect = this.panel.querySelector('#langSelect');
    if (langSelect) {
      langSelect.value = getLang();
    }

    // Reduce motion
    const reduceMotion = this.panel.querySelector('#reduceMotion');
    if (reduceMotion) {
      reduceMotion.checked = prefs.reduceMotion || false;
    }

    // High contrast
    const highContrast = this.panel.querySelector('#highContrast');
    if (highContrast) {
      highContrast.checked = prefs.highContrast || false;
    }

    // Large text
    const largeText = this.panel.querySelector('#largeText');
    if (largeText) {
      largeText.checked = prefs.largeText || false;
    }

    // Quality
    const qualitySelect = this.panel.querySelector('#qualitySelect');
    if (qualitySelect && prefs.quality) {
      qualitySelect.value = prefs.quality;
    }

    // Show FPS
    const showFPS = this.panel.querySelector('#showFPS');
    if (showFPS) {
      showFPS.checked = prefs.showFPS || false;
    }
  }

  _getPreferences() {
    try {
      return JSON.parse(localStorage.getItem('astralis-settings') || '{}');
    } catch {
      return {};
    }
  }

  _savePreferences(prefs) {
    try {
      const current = this._getPreferences();
      localStorage.setItem('astralis-settings', JSON.stringify({ ...current, ...prefs }));
    } catch (e) {
      console.warn('Impossibile salvare preferenze:', e);
    }
  }

  _setTheme(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    this._savePreferences({ theme });
    this._notifyChange('theme', theme);
  }

  _applyHud(hud) {
    if (hud === 'nav') {
      document.documentElement.setAttribute('data-hud', 'nav');
    } else {
      document.documentElement.removeAttribute('data-hud');
    }
  }

  _setHud(hud) {
    this._applyHud(hud);
    this._savePreferences({ hud });
    this._notifyChange('hud', hud);
  }

  _setLanguage(lang) {
    setLang(lang);
    applyI18nToDOM();
    this._savePreferences({ language: lang });
    this._notifyChange('language', lang);
  }

  _setReduceMotion(enabled) {
    if (enabled) {
      document.documentElement.setAttribute('data-reduce-motion', '1');
    } else {
      document.documentElement.removeAttribute('data-reduce-motion');
    }
    this._savePreferences({ reduceMotion: enabled });
    this._notifyChange('reduceMotion', enabled);
  }

  _setHighContrast(enabled) {
    if (enabled) {
      document.documentElement.setAttribute('data-high-contrast', '1');
    } else {
      document.documentElement.removeAttribute('data-high-contrast');
    }
    this._savePreferences({ highContrast: enabled });
    this._notifyChange('highContrast', enabled);
  }

  _setLargeText(enabled) {
    if (enabled) {
      document.documentElement.setAttribute('data-large-text', '1');
    } else {
      document.documentElement.removeAttribute('data-large-text');
    }
    this._savePreferences({ largeText: enabled });
    this._notifyChange('largeText', enabled);
  }

  _setQuality(quality) {
    this._savePreferences({ quality });
    this._notifyChange('quality', quality);
  }

  _setShowFPS(enabled) {
    const hud = document.querySelector('.hud');
    if (hud) {
      hud.style.display = enabled ? 'flex' : 'none';
    }
    this._savePreferences({ showFPS: enabled });
    this._notifyChange('showFPS', enabled);
  }

  _notifyChange(key, value) {
    this.onChangeCallbacks.forEach(cb => cb(key, value));
  }

  onChange(callback) {
    this.onChangeCallbacks.push(callback);
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    this.panel.classList.add('open');
    this.overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen = false;
    this.panel.classList.remove('open');
    this.overlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  getQuality() {
    const prefs = this._getPreferences();
    return prefs.quality || 'high';
  }

  shouldShowFPS() {
    const prefs = this._getPreferences();
    return prefs.showFPS || false;
  }
}

export const settingsPanel = new SettingsPanel();