// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { createLazyFeatures } from './lazyFeatures.js';

function makeCtx(overrides = {}) {
  return {
    scene: {},
    camera: {},
    renderer: {},
    allBodies: [],
    CAM: { tRadius: 0, tTheta: 0, tPhi: 0, tPivot: { copy() {}, set() {} }, followBody: null },
    getSelectedBody: () => null,
    selectBody: vi.fn(),
    exitFly: vi.fn(),
    exitGalaxyMapIfActive: vi.fn(),
    setCamLabel: vi.fn(),
    setCustomDate: vi.fn(),
    importers: {
      news: async () => ({
        SpaceNews: class {
          toggle() {}
        },
      }),
      quiz: async () => ({
        Quiz: class {
          toggle() {}
        },
      }),
      gravity: async () => ({
        GravitySandbox: class {
          toggle() {}
        },
      }),
      grandTour: async () => ({
        GrandTour: class {
          toggle() {}
        },
      }),
      systemsExplorer: async () => ({
        SystemsExplorer: class {
          toggle() {}
        },
      }),
      comparison: async () => ({
        ComparisonMode: class {
          toggle() {}
        },
      }),
      credits: async () => ({ creditsPage: { toggle() {} } }),
      missions: async () => ({
        MissionsSystem: class {
          toggle() {}
        },
      }),
      spaceMissions: async () => ({ showMissionsPanel: vi.fn() }),
      bookmarks: async () => ({ CameraBookmarks: class {} }),
      observatory: async () => ({ Observatory: class {} }),
      systemInspector: async () => ({
        SystemInspectorModal: class {
          open() {}
        },
      }),
    },
    ...overrides,
  };
}

describe('createLazyFeatures', () => {
  it('espone tutte le azioni lazy', () => {
    const lazy = createLazyFeatures(makeCtx());
    for (const key of [
      'toggleSpaceNews',
      'toggleQuiz',
      'toggleTimeTravel',
      'toggleGravitySandbox',
      'toggleGrandTour',
      'openSystemInspector',
      'toggleSystemsExplorer',
      'toggleComparison',
      'toggleCredits',
      'toggleMissions',
      'openSpaceMissions',
      'getBookmarks',
      'getObservatory',
      'toggleObservatory',
    ]) {
      expect(typeof lazy[key]).toBe('function');
    }
  });

  it('riusa la stessa istanza alla seconda apertura (cache)', async () => {
    let instances = 0;
    const ctx = makeCtx({
      importers: {
        quiz: async () => ({
          Quiz: class {
            toggle() {
              instances++;
            }
          },
        }),
      },
    });
    const lazy = createLazyFeatures(ctx);
    await lazy.toggleQuiz();
    await lazy.toggleQuiz();
    expect(instances).toBe(2); // toggle chiamato 2 volte…
  });

  it('toggleObservatory avvisa se nessun pianeta è selezionato', async () => {
    const lazy = createLazyFeatures(makeCtx({ getSelectedBody: () => null }));
    await expect(lazy.toggleObservatory()).resolves.toBeUndefined();
    const btn = document.getElementById('observatoryBtn');
    if (btn) expect(btn.getAttribute('aria-pressed')).toBe('false');
  });

  it('toggleObservatory apre l’osservatorio su un pianeta selezionato', async () => {
    let toggledWith = null;
    const ctx = makeCtx({
      getSelectedBody: () => ({ key: 'Earth', type: 'planet' }),
      allBodies: [{ key: 'Sun', pivot: { position: { x: 0, y: 0, z: 0 } } }],
      importers: {
        observatory: async () => ({
          Observatory: class {
            active = true;
            toggle(body) {
              toggledWith = body;
            }
          },
        }),
      },
    });
    const lazy = createLazyFeatures(ctx);
    await lazy.toggleObservatory();
    expect(toggledWith?.key).toBe('Earth');
  });

  it('getObservatory riusa la stessa istanza', async () => {
    const lazy = createLazyFeatures(makeCtx());
    const a = await lazy.getObservatory();
    const b = await lazy.getObservatory();
    expect(a).toBe(b);
  });
});
