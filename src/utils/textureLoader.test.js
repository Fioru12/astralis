// Comprehensive texture loading test
import { describe, it, expect, beforeEach } from 'vitest';

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

  it('disposes a single cached texture', () => {
    const url = '/dispose-me.jpg';
    loader.load(url);
    expect(loader.has(url)).toBe(true);
    expect(loader.dispose(url)).toBe(true);
    expect(loader.has(url)).toBe(false);
  });

  it('calls dispose on the GPU texture when clearing one entry', () => {
    let disposed = 0;
    loader.cache.set('/gpu.jpg', { dispose: () => disposed++ });
    expect(loader.dispose('/gpu.jpg')).toBe(true);
    expect(disposed).toBe(1);
    expect(loader.size).toBe(0);
  });

  it('returns false when disposing an unknown path', () => {
    expect(loader.dispose('/never-loaded.jpg')).toBe(false);
  });

  it('clears the whole cache', () => {
    loader.load('/a.jpg');
    loader.load('/b.jpg');
    expect(loader.size).toBe(2);
    loader.clear();
    expect(loader.size).toBe(0);
  });

  it('rewrites KTX2/Basis paths to WebP equivalent', () => {
    const webp = loader.load('/tex/earth.webp');
    const ktx = loader.load('/tex/earth.ktx2');
    expect(ktx).toBe(webp);
    const basis = loader.load('/tex/earth.basis');
    expect(basis).toBe(webp);
  });

  it('loadAsync rewrites KTX2 paths to WebP', async () => {
    const fake = { image: {}, dispose: () => {} };
    loader.cache.set('/tex/mars.webp', fake);
    await expect(loader.loadAsync('/tex/mars.ktx2')).resolves.toBe(fake);
  });
});
