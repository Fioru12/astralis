// Comprehensive texture loading test
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AsyncTextureLoader } from './textureLoader.js';
import * as THREE from 'three';

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
