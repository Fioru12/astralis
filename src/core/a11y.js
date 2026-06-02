/**
 * Accessibility
 */
const KEY = 'solar-system.a11y';
export class A11y {
  constructor() { this.prefs = this._load(); }
  _load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } }
  _save() { localStorage.setItem(KEY, JSON.stringify(this.prefs)); }
  apply() {
    const r = document.documentElement;
    if (this.prefs.reduceMotion) r.setAttribute('data-reduce-motion', '1');
    else r.removeAttribute('data-reduce-motion');
    if (this.prefs.highContrast) r.setAttribute('data-high-contrast', '1');
    else r.removeAttribute('data-high-contrast');
  }
  get(k) { return !!this.prefs[k]; }
  set(k, v) { this.prefs[k] = !!v; this._save(); this.apply(); }
  toggle(k) { this.set(k, !this.get(k)); return this.get(k); }
}
export const a11y = new A11y();
if (window.matchMedia) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mq.matches && !('reduceMotion' in a11y.prefs)) a11y.set('reduceMotion', true);
}
