// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createCameraSystem, enterFollow, updateCamera } from './camera.js';
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

    updateCamera(controls, camera, 1, { w: true });
    expect(controls.flyPos.z).toBeGreaterThan(0);

    controls.flyPos.set(0, 0, 0);
    updateCamera(controls, camera, 1, { s: true });
    expect(controls.flyPos.z).toBeLessThan(0);
  });
});
