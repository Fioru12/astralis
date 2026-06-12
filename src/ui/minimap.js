// src/ui/minimap.js
// ══════════════════════════════════════════════════════════════════
// MINIMAP - Vista dall'alto del sistema solare
// Mostra le orbite e le posizioni dei pianeti in tempo reale
// ══════════════════════════════════════════════════════════════════

export function initMinimap(canvas, allBodies, camera, CAM) {
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const scale = 0.0005; // scala per adattare il sistema solare al canvas
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  function drawMinimap() {
    // Clear background
    ctx.fillStyle = 'rgba(0, 10, 20, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'rgba(91, 196, 207, 0.1)';
    ctx.lineWidth = 0.5;
    const gridSize = 100000;
    for (let x = -3; x <= 3; x++) {
      ctx.beginPath();
      ctx.moveTo(centerX + x * gridSize * scale, 0);
      ctx.lineTo(centerX + x * gridSize * scale, canvas.height);
      ctx.stroke();
    }
    for (let y = -3; y <= 3; y++) {
      ctx.beginPath();
      ctx.moveTo(0, centerY + y * gridSize * scale);
      ctx.lineTo(canvas.width, centerY + y * gridSize * scale);
      ctx.stroke();
    }

    // Draw planet orbits
    ctx.strokeStyle = 'rgba(150, 150, 150, 0.3)';
    ctx.lineWidth = 1;
    const planets = allBodies.filter(b => b.type === 'planet' && b.orbitRadius);
    planets.forEach(p => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, p.orbitRadius * scale, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Draw Sun
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px Arial';
    ctx.fillText('☉', centerX - 4, centerY + 4);

    // Draw planets
    planets.forEach(p => {
      const pos = p.pivot?.position;
      if (pos) {
        const x = centerX + pos.x * scale;
        const y = centerY + pos.z * scale;

        // Planet circle
        ctx.fillStyle = p.color || '#aaa';
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Planet label
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = '#fff';
        ctx.font = '9px Arial';
        ctx.fillText(p.label.substring(0, 3), x + 6, y + 2);
      }
    });

    // Draw camera position
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    const camX = centerX + camera.position.x * scale;
    const camY = centerY + camera.position.z * scale;
    ctx.beginPath();
    ctx.arc(camX, camY, 6, 0, Math.PI * 2);
    ctx.stroke();

    // Draw camera direction
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    ctx.beginPath();
    ctx.moveTo(camX, camY);
    ctx.lineTo(camX + dir.x * 30, camY + dir.z * 30);
    ctx.stroke();

    requestAnimationFrame(drawMinimap);
  }

  drawMinimap();
}

export function toggleMinimapVisibility(canvas, visible) {
  if (canvas) {
    canvas.style.display = visible ? 'block' : 'none';
  }
}
