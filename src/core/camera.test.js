// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import {
  createCameraSystem,
  dampFactor,
  enterFollow,
  getMoveInput,
  updateCamera,
} from './camera.js';
import { setLang } from '../i18n/index.js';

describe('camera controls', () => {
  it('uses a close, readable default orbit framing', () => {
    const camera = createCameraSystem();
    expect(camera.radius).toBe(900);
    expect(camera.tRadius).toBe(900);
  });

  it('shows a localized follow hint with the body name', () => {
    const controls = createCameraSystem();
    const body = { key: 'Earth', label: 'Terra', labelEn: 'Earth', visualR: 3.6 };
    let hint = '';
    const follow = (msg) => {
      hint = msg;
    };
    setLang('it');
    enterFollow(controls, body, () => {}, follow);
    expect(controls.mode).toBe('follow');
    expect(hint).toContain('Terra');
    setLang('en');
    enterFollow(controls, body, () => {}, follow);
    expect(hint).toContain('Earth');
    setLang('it');
  });

  it('moves forward with W and backward with S in free flight', () => {
    const controls = createCameraSystem();
    const camera = new THREE.PerspectiveCamera();
    controls.mode = 'fly';
    controls.flyPos.set(0, 0, 0);
    controls.flyYaw = 0;
    controls.flyPitch = 0;

    // La camera di three.js guarda verso -Z: avanti riduce z.
    updateCamera(controls, camera, 1, { w: true });
    expect(controls.flyPos.z).toBeLessThan(0);

    controls.flyPos.set(0, 0, 0);
    updateCamera(controls, camera, 1, { s: true });
    expect(controls.flyPos.z).toBeGreaterThan(0);

    // Coerenza con la vista: lo spostamento va nella direzione inquadrata.
    controls.flyPos.set(0, 0, 0);
    updateCamera(controls, camera, 1, { w: true });
    const look = new THREE.Vector3();
    camera.getWorldDirection(look);
    expect(controls.flyPos.clone().normalize().dot(look)).toBeCloseTo(1, 5);
  });
});

describe('getMoveInput', () => {
  it('combina WASD, frecce e QE in un vettore di direzione', () => {
    expect(getMoveInput({})).toEqual({ x: 0, y: 0, z: 0 });
    expect(getMoveInput({ w: true, d: true, q: true })).toEqual({ x: 1, y: 1, z: 1 });
    expect(getMoveInput({ ArrowDown: true, ArrowLeft: true, E: true })).toEqual({
      x: -1,
      y: -1,
      z: -1,
    });
    // Tasti opposti si annullano
    expect(getMoveInput({ w: true, s: true }).z).toBe(0);
  });
});

describe('dampFactor', () => {
  it('è indipendente dal frame rate', () => {
    // Due passi da 1/120 s equivalgono a un passo da 1/60 s
    const one = dampFactor(0.1, 1 / 60);
    const half = dampFactor(0.1, 1 / 120);
    expect(1 - (1 - half) * (1 - half)).toBeCloseTo(one, 10);
    expect(dampFactor(0.1, 0)).toBe(0);
  });
});

describe('updateCamera in orbita', () => {
  it("applica e smorza l'inerzia del trascinamento", () => {
    const cam = createCameraSystem();
    const camera = new THREE.PerspectiveCamera();
    const startTheta = cam.tTheta;
    cam.momentumTheta = 0.01;
    updateCamera(cam, camera, 1 / 60, {});
    expect(cam.tTheta).toBeCloseTo(startTheta + 0.01, 10);
    expect(cam.momentumTheta).toBeCloseTo(0.01 * cam.momentumDamp, 10);
    for (let i = 0; i < 200; i++) updateCamera(cam, camera, 1 / 60, {});
    expect(cam.momentumTheta).toBe(0);
  });

  it('limita phi per non ribaltare la camera', () => {
    const cam = createCameraSystem();
    cam.momentumPhi = 10;
    updateCamera(cam, new THREE.PerspectiveCamera(), 1 / 60, {});
    expect(cam.tPhi).toBeLessThanOrEqual(Math.PI - 0.05);
  });

  it('posiziona la camera a distanza radius dal pivot e la orienta verso di esso', () => {
    const cam = createCameraSystem();
    const camera = new THREE.PerspectiveCamera();
    cam.radius = cam.tRadius = 500;
    updateCamera(cam, camera, 1 / 60, {});
    expect(camera.position.distanceTo(cam.pivot)).toBeCloseTo(500, 3);
    const look = new THREE.Vector3();
    camera.getWorldDirection(look);
    const toPivot = cam.pivot.clone().sub(camera.position).normalize();
    expect(look.dot(toPivot)).toBeCloseTo(1, 5);
  });

  it('termina la transizione quando raggiunge il corpo selezionato', () => {
    const cam = createCameraSystem();
    const body = { pivot: { position: new THREE.Vector3(100, 0, 0) } };
    cam.zoomTarget = { body, finalRadius: cam.radius };
    cam.isTransitioning = true;
    updateCamera(cam, new THREE.PerspectiveCamera(), 1 / 60, {});
    expect(cam.zoomTarget).toBeNull();
    expect(cam.isTransitioning).toBe(false);
    expect(cam.tPivot.x).toBe(100);
  });
});
