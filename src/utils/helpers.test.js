// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import {
  createTooltip,
  currentT,
  formatNumber,
  julianDate,
  makeCanvasSprite,
  makeGlow,
} from './helpers.js';
import { installCanvas2DStub } from './canvas2dStub.js';

installCanvas2DStub();

describe('helpers', () => {
  it('calcola la data giuliana J2000 esatta', () => {
    expect(julianDate(new Date(Date.UTC(2000, 0, 1, 12, 0, 0)))).toBe(2451545.0);
  });

  it('currentT vale ~0 alla epoca J2000 e ~0.25 nel 2025', () => {
    expect(currentT(new Date(Date.UTC(2000, 0, 1, 12, 0, 0)))).toBeCloseTo(0, 10);
    expect(currentT(new Date(Date.UTC(2025, 0, 1, 12, 0, 0)))).toBeCloseTo(0.25, 2);
  });

  it('formatta i numeri con il punto delle migliaia', () => {
    expect(formatNumber(1234567)).toBe('1.234.567');
    expect(formatNumber(42)).toBe('42');
  });

  it('createTooltip crea un div nascosto nel body', () => {
    const el = createTooltip();
    expect(el.tagName).toBe('DIV');
    expect(el.style.display).toBe('none');
    el.remove();
  });

  it('makeCanvasSprite disegna e scala lo sprite', () => {
    let drawn = false;
    const sp = makeCanvasSprite(
      () => {
        drawn = true;
      },
      64,
      10
    );
    expect(drawn).toBe(true);
    expect(sp).toBeInstanceOf(THREE.Sprite);
    expect(sp.scale.x).toBe(10);
  });

  it('makeGlow crea uno sprite dal colore esadecimale', () => {
    const sp = makeGlow(5, 0xff0000);
    expect(sp).toBeInstanceOf(THREE.Sprite);
    expect(sp.scale.x).toBe(35);
  });
});
