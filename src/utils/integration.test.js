import { describe, it, expect } from 'vitest';
import * as THREE from 'three';

describe('Scene integration', () => {
  it('THREE library loads', () => {
    expect(THREE.Scene).toBeDefined();
    expect(THREE.WebGLRenderer).toBeDefined();
    expect(THREE.LOD).toBeDefined();
  });

  it('can create basic THREE objects', () => {
    const scene = new THREE.Scene();
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshStandardMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    expect(scene.children.length).toBe(1);
    expect(mesh.parent).toBe(scene);
  });

  it('can create LOD objects', () => {
    const lod = new THREE.LOD();
    const geom1 = new THREE.SphereGeometry(1, 32, 32);
    const geom2 = new THREE.SphereGeometry(1, 16, 16);
    const mat = new THREE.MeshStandardMaterial();

    const mesh1 = new THREE.Mesh(geom1, mat);
    const mesh2 = new THREE.Mesh(geom2, mat);

    lod.addLevel(mesh1, 0);
    lod.addLevel(mesh2, 300);

    expect(lod.levels.length).toBe(2);
  });

  it('LoadingManager works', () => {
    const manager = new THREE.LoadingManager();
    let onProgress = 0;
    let onComplete = false;

    manager.onProgress = () => {
      onProgress++;
    };
    manager.onLoad = () => {
      onComplete = true;
    };

    manager.onProgress();
    expect(onProgress).toBe(1);

    manager.onLoad();
    expect(onComplete).toBe(true);
  });

  it('can create asteroid belt group', () => {
    const asteroidGroup = new THREE.Group();
    const geometry = new THREE.SphereGeometry(0.3, 8, 8);
    const material = new THREE.MeshStandardMaterial({ color: 0x887766 });

    for (let i = 0; i < 10; i++) {
      const asteroid = new THREE.Mesh(geometry, material);
      asteroid.position.set(Math.random() * 100, Math.random() * 10, Math.random() * 100);
      asteroidGroup.add(asteroid);
    }

    expect(asteroidGroup.children.length).toBe(10);
  });
});
