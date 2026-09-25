/**
 * Smaltimento completo delle risorse GPU (geometry/material/texture/renderer).
 * Serve alle scene ricreate dinamicamente (osservatorio, modali di sistema,
 * galassia, sandbox): il render loop principale riusa un unico renderer e non
 * ha bisogno di chiamarla a ogni frame.
 */

export function disposeMaterial(material) {
  if (!material) return;
  const list = Array.isArray(material) ? material : [material];
  for (const mat of list) {
    for (const key of Object.keys(mat)) {
      const value = mat[key];
      if (value && typeof value.dispose === 'function' && value.isTexture) {
        value.dispose();
      }
    }
    mat.dispose?.();
  }
}

export function disposeObject(root) {
  if (!root) return;
  root.traverse?.((child) => {
    if (child.geometry) child.geometry.dispose?.();
    if (child.material) disposeMaterial(child.material);
  });
}

/**
 * Smaltisce una sottoscena dinamica: rimuove i figli dal parent, rilascia
 * le risorse GPU e (opzionale) il renderer dedicato.
 */
export function disposeScene({ parent = null, children = [], renderer = null } = {}) {
  for (const child of children) {
    if (parent && child.parent === parent) parent.remove(child);
    disposeObject(child);
  }
  if (renderer) {
    renderer.dispose?.();
    if (renderer.forceContextLoss) {
      try {
        renderer.forceContextLoss();
      } catch {
        /* contesto già perso o non disponibile */
      }
    }
  }
}
