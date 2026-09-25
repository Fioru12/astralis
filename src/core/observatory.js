// src/core/observatory.js
// MODALITA OSSERVATORIO TERRESTRE
import * as THREE from 'three';
import { DEG } from '../utils/constants.js';
import { toast } from '../ui/toast.js';

const BRIGHT_STARS = [
  { name: 'Sirio', ra: 6.752, dec: -16.716, mag: -1.46, color: 0xaaccff },
  { name: 'Canopo', ra: 6.399, dec: -52.696, mag: -0.74, color: 0xffeecc },
  { name: 'Arturo', ra: 14.261, dec: 19.182, mag: -0.05, color: 0xffaa66 },
  { name: 'Vega', ra: 18.616, dec: 38.784, mag: 0.03, color: 0xaaccff },
  { name: 'Capella', ra: 5.278, dec: 45.998, mag: 0.08, color: 0xffeecc },
  { name: 'Rigel', ra: 5.242, dec: -8.202, mag: 0.13, color: 0xaabbff },
  { name: 'Procione', ra: 7.655, dec: 5.225, mag: 0.34, color: 0xffeecc },
  { name: 'Betelgeuse', ra: 5.919, dec: 7.407, mag: 0.5, color: 0xff6644 },
  { name: 'Altair', ra: 19.846, dec: 8.868, mag: 0.77, color: 0xffffff },
  { name: 'Aldebaran', ra: 4.598, dec: 16.509, mag: 0.85, color: 0xffaa66 },
  { name: 'Spica', ra: 13.42, dec: -11.161, mag: 1.04, color: 0xaabbff },
  { name: 'Polare', ra: 2.53, dec: 89.264, mag: 1.97, color: 0xffeecc },
];

function equatorialToCartesian(ra, dec, radius) {
  const raRad = (ra / 24) * Math.PI * 2;
  const decRad = dec * DEG;
  return new THREE.Vector3(
    radius * Math.cos(decRad) * Math.cos(raRad),
    radius * Math.sin(decRad),
    radius * Math.cos(decRad) * Math.sin(raRad)
  );
}

export function createStarDome(radius) {
  const positions = [];
  const colors = [];
  const sizes = [];
  BRIGHT_STARS.forEach((star) => {
    const pos = equatorialToCartesian(star.ra, star.dec, radius);
    positions.push(pos.x, pos.y, pos.z);
    const color = new THREE.Color(star.color);
    colors.push(color.r, color.g, color.b);
    sizes.push(Math.max(8, 30 - star.mag * 5));
  });
  for (let i = 0; i < 2000; i++) {
    const ra = Math.random() * 24;
    const dec = (Math.random() - 0.5) * 180;
    const pos = equatorialToCartesian(ra, dec, radius * (0.95 + Math.random() * 0.1));
    positions.push(pos.x, pos.y, pos.z);
    colors.push(0.9, 0.9, 0.95);
    sizes.push(1 + Math.random() * 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
  const starMaterial = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 }, twinkleAmount: { value: 0.3 } },
    vertexShader:
      'attribute float size; attribute vec3 color; varying vec3 vColor; uniform float time; uniform float twinkleAmount; void main() { vColor = color; vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); gl_PointSize = size * (300.0 / -mvPosition.z); float twinkle = 1.0 + twinkleAmount * sin(time * 2.0 + position.x * 10.0) * cos(time * 3.0 + position.y * 8.0); gl_PointSize *= twinkle; gl_Position = projectionMatrix * mvPosition; }',
    fragmentShader:
      'varying vec3 vColor; void main() { float dist = length(gl_PointCoord - vec2(0.5)); if (dist > 0.5) discard; float alpha = 1.0 - smoothstep(0.0, 0.5, dist); float glow = exp(-dist * 8.0); gl_FragColor = vec4(vColor * (1.0 + glow * 2.0), alpha); }',
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const stars = new THREE.Points(geometry, starMaterial);
  stars.name = 'starDome';
  stars.userData.material = starMaterial;
  return stars;
}

export function createAtmosphereDome(radius) {
  const geometry = new THREE.SphereGeometry(radius, 64, 32);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      sunPosition: { value: new THREE.Vector3(1, 0, 0) },
      sunIntensity: { value: 1.0 },
      time: { value: 0 },
      skyColor: { value: new THREE.Color(0x4a90e2) },
      sunsetColor: { value: new THREE.Color(0xff7744) },
    },
    vertexShader:
      'varying vec3 vWorldPosition; varying vec3 vNormal; void main() { vNormal = normalize(normalMatrix * normal); vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader:
      'uniform vec3 sunPosition; uniform float sunIntensity; uniform vec3 skyColor; uniform vec3 sunsetColor; uniform float time; varying vec3 vWorldPosition; varying vec3 vNormal; void main() { vec3 viewDirection = normalize(vWorldPosition); float cosTheta = dot(viewDirection, normalize(sunPosition)); float sunHeight = sunPosition.y; float sunAngle = acos(clamp(cosTheta, -1.0, 1.0)); float rayleighIntensity = 0.0596831 * (1.0 + cosTheta * cosTheta); vec3 zenithColor = skyColor; vec3 horizonColor = mix(sunsetColor, skyColor, smoothstep(-0.1, 0.3, sunHeight)); float horizonFactor = pow(1.0 - max(0.0, vNormal.y), 4.0); vec3 skyCol = mix(zenithColor, horizonColor, horizonFactor); float sunsetFactor = 1.0 - smoothstep(-0.2, 0.2, sunHeight); sunsetFactor *= smoothstep(-0.3, 0.0, sunHeight); vec3 sunsetGlow = sunsetColor * sunsetFactor * exp(-sunAngle * 2.0) * 1.5; vec3 finalColor = skyCol * (rayleighIntensity + 0.5) + sunsetGlow; float nightFactor = smoothstep(0.0, -0.2, sunHeight); finalColor = mix(finalColor, vec3(0.01, 0.01, 0.03), nightFactor * 0.95); finalColor *= sunIntensity; gl_FragColor = vec4(finalColor, 1.0); }',
    side: THREE.BackSide,
    transparent: false,
    depthWrite: true,
  });
  const dome = new THREE.Mesh(geometry, material);
  dome.name = 'atmosphereDome';
  dome.userData.material = material;
  return dome;
}

export function createGround(radius, color) {
  const geometry = new THREE.CircleGeometry(radius, 64);
  const material = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.95,
    metalness: 0.0,
  });
  const ground = new THREE.Mesh(geometry, material);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.5;
  ground.name = 'observatoryGround';
  return ground;
}

export function getSunDirection(planetPos, sunPos) {
  return sunPos.clone().sub(planetPos).normalize();
}

export class Observatory {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.active = false;
    this.observatoryGroup = null;
    this.planetBody = null;
    this.planetRadius = 1;
    this.yaw = 0;
    this.pitch = 0;
    this.originalCameraState = null;
    this.locationLabel = 'Terra';
    this.fov = 60;
    this.atmosphereDome = null;
    this.starDome = null;
    this.ground = null;
  }

  enter(planetBody, sunPos) {
    if (this.active) this.exit();
    this.active = true;
    this.planetBody = planetBody;
    this.planetRadius = planetBody.visualR || planetBody.radius || 1;
    this.locationLabel = planetBody.label || 'Pianeta';
    this.originalCameraState = {
      position: this.camera.position.clone(),
      rotation: this.camera.rotation.clone(),
      fov: this.camera.fov,
      near: this.camera.near,
      far: this.camera.far,
    };
    this.observatoryGroup = new THREE.Group();
    this.observatoryGroup.name = 'observatory';
    const planetPos = planetBody.pivot ? planetBody.pivot.position : new THREE.Vector3();
    this.observatoryGroup.position.copy(planetPos);
    this.scene.add(this.observatoryGroup);
    const surfaceHeight = this.planetRadius + 0.01;
    const atmosphereRadius = surfaceHeight * 50;
    const starDomeRadius = atmosphereRadius * 10;
    this.ground = createGround(50, planetBody.color || 0x3a5f3a);
    this.ground.position.y = surfaceHeight;
    this.observatoryGroup.add(this.ground);
    this.atmosphereDome = createAtmosphereDome(atmosphereRadius);
    this.atmosphereDome.position.y = surfaceHeight;
    this.observatoryGroup.add(this.atmosphereDome);
    this.starDome = createStarDome(starDomeRadius);
    this.starDome.position.y = surfaceHeight;
    this.observatoryGroup.add(this.starDome);
    if (sunPos && this.atmosphereDome) {
      const sunDir = getSunDirection(planetPos, sunPos);
      this.atmosphereDome.userData.material.uniforms.sunPosition.value.copy(sunDir);
    }
    this.camera.fov = this.fov;
    this.camera.near = 0.01;
    this.camera.far = starDomeRadius * 2;
    this.camera.updateProjectionMatrix();
    const obsPos = this.observatoryGroup.position;
    this.camera.position.set(obsPos.x, obsPos.y + surfaceHeight + 0.1, obsPos.z + 0.01);
    this.camera.lookAt(obsPos.x, obsPos.y + surfaceHeight, obsPos.z - 1);
    this.yaw = 0;
    this.pitch = 0;
    toast.success('Sei su ' + this.locationLabel + '!', 4000);
  }

  exit() {
    if (!this.active) return;
    this.active = false;
    if (this.observatoryGroup) {
      this.observatoryGroup.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (child.material.map) child.material.map.dispose();
          child.material.dispose();
        }
      });
      this.scene.remove(this.observatoryGroup);
      this.observatoryGroup = null;
    }
    if (this.originalCameraState) {
      this.camera.position.copy(this.originalCameraState.position);
      this.camera.rotation.copy(this.originalCameraState.rotation);
      this.camera.fov = this.originalCameraState.fov;
      this.camera.near = this.originalCameraState.near;
      this.camera.far = this.originalCameraState.far;
      this.camera.updateProjectionMatrix();
      this.originalCameraState = null;
    }
    toast.info('Modalita osservatorio disattivata');
  }

  update(dt, sunPos) {
    if (!this.active || !this.observatoryGroup) return;
    const planetPos = this.planetBody.pivot ? this.planetBody.pivot.position : new THREE.Vector3();
    this.observatoryGroup.position.copy(planetPos);
    if (sunPos && this.atmosphereDome) {
      const sunDir = getSunDirection(planetPos, sunPos);
      this.atmosphereDome.userData.material.uniforms.sunPosition.value.copy(sunDir);
    }
    const time = performance.now() / 1000;
    if (this.atmosphereDome) this.atmosphereDome.userData.material.uniforms.time.value = time;
    if (this.starDome) this.starDome.userData.material.uniforms.time.value = time;
  }

  onMouseMove(dx, dy) {
    if (!this.active) return;
    this.yaw -= dx * 0.003;
    this.pitch -= dy * 0.003;
    this.pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, this.pitch));
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
    this.camera.rotation.z = 0;
  }

  toggle(planetBody, sunPos) {
    if (this.active) {
      this.exit();
    } else if (planetBody) {
      this.enter(planetBody, sunPos);
    }
  }
}
