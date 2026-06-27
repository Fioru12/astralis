/**
 * Command Palette (Ctrl+K) - Ricerca fuzzy + comandi rapidi
 * Stile VS Code / GitHub
 */
import { t } from '../i18n/index.js';
import { escapeHtml } from '../utils/sanitize.js';
import { PLANETS, MOONS, ASTEROIDS, COMETS, NEARBY_STARS, EXOPLANETS } from '../data/celestialData.js';

const BODIES = [
  ...PLANETS, ...MOONS, ...ASTEROIDS, ...COMETS, ...NEARBY_STARS, ...EXOPLANETS
];

// Fuzzy search semplice
function fuzzyMatch(query, str) {
  const q = query.toLowerCase();
  const s = str.toLowerCase();
  let qi = 0;
  for (let i = 0; i < s.length && qi < q.length; i++) {
    if (s[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

function score(query, str) {
  const q = query.toLowerCase();
  const s = str.toLowerCase();
  if (s.startsWith(q)) return 100;
  if (s.includes(q)) return 50;
  if (fuzzyMatch(q, s)) return 10;
  return 0;
}

export class CommandPalette {
  constructor(actions = {}) {
    this.actions = actions; // { goToBody, focusOn, setTheme, etc. }
    this.isOpen = false;
    this.panel = null;
    this.input = null;
    this.results = null;
    this.selectedIndex = 0;
    this.currentItems = [];
  }

  registerActions(actions) {
    this.actions = { ...this.actions, ...actions };
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
      this.input.focus();
    });
    this.isOpen = true;
  }

  hide() {
    if (!this.panel) return;
    this.panel.style.opacity = '0';
    setTimeout(() => {
      this.panel?.remove();
      this.panel = null;
      this.input = null;
      this.results = null;
    }, 200);
    this.isOpen = false;
  }

  _build() {
    this.panel = document.createElement('div');
    this.panel.id = 'commandPalette';
    Object.assign(this.panel.style, {
      position: 'fixed',
      top: '15%', left: '50%',
      transform: 'translateX(-50%)',
      width: 'min(600px, 92vw)',
      maxHeight: '70vh',
      background: 'rgba(8, 10, 20, 0.97)',
      backdropFilter: 'blur(24px)',
      border: '1px solid rgba(91,196,207,0.3)',
      borderRadius: '16px',
      boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 60px rgba(91,196,207,0.2)',
      zIndex: '10000',
      overflow: 'hidden',
      opacity: '0',
      transition: 'opacity 0.18s ease',
      display: 'flex', flexDirection: 'column',
    });

    this.panel.innerHTML = `
      <div style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.08);
        display:flex;align-items:center;gap:10px;">
        <span style="font-size:18px;">🔍</span>
        <input id="cmdInput" type="text" placeholder="${escapeHtml(t('cmd_placeholder'))}"
          style="flex:1;background:transparent;border:none;outline:none;color:#e4eaf8;
          font-size:15px;font-family:inherit;" />
        <kbd style="background:rgba(255,255,255,0.08);padding:2px 8px;border-radius:5px;
          font-size:10px;color:rgba(228,234,248,0.5);">ESC</kbd>
      </div>
      <div id="cmdResults" style="flex:1;overflow-y:auto;padding:6px;"></div>
      <div style="padding:8px 18px;border-top:1px solid rgba(255,255,255,0.05);
        font-size:10.5px;color:rgba(228,234,248,0.4);display:flex;justify-content:space-between;">
        <span>↑↓ navigate</span><span>↵ select</span><span>Ctrl+K close</span>
      </div>
    `;

    document.body.appendChild(this.panel);
    this.input = this.panel.querySelector('#cmdInput');
    this.results = this.panel.querySelector('#cmdResults');

    this.input.addEventListener('input', () => this._render());
    this.input.addEventListener('keydown', (e) => this._onKey(e));
    this.panel.addEventListener('click', (e) => {
      if (e.target.closest('[data-cmd-item]')) {
        const idx = parseInt(e.target.closest('[data-cmd-item]').dataset.cmdItem);
        this._execute(this.currentItems[idx]);
      }
    });
  }

  _onKey(e) {
    if (e.key === 'Escape') { this.hide(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.selectedIndex = Math.min(this.selectedIndex + 1, this.currentItems.length - 1);
      this._highlight();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
      this._highlight();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (this.currentItems[this.selectedIndex]) {
        this._execute(this.currentItems[this.selectedIndex]);
      }
    }
  }

  _getAllItems() {
    const actions = [
      { type: 'action', icon: '⏸', label: t('cmd_action_pause'),        id: 'pause' },
      { type: 'action', icon: '▶', label: t('cmd_action_resume'),       id: 'resume' },
      { type: 'action', icon: '🎯', label: t('cmd_action_reset_cam'),    id: 'reset_cam' },
      { type: 'action', icon: '🛰️', label: t('cmd_action_toggle_orbits'), id: 'toggle_orbits' },
      { type: 'action', icon: '🏷️', label: t('cmd_action_toggle_labels'), id: 'toggle_labels' },
      { type: 'action', icon: '🌓', label: t('cmd_action_toggle_theme'), id: 'toggle_theme' },
      { type: 'action', icon: '📖', label: t('cmd_action_open_help'),    id: 'help' },
      { type: 'action', icon: '⏰', label: t('cmd_action_timetravel'),    id: 'timetravel' },
      { type: 'action', icon: '📷', label: t('cmd_action_screenshot'),   id: 'screenshot' },
      { type: 'action', icon: '🔗', label: t('cmd_action_share'),        id: 'share' },
      { type: 'action', icon: '🔊', label: t('cmd_action_sound'),        id: 'sound' },
      { type: 'action', icon: '🎓', label: t('cmd_action_quiz'),         id: 'quiz' },
      { type: 'action', icon: '⚙️', label: t('cmd_action_settings') || 'Impostazioni', id: 'settings' },
      { type: 'view',   icon: '🏠', label: t('cmd_view_home'),    id: 'home' },
      { type: 'view',   icon: '🪐', label: t('cmd_view_system'),  id: 'system' },
      { type: 'view',   icon: '🔥', label: t('cmd_view_inner'),   id: 'inner' },
      { type: 'view',   icon: '🌑', label: t('cmd_view_outer'),   id: 'outer' },
      { type: 'view',   icon: '☄️', label: t('cmd_view_belt'),    id: 'belt' },
      { type: 'view',   icon: '❄️', label: t('cmd_view_kuiper'),  id: 'kuiper' },
      { type: 'view',   icon: '🌌', label: t('cmd_view_galaxy'),  id: 'galaxy' },
    ];
    const bodies = BODIES.map(b => ({
      type: 'body',
      icon: b.icon || '🌍',
      label: b.name,
      id: b.id || b.name,
      body: b,
    }));
    return [...actions, ...bodies];
  }

  _render() {
    const q = this.input.value.trim();
    let items = this._getAllItems();
    if (q) {
      items = items
        .map(it => ({ ...it, _score: score(q, it.label) }))
        .filter(it => it._score > 0)
        .sort((a, b) => b._score - a._score)
        .slice(0, 30);
    } else {
      items = items.slice(0, 20);
    }
    this.currentItems = items;
    this.selectedIndex = 0;

    if (items.length === 0) {
      this.results.innerHTML = `<div style="padding:30px;text-align:center;color:rgba(228,234,248,0.4);">${escapeHtml(t('cmd_no_results'))}</div>`;
      return;
    }

    const sections = { action: [], view: [], body: [] };
    items.forEach((it, idx) => sections[it.type]?.push({ ...it, _idx: idx }));

    const sectionLabels = { action: t('cmd_section_actions'), view: t('cmd_section_nav'), body: t('cmd_section_nav') };
    const html = Object.entries(sections).filter(([, arr]) => arr.length).map(([key, arr]) => `
      <div style="padding:6px 14px 4px;font-size:10px;font-weight:700;color:rgba(228,234,248,0.4);
        text-transform:uppercase;letter-spacing:1px;">${sectionLabels[key]}</div>
      ${arr.map(it => `
        <div data-cmd-item="${it._idx}" class="cmd-item"
          style="padding:8px 14px;margin:2px 6px;border-radius:8px;cursor:pointer;
          display:flex;align-items:center;gap:10px;transition:background 0.1s;
          ${it._idx === this.selectedIndex ? 'background:rgba(91,196,207,0.15);' : ''}">
          <span style="font-size:16px;width:22px;text-align:center;">${escapeHtml(it.icon || '⚡')}</span>
          <span style="color:#e4eaf8;font-size:13px;flex:1;">${escapeHtml(it.label)}</span>
        </div>
      `).join('')}
    `).join('');

    this.results.innerHTML = html;
  }

  _highlight() {
    this.results.querySelectorAll('.cmd-item').forEach((el, i) => {
      const isSel = i === this.selectedIndex;
      el.style.background = isSel ? 'rgba(91,196,207,0.18)' : 'transparent';
      el.style.borderLeft = isSel ? '2px solid #5bc4cf' : '2px solid transparent';
    });
    const sel = this.results.querySelector('.cmd-item:nth-child(' + (this.selectedIndex + 1) + ')');
    sel?.scrollIntoView({ block: 'nearest' });
  }

  _execute(item) {
    this.hide();
    if (!item) return;
    if (item.type === 'body' && this.actions.goToBody) {
      this.actions.goToBody(item.body);
    } else if (this.actions[item.id]) {
      this.actions[item.id]();
    }
  }
}

export const commandPalette = new CommandPalette();
