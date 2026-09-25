// src/core/controls.js
// ══════════════════════════════════════════════════════════════════
// GESTIONE INPUT (mouse, tastiera, touch)
// ══════════════════════════════════════════════════════════════════

import * as THREE from 'three';
import { enterFly, exitFly } from './camera.js';
import { highlightInventory } from '../ui/inventory.js';

export function setupControls(
  cam,
  camera,
  renderer,
  ui,
  raycaster,
  mouse,
  mouseMove,
  meshList,
  hitboxList,
  allBodies,
  tooltip,
  setCamLabel,
  showHint,
  selectBody
) {
  const isSceneTarget = (target) =>
    target === renderer.domElement || target?.classList?.contains('label');

  // Mouse
  window.addEventListener('mousedown', (e) => {
    if (!isSceneTarget(e.target)) return;
    if (cam.pointerLocked) return;
    cam.dragging = true;
    cam.isDragging = false;
    cam.lastX = e.clientX;
    cam.lastY = e.clientY;
    cam.downPos.set(e.clientX, e.clientY);
    cam.zoomTarget = null;
  });

  window.addEventListener('mouseleave', () => {
    cam.dragging = false;
  });

  window.addEventListener(
    'mousemove',
    (e) => {
      if (cam.pointerLocked && cam.mode === 'fly') {
        cam.flyYaw -= e.movementX * 0.002;
        cam.flyPitch -= e.movementY * 0.002;
        cam.flyPitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, cam.flyPitch));
        return;
      }

      if (!cam.dragging) {
        // Hover tooltip
        mouseMove.set(
          (e.clientX / window.innerWidth) * 2 - 1,
          -(e.clientY / window.innerHeight) * 2 + 1
        );
        raycaster.setFromCamera(mouseMove, camera);
        const hits = raycaster
          .intersectObjects([...meshList, ...hitboxList])
          .filter((h) => h.object.userData.bodyKey);
        if (hits.length > 0) {
          const b = allBodies.find((x) => x.key === hits[0].object.userData.bodyKey);
          ui.hoveredBody = b || null;
          renderer.domElement.style.cursor = 'pointer';
          tooltip.style.display = 'block';
          tooltip.style.left = e.clientX + 14 + 'px';
          tooltip.style.top = e.clientY - 10 + 'px';
          if (b) tooltip.textContent = b.icon + ' ' + b.label;
        } else {
          ui.hoveredBody = null;
          renderer.domElement.style.cursor = cam.pointerLocked ? 'none' : 'default';
          tooltip.style.display = 'none';
        }
        return;
      }

      const dx = e.clientX - cam.lastX,
        dy = e.clientY - cam.lastY;
      if (Math.hypot(e.clientX - cam.downPos.x, e.clientY - cam.downPos.y) > 5)
        cam.isDragging = true;

      if (cam.mode === 'orbit') {
        if (e.shiftKey) {
          const right = new THREE.Vector3(),
            up = new THREE.Vector3();
          right.setFromMatrixColumn(camera.matrix, 0);
          up.setFromMatrixColumn(camera.matrix, 1);
          const ps = cam.radius * 0.001;
          cam.tPivot.addScaledVector(right, -dx * ps);
          cam.tPivot.addScaledVector(up, dy * ps);
        } else {
          cam.tTheta -= dx * 0.005;
          cam.tPhi += dy * 0.005;
          cam.tPhi = Math.max(0.05, Math.min(Math.PI - 0.05, cam.tPhi));
        }
      }
      if (cam.mode === 'follow') {
        cam.followTheta -= dx * 0.005;
        cam.followPhi += dy * 0.005;
        cam.followPhi = Math.max(0.1, Math.min(Math.PI - 0.1, cam.followPhi));
      }
      cam.lastX = e.clientX;
      cam.lastY = e.clientY;
    },
    { passive: true }
  );

  let lastDragVelX = 0,
    lastDragVelY = 0;
  window.addEventListener('mouseup', (e) => {
    const was = cam.isDragging;
    cam.dragging = cam.isDragging = false;

    // Transfer drag velocity to momentum
    if (was && cam.mode === 'orbit') {
      cam.momentumTheta = -lastDragVelX * 0.005 * 0.15; // 15% of velocity becomes momentum
      cam.momentumPhi = lastDragVelY * 0.005 * 0.15;
    }

    if (was) return;
    handleClick(
      e.clientX,
      e.clientY,
      camera,
      raycaster,
      mouse,
      meshList,
      hitboxList,
      allBodies,
      ui,
      renderer,
      selectBody,
      highlightInventory
    );
  });

  // Track velocity for momentum
  let lastVelCheckX = 0,
    lastVelCheckY = 0;
  let lastVelCheckTime = Date.now();
  window.addEventListener(
    'mousemove',
    (e) => {
      if (cam.dragging && cam.isDragging) {
        const now = Date.now();
        const dt = Math.max(1, now - lastVelCheckTime);
        lastDragVelX = (e.clientX - lastVelCheckX) / (dt * 0.016);
        lastDragVelY = (e.clientY - lastVelCheckY) / (dt * 0.016);
        lastVelCheckX = e.clientX;
        lastVelCheckY = e.clientY;
        lastVelCheckTime = now;
      }
    },
    { passive: true }
  );

  window.addEventListener('dblclick', (e) => {
    if (cam.mode !== 'orbit') {
      exitFly(cam, setCamLabel, showHint);
      return;
    }
    mouse.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster
      .intersectObjects([...meshList, ...hitboxList])
      .filter((h) => h.object.userData.bodyKey);
    if (hits.length === 0) enterFly(cam, camera, renderer, setCamLabel, showHint);
  });

  window.addEventListener('wheel', (e) => {
    if (!isSceneTarget(e.target)) return;
    cam.zoomTarget = null;
    if (cam.mode === 'fly') {
      cam.flySpeed = Math.max(5, Math.min(100000, cam.flySpeed * (1 + e.deltaY * 0.001)));
      return;
    }
    if (cam.mode === 'follow') {
      cam.followDist = Math.max(5, Math.min(50000, cam.followDist * (1 + e.deltaY * 0.001)));
      return;
    }
    cam.tRadius *= 1 + e.deltaY * 0.001;
    cam.tRadius = Math.max(cam.minRadius, Math.min(cam.maxRadius, cam.tRadius));
  });

  // Touch support & gesture handling
  let touchStartDist = 0;
  let touchStartCenter = { x: 0, y: 0 };
  let lastTapTime = 0;
  let lastTapPos = { x: 0, y: 0 };

  window.addEventListener(
    'touchstart',
    (e) => {
      if (!isSceneTarget(e.target)) return;
      if (e.touches.length === 1) {
        cam.dragging = true;
        cam.isDragging = false;
        cam.lastX = e.touches[0].clientX;
        cam.lastY = e.touches[0].clientY;
        cam.downPos.set(cam.lastX, cam.lastY);
        cam.zoomTarget = null;
      } else if (e.touches.length === 2) {
        cam.dragging = false;
        touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        touchStartCenter = {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        };
      }
    },
    { passive: true }
  );

  window.addEventListener(
    'touchmove',
    (e) => {
      if (!isSceneTarget(e.target)) return;
      if (e.touches.length === 1 && cam.dragging) {
        const dx = e.touches[0].clientX - cam.lastX;
        const dy = e.touches[0].clientY - cam.lastY;
        if (
          Math.hypot(e.touches[0].clientX - cam.downPos.x, e.touches[0].clientY - cam.downPos.y) > 5
        ) {
          cam.isDragging = true;
        }
        cam.tTheta -= dx * 0.005;
        cam.tPhi += dy * 0.005;
        cam.tPhi = Math.max(0.05, Math.min(Math.PI - 0.05, cam.tPhi));
        cam.lastX = e.touches[0].clientX;
        cam.lastY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        // Pinch-to-zoom
        const d = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (touchStartDist > 0 && d > 0) {
          const factor = touchStartDist / d;
          // Smooth zoom damping
          const smoothFactor = 1 + (factor - 1) * 0.7;
          if (cam.mode === 'follow') {
            cam.followDist = Math.max(5, Math.min(50000, cam.followDist * smoothFactor));
          } else {
            cam.tRadius *= smoothFactor;
            cam.tRadius = Math.max(cam.minRadius, Math.min(cam.maxRadius, cam.tRadius));
          }
          touchStartDist = d;
        }

        // Two-finger pan
        const currentCenter = {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        };
        const panDx = currentCenter.x - touchStartCenter.x;
        const panDy = currentCenter.y - touchStartCenter.y;
        if (Math.hypot(panDx, panDy) > 2 && cam.mode === 'orbit') {
          const right = new THREE.Vector3();
          const up = new THREE.Vector3();
          right.setFromMatrixColumn(camera.matrix, 0);
          up.setFromMatrixColumn(camera.matrix, 1);
          const ps = cam.radius * 0.0008;
          cam.tPivot.addScaledVector(right, -panDx * ps);
          cam.tPivot.addScaledVector(up, panDy * ps);
        }
        touchStartCenter = currentCenter;
      }
    },
    { passive: true }
  );

  window.addEventListener('touchend', (e) => {
    if (!isSceneTarget(e.target)) return;
    const was = cam.isDragging;
    cam.dragging = cam.isDragging = false;
    if (was || e.changedTouches.length !== 1) return;

    const t = e.changedTouches[0];
    const now = Date.now();
    const isDoubleTap =
      now - lastTapTime < 320 &&
      Math.hypot(t.clientX - lastTapPos.x, t.clientY - lastTapPos.y) < 25;

    lastTapTime = now;
    lastTapPos = { x: t.clientX, y: t.clientY };

    if (isDoubleTap) {
      // Double-tap on touch device: toggle fly or select/zoom
      if (cam.mode !== 'orbit') {
        exitFly(cam, setCamLabel, showHint);
      } else {
        mouse.set(
          (t.clientX / window.innerWidth) * 2 - 1,
          -(t.clientY / window.innerHeight) * 2 + 1
        );
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster
          .intersectObjects([...meshList, ...hitboxList])
          .filter((h) => h.object.userData.bodyKey);
        if (hits.length === 0) {
          enterFly(cam, camera, renderer, setCamLabel, showHint);
        } else {
          const body = allBodies.find((b) => b.key === hits[0].object.userData.bodyKey);
          if (body) selectBody(body);
        }
      }
      return;
    }

    handleClick(
      t.clientX,
      t.clientY,
      camera,
      raycaster,
      mouse,
      meshList,
      hitboxList,
      allBodies,
      ui,
      renderer,
      selectBody,
      highlightInventory
    );
  });

  document.addEventListener('pointerlockchange', () => {
    cam.pointerLocked = document.pointerLockElement === renderer.domElement;
  });
}

/**
 * Gestisce il click su un corpo celeste
 */
function handleClick(
  cx,
  cy,
  camera,
  raycaster,
  mouse,
  meshList,
  hitboxList,
  allBodies,
  ui,
  renderer,
  selectBody
) {
  const el = document.elementFromPoint(cx, cy);
  if (el && el !== renderer.domElement && !el.classList.contains('label')) return;

  mouse.set((cx / window.innerWidth) * 2 - 1, -(cy / window.innerHeight) * 2 + 1);
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster
    .intersectObjects([...meshList, ...hitboxList])
    .filter((h) => h.object.userData.bodyKey);
  if (hits.length > 0) {
    const body = allBodies.find((b) => b.key === hits[0].object.userData.bodyKey);
    if (body) selectBody(body);
  } else {
    if (ui.infoPanel) ui.infoPanel.classList.remove('visible');
    selectBody(null);
  }
}
