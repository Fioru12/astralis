import * as THREE from 'three';

function getStarBounds(allBodies) {
  const stars = allBodies.filter((body) => body.type === 'star' && body.pivot);
  if (!stars.length) return null;
  const x = stars.map((star) => star.pivot.position.x);
  const z = stars.map((star) => star.pivot.position.z);
  return {
    stars,
    minX: Math.min(...x),
    maxX: Math.max(...x),
    minZ: Math.min(...z),
    maxZ: Math.max(...z),
  };
}

export function createGalaxySectors(allBodies, target, gridSize = 4) {
  const bounds = getStarBounds(allBodies);
  if (!bounds || !target) return 0;
  const width = (bounds.maxX - bounds.minX) / gridSize;
  const height = (bounds.maxZ - bounds.minZ) / gridSize;
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return 0;

  for (let column = 0; column < gridSize; column++) {
    for (let row = 0; row < gridSize; row++) {
      const geometry = new THREE.PlaneGeometry(width, height);
      const sector = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({
          color: 0x4488ff,
          transparent: true,
          opacity: 0.05,
          side: THREE.DoubleSide,
        })
      );
      sector.rotation.x = -Math.PI / 2;
      sector.position.set(
        bounds.minX + (column + 0.5) * width,
        0,
        bounds.minZ + (row + 0.5) * height
      );
      sector.userData = { sectorX: column, sectorY: row };
      target.add(sector);

      const border = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry),
        new THREE.LineBasicMaterial({ color: 0x4488ff, transparent: true, opacity: 0.15 })
      );
      border.rotation.x = -Math.PI / 2;
      border.position.copy(sector.position);
      target.add(border);
    }
  }
  return gridSize * gridSize;
}

export function drawGalaxyMinimap(canvas, allBodies, cameraPivot) {
  const bounds = getStarBounds(allBodies);
  const context = canvas?.getContext?.('2d');
  if (!bounds || !context || !cameraPivot) return false;

  const { width, height } = canvas;
  const padding = 20;
  const scale = (value, min, max, outputMin, outputMax) => {
    if (max === min) return (outputMin + outputMax) / 2;
    return outputMin + ((value - min) / (max - min)) * (outputMax - outputMin);
  };

  context.fillStyle = 'rgba(0, 0, 0, 0.8)';
  context.fillRect(0, 0, width, height);
  bounds.stars.forEach((star) => {
    const x = scale(star.pivot.position.x, bounds.minX, bounds.maxX, padding, width - padding);
    const y = scale(star.pivot.position.z, bounds.minZ, bounds.maxZ, padding, height - padding);
    context.beginPath();
    context.arc(x, y, 2, 0, Math.PI * 2);
    context.fillStyle = `#${star.color.toString(16).padStart(6, '0')}`;
    context.fill();
    if (star.key === 'Sun') {
      context.beginPath();
      context.arc(x, y, 7, 0, Math.PI * 2);
      context.fillStyle = 'rgba(255, 30, 60, 0.4)';
      context.fill();
      context.beginPath();
      context.arc(x, y, 3.5, 0, Math.PI * 2);
      context.fillStyle = '#ff2244';
      context.fill();
      if (typeof context.fillText === 'function') {
        context.fillStyle = '#ffffff';
        context.font = 'bold 9px sans-serif';
        context.fillText('🔴 TERRA', x + 9, y + 3);
      }
    } else if (star.key.includes('Alpha') || star.key.includes('Sirius')) {
      context.beginPath();
      context.arc(x, y, 4, 0, Math.PI * 2);
      context.fillStyle = 'rgba(255, 255, 100, 0.3)';
      context.fill();
    }
  });

  const cameraX = scale(cameraPivot.x, bounds.minX, bounds.maxX, padding, width - padding);
  const cameraY = scale(cameraPivot.z, bounds.minZ, bounds.maxZ, padding, height - padding);
  context.beginPath();
  context.arc(cameraX, cameraY, 5, 0, Math.PI * 2);
  context.strokeStyle = '#00ff00';
  context.lineWidth = 2;
  context.stroke();
  return true;
}
