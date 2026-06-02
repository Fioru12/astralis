// src/core/postprocessing.js
// ══════════════════════════════════════════════════════════════════
// POST-PROCESSING EFFECTS (Bloom, Outline, Anti-aliasing)
// ══════════════════════════════════════════════════════════════════

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';

/**
 * Configura il post-processing composer
 */
export function setupPostProcessing(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);
  
  // Render pass base
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // Bloom effect per il Sole e oggetti luminosi
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,  // strength
    0.4,  // radius
    0.85  // threshold
  );
  composer.addPass(bloomPass);

  // Outline effect per hover sui pianeti
  const outlinePass = new OutlinePass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    scene,
    camera
  );
  outlinePass.edgeStrength = 3.0;
  outlinePass.edgeGlow = 0.0;
  outlinePass.edgeThickness = 1.0;
  outlinePass.visibleEdgeColor.set(0xffffff);
  outlinePass.hiddenEdgeColor.set(0x000000);
  outlinePass.usePatternTexture = false;
  composer.addPass(outlinePass);

  return { composer, bloomPass, outlinePass };
}

/**
 * Aggiorna il composer quando il renderer cambia dimensione
 */
export function updatePostProcessingSize(composer) {
  composer.setSize(window.innerWidth, window.innerHeight);
}
