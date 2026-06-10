/**
 * Pannello scorciatoie tastiera (tasto H)
 */
import { t, onLangChange } from '../i18n/index.js';

const SHORTCUTS = [
  {
    section: 'shortcuts_general',
    items: [
      { key: 'Space / K', desc: 'shortcut_pause' },
      { key: 'R',         desc: 'shortcut_reset_cam' },
      { key: 'N',         desc: 'shortcut_now' },
      { key: 'H',         desc: 'shortcut_help' },
      { key: 'P',         desc: 'shortcut_settings' },
      { key: 'Ctrl+K',    desc: 'shortcut_command' },
      { key: 'V',         desc: 'shortcut_presets' },
      { key: 'TAB',       desc: 'shortcut_inv' },
      { key: 'T',         desc: 'shortcut_theme' },
      { key: 'L',         desc: 'shortcut_lang' },
      { key: 'ESC',       desc: 'shortcut_esc' },
    ],
  },
  {
    section: 'shortcuts_camera',
    items: [
      { key: 'Mouse Drag',     desc: 'shortcut_rotate' },
      { key: 'Scroll',         desc: 'shortcut_zoom' },
      { key: 'Shift + Drag',   desc: 'shortcut_pan' },
      { key: 'Double Click',   desc: 'shortcut_double_click' },
      { key: 'WASD / Arrows',  desc: 'shortcut_wasd' },
    ],
  },
  {
    section: 'shortcuts_time',
    items: [
      { key: '[',          desc: 'shortcut_year_back' },
      { key: ']',          desc: 'shortcut_year_fwd' },
      { key: 'Shift+[/]',  desc: 'shortcut_decade' },
    ],
  },
];

export class ShortcutsPanel {
  constructor() {
    this.isOpen = false;
    this.panel = null;
    this.unsub = null;
  }

  toggle() {
    if (this.isOpen) this.hide();
    else this.show();
  }

  show() {
    if (this.panel) return;
    this._build();
    requestAnimationFrame(() => {
      this.panel.style.opacity = '1';
      this.panel.style.transform = 'translate(-50%, -50%) scale(1)';
    });
    this.isOpen = true;
  }

  hide() {
    if (!this.panel) return;
    this.panel.style.opacity = '0';
    this.panel.style.transform = 'translate(-50%, -50%) scale(0.95)';
    setTimeout(() => {
      this.panel?.remove();
      this.panel = null;
    }, 250);
    this.isOpen = false;
  }

  _build() {
    this.panel = document.createElement('div');
    this.panel.id = 'shortcutsPanel';
    Object.assign(this.panel.style, {
      position: 'fixed',
      top: '50%', left: '50%',
      transform: 'translate(-50%, -50%) scale(0.95)',
      width: 'min(520px, 92vw)',
      maxHeight: '85vh',
      padding: '24px',
      background: 'rgba(8, 10, 20, 0.96)',
      backdropFilter: 'blur(24px)',
      border: '1px solid rgba(91,196,207,0.25)',
      borderRadius: '20px',
      boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 60px rgba(91,196,207,0.15)',
      color: '#e4eaf8',
      zIndex: '9999',
      overflowY: 'auto',
      opacity: '0',
      transition: 'opacity 0.25s ease, transform 0.25s ease',
    });

    const sections = SHORTCUTS.map(group => {
      const items = group.items.map(item =>
        `<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;
          border-bottom:1px solid rgba(255,255,255,0.04);gap:12px;">
          <span style="color:rgba(228,234,248,0.7);font-size:12.5px;">${t(item.desc)}</span>
          <kbd style="background:rgba(91,196,207,0.12);border:1px solid rgba(91,196,207,0.3);
            color:#5bc4cf;padding:3px 10px;border-radius:6px;font-size:11px;font-family:monospace;
            white-space:nowrap;">${item.key}</kbd>
        </div>`
      ).join('');

      return `
        <div style="margin-bottom:18px;">
          <h3 style="margin:0 0 8px;font-size:11px;font-weight:700;color:rgba(228,234,248,0.5);
            text-transform:uppercase;letter-spacing:1px;">${t(group.section)}</h3>
          ${items}
        </div>
      `;
    }).join('');

    this.panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;
        padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.08);">
        <h2 style="margin:0;font-size:1.2rem;font-weight:800;color:#5bc4cf;">${t('shortcuts_title')}</h2>
        <button id="scClose" style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.16);
          color:rgba(228,234,248,0.7);width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:14px;
          display:flex;align-items:center;justify-content:center;">✕</button>
      </div>
      ${sections}
      <div style="text-align:center;margin-top:14px;font-size:11px;color:rgba(228,234,248,0.4);">
        Press <kbd style="background:rgba(255,255,255,0.08);padding:2px 6px;border-radius:4px;">H</kbd> to close
      </div>
    `;

    document.body.appendChild(this.panel);
    this.panel.querySelector('#scClose').addEventListener('click', () => this.hide());

    this.unsub = onLangChange(() => {
      this._build();
      this.panel.style.opacity = '1';
      this.panel.style.transform = 'translate(-50%, -50%) scale(1)';
    });
  }
}

export const shortcutsPanel = new ShortcutsPanel();
