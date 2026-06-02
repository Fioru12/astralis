/**
 * Theme Manager - Light/Dark theme switcher
 */
const STORAGE_KEY = 'solar-system.theme';

export class ThemeManager {
  constructor() {
    this.current = localStorage.getItem(STORAGE_KEY) || 'dark';
  }

  apply() {
    document.documentElement.setAttribute('data-theme', this.current);
  }

  toggle() {
    this.current = this.current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY, this.current);
    this.apply();
    return this.current;
  }

  set(theme) {
    if (theme !== 'dark' && theme !== 'light') return;
    this.current = theme;
    localStorage.setItem(STORAGE_KEY, theme);
    this.apply();
  }

  get() { return this.current; }
}

export const themeManager = new ThemeManager();
