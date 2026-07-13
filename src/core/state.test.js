import { describe, it, expect } from 'vitest';
import { createSimState, simDate } from './state.js';

describe('createSimState', () => {
  it('returns default state object', () => {
    const state = createSimState();
    expect(state.paused).toBe(false);
    expect(state.timeOffsetMs).toBe(0);
    expect(state.selectedBody).toBe(null);
    expect(state.customDate).toBe(null);
    expect(state.galaxyMapMode).toBe(false);
    expect(state.lastOrbitT).toBe(null);
  });

  it('returns unique instances', () => {
    expect(createSimState()).not.toBe(createSimState());
  });
});

describe('simDate', () => {
  it('returns custom date when set', () => {
    const state = createSimState();
    const d = new Date('2025-01-01');
    state.customDate = d;
    expect(simDate(state)).toBe(d);
  });

  it('returns computed date from offset when no custom date', () => {
    const state = createSimState();
    state.timeOffsetMs = 86400000;
    const d = simDate(state);
    expect(d.getTime()).toBeCloseTo(Date.now() + 86400000, -3);
  });
});
