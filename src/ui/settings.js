/**
 * ASTRALIS Settings Panel
 * Pannello impostazioni con theme, lingua e accessibilità
 */

import { getLang, setLang, applyI18nToDOM } from '../i18n/index.js';
import { themeManager } from '../core/theme.js';
import { a11y } from '../core/a11y.js';
import { trapFocus } from '../utils/focusTrap.js';
import { soundManager } from '../core/soundManager.js';

class SettingsPanel {
  constructor() {
    this.panel = null;
    this.isOpen = false;
    this.overlay = null;
    this.onChangeCallbacks = [];
    this.lastFocused = null;
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
    this.panel.setAttribute('role', 'dialog');
    this.panel.setAttribute('aria-modal', 'true');
    this.panel.setAttribute('aria-labelledby', 'settingsTitle');
    this.panel.setAttribute('aria-hidden', 'true');
    this.panel.inert = true;
    this.panel.innerHTML = `
      <div class="settings-header">
        <h3 id="settingsTitle" data-i18n="settings_title">⚙️ Impostazioni</h3>
        <button class="settings-close" id="settingsClose" aria-label="Chiudi impostazioni" data-i18n-aria="settings_close">✕</button>
      </div>
      <div class="settings-content">
        <!-- Theme -->
        <div class="settings-section">
          <h4 data-i18n="settings_appearance">🎨 Aspetto</h4>
          <div class="settings-row">
            <label for="themeSelect" data-i18n="settings_theme">Tema</label>
            <select id="themeSelect" class="settings-select">
              <option value="dark" data-i18n="theme_dark">🌙 Scuro</option>
              <option value="light" data-i18n="theme_light">☀️ Chiaro</option>
            </select>
          </div>
          <div class="settings-row">
            <label for="hudSelect" data-i18n="settings_hud">Stile HUD</label>
            <select id="hudSelect" class="settings-select">
              <option value="standard" data-i18n="hud_standard">✨ Standard</option>
              <option value="nav" data-i18n="hud_navigation">🛰️ Navigation Computer</option>
            </select>
          </div>
        </div>

        <!-- Lingua -->
        <div class="settings-section">
          <h4 data-i18n="settings_language_section">🌐 Lingua</h4>
          <div class="settings-row">
            <label for="langSelect" data-i18n="settings_language">Lingua interfaccia</label>
            <select id="langSelect" class="settings-select">
              <option value="it">🇮🇹 Italiano</option>
              <option value="en">🇬🇧 English</option>
            </select>
          </div>
        </div>

        <!-- Accessibilità -->
        <div class="settings-section">
          <h4 data-i18n="settings_accessibility">♿ Accessibilità</h4>
          <div class="settings-row">
            <label for="reduceMotion" data-i18n="a11y_reduce_motion">Riduci animazioni</label>
            <input type="checkbox" id="reduceMotion" class="settings-toggle" />
          </div>
          <div class="settings-row">
            <label for="highContrast" data-i18n="a11y_high_contrast">Alto contrasto</label>
            <input type="checkbox" id="highContrast" class="settings-toggle" />
          </div>
          <div class="settings-row">
            <label for="largeText" data-i18n="a11y_large_text">Testo grande</label>
            <input type="checkbox" id="largeText" class="settings-toggle" />
          </div>
        </div>

        <!-- Performance -->
        <div class="settings-section">
          <h4 data-i18n="settings_performance">⚡ Performance</h4>
          <div class="settings-row">
            <label for="qualitySelect" data-i18n="settings_quality">Qualità grafica</label>
            <select id="qualitySelect" class="settings-select">
              <option value="auto" selected data-i18n="quality_auto">Automatica (consigliata)</option>
              <option value="low" data-i18n="quality_low">Bassa (più FPS)</option>
              <option value="medium" data-i18n="quality_medium">Media</option>
              <option value="high" data-i18n="quality_high">Alta</option>
            </select>
          </div>
          <div class="settings-row">
            <label for="showFPS" data-i18n="settings_show_fps">Mostra FPS</label>
            <input type="checkbox" id="showFPS" class="settings-toggle" />
          </div>
        </div>

        <!-- Audio -->
        <div class="settings-section">
          <h4 data-i18n="settings_audio">🔊 Audio</h4>
          <div class="settings-row">
            <label for="soundEnabled">Effetti & Risonanze</label>
            <input type="checkbox" id="soundEnabled" class="settings-toggle" />
          </div>
          <div class="settings-row">
            <label for="volumeSlider">Volume</label>
            <input type="range" id="volumeSlider" class="settings-slider" min="0" max="1" step="0.05" value="0.7" />
          </div>
        </div>

        <!-- Info -->
        <div class="settings-section settings-info">
          <h4 data-i18n="settings_info">ℹ️ Informazioni</h4>
          <p class="settings-version">ASTRALIS v2.0</p>
          <p class="settings-hint" data-i18n="settings_saved_hint">Le impostazioni vengono salvate automaticamente nel browser.</p>
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
      if (!this.isOpen) return;
      if (e.key === 'Escape') this.close();
      else trapFocus(this.panel, e);
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

    // Sound toggle
    const soundEnabled = this.panel.querySelector('#soundEnabled');
    soundEnabled?.addEventListener('change', (e) => {
      this._setSoundEnabled(e.target.checked);
    });

    // Volume slider
    const volumeSlider = this.panel.querySelector('#volumeSlider');
    volumeSlider?.addEventListener('input', (e) => {
      this._setVolume(parseFloat(e.target.value));
    });
  }

  _loadPreferences() {
    const prefs = this._getPreferences();
    applyI18nToDOM(this.panel);

    // Theme
    const themeSelect = this.panel.querySelector('#themeSelect');
    const theme = prefs.theme || themeManager.get();
    if (themeSelect) themeSelect.value = theme;
    themeManager.set(theme);

    // Sound and volume
    const soundEnabled = this.panel.querySelector('#soundEnabled');
    if (soundEnabled) soundEnabled.checked = soundManager.isEnabled();

    const volumeSlider = this.panel.querySelector('#volumeSlider');
    if (volumeSlider) volumeSlider.value = String(soundManager.getVolume());

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
      reduceMotion.checked = prefs.reduceMotion ?? a11y.get('reduceMotion');
      a11y.set('reduceMotion', reduceMotion.checked);
    }

    // High contrast
    const highContrast = this.panel.querySelector('#highContrast');
    if (highContrast) {
      highContrast.checked = prefs.highContrast ?? a11y.get('highContrast');
      a11y.set('highContrast', highContrast.checked);
    }

    // Large text
    const largeText = this.panel.querySelector('#largeText');
    if (largeText) {
      largeText.checked = prefs.largeText || false;
      if (largeText.checked) document.documentElement.setAttribute('data-large-text', '1');
      else document.documentElement.removeAttribute('data-large-text');
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
    } catch {
      /* Preferenze non disponibili: l'app resta utilizzabile. */
    }
  }

  _setTheme(theme) {
    themeManager.set(theme);
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
    a11y.set('reduceMotion', enabled);
    this._savePreferences({ reduceMotion: enabled });
    this._notifyChange('reduceMotion', enabled);
  }

  _setHighContrast(enabled) {
    a11y.set('highContrast', enabled);
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
    const hud = document.querySelector('#hud');
    if (hud) {
      hud.style.display = enabled ? 'flex' : 'none';
    }
    this._savePreferences({ showFPS: enabled });
    this._notifyChange('showFPS', enabled);
  }

  _setSoundEnabled(enabled) {
    if (soundManager.isEnabled() !== enabled) {
      soundManager.toggle();
    }
    this._notifyChange('sound', enabled);
  }

  _setVolume(vol) {
    soundManager.setVolume(vol);
    this._notifyChange('volume', vol);
  }

  _notifyChange(key, value) {
    this.onChangeCallbacks.forEach((cb) => cb(key, value));
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
    this.lastFocused = document.activeElement;
    this.isOpen = true;
    this.panel.inert = false;
    this.panel.setAttribute('aria-hidden', 'false');
    this.panel.classList.add('open');
    this.overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
    this.panel.querySelector('select, input, button')?.focus();
  }

  close() {
    this.isOpen = false;
    this.panel.classList.remove('open');
    this.panel.setAttribute('aria-hidden', 'true');
    this.panel.inert = true;
    this.overlay.classList.remove('visible');
    document.body.style.overflow = '';
    this.lastFocused?.focus?.();
    this.lastFocused = null;
  }

  getQuality() {
    const prefs = this._getPreferences();
    return prefs.quality || 'auto';
  }

  getEffectiveQuality() {
    const quality = this.getQuality();
    if (quality !== 'auto') return quality;

    // Apply a conservative default only until the user chooses a preset.
    // This protects entry-level mobile hardware without penalising desktops.
    const memory = navigator.deviceMemory || 8;
    const cores = navigator.hardwareConcurrency || 8;
    if (memory <= 4 || cores <= 4) return 'low';
    if (memory <= 6 || cores <= 6 || matchMedia('(pointer: coarse)').matches) return 'medium';
    return 'high';
  }

  shouldShowFPS() {
    const prefs = this._getPreferences();
    return prefs.showFPS || false;
  }
}

export const settingsPanel = new SettingsPanel();
