// src/core/postprocessing.js
// ══════════════════════════════════════════════════════════════════
// POST-PROCESSING EFFECTS (Bloom, Outline, Tone Mapping, Color Grading)
// ══════════════════════════════════════════════════════════════════

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

// Custom shader for tone mapping and color grading
const toneMapShader = {
  uniforms: {
    tDiffuse: { value: null },
    exposure: { value: 1.2 },
    saturation: { value: 1.15 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float exposure;
    uniform float saturation;
    varying vec2 vUv;

    vec3 tonemap(vec3 x) {
      // ACES Filmic tone mapping (simplified)
      float a = 2.51;
      float b = 0.03;
      float c = 2.43;
      float d = 0.59;
      float e = 0.14;
      return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
    }

    vec3 saturation_adjust(vec3 rgb, float sat) {
      vec3 gray = vec3(dot(rgb, vec3(0.299, 0.587, 0.114)));
      return mix(gray, rgb, sat);
    }

    void main() {
      vec3 texel = texture2D(tDiffuse, vUv).rgb;

      // Apply exposure
      texel *= exposure;

      // Tone mapping
      texel = tonemap(texel);

      // Saturation boost
      texel = saturation_adjust(texel, saturation);

      // Subtle vignette
      vec2 uv = vUv - 0.5;
      float vignette = 1.0 - dot(uv, uv) * 0.5;
      texel *= mix(0.85, 1.0, vignette);

      gl_FragColor = vec4(texel, 1.0);
    }
  `
};

export function setupPostProcessing(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);

  // Render pass base
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // Enhanced bloom effect for Sun and glowing objects
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.8,   // strength (increased for more glow)
    0.5,   // radius (larger bloom)
    0.75   // threshold (slightly lower to catch more objects)
  );
  bloomPass.renderToScreen = false;
  composer.addPass(bloomPass);

  // Improved outline effect for planet hover
  const outlinePass = new OutlinePass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    scene,
    camera
  );
  outlinePass.edgeStrength = 2.5;  // Reduced from 3.0 for less aggressiveness
  outlinePass.edgeGlow = 0.3;      // Added subtle glow
  outlinePass.edgeThickness = 1.2;
  outlinePass.visibleEdgeColor.set(0x88ddff);  // Cyan highlight
  outlinePass.hiddenEdgeColor.set(0x000000);
  outlinePass.usePatternTexture = false;
  outlinePass.renderToScreen = false;
  composer.addPass(outlinePass);

  // Tone mapping and color grading pass
  const toneMappingPass = new ShaderPass(toneMapShader);
  toneMappingPass.renderToScreen = true;
  composer.addPass(toneMappingPass);

  return { composer, bloomPass, outlinePass, toneMappingPass };
}

export function updatePostProcessingSize(composer) {
  composer.setSize(window.innerWidth, window.innerHeight);
}

export function updateToneMapping(toneMappingPass, exposure = 1.2, saturation = 1.15) {
  if (toneMappingPass?.uniforms) {
    toneMappingPass.uniforms.exposure.value = exposure;
    toneMappingPass.uniforms.saturation.value = saturation;
  }
}
