// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import {
  ConstellationManager,
  CONSTELLATIONS_DATA,
  DEEP_SKY_OBJECTS,
  raDecToVector3,
} from './constellations.js';

describe('ConstellationManager', () => {
  let scene;
  let manager;

  beforeEach(() => {
    scene = new THREE.Scene();
    manager = new ConstellationManager(scene);
  });

  it('converts RA and Dec to valid 3D sphere coordinates', () => {
    const v1 = raDecToVector3(0, 0, 1000);
    expect(v1.x).toBeCloseTo(1000, 1);
    expect(v1.y).toBeCloseTo(0, 1);
    expect(v1.z).toBeCloseTo(0, 1);

    const v2 = raDecToVector3(6, 90, 1000);
    expect(v2.y).toBeCloseTo(1000, 1);
  });

  it('initializes constellation groups with lines and deep sky objects', () => {
    expect(CONSTELLATIONS_DATA.length).toBeGreaterThanOrEqual(5);
    expect(DEEP_SKY_OBJECTS.length).toBeGreaterThanOrEqual(4);
    expect(manager.group).toBeDefined();
    expect(manager.group.name).toBe('constellationsGroup');
    expect(scene.children).toContain(manager.group);
  });

  it('toggles visibility correctly', () => {
    expect(manager.visible).toBe(false);
    expect(manager.group.visible).toBe(false);

    manager.setVisible(true);
    expect(manager.visible).toBe(true);
    expect(manager.group.visible).toBe(true);

    manager.toggle();
    expect(manager.visible).toBe(false);
    expect(manager.group.visible).toBe(false);
  });
});
