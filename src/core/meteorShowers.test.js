// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { MeteorShowerManager } from './meteorShowers.js';

describe('MeteorShowerManager', () => {
  let scene;
  let manager;

  beforeEach(() => {
    scene = new THREE.Scene();
    manager = new MeteorShowerManager(scene, { spawnInterval: 0.1, maxMeteors: 4 });
  });

  it('initializes with a scene group and default visibility', () => {
    expect(manager.group).toBeDefined();
    expect(manager.visible).toBe(true);
    expect(scene.children).toContain(manager.group);
  });

  it('spawns meteors and animates them over time', () => {
    expect(manager.meteors.length).toBe(0);
    manager.spawnMeteor();
    expect(manager.meteors.length).toBe(1);

    // Update simulation time
    manager.update(0.1);
    expect(manager.meteors[0].progress).toBeGreaterThan(0);
  });

  it('recycles and removes completed meteors', () => {
    manager.spawnInterval = 100; // prevent auto-spawn during test
    manager.spawnTimer = 0;
    manager.spawnMeteor();
    const meteor = manager.meteors[0];
    meteor.lifetime = 0.1;

    // Advance past lifetime
    manager.update(0.2);
    expect(manager.meteors.length).toBe(0);
  });

  it('toggles visibility and clears meteors', () => {
    manager.spawnMeteor();
    manager.clear();
    expect(manager.meteors.length).toBe(0);

    manager.setVisible(false);
    expect(manager.visible).toBe(false);
    expect(manager.group.visible).toBe(false);
  });
});
