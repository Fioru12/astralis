// src/core/sunShader.js
// ══════════════════════════════════════════════════════════════════
// SHADER AVANZATI PER IL SOLE
// Corona solare dinamica, brillamenti, macchie solari
// ══════════════════════════════════════════════════════════════════

import * as THREE from 'three';

/**
 * Shader vertex per il Sole
 */
const sunVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Shader fragment per il Sole con corona, brillamenti e macchie
 */
const sunFragmentShader = `
  uniform sampler2D sunTexture;
  uniform float time;
  uniform float intensity;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  // Funzione noise per effetti organici
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float f = 0.0;
    f += 0.5000 * noise(p); p *= 2.01;
    f += 0.2500 * noise(p); p *= 2.02;
    f += 0.1250 * noise(p); p *= 2.03;
    f += 0.0625 * noise(p);
    return f;
  }

  void main() {
    vec3 texColor = texture2D(sunTexture, vUv).rgb;
    
    // === Macchie solari ===
    float spots = 0.0;
    vec2 spotUv = vUv * 8.0 + time * 0.02;
    float spotNoise = fbm(spotUv);
    spots = smoothstep(0.55, 0.65, spotNoise);
    vec3 spotColor = texColor * 0.3;
    texColor = mix(texColor, spotColor, spots * 0.4);
    
    // === Brillamenti solari (flare) ===
    float flare = 0.0;
    vec2 flareUv = vUv * 4.0 + vec2(time * 0.1, time * 0.05);
    float flareNoise = fbm(flareUv);
    flare = pow(max(0.0, flareNoise), 4.0);
    vec3 flareColor = vec3(1.0, 0.9, 0.6) * flare * 2.0;
    texColor += flareColor * 0.3;
    
    // === Granulazione (convezione) ===
    float granulation = 0.0;
    vec2 granUv = vUv * 20.0 + time * 0.05;
    granulation = fbm(granUv) * 0.15;
    texColor += vec3(granulation * 0.5, granulation * 0.3, 0.0);
    
    // === Limb darkening (assottigliamento al bordo) ===
    float rim = 1.0 - max(0.0, dot(vNormal, normalize(-vPosition)));
    float limbDark = 1.0 - rim * rim * 0.5;
    texColor *= limbDark;
    
    // === Emissione finale ===
    gl_FragColor = vec4(texColor * intensity, 1.0);
  }
`;

/**
 * Crea un Sole con shader avanzato
 * @param {number} radius - Raggio del Sole
 * @param {string} textureUrl - URL della texture del Sole
 * @param {THREE.LoadingManager} manager - Loading manager per le texture
 * @returns {THREE.Mesh}
 */
export function createAdvancedSun(radius, textureUrl, manager) {
  const geometry = new THREE.SphereGeometry(radius, 64, 64);

  const loader = new THREE.TextureLoader(manager);
  const sunTexture = loader.load(textureUrl);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      sunTexture: { value: sunTexture },
      time: { value: 0 },
      intensity: { value: 1.1 },
    },
    vertexShader: sunVertexShader,
    fragmentShader: sunFragmentShader,
    fog: false,
    side: THREE.FrontSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'advancedSun';
  mesh.userData.material = material;
  mesh.renderOrder = -100; // Render sun first (behind everything else)
  return mesh;
}

/**
 * Crea corona solare con shader
 * @param {number} innerRadius - Raggio interno
 * @param {number} outerRadius - Raggio esterno
 * @returns {THREE.Mesh}
 */
export function createSunCorona(innerRadius, outerRadius) {
  const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 128, 4);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      intensity: { value: 1.0 },
      colorInner: { value: new THREE.Color(0xffee66) },
      colorOuter: { value: new THREE.Color(0xff7722) },
      innerRadius: { value: innerRadius },
      outerRadius: { value: outerRadius },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float intensity;
      uniform vec3 colorInner;
      uniform vec3 colorOuter;
      uniform float innerRadius;
      uniform float outerRadius;
      varying vec2 vUv;
      varying vec3 vPosition;
      
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }
      
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }
      
      void main() {
        float dist = length(vPosition.xy);
        float normalizedDist = (dist - innerRadius) / max(outerRadius - innerRadius, 0.001);
        normalizedDist = clamp(normalizedDist, 0.0, 1.0);
        
        // Corona con noise
        float coronaNoise = noise(vUv * 10.0 + time * 0.3) * 0.5 + 0.5;
        coronaNoise += noise(vUv * 20.0 - time * 0.2) * 0.25;
        
        float alpha = (1.0 - normalizedDist) * coronaNoise * intensity;
        alpha *= smoothstep(1.0, 0.7, normalizedDist);
        
        vec3 color = mix(colorInner, colorOuter, normalizedDist);
        color += vec3(0.2, 0.1, 0.0) * coronaNoise;
        
        gl_FragColor = vec4(color, alpha * 0.42);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'sunCorona';
  mesh.userData.material = material;
  return mesh;
}

/**
 * Aggiorna gli shader del Sole
 * @param {THREE.Mesh} sunMesh - Mesh del Sole
 * @param {THREE.Mesh} coronaMesh - Mesh della corona (opzionale)
 */
export function updateSunShader(sunMesh, coronaMesh) {
  const time = performance.now() / 1000;
  if (sunMesh && sunMesh.userData.material) {
    sunMesh.userData.material.uniforms.time.value = time;
  }
  if (coronaMesh && coronaMesh.userData.material) {
    coronaMesh.userData.material.uniforms.time.value = time;
  }
}
