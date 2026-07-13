import * as THREE from 'three';

class AsyncTextureLoader {
  constructor() {
    this.loader = new THREE.TextureLoader();
    this.cache = new Map();
  }

  setManager(manager) {
    this.loader = new THREE.TextureLoader(manager);
  }

  load(path, fallback) {
    if (this.cache.has(path)) return this.cache.get(path);

    const placeholder = new THREE.Texture();
    placeholder.minFilter = THREE.LinearMipmapLinearFilter;
    placeholder.magFilter = THREE.LinearFilter;
    placeholder.anisotropy = 1;
    placeholder.generateMipmaps = false;

    this.loader.load(
      path,
      (tex) => {
        placeholder.image = tex.image;
        placeholder.mapping = tex.mapping;
        placeholder.wrapS = tex.wrapS;
        placeholder.wrapT = tex.wrapT;
        placeholder.minFilter = tex.minFilter;
        placeholder.magFilter = tex.magFilter;
        placeholder.anisotropy = tex.anisotropy || 1;
        placeholder.generateMipmaps = true;
        placeholder.needsUpdate = true;
      },
      undefined,
      () => {
        if (fallback) {
          const fb = typeof fallback === 'function' ? fallback() : fallback;
          placeholder.image = fb.image;
          placeholder.minFilter = fb.minFilter;
          placeholder.magFilter = fb.magFilter;
          placeholder.generateMipmaps = fb.generateMipmaps;
          placeholder.needsUpdate = true;
        }
      }
    );

    this.cache.set(path, placeholder);
    return placeholder;
  }

  loadAsync(path) {
    if (this.cache.has(path) && this.cache.get(path).image) return Promise.resolve(this.cache.get(path));
    return new Promise((resolve, reject) => {
      this.loader.load(path, (tex) => {
        this.cache.set(path, tex);
        resolve(tex);
      }, undefined, reject);
    });
  }
}

export { AsyncTextureLoader };
export const textureLoader = new AsyncTextureLoader();
