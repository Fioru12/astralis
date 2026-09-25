/**
 * @file spiralGalaxy.js
 * @description Breathtaking 3D Procedural Spiral Galaxy (Milky Way) visualization system.
 * Renders 80,000 3D particles along logarithmic spiral arms, central galactic core bulge, and glowing dust disc.
 */

import * as THREE from 'three';

export function create3DSpiralGalaxy() {
  const galaxyGroup = new THREE.Group();
  galaxyGroup.name = 'spiralGalaxy3D';
  galaxyGroup.visible = false;

  // 1. Particle System for Spiral Arms & Core (80,000 particles)
  const particleCount = 80000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  const arms = 4;
  const radiusMax = 320000;

  const coreColor = new THREE.Color(0xffdb99); // Warm golden core
  const innerColor = new THREE.Color(0xa78bfa); // Violet inner disk
  const armColorCyan = new THREE.Color(0x5bc4cf); // Cyan spiral arm
  const armColorBlue = new THREE.Color(0x3b82f6); // Deep blue outer arm
  const dustColor = new THREE.Color(0xe879f9); // Magenta nebula dust

  for (let i = 0; i < particleCount; i++) {
    const isCore = Math.random() < 0.25;
    let r, theta, x, y, z, pColor, pSize;

    if (isCore) {
      // Dense central galactic bulge (Gaussian sphere/ellipsoid)
      r = Math.pow(Math.random(), 2) * (radiusMax * 0.18);
      theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      x = r * Math.sin(phi) * Math.cos(theta);
      z = r * Math.sin(phi) * Math.sin(theta);
      y = r * Math.cos(phi) * 0.35; // Slightly flattened bulge

      const tColor = r / (radiusMax * 0.18);
      pColor = coreColor.clone().lerp(innerColor, tColor);
      pSize = (1 - tColor) * 6000 + 1500;
    } else {
      // Logarithmic spiral arms
      const armIndex = i % arms;
      const armOffset = (armIndex / arms) * Math.PI * 2;

      const normR = Math.pow(Math.random(), 1.2);
      r = normR * radiusMax;

      const spin = 3.2; // Number of spiral turns
      const spiralTheta = Math.log(r / 5000 + 1) * spin + armOffset;

      const scatterScale = 12000 + normR * 45000;
      const scatterX = (Math.random() - 0.5) * scatterScale;
      const scatterZ = (Math.random() - 0.5) * scatterScale;

      x = Math.cos(spiralTheta) * r + scatterX;
      z = Math.sin(spiralTheta) * r + scatterZ;
      y = (Math.random() + Math.random() - 1) * (6000 + normR * 12000);

      if (normR < 0.35) {
        pColor = innerColor.clone().lerp(armColorCyan, normR / 0.35);
      } else if (normR < 0.7) {
        pColor = armColorCyan.clone().lerp(armColorBlue, (normR - 0.35) / 0.35);
      } else {
        pColor = armColorBlue.clone().lerp(dustColor, (normR - 0.7) / 0.3);
      }

      pSize = (1 - normR * 0.6) * 4500 + Math.random() * 2000;
    }

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    colors[i * 3] = pColor.r;
    colors[i * 3 + 1] = pColor.g;
    colors[i * 3 + 2] = pColor.b;

    sizes[i] = pSize;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Canvas circular particle texture for soft glowing stars
  const particleCanvas = document.createElement('canvas');
  particleCanvas.width = 64;
  particleCanvas.height = 64;
  const pCtx = particleCanvas.getContext('2d');
  if (pCtx) {
    const grad = pCtx.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.25)');
    grad.addColorStop(1, 'transparent');
    pCtx.fillStyle = grad;
    pCtx.beginPath();
    pCtx.arc(32, 32, 30, 0, Math.PI * 2);
    pCtx.fill();
  }

  const pTexture = new THREE.CanvasTexture(particleCanvas);

  const material = new THREE.PointsMaterial({
    size: 4500,
    sizeAttenuation: true,
    map: pTexture,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particleMesh = new THREE.Points(geometry, material);
  particleMesh.name = 'galaxy-particles';
  galaxyGroup.add(particleMesh);

  // 2. High-Resolution Photorealistic Texture Disc Plane
  // WebP ottimizzato (~100KB) con fallback al JPG (~823KB) per browser datati.
  const loader = new THREE.TextureLoader();
  const discGeometry = new THREE.PlaneGeometry(650000, 650000);
  const discMaterial = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0.88,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const applyDisc = (tex) => {
    discMaterial.map = tex;
    discMaterial.needsUpdate = true;
  };
  loader.load('./milky_way_topdown.webp', applyDisc, undefined, () =>
    loader.load('./milky_way_topdown.jpg', applyDisc)
  );

  const discMesh = new THREE.Mesh(discGeometry, discMaterial);
  discMesh.rotation.x = -Math.PI / 2;
  discMesh.name = 'galaxy-disc';
  galaxyGroup.add(discMesh);

  return galaxyGroup;
}
