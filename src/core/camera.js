// src/core/camera.js
// ══════════════════════════════════════════════════════════════════
// SISTEMA CAMERA - 3 modalità: orbit / fly / follow
// ══════════════════════════════════════════════════════════════════

import * as THREE from 'three';
import { CAMERA_DAMP } from '../utils/constants.js';
import { getLang, t } from '../i18n/index.js';
import { getBodyLabel } from '../data/celestialData.js';

/**
 * Crea il sistema camera con 3 modalità
 */
export function createCameraSystem() {
  return {
    mode: 'orbit',
    // Orbit
    // Keep the initial system readable while preserving the full-system presets.
    radius: 900,
    tRadius: 900,
    theta: 0.9,
    tTheta: 0.9,
    phi: 1.05,
    tPhi: 1.05,
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
    flyYaw: 0,
    flyPitch: 0,
    flySpeed: 300,
    flyBoost: false,
    // Follow
    followBody: null,
    followDist: null,
    followTheta: 0.9,
    followPhi: 1.2,
    // Drag
    dragging: false,
    isDragging: false,
    lastX: 0,
    lastY: 0,
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
  showHint(
    '🚀 Volo libero — W avanti · S indietro · A/D laterali · Q/E su/giù · Shift boost · ESC torna in orbita'
  );
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
  showHint(
    `🔭 ${t('info_follow')} ${getBodyLabel(body, getLang())} — ${t('shortcut_rotate')} · ${t(
      'shortcut_zoom'
    )} · ${t('shortcut_esc')}`
  );
}

// Vettori di lavoro riusati: updateCamera gira a ogni fotogramma.
const _fwd = new THREE.Vector3();
const _right = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _offset = new THREE.Vector3();
const _followTarget = new THREE.Vector3();
const _targetPos = new THREE.Vector3();

/**
 * Direzione di movimento da tastiera: {x: destra(+)/sinistra(-),
 * z: avanti(+)/indietro(-), y: su(+)/giù(-)}. Accetta WASD/QE e frecce.
 */
export function getMoveInput(keys) {
  const k = (...names) => names.some((n) => keys[n]);
  return {
    z: (k('w', 'W', 'ArrowUp') ? 1 : 0) - (k('s', 'S', 'ArrowDown') ? 1 : 0),
    x: (k('d', 'D', 'ArrowRight') ? 1 : 0) - (k('a', 'A', 'ArrowLeft') ? 1 : 0),
    y: (k('q', 'Q') ? 1 : 0) - (k('e', 'E') ? 1 : 0),
  };
}

/** Fattore di smorzamento indipendente dal frame rate (dt in secondi). */
export function dampFactor(damp, dt) {
  return 1 - Math.pow(1 - damp, dt * 60);
}

/** Applica e fa decadere l'inerzia lasciata dal trascinamento (controls.js). */
function applyMomentum(cam) {
  if (cam.momentumTheta === 0 && cam.momentumPhi === 0 && cam.momentumRadius === 0) return;
  cam.tTheta += cam.momentumTheta;
  cam.tPhi = Math.max(0.05, Math.min(Math.PI - 0.05, cam.tPhi + cam.momentumPhi));
  if (cam.momentumRadius !== 0) {
    cam.tRadius = Math.max(
      cam.minRadius,
      Math.min(cam.maxRadius, cam.tRadius + cam.momentumRadius)
    );
  }
  cam.momentumTheta *= cam.momentumDamp;
  cam.momentumPhi *= cam.momentumDamp;
  cam.momentumRadius *= cam.momentumDamp;
  if (Math.abs(cam.momentumTheta) < 0.0001) cam.momentumTheta = 0;
  if (Math.abs(cam.momentumPhi) < 0.0001) cam.momentumPhi = 0;
  if (Math.abs(cam.momentumRadius) < 0.1) cam.momentumRadius = 0;
}

/**
 * Aggiorna la camera in base alla modalità (orbit / fly / follow).
 */
export function updateCamera(cam, camera, dt, keys) {
  const distToTarget = cam.zoomTarget ? Math.abs(cam.radius - cam.zoomTarget.finalRadius) : 0;
  const useFastDamp = distToTarget > 500 || cam.isTransitioning;
  const sp = dampFactor(useFastDamp ? cam.DAMP_FAST : cam.DAMP, dt);
  const move = getMoveInput(keys);

  if (cam.mode === 'orbit') {
    applyMomentum(cam);
    const moveSpeed = cam.radius * 0.005 * dt * 60;
    if (move.z || move.x) {
      _fwd.set(-Math.sin(cam.theta), 0, -Math.cos(cam.theta));
      _right.set(-Math.cos(cam.theta), 0, Math.sin(cam.theta));
      cam.tPivot.addScaledVector(_fwd, move.z * moveSpeed);
      cam.tPivot.addScaledVector(_right, move.x * moveSpeed);
    }
    cam.tPivot.y += move.y * moveSpeed;

    if (cam.zoomTarget) {
      // Posizione nel mondo: alcuni pivot (esopianeti) sono relativi alla stella.
      const pivot = cam.zoomTarget.body.pivot;
      const pos = pivot?.getWorldPosition ? pivot.getWorldPosition(_targetPos) : pivot?.position;
      if (pos) {
        cam.tRadius = cam.zoomTarget.finalRadius;
        cam.tPivot.copy(pos);
        if (Math.abs(cam.radius - cam.tRadius) < 0.5) {
          cam.zoomTarget = null;
          cam.isTransitioning = false;
        }
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
    // La camera guarda verso -Z: con yaw=0 "avanti" riduce z.
    _fwd.set(
      -Math.sin(cam.flyYaw) * Math.cos(cam.flyPitch),
      Math.sin(cam.flyPitch),
      -Math.cos(cam.flyYaw) * Math.cos(cam.flyPitch)
    );
    _right.set(Math.cos(cam.flyYaw), 0, -Math.sin(cam.flyYaw));
    cam.flyPos.addScaledVector(_fwd, move.z * speed);
    cam.flyPos.addScaledVector(_right, move.x * speed);
    cam.flyPos.addScaledVector(_up, move.y * speed);
    camera.position.copy(cam.flyPos);
    camera.rotation.order = 'YXZ';
    camera.rotation.y = cam.flyYaw;
    camera.rotation.x = cam.flyPitch;
    cam.isTransitioning = false;
  } else if (cam.mode === 'follow' && cam.followBody) {
    const fp = cam.followBody.pivot;
    const target = fp?.getWorldPosition
      ? fp.getWorldPosition(_followTarget)
      : fp?.position || _followTarget.set(0, 0, 0);
    const targetDist = Math.max(cam.followBody.visualR * 10, 40);
    cam.followDist += (targetDist - cam.followDist) * sp * 2;
    _offset.set(
      cam.followDist * Math.sin(cam.followPhi) * Math.cos(cam.followTheta),
      cam.followDist * Math.cos(cam.followPhi),
      cam.followDist * Math.sin(cam.followPhi) * Math.sin(cam.followTheta)
    );
    _offset.add(target);
    camera.position.lerp(_offset, sp * 2);
    camera.lookAt(target);
    if (Math.abs(cam.followDist - targetDist) < 1) cam.isTransitioning = false;
  }
}
