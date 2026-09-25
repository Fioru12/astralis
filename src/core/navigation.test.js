// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { createNavigation } from './navigation.js';

function makeCtx(overrides = {}) {
  const camera = new THREE.PerspectiveCamera();
  return {
    ctx: {
      CAM: {
        radius: 900,
        tRadius: 900,
        tTheta: 0,
        tPhi: 0,
        tPivot: new THREE.Vector3(),
        pivot: new THREE.Vector3(),
        mode: 'orbit',
        followBody: null,
        isTransitioning: false,
      },
      camera,
      renderer: {},
      ui: {},
      allBodies: [
        { key: 'Earth', type: 'planet', pivot: { position: new THREE.Vector3() }, visualR: 3.6 },
        { key: 'Moon', type: 'moon', pivot: { position: new THREE.Vector3() }, visualR: 1 },
      ],
      hintTimerRef: { current: null },
      selectBody: vi.fn(),
      setCamLabel: vi.fn(),
      showHint: vi.fn(),
      ...overrides,
    },
  };
}

describe('createNavigation', () => {
  it('zoomToBody imposta il target con raggio finale proporzionato', () => {
    const { ctx } = makeCtx();
    const { zoomToBody } = createNavigation(ctx);
    const body = ctx.allBodies[0];
    zoomToBody(body, 500);
    expect(ctx.CAM.zoomTarget.body).toBe(body);
    expect(ctx.CAM.zoomTarget.finalRadius).toBe(Math.max(3.6 * 8, 26));
    expect(ctx.CAM.mode).toBe('orbit');
    expect(ctx.setCamLabel).toHaveBeenCalledWith({}, 'orbit');
  });

  it('zoomToBody ignora corpi senza pivot', () => {
    const { ctx } = makeCtx();
    const { zoomToBody } = createNavigation(ctx);
    expect(() => zoomToBody(null)).not.toThrow();
    expect(ctx.CAM.zoomTarget).toBeUndefined();
  });

  it('zoomToPosition centra la camera sulla posizione', () => {
    const { ctx } = makeCtx();
    const { zoomToPosition } = createNavigation(ctx);
    zoomToPosition(new THREE.Vector3(100, 0, 0), 200);
    expect(ctx.CAM.tRadius).toBe(200);
    expect(ctx.CAM.tPivot.x).toBe(100);
    expect(ctx.CAM.mode).toBe('orbit');
  });

  it('exploreBody ed exploreRandomBody selezionano i corpi', () => {
    const { ctx } = makeCtx();
    const { exploreBody, exploreRandomBody } = createNavigation(ctx);
    exploreBody('Moon');
    expect(ctx.selectBody).toHaveBeenCalledWith(ctx.allBodies[1]);
    exploreBody('Unknown');
    expect(ctx.selectBody).toHaveBeenCalledTimes(1);
    exploreRandomBody();
    expect(ctx.selectBody).toHaveBeenCalledTimes(2);
  });
});
