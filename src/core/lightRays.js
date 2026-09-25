// src/core/lightRays.js
// ══════════════════════════════════════════════════════════════════
// GOD RAYS / CREPUSCULAR RAYS - Light rays emanating from the Sun
// ══════════════════════════════════════════════════════════════════

import * as THREE from 'three';

const godRaysShader = {
  uniforms: {
    tDiffuse: { value: null },
    lightPos: { value: new THREE.Vector2(0.5, 0.5) },
    exposure: { value: 0.6 },
    decay: { value: 0.96 },
    density: { value: 0.5 },
    weight: { value: 0.4 },
    samples: { value: 100 },
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
    uniform vec2 lightPos;
    uniform float exposure;
    uniform float decay;
    uniform float density;
    uniform float weight;
    uniform int samples;
    varying vec2 vUv;

    void main() {
      vec2 deltaTexCoord = vec2(vUv - lightPos);
      deltaTexCoord *= 1.0 / float(samples) * density;
      vec3 ray = vec3(0.0);
      float illuminationDecay = 1.0;

      for(int i = 0; i < 100; i++) {
        vec2 sampleCoord = lightPos + deltaTexCoord * float(i);
        vec3 sampleColor = texture2D(tDiffuse, sampleCoord).rgb;
        sampleColor *= illuminationDecay * weight;
        ray += sampleColor;
        illuminationDecay *= decay;
      }

      ray *= exposure;
      vec3 texel = texture2D(tDiffuse, vUv).rgb;
      gl_FragColor = vec4(texel + ray * 0.3, 1.0);
    }
  `,
};

export function createGodRaysPass() {
  const { ShaderPass } = require('three/examples/jsm/postprocessing/ShaderPass.js');
  const pass = new ShaderPass(godRaysShader);
  pass.uniforms.exposure.value = 0.6;
  pass.uniforms.decay.value = 0.96;
  pass.uniforms.density.value = 0.5;
  pass.uniforms.weight.value = 0.4;
  pass.renderToScreen = false;
  return pass;
}

export function updateGodRaysPosition(godRaysPass, sunPos, camera, renderer) {
  if (!godRaysPass) return;

  const vector = sunPos.clone();
  vector.project(camera);

  const canvas = renderer.domElement;
  const x = (vector.x * 0.5 + 0.5) * canvas.clientWidth;
  const y = (vector.y * -0.5 + 0.5) * canvas.clientHeight;

  const lightPos = new THREE.Vector2(x / canvas.clientWidth, y / canvas.clientHeight);

  godRaysPass.uniforms.lightPos.value = lightPos;
}
