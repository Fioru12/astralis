import * as THREE from 'three';

class AsyncTextureLoader {
  constructor() {
    this.loader = new THREE.TextureLoader();
    this.cache = new Map();
  }

  setManager(manager) {
    this.loader = new THREE.TextureLoader(manager);
  }

  // Synchronous-compatible API: returns a placeholder texture immediately
  // and updates it when the real texture is loaded.
  load(path) {
    if (this.cache.has(path)) return this.cache.get(path);

    const placeholder = new THREE.Texture();
    placeholder.minFilter = THREE.LinearMipmapLinearFilter;
    placeholder.magFilter = THREE.LinearFilter;
    placeholder.anisotropy = 1; // will be updated after load if renderer supports
    placeholder.generateMipmaps = false;

    // Start async load and update placeholder when available
    this.loader.load(
      path,
      (tex) => {
        // copy important properties into placeholder
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
        // load error - leave placeholder as-is
        // console.warn optionally here
      }
    );

    this.cache.set(path, placeholder);
    return placeholder;
  }

  // Promise-based load when caller needs to await texture readiness
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
