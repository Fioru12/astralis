import { describe, expect, it } from 'vitest';
import { GRAPHICS_QUALITIES, getGraphicsPreset } from './graphicsPresets.js';

describe('getGraphicsPreset', () => {
  it('ricade su high per valori sconosciuti', () => {
    expect(getGraphicsPreset('boh', 2).quality).toBe('high');
    expect(getGraphicsPreset(undefined).quality).toBe('high');
  });

  it('limita il pixel ratio al devicePixelRatio', () => {
    expect(getGraphicsPreset('ultra', 1).pixelRatio).toBe(1);
    expect(getGraphicsPreset('ultra', 3).pixelRatio).toBe(2.5);
    expect(getGraphicsPreset('low', 3).pixelRatio).toBe(0.85);
  });

  it('aumenta il dettaglio in modo monotono da low a ultra', () => {
    const p = GRAPHICS_QUALITIES.map((q) => getGraphicsPreset(q, 3));
    for (let i = 1; i < p.length; i++) {
      expect(p[i].pixelRatio).toBeGreaterThanOrEqual(p[i - 1].pixelRatio);
      expect(p[i].bloom).toBeGreaterThanOrEqual(p[i - 1].bloom);
      expect(Number(p[i].shadows)).toBeGreaterThanOrEqual(Number(p[i - 1].shadows));
    }
    expect(p[0]).toMatchObject({ shadows: false, bloom: 0, dust: false, oort: false });
  });
});
