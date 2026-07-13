// src/ui/atmosphereEffects.js
// ══════════════════════════════════════════════════════════════════
// EFFETTI ATMOSFERICI SUI PIANETI
// Nuvole, aurore, tempeste per i pianeti con atmosfera
// ══════════════════════════════════════════════════════════════════

import * as THREE from 'three';

/**
 * Dati degli effetti atmosferici per pianeta
 */
const ATMOSPHERE_EFFECTS = {
  Earth: {
    clouds: true,
    aurora: true,
    storms: false,
    color: 0x4488ff,
    cloudSpeed: 0.0003,
    cloudOpacity: 0.25,
    auroraColor: 0x00ff88,
    auroraIntensity: 0.3,
    glowColor: 0x4488ff,
    glowIntensity: 0.5,
  },
  Venus: {
    clouds: true,
    aurora: false,
    storms: true,
    color: 0xffcc44,
    cloudSpeed: 0.0005,
    cloudOpacity: 0.6,
    glowColor: 0xffaa44,
    glowIntensity: 0.4,
  },
  Mars: {
    clouds: true,
    aurora: false,
    storms: true,
    color: 0xff6644,
    cloudSpeed: 0.0002,
    cloudOpacity: 0.15,
  },
  Jupiter: {
    clouds: true,
    aurora: false,
    storms: true,
    color: 0xddaa66,
    cloudSpeed: 0.0008,
    cloudOpacity: 0.35,
    glowColor: 0xcc8844,
    glowIntensity: 0.3,
  },
  Saturn: {
    clouds: true,
    aurora: false,
    storms: false,
    color: 0xeedd88,
    cloudSpeed: 0.0006,
    cloudOpacity: 0.2,
    glowColor: 0xddcc66,
    glowIntensity: 0.2,
  },
  Uranus: {
    clouds: true,
    aurora: false,
    storms: false,
    color: 0x88eecc,
    cloudSpeed: 0.0004,
    cloudOpacity: 0.15,
    glowColor: 0x88ddcc,
    glowIntensity: 0.25,
  },
  Neptune: {
    clouds: true,
    aurora: false,
    storms: true,
    color: 0x4488ff,
    cloudSpeed: 0.001,
    cloudOpacity: 0.2,
    glowColor: 0x4466ff,
    glowIntensity: 0.35,
  },
  Titan: {
    clouds: true,
    aurora: false,
    storms: false,
    color: 0xff9944,
    cloudSpeed: 0.0003,
    cloudOpacity: 0.4,
    glowColor: 0xff8844,
    glowIntensity: 0.2,
  },
};

/**
 * Crea uno strato di nuvole procedurali per un pianeta
 * @param {number} radius - Raggio del pianeta
 * @param {Object} config - Configurazione atmosfera
 * @returns {THREE.Mesh}
 */
function createCloudLayer(radius, config, scale, opacityMul) {
  const geometry = new THREE.SphereGeometry(radius * (scale || 1.02), 48, 24);
  
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      speed: { value: config.cloudSpeed || 0.0003 },
      opacity: { value: (config.cloudOpacity || 0.25) * (opacityMul || 1.0) },
      color: { value: new THREE.Color(config.color || 0xffffff) },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float speed;
      uniform float opacity;
      uniform vec3 color;
      varying vec2 vUv;
      varying vec3 vNormal;

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
        vec2 uv = vUv;
        uv.x += time * speed;

        float n1 = noise(uv * 6.0);
        float n2 = noise(uv * 12.0 + time * speed * 0.5);
        float n3 = noise(uv * 24.0 - time * speed * 0.3);
        float n4 = noise(uv * 48.0 + time * speed * 0.7);
        float cloudNoise = n1 * 0.35 + n2 * 0.3 + n3 * 0.2 + n4 * 0.15;

        float detail = noise(uv * 80.0 + time * speed * 1.2) * 0.1;
        cloudNoise += detail;

        float cloud = smoothstep(0.3, 0.7, cloudNoise);
        float softCloud = smoothstep(0.2, 0.6, cloudNoise);

        vec3 lightDir = normalize(vec3(0.5, 0.8, 0.6));
        float ndotl = max(0.0, dot(vNormal, lightDir));
        float shadow = 0.6 + 0.4 * ndotl;

        float fresnel = 1.0 - max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0)));
        float edgeFade = smoothstep(0.0, 0.5, fresnel);
        float rimLight = pow(fresnel, 2.0) * 0.3;

        vec3 cloudColor = color * shadow + vec3(1.0, 0.95, 0.9) * rimLight;
        float alpha = (cloud * 0.7 + softCloud * 0.3) * opacity * edgeFade;

        gl_FragColor = vec4(cloudColor, alpha);
      }
    `,
    transparent: true,
    side: THREE.FrontSide,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'cloudLayer';
  mesh.userData.material = material;
  return mesh;
}

/**
 * Crea un effetto aurora boreale
 * @param {number} radius - Raggio del pianeta
 * @param {Object} config - Configurazione
 * @returns {THREE.Mesh}
 */
function createAuroraEffect(radius, config) {
  const geometry = new THREE.SphereGeometry(radius * 1.08, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.3);
  
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color(config.auroraColor || 0x00ff88) },
      intensity: { value: config.auroraIntensity || 0.3 },
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
      uniform vec3 color;
      uniform float intensity;
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
        vec2 uv = vUv;
        uv.x += time * 0.1;
        
        float auroraNoise = noise(uv * 5.0 + time * 0.5);
        auroraNoise += noise(uv * 10.0 - time * 0.3) * 0.5;
        
        float curtain = sin(uv.x * 20.0 + auroraNoise * 5.0) * 0.5 + 0.5;
        curtain *= smoothstep(0.3, 0.7, uv.y);
        
        float alpha = curtain * intensity * auroraNoise;
        
        vec3 finalColor = color + vec3(0.2, 0.1, 0.0) * auroraNoise;
        
        gl_FragColor = vec4(finalColor, alpha * 0.6);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'auroraEffect';
  mesh.userData.material = material;
  return mesh;
}

/**
 * Crea un alone atmosferico con scattering
 * @param {number} radius - Raggio del pianeta
 * @param {Object} config - Configurazione atmosfera
 * @returns {THREE.Mesh}
 */
function createAtmosphericGlow(radius, config) {
  const geometry = new THREE.SphereGeometry(radius * 1.08, 48, 24);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      glowColor: { value: new THREE.Color(config.glowColor || 0x4488ff) },
      intensity: { value: config.glowIntensity || 0.3 },
    },
    vertexShader: `
      varying vec3 vNormal; varying vec3 vPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor; uniform float intensity;
      varying vec3 vNormal; varying vec3 vPosition;
      void main() {
        vec3 viewDir = normalize(-vPosition);
        float rim = 1.0 - max(0.0, dot(viewDir, normalize(vNormal)));
        float glow = pow(rim, 3.0) * intensity;
        float scatter = pow(rim, 6.0) * intensity * 1.5;
        vec3 col = glowColor * (glow + scatter);
        gl_FragColor = vec4(col, glow * 0.7 + scatter * 0.3);
      }
    `,
    transparent: true,
    side: THREE.FrontSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'atmosphereGlow';
  mesh.userData.material = material;
  return mesh;
}

/**
 * Aggiunge effetti atmosferici a un pianeta
 * @param {Object} body - Corpo celeste Three.js
 * @param {string} planetKey - Chiave del pianeta
 */
export function addAtmosphereEffects(body, planetKey) {
  const config = ATMOSPHERE_EFFECTS[planetKey];
  if (!config || !body.pivot) return;

  const radius = body.visualR || body.radius || 1;

  // Aggiungi alone atmosferico
  if (config.glowColor) {
    const glow = createAtmosphericGlow(radius, config);
    body.pivot.add(glow);
    body.atmosphereGlow = glow;
  }

    // Aggiungi nuvole (doppio strato per pianeti principali)
  if (config.clouds) {
    const clouds = createCloudLayer(radius, config, 1.02, 1.0);
    body.pivot.add(clouds);
    body.clouds = clouds;
    if (planetKey === 'Earth' || planetKey === 'Venus' || planetKey === 'Jupiter') {
      const upperClouds = createCloudLayer(radius, config, 1.04, 0.6);
      upperClouds.userData.material.uniforms.speed.value = config.cloudSpeed * 1.8;
      body.pivot.add(upperClouds);
      body.upperClouds = upperClouds;
    }
  }

  // Aggiungi aurora (solo per Terra)
  if (config.aurora) {
    const aurora = createAuroraEffect(radius, config);
    body.pivot.add(aurora);
    body.aurora = aurora;
  }
}

/**
 * Aggiorna gli effetti atmosferici
 * @param {Object} body - Corpo celeste
 * @param {number} dt - Delta time
 */
export function updateAtmosphereEffects(body, camera) {
  const time = performance.now() / 1000;

  [body.clouds, body.upperClouds].forEach(c => {
    if (c && c.userData.material) c.userData.material.uniforms.time.value = time;
  });
  if (body.aurora && body.aurora.userData.material) {
    body.aurora.userData.material.uniforms.time.value = time;
  }

}

/**
 * Ottieni lista pianeti con atmosfera
 * @returns {Array}
 */
export function getAtmosphericPlanets() {
  return Object.keys(ATMOSPHERE_EFFECTS);
}