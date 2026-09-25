// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { ThemeManager } from './theme.js';

describe('ThemeManager', () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('usa dark come default e lo applica al documento', () => {
    const mgr = new ThemeManager();
    expect(mgr.get()).toBe('dark');
    mgr.apply();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('alterna tema e persiste la scelta', () => {
    const mgr = new ThemeManager();
    expect(mgr.toggle()).toBe('light');
    expect(localStorage.getItem('solar-system.theme')).toBe('light');
    expect(new ThemeManager().get()).toBe('light');
    expect(mgr.toggle()).toBe('dark');
  });

  it('ignora temi non validi', () => {
    const mgr = new ThemeManager();
    mgr.set('neon');
    expect(mgr.get()).toBe('dark');
    mgr.set('light');
    expect(mgr.get()).toBe('light');
  });
});
