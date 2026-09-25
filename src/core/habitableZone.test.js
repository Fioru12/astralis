import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { HabitableZoneManager } from './habitableZone.js';

describe('HabitableZoneManager', () => {
  let scene;
  let hzManager;

  beforeEach(() => {
    scene = new THREE.Scene();
    hzManager = new HabitableZoneManager(scene, { visible: true });
  });

  it('should initialize correctly with empty zones', () => {
    expect(hzManager.zones).toHaveLength(0);
    expect(hzManager.visible).toBe(true);
  });

  it('should populate habitable zones for star bodies', () => {
    const fakeSunPivot = new THREE.Object3D();
    fakeSunPivot.position.set(0, 0, 0);

    const mockBodies = [
      { key: 'Sun', type: 'star', label: 'Sole', radius: 10, pivot: fakeSunPivot },
      { key: 'Earth', type: 'planet', label: 'Terra', radius: 1, distAU: 1.0, parent: 'Sun' },
    ];

    hzManager.init(mockBodies);

    expect(hzManager.zones).toHaveLength(1);
    expect(hzManager.zones[0].starKey).toBe('Sun');
  });

  it('should toggle visibility correctly', () => {
    expect(hzManager.visible).toBe(true);
    const newState = hzManager.toggle();
    expect(newState).toBe(false);
    expect(hzManager.visible).toBe(false);
  });

  it('should correctly identify habitable bodies', () => {
    const earth = { key: 'Earth', distAU: 1.0, parent: 'Sun' };
    const venus = { key: 'Venus', distAU: 0.72, parent: 'Sun' };
    const exoHabitable = { key: 'Kepler452b', habitability: 'Pianeta Potenzialmente Abitabile' };

    expect(hzManager.isBodyHabitable(earth)).toBe(true);
    expect(hzManager.isBodyHabitable(venus)).toBe(false);
    expect(hzManager.isBodyHabitable(exoHabitable)).toBe(true);
  });
});
