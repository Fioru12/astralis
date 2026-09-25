import * as THREE from 'three';

// Formati GPU-compressi (KTX2/Basis). Il transcoder non è ancora incluso nel
// bundle: le richieste .ktx2/.basis vengono riscritte sul WebP equivalente e,
// in mancanza, gestite dal fallback procedurale. Quando la pipeline KTX2
// verrà aggiunta (vedi TEXTURE_OPTIMIZATION.md), basterà registrare qui il
// KTX2Loader senza cambiare i chiamanti.
const GPU_COMPRESSED_RE = /\.(ktx2|basis)$/i;

function gpuFallbackPath(path) {
  return String(path).replace(GPU_COMPRESSED_RE, '.webp');
}

class AsyncTextureLoader {
  constructor() {
    this.loader = new THREE.TextureLoader();
    this.cache = new Map();
  }

  setManager(manager) {
    this.loader = new THREE.TextureLoader(manager);
  }

  has(path) {
    return this.cache.has(path);
  }

  get size() {
    return this.cache.size;
  }

  /** Rilascia una texture dalla cache e dalla GPU. */
  dispose(path) {
    if (path !== undefined) {
      const tex = this.cache.get(path);
      if (tex) {
        tex.dispose?.();
        this.cache.delete(path);
        return true;
      }
      return false;
    }
    for (const tex of this.cache.values()) tex.dispose?.();
    this.cache.clear();
  }

  /** Alias di dispose() totale, per chi ricrea dinamicamente la scena. */
  clear() {
    this.dispose();
  }

  load(path, fallback) {
    // Percorso KTX2/Basis -> prova il WebP equivalente (stessa cache key
    // del path originale per non duplicare le entry).
    if (GPU_COMPRESSED_RE.test(path)) {
      return this.load(gpuFallbackPath(path), fallback);
    }
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
    if (GPU_COMPRESSED_RE.test(path)) {
      return this.loadAsync(gpuFallbackPath(path));
    }
    if (this.cache.has(path) && this.cache.get(path).image)
      return Promise.resolve(this.cache.get(path));
    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (tex) => {
          this.cache.set(path, tex);
          resolve(tex);
        },
        undefined,
        reject
      );
    });
  }
}

export { AsyncTextureLoader };
export const textureLoader = new AsyncTextureLoader();
