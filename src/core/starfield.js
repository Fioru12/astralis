// src/core/starfield.js
// ══════════════════════════════════════════════════════════════════
// DYNAMIC STARFIELD - Milky Way background with parallax
// ══════════════════════════════════════════════════════════════════

import * as THREE from 'three';

export function createStarfield(scene) {
  const starfieldGroup = new THREE.Group();
  starfieldGroup.name = 'starfield';

  // Layer 1: Distant stars (far background)
  const distantStars = createStarLayer(0.5, 2000, 0.4, 'distant');
  starfieldGroup.add(distantStars);

  // Layer 2: Mid-distance stars
  const midStars = createStarLayer(1.0, 1500, 0.6, 'mid');
  starfieldGroup.add(midStars);

  // Layer 3: Closer stars (faster parallax)
  const closeStars = createStarLayer(1.5, 1000, 0.8, 'close');
  starfieldGroup.add(closeStars);

  // Add subtle Milky Way glow
  const milkyWay = createMilkyWay();
  starfieldGroup.add(milkyWay);

  scene.add(starfieldGroup);
  return starfieldGroup;
}

function createStarLayer(parallaxFactor, starCount, size, layerName) {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];
  const sizes = [];

  for (let i = 0; i < starCount; i++) {
    // Random positions on a large sphere
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const r = 5000 + Math.random() * 10000; // Distance range

    positions.push(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );

    // Star colors (blue, white, yellow)
    const colorChoice = Math.random();
    if (colorChoice < 0.3) {
      colors.push(0.6, 0.8, 1.0); // Blue stars
    } else if (colorChoice < 0.7) {
      colors.push(1.0, 1.0, 0.9); // White stars
    } else {
      colors.push(1.0, 0.9, 0.6); // Yellow stars
    }

    // Vary star sizes with brightness
    const brightness = Math.random();
    sizes.push(0.3 + brightness * 2.0);
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(new Float32Array(sizes), 1));

  const material = new THREE.PointsMaterial({
    size: size,
    sizeAttenuation: true,
    vertexColors: true,
    fog: false,
    transparent: true,
    opacity: 0.8,
  });

  const points = new THREE.Points(geometry, material);
  points.name = `starfield-${layerName}`;
  points.userData.parallaxFactor = parallaxFactor;

  return points;
}

function createMilkyWay() {
  // Create a semi-transparent plane with a radial gradient
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Create radial gradient
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const gradient = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, 300);

  gradient.addColorStop(0, 'rgba(100, 80, 200, 0.15)');
  gradient.addColorStop(0.5, 'rgba(50, 40, 100, 0.08)');
  gradient.addColorStop(1, 'rgba(20, 20, 50, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add some noise
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] += Math.random() * 10;
    data[i + 1] += Math.random() * 8;
    data[i + 2] += Math.random() * 15;
  }
  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  const geometry = new THREE.SphereGeometry(4800, 32, 32);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    fog: false,
    side: THREE.BackSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'milkyway-glow';
  return mesh;
}

export function updateStarfieldParallax(starfieldGroup, camera) {
  starfieldGroup.children.forEach(child => {
    if (child.userData.parallaxFactor) {
      // Apply subtle parallax based on camera movement
      const factor = child.userData.parallaxFactor;
      child.position.copy(camera.position).multiplyScalar(factor * 0.05);
    }
  });
}
