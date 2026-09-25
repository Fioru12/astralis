// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { achievements, AchievementPanel, BRAND } from './brand.js';
import { setLang } from '../i18n/index.js';

describe('achievements', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    achievements.unlocked = [];
    achievements.stats = {};
    setLang('it');
  });

  it('sblocca una sola volta e somma XP', () => {
    expect(achievements.unlock('explorer')).not.toBeNull();
    expect(achievements.unlock('explorer')).toBeNull();
    const { xp, unlocked, total } = achievements.getProgress();
    expect(unlocked).toBe(1);
    expect(total).toBeGreaterThan(5);
    expect(xp).toBe(25);
  });

  it('traccia le visite e sblocca le soglie', () => {
    for (let i = 0; i < 5; i++) achievements.track('body_visited');
    expect(achievements.getUnlocked()).toContain('explorer');
    for (let i = 0; i < 3; i++) achievements.track('body_visited');
    expect(achievements.getUnlocked()).toContain('astronomer');
  });

  it('mostra il toast localizzato e il pannello', async () => {
    setLang('en');
    achievements.unlock('first_visit');
    expect(document.body.textContent).toContain('Achievement Unlocked!');
    const panel = new AchievementPanel();
    panel.toggle();
    expect(document.getElementById('achievementPanel')).not.toBeNull();
    expect(document.getElementById('achList').children.length).toBeGreaterThan(5);
    panel.toggle();
    await new Promise((r) => setTimeout(r, 250));
    expect(document.getElementById('achievementPanel')).toBeNull();
    setLang('it');
  });

  it('BRAND espone tagline bilingue', () => {
    expect(BRAND.tagline).toBeTruthy();
    expect(BRAND.taglineEn).toBeTruthy();
    expect(BRAND.version).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
