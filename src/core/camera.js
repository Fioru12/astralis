// src/core/camera.js
// ══════════════════════════════════════════════════════════════════
// SISTEMA CAMERA - 3 modalità: orbit / fly / follow
// ══════════════════════════════════════════════════════════════════

import * as THREE from 'three';
import { CAMERA_DAMP } from '../utils/constants.js';

/**
 * Crea il sistema camera con 3 modalità
 */
export function createCameraSystem() {
  return {
    mode: 'orbit',
    // Orbit
    radius: 1400, tRadius: 1400,
    theta: 0.9, tTheta: 0.9,
    phi: 1.05, tPhi: 1.05,
    pivot: new THREE.Vector3(),
    tPivot: new THREE.Vector3(),
    DAMP: CAMERA_DAMP,
    DAMP_FAST: 0.15,
    // Camera smoothing
    momentumTheta: 0,
    momentumPhi: 0,
    momentumRadius: 0,
    momentumDamp: 0.92, // Inertia decay
    // Zoom constraints
    minRadius: 50,
    maxRadius: 500000,
    // Fly
    flyPos: new THREE.Vector3(0, 200, 1400),
    flyYaw: 0, flyPitch: 0,
    flySpeed: 300,
    flyBoost: false,
    // Follow
    followBody: null,
    followDist: null,
    followTheta: 0.9,
    followPhi: 1.2,
    // Drag
    dragging: false, isDragging: false,
    lastX: 0, lastY: 0,
    downPos: new THREE.Vector2(),
    pointerLocked: false,
    zoomTarget: null,
    isTransitioning: false,
  };
}

/**
 * Entra in modalità volo libero
 */
export function enterFly(cam, camera, renderer, setCamLabel, showHint) {
  if (cam.mode === 'fly') return;
  cam.mode = 'fly';
  cam.flyPos.copy(camera.position);
  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);
  cam.flyPitch = Math.asin(Math.max(-1, Math.min(1, dir.y)));
  cam.flyYaw = Math.atan2(-dir.x, -dir.z);
  cam.followBody = null;
  setCamLabel('fly');
  showHint('🚀 Volo libero — WASD muovi · Q/E su/giù · Shift boost · ESC torna in orbita');
  renderer.domElement.requestPointerLock?.();
}

/**
 * Esce dalla modalità volo
 */
export function exitFly(cam, setCamLabel, showHint) {
  if (cam.mode === 'orbit') return;
  cam.mode = 'orbit';
  cam.followBody = null;
  document.exitPointerLock?.();
  const p = cam.flyPos;
  cam.radius = cam.tRadius = p.length();
  cam.phi = cam.tPhi = Math.acos(Math.max(-1, Math.min(1, p.y / cam.radius)));
  cam.theta = cam.tTheta = Math.atan2(p.z, p.x);
  cam.pivot.set(0, 0, 0);
  cam.tPivot.set(0, 0, 0);
  setCamLabel('orbit');
  showHint('🌐 Modalità orbita — trascina · scroll · Shift+trascina per pan');
}

/**
 * Entra in modalità follow
 */
export function enterFollow(cam, body, setCamLabel, showHint) {
  cam.followBody = body;
  cam.mode = 'follow';
  document.exitPointerLock?.();
  cam.followDist = Math.max(body.visualR * 10, 40);
  cam.followTheta = cam.theta;
  cam.followPhi = 1.2;
  setCamLabel('follow');
  showHint('🔭 Segui ' + body.label + ' — trascina per orbitare · scroll per zoom · ESC per uscire');
}

/**
 * Aggiorna la camera in base alla modalità
 */
export function updateCamera(cam, camera, dt, keys) {
  const sp = 1 - Math.pow(1 - cam.DAMP, dt * 60);

  if (cam.mode === 'orbit') {
    // Apply momentum from dragging
    if (cam.momentumTheta !== 0 || cam.momentumPhi !== 0 || cam.momentumRadius !== 0) {
      cam.tTheta += cam.momentumTheta;
      cam.tPhi += cam.momentumPhi;
      cam.tPhi = Math.max(0.05, Math.min(Math.PI - 0.05, cam.tPhi));
      cam.tRadius += cam.momentumRadius;
      cam.tRadius = Math.max(cam.minRadius, Math.min(cam.maxRadius, cam.tRadius));

      // Decay momentum
      cam.momentumTheta *= cam.momentumDamp;
      cam.momentumPhi *= cam.momentumDamp;
      cam.momentumRadius *= cam.momentumDamp;

      // Stop momentum when negligible
      if (Math.abs(cam.momentumTheta) < 0.0001) cam.momentumTheta = 0;
      if (Math.abs(cam.momentumPhi) < 0.0001) cam.momentumPhi = 0;
      if (Math.abs(cam.momentumRadius) < 0.1) cam.momentumRadius = 0;
    }

    if (cam.zoomTarget) {
      const pos = cam.zoomTarget.body.pivot?.position;
      if (pos) {
        cam.tRadius = cam.zoomTarget.finalRadius;
        cam.tPhi = Math.atan2(Math.sqrt(pos.x * pos.x + pos.z * pos.z), pos.y);
        cam.tTheta = Math.atan2(pos.z, pos.x);
        cam.tPivot.copy(pos);
        if (Math.abs(cam.radius - cam.tRadius) < 0.5) cam.zoomTarget = null;
      }
    }
    cam.radius += (cam.tRadius - cam.radius) * sp;
    cam.phi += (cam.tPhi - cam.phi) * sp;
    cam.theta += (cam.tTheta - cam.theta) * sp;
    cam.pivot.lerp(cam.tPivot, sp);
    camera.position.set(
      cam.pivot.x + cam.radius * Math.sin(cam.phi) * Math.cos(cam.theta),
      cam.pivot.y + cam.radius * Math.cos(cam.phi),
      cam.pivot.z + cam.radius * Math.sin(cam.phi) * Math.sin(cam.theta)
    );
    camera.lookAt(cam.pivot);

  } else if (cam.mode === 'fly') {
    const speed = cam.flySpeed * (cam.flyBoost ? 5 : 1) * dt;
    const fwd = new THREE.Vector3(Math.sin(cam.flyYaw) * Math.cos(cam.flyPitch), Math.sin(cam.flyPitch), Math.cos(cam.flyYaw) * Math.cos(cam.flyPitch));
    const right = new THREE.Vector3(Math.cos(cam.flyYaw), 0, -Math.sin(cam.flyYaw));
    const up = new THREE.Vector3(0, 1, 0);
    if (keys['w'] || keys['W'] || keys['ArrowUp']) cam.flyPos.addScaledVector(fwd, speed);
    if (keys['s'] || keys['S'] || keys['ArrowDown']) cam.flyPos.addScaledVector(fwd, -speed);
    if (keys['a'] || keys['A'] || keys['ArrowLeft']) cam.flyPos.addScaledVector(right, -speed);
    if (keys['d'] || keys['D'] || keys['ArrowRight']) cam.flyPos.addScaledVector(right, speed);
    if (keys['q'] || keys['Q']) cam.flyPos.addScaledVector(up, speed);
    if (keys['e'] || keys['E']) cam.flyPos.addScaledVector(up, -speed);
    camera.position.copy(cam.flyPos);
    camera.rotation.order = 'YXZ';
    camera.rotation.y = cam.flyYaw;
    camera.rotation.x = cam.flyPitch;

  } else if (cam.mode === 'follow' && cam.followBody) {
    const target = cam.followBody.pivot?.position || new THREE.Vector3();
    cam.followDist += ((Math.max(cam.followBody.visualR * 10, 40)) - cam.followDist) * 0.001;
    const offset = new THREE.Vector3(
      cam.followDist * Math.sin(cam.followPhi) * Math.cos(cam.followTheta),
      cam.followDist * Math.cos(cam.followPhi),
      cam.followDist * Math.sin(cam.followPhi) * Math.sin(cam.followTheta)
    );
    camera.position.lerp(target.clone().add(offset), sp * 2);
    camera.lookAt(target);
  }
}
