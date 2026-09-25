// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { buildPlanetsAndMoons } from './planetBuilder.js';
import { setLang } from '../i18n/index.js';
import { installCanvas2DStub } from '../utils/canvas2dStub.js';

installCanvas2DStub();

function makeCtx(overrides = {}) {
  const scene = new THREE.Scene();
  const labelsLayer = document.createElement('div');
  document.body.appendChild(labelsLayer);
  return {
    ctx: {
      scene,
      ui: { labelsLayer },
      pGroup: new THREE.Group(),
      aGroup: new THREE.Group(),
      allBodies: [],
      meshList: [],
      hitboxList: [],
      lodList: [],
      selectBody: vi.fn(),
      getTimeOffset: () => 0,
      getTimeOffsetMs: () => 0,
      ...overrides,
    },
    labelsLayer,
  };
}

describe('buildPlanetsAndMoons', () => {
  // Costruzione completa dai dati reali (fbm procedurale in JS): lenta
  // sotto coverage su runner condivisi, fuori dal budget default di 5s.
  it('costruisce pianeti, lune e fasce registrando tutte le strutture', () => {
    setLang('it');
    const { ctx } = makeCtx();
    const { mainBelt, kuiperBelt } = buildPlanetsAndMoons(ctx);
    expect(mainBelt.userData.name).toBe('mainBelt');
    expect(kuiperBelt.userData.name).toBe('kuiperBelt');
    expect(ctx.scene.children).toContain(mainBelt);

    const keys = ctx.allBodies.map((b) => b.key);
    for (const expected of ['Mercury', 'Earth', 'Pluto', 'Moon', 'Titan', 'Vesta', 'Bennu']) {
      expect(keys, expected).toContain(expected);
    }
    expect(ctx.meshList.length).toBeGreaterThan(10);
    expect(ctx.lodList.length).toBeGreaterThan(5);

    const earth = ctx.allBodies.find((b) => b.key === 'Earth');
    expect(earth.labelEl.textContent).toBe('Terra');
    expect(earth.atmosphereMesh).toBeTruthy();
    const pos = earth.getPos(0);
    expect(pos).toBeInstanceOf(THREE.Vector3);
    expect(pos.length()).toBeGreaterThan(0);
  }, 60000);

  it('localizza le etichette 3D nella lingua corrente', () => {
    setLang('en');
    const { ctx } = makeCtx();
    buildPlanetsAndMoons(ctx);
    const earth = ctx.allBodies.find((b) => b.key === 'Earth');
    expect(earth.labelEl.textContent).toBe('Earth');
    const moon = ctx.allBodies.find((b) => b.key === 'Moon');
    expect(typeof moon.getPos().x).toBe('number');
    setLang('it');
  }, 60000);
});
