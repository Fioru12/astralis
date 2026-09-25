// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { HUD } from './hud.js';
import { setLang } from '../i18n/index.js';

describe('HUD', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    setLang('it');
  });

  it('inizializza con corpo libero localizzato', () => {
    const hud = new HUD();
    hud.init();
    expect(document.getElementById('hud')).not.toBeNull();
    expect(document.getElementById('hudBody').textContent).toBe('Libero');
    setLang('en');
    const hudEn = new HUD();
    hudEn.init();
    expect(hudEn.setBody(null)).toBeUndefined();
    setLang('it');
  });

  it('aggiorna corpo e data nel locale corrente', () => {
    const hud = new HUD();
    hud.init();
    hud.setBody('Terra');
    expect(document.getElementById('hudBody').textContent).toBe('Terra');
    hud.setDate(new Date(Date.UTC(2026, 8, 25)));
    expect(document.getElementById('hudDate').textContent).toContain('2026');
  });

  it('calcola la media FPS su finestra mobile', () => {
    const hud = new HUD();
    hud.init();
    for (let i = 0; i < 35; i++) hud.updateFPS(60);
    expect(hud.fpsHistory.length).toBe(30);
    expect(document.getElementById('hudFps').textContent).toBe('60 FPS');
  });
});
