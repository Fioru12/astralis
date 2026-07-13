import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { rebuildOrbits } from './orbits.js';

describe('rebuildOrbits', () => {
  it('does nothing when T is unchanged', () => {
    const ref = { current: null };
    const group = new THREE.Group();
    rebuildOrbits(0.5, group, ref);
    const count = group.children.length;
    rebuildOrbits(0.5, group, ref);
    expect(group.children.length).toBe(count);
  });

  it('accepts new T value', () => {
    const ref = { current: null };
    const group = new THREE.Group();
    rebuildOrbits(0.0, group, ref);
    expect(ref.current).toBe(0.0);
  });

  it('clears and rebuilds on T change', () => {
    const ref = { current: null };
    const group = new THREE.Group();
    rebuildOrbits(0.0, group, ref);
    const count1 = group.children.length;
    rebuildOrbits(1.0, group, ref);
    const count2 = group.children.length;
    expect(count1).toBe(count2);
    expect(count1).toBeGreaterThan(0);
  });
});
