// Comprehensive texture loading test
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock document before any import that needs it
const mockCreateElementNS = () => ({
  src: '',
  decode: () => Promise.resolve(),
  addEventListener: () => {},
  removeEventListener: () => {},
});

if (typeof globalThis.document === 'undefined') {
  globalThis.document = { createElementNS: mockCreateElementNS };
}

const THREE = await import('three');
const { AsyncTextureLoader } = await import('./textureLoader.js');

describe('AsyncTextureLoader', () => {
  let loader;

  beforeEach(() => {
    loader = new AsyncTextureLoader();
  });

  it('creates loader instance', () => {
    expect(loader).toBeInstanceOf(AsyncTextureLoader);
  });

  it('has load method', () => {
    expect(typeof loader.load).toBe('function');
  });

  it('has loadAsync method', () => {
    expect(typeof loader.loadAsync).toBe('function');
  });

  it('has cache capability', () => {
    expect(loader.cache).toBeInstanceOf(Map);
  });

  it('returns placeholder texture on load', () => {
    const url = '/test-texture.jpg';
    const texture = loader.load(url);
    expect(texture).toBeInstanceOf(THREE.Texture);
  });

  it('caches textures', () => {
    const url = '/test-texture.jpg';
    const texture1 = loader.load(url);
    const texture2 = loader.load(url);
    expect(texture1).toBe(texture2);
  });

  it('can set loading manager', () => {
    const manager = new THREE.LoadingManager();
    expect(() => loader.setManager(manager)).not.toThrow();
  });
});