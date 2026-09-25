import { describe, it, expect } from 'vitest';
import * as kepler from './kepler.js';

describe('kepler module', () => {
  it('exports something', () => {
    expect(typeof kepler).toBe('object');
  });

  it('exports solveKepler function', () => {
    expect(typeof kepler.solveKepler).toBe('function');
  });

  it('solveKepler converges', () => {
    const M = 0.5;
    const e = 0.1;
    const E = kepler.solveKepler(M, e);
    expect(E).toBeDefined();
    expect(typeof E).toBe('number');
    // Verify Kepler's equation: E - e*sin(E) == M
    const check = E - e * Math.sin(E);
    expect(Math.abs(check - M)).toBeLessThan(1e-9);
  });

  it('solveKepler con eccentricita zero restituisce M', () => {
    expect(kepler.solveKepler(1.234, 0)).toBeCloseTo(1.234, 9);
  });

  it('wrapDeg180 normalizza gli angoli', () => {
    expect(kepler.wrapDeg180(190)).toBe(-170);
    expect(kepler.wrapDeg180(-190)).toBe(170);
    expect(kepler.wrapDeg180(45)).toBe(45);
    expect(kepler.wrapDeg180(360)).toBe(0);
  });

  it('keplerPos posiziona la Terra a ~1 AU alla epoca J2000', async () => {
    const { ORBITAL_ELEMENTS } = await import('../data/celestialData.js');
    const { AU } = await import('./constants.js');
    const pos = kepler.keplerPos('Earth', 0, ORBITAL_ELEMENTS);
    expect(Math.abs(pos.length() - AU) / AU).toBeLessThan(0.05);
  });

  it('keplerPos restituisce il vettore nullo per corpi sconosciuti', async () => {
    const { ORBITAL_ELEMENTS } = await import('../data/celestialData.js');
    expect(kepler.keplerPos('Nibiru', 0, ORBITAL_ELEMENTS).length()).toBe(0);
  });

  it('julianDate e currentT sono riesportati da helpers', async () => {
    const helpers = await import('./helpers.js');
    expect(kepler.julianDate).toBe(helpers.julianDate);
    expect(kepler.currentT).toBe(helpers.currentT);
  });
});
