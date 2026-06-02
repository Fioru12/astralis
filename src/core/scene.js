// src/core/scene.js
// ══════════════════════════════════════════════════════════════════
// SETUP SCENA THREE.JS
// ══════════════════════════════════════════════════════════════════

import * as THREE from 'three';

/**
 * Crea e configura la scena Three.js
 */
export function createScene(textureLoader) {
  const scene = new THREE.Scene();

  // Carica texture sfondo (Via Lattea)
  const mwTex = textureLoader.load('./assets/textures/8k_stars_milky_way.jpg');
  mwTex.mapping = THREE.EquirectangularReflectionMapping;
  mwTex.minFilter = THREE.LinearMipmapLinearFilter;
  mwTex.magFilter = THREE.LinearFilter;
  mwTex.generateMipmaps = true;
  mwTex.anisotropy = 16;
  scene.background = mwTex;

  return scene;
}

/**
 * Crea e configura il renderer
 */
export function createRenderer() {
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    logarithmicDepthBuffer: true 
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.4;
  document.body.appendChild(renderer.domElement);

  return renderer;
}

/**
 * Crea la camera
 */
export function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    55, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    500000
  );
  return camera;
}

/**
 * Configura le luci della scena
 */
export function setupLights(scene) {
  // Luce ambientale
  scene.add(new THREE.AmbientLight(0xffffff, 0.45));

  // Luce del Sole (PointLight)
  const sunLight = new THREE.PointLight(0xfff4e0, 8.0, 0);
  scene.add(sunLight);
}

/**
 * Gestisce il resize della finestra
 */
export function setupResize(camera, renderer) {
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
