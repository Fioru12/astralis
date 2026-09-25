import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { createGalaxySectors, drawGalaxyMinimap } from './galaxyGrid.js';

const makeStar = (key, x, z, color = 0xffffff) => ({
  key,
  type: 'star',
  color,
  pivot: { position: new THREE.Vector3(x, 0, z) },
});

describe('galaxy grid', () => {
  const stars = [makeStar('Sun', -10, -5, 0xffffaa), makeStar('Sirius', 10, 15, 0xaaccff)];

  it('creates a complete grid with a surface and border per sector', () => {
    const group = new THREE.Group();
    expect(createGalaxySectors(stars, group, 4)).toBe(16);
    expect(group.children).toHaveLength(32);
    expect(group.children[0].userData).toEqual({ sectorX: 0, sectorY: 0 });
  });

  it('draws stars and the camera marker on the minimap', () => {
    const context = {
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillRect: vi.fn(),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
    };
    const canvas = { width: 200, height: 200, getContext: () => context };
    expect(drawGalaxyMinimap(canvas, stars, new THREE.Vector3())).toBe(true);
    expect(context.fillRect).toHaveBeenCalledWith(0, 0, 200, 200);
    expect(context.arc).toHaveBeenCalledTimes(6);
    expect(context.stroke).toHaveBeenCalledOnce();
  });
});
