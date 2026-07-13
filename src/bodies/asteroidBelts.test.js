import { describe, it, expect } from 'vitest';

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
});
