import { describe, it, expect } from 'vitest';
import { disposeMaterial, disposeObject, disposeScene } from './dispose.js';

function fakeTexture() {
  return {
    isTexture: true,
    disposed: false,
    dispose() {
      this.disposed = true;
    },
  };
}

function fakeMaterial() {
  return {
    map: fakeTexture(),
    disposed: false,
    dispose() {
      this.disposed = true;
    },
  };
}

describe('dispose utils', () => {
  it('disposeMaterial rilascia mappe e materiale', () => {
    const mat = fakeMaterial();
    disposeMaterial(mat);
    expect(mat.map.disposed).toBe(true);
    expect(mat.disposed).toBe(true);
  });

  it('disposeMaterial gestisce array di materiali e valori nulli', () => {
    const a = fakeMaterial();
    const b = fakeMaterial();
    expect(() => disposeMaterial([a, b])).not.toThrow();
    expect(() => disposeMaterial(null)).not.toThrow();
    expect(a.disposed && b.disposed).toBe(true);
  });

  it('disposeObject attraversa i figli', () => {
    const geo = {
      disposed: false,
      dispose() {
        this.disposed = true;
      },
    };
    const mat = fakeMaterial();
    const child = { geometry: geo, material: mat };
    const root = {
      traverse(fn) {
        fn(root);
        fn(child);
      },
    };
    disposeObject(root);
    expect(geo.disposed).toBe(true);
    expect(mat.disposed).toBe(true);
  });

  it('disposeScene rimuove i figli e rilascia il renderer', () => {
    const removed = [];
    const parent = {
      remove(c) {
        removed.push(c);
      },
    };
    const geo = {
      disposed: false,
      dispose() {
        this.disposed = true;
      },
    };
    const child = {
      parent,
      geometry: geo,
      material: fakeMaterial(),
      traverse(fn) {
        fn(child);
      },
    };
    const renderer = {
      disposed: false,
      dispose() {
        this.disposed = true;
      },
    };
    disposeScene({ parent, children: [child], renderer });
    expect(removed).toContain(child);
    expect(geo.disposed).toBe(true);
    expect(renderer.disposed).toBe(true);
  });
});
