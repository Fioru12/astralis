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
    // Verify Kepler's equation: E - e*sin(E) ≈ M
    const check = E - e * Math.sin(E);
    expect(Math.abs(check - M)).toBeLessThan(1e-9);
  });
});

