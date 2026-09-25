// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { generateSaturnRingTexture, getProceduralPlanetTexture } from './proceduralTextures.js';
import { installCanvas2DStub } from './canvas2dStub.js';

installCanvas2DStub();

describe('proceduralTextures', () => {
  it('genera la texture degli anelli di Saturno', () => {
    const tex = generateSaturnRingTexture();
    expect(tex).toBeInstanceOf(THREE.CanvasTexture);
    expect(tex.wrapS).toBe(THREE.RepeatWrapping);
  });

  it('restituisce null quando esiste gia una texture', () => {
    expect(getProceduralPlanetTexture({ tex: 'x.webp' })).toBeNull();
  });

  it('genera texture per nani, lune e asteroidi', () => {
    for (const def of [
      { type: 'dwarf', key: 'Ceres', color: 0xccbbaa },
      { type: 'dwarf', key: 'Pluto', color: 0xdd9977 },
      { type: 'moon', key: 'Io', color: 0xffdd44 },
      { type: 'moon', key: 'Titan', color: 0xff9944 },
      { type: 'asteroid', key: 'Vesta', color: 0xdd7744 },
    ]) {
      const tex = getProceduralPlanetTexture(def);
      expect(tex, def.key).toBeInstanceOf(THREE.CanvasTexture);
    }
  });

  it('restituisce null per tipi sconosciuti', () => {
    expect(getProceduralPlanetTexture({ type: 'star', key: 'Sun' })).toBeNull();
  });
});
