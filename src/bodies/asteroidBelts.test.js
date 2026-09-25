import { describe, it, expect } from 'vitest';
import { ASTEROIDS, ORBITAL_ELEMENTS } from '../data/celestialData.js';

describe('asteroidBelts exports', () => {
  it('all exports are functions', async () => {
    const mod = await import('./asteroidBelts.js');
    expect(typeof mod.generateAsteroidBelt).toBe('function');
    expect(typeof mod.updateAsteroidBelts).toBe('function');
    expect(typeof mod.createDustBelts).toBe('function');
    expect(typeof mod.createOortCloud).toBe('function');
    expect(typeof mod.updateDustBelts).toBe('function');
    expect(typeof mod.buildAsteroidBody).toBe('function');
  });

  it('gives every listed asteroid an orbital solution away from the Sun', () => {
    ASTEROIDS.forEach(({ key }) => {
      expect(ORBITAL_ELEMENTS[key]?.a0, key).toBeGreaterThan(0);
    });
  });
});
