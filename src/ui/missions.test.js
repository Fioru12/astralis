// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { MISSIONS, MissionsSystem } from './missions.js';

describe('MissionsSystem', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
  });

  it('avanza di step visitando i corpi e assegna XP al completamento', () => {
    const ms = new MissionsSystem();
    expect(ms.totalXP).toBe(0);
    // explorer: Mercury..Neptune in ordine
    const targets = MISSIONS.find((m) => m.id === 'explorer').steps.map((s) => s.target);
    targets.forEach((key, i) => {
      ms.onBodyVisited(key);
      expect(ms.missionProgress.explorer).toBe(i + 1);
    });
    expect(ms.completedMissions).toContain('explorer');
    expect(ms.totalXP).toBe(200);
    expect(ms.badges.length).toBe(1);
  });

  it('ignora corpi fuori sequenza e missioni gia completate', () => {
    const ms = new MissionsSystem();
    ms.onBodyVisited('Neptune');
    expect(ms.missionProgress.explorer || 0).toBe(0);
    ms.onBodyVisited('Mercury');
    ms.onBodyVisited('Mercury');
    expect(ms.missionProgress.explorer).toBe(1);
  });

  it('avanza le tappe temporali con tolleranza di 5 anni', () => {
    const ms = new MissionsSystem();
    ms.onTimeTravel(1971);
    expect(ms.missionProgress.time_traveler).toBe(1);
    ms.onTimeTravel(2000);
    expect(ms.missionProgress.time_traveler).toBe(1);
    ms.onTimeTravel(2030);
    expect(ms.missionProgress.time_traveler).toBe(2);
  });

  it('persiste lo stato in localStorage', () => {
    const ms = new MissionsSystem();
    ms.onBodyVisited('Mercury');
    const ms2 = new MissionsSystem();
    expect(ms2.missionProgress.explorer).toBe(1);
  });
});
