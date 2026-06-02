/**
 * URL State Sharing
 */
import { isValidBodyKey } from '../utils/sanitize.js';

const PARAMS = ['body', 'view', 'date', 'speed', 'theme', 'lang', 'preset'];

export class URLState {
  constructor() {
    this.params = new URLSearchParams(window.location.search);
  }

  get(key) { return this.params.get(key); }
  has(key) { return this.params.has(key); }

  getBodyKey() { const k = this.params.get('body'); return isValidBodyKey(k) ? k : null; }

  set(key, value) {
    if (value === null || value === undefined) this.params.delete(key);
    else this.params.set(key, value);
    this._write();
  }

  setMany(obj) {
    Object.entries(obj).forEach(([k, v]) => {
      if (v === null || v === undefined) this.params.delete(k);
      else this.params.set(k, v);
    });
    this._write();
  }

  remove(key) { this.params.delete(key); this._write(); }

  toJSON() {
    const obj = {};
    PARAMS.forEach(p => { if (this.params.has(p)) obj[p] = this.params.get(p); });
    return obj;
  }

  getShareURL() {
    return window.location.origin + window.location.pathname + '?' + this.params.toString();
  }

  copyShareURL() {
    const url = this.getShareURL();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => this._fallbackCopy(url));
    } else {
      this._fallbackCopy(url);
    }
  }

  _fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  _write() {
    const q = this.params.toString();
    const newUrl = window.location.pathname + (q ? '?' + q : '');
    window.history.replaceState({}, '', newUrl);
  }
}

export const urlState = new URLState();
