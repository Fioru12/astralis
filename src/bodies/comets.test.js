import { describe, it, expect } from 'vitest';
import { cometVisualA, cometPosFromAngle, cometAngSpeed } from './comets.js';

const mockComet = { a: 17.834, e: 0.96714, I: 162.26, w: 111.33, O: 58.42, color: 0x00ffff };

describe('cometVisualA', () => {
  it('returns semi-major axis in scene units', () => {
    const result = cometVisualA(mockComet);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(2000);
  });
});

describe('cometPosFromAngle', () => {
  it('returns a Vector3', () => {
    const pos = cometPosFromAngle(mockComet, 0);
    expect(pos.x).not.toBeNaN();
    expect(pos.y).not.toBeNaN();
    expect(pos.z).not.toBeNaN();
  });

  it('returns different positions for different angles', () => {
    const p1 = cometPosFromAngle(mockComet, 0);
    const p2 = cometPosFromAngle(mockComet, Math.PI);
    expect(p1.distanceTo(p2)).toBeGreaterThan(0.1);
  });
});

describe('cometAngSpeed', () => {
  it('returns positive speed', () => {
    const speed = cometAngSpeed(mockComet, 0);
    expect(speed).toBeGreaterThan(0);
  });

  it('is faster at perihelion than aphelion', () => {
    const atPeri = cometAngSpeed(mockComet, 0);
    const atAph = cometAngSpeed(mockComet, Math.PI);
    expect(atPeri).toBeGreaterThan(atAph);
  });
});
