import { describe, it, expect, vi } from 'vitest';
import { registerCommandActions, COMMAND_ACTION_KEYS } from './commandActions.js';

function makeDeps(overrides = {}) {
  const registered = {};
  return {
    deps: {
      ui: { toggle: { click: vi.fn() }, resetCam: { click: vi.fn() } },
      allBodies: [{ key: 'Earth', label: 'Terra' }],
      CAM: { tRadius: 0, tPhi: 0, tPivot: { set() {} } },
      commandPalette: { registerActions: vi.fn((a) => Object.assign(registered, a)) },
      themeManager: { toggle: vi.fn(), get: () => 'dark' },
      soundManager: { toggle: vi.fn() },
      screenshot: { capture: vi.fn() },
      travelCalc: { open: vi.fn() },
      viewPresets: {},
      shortcutsPanel: { toggle: vi.fn() },
      urlState: { setMany: vi.fn(), copyShareURL: vi.fn() },
      constellationManager: { toggle: vi.fn(() => true) },
      meteorShowerManager: { toggle: vi.fn(() => false) },
      eclipseSimulator: { getEvents: () => [], jumpToEclipse: vi.fn() },
      minimap: { toggle: vi.fn(() => true) },
      getSelectedBody: () => ({ key: 'Earth' }),
      selectBody: vi.fn(),
      exitFly: vi.fn(),
      getGalaxyMapMode: () => false,
      getLocalBubbleMode: () => false,
      getCustomDate: () => null,
      setCamLabel: vi.fn(),
      toggleTimeTravel: vi.fn(),
      toggleGrandTour: vi.fn(),
      toggleSystemsExplorer: vi.fn(),
      toggleQuiz: vi.fn(),
      getLang: () => 'it',
      t: (key) => key,
      ...overrides,
    },
    registered,
  };
}

describe('registerCommandActions', () => {
  it('registra tutte le azioni attese', () => {
    const { deps, registered } = makeDeps();
    registerCommandActions(deps);
    expect(deps.commandPalette.registerActions).toHaveBeenCalledOnce();
    for (const key of COMMAND_ACTION_KEYS) {
      expect(registered[key], `manca azione ${key}`).toBeTypeOf('function');
    }
  });

  it('pause/resume cliccano il toggle UI', () => {
    const { deps, registered } = makeDeps();
    registerCommandActions(deps);
    registered.pause();
    registered.resume();
    expect(deps.ui.toggle.click).toHaveBeenCalledTimes(2);
  });

  it('goToBody seleziona il corpo corrispondente', () => {
    const { deps, registered } = makeDeps();
    registerCommandActions(deps);
    registered.goToBody({ key: 'Earth' });
    expect(deps.selectBody).toHaveBeenCalledWith({ key: 'Earth', label: 'Terra' });
  });

  it('share costruisce lo stato URL con corpo e lingua', () => {
    const { deps, registered } = makeDeps();
    registerCommandActions(deps);
    registered.share();
    expect(deps.urlState.setMany).toHaveBeenCalledWith(
      expect.objectContaining({ body: 'Earth', lang: 'it' })
    );
    expect(deps.urlState.copyShareURL).toHaveBeenCalledOnce();
  });

  it('system esce dal volo e ricentra la camera', () => {
    const { deps, registered } = makeDeps();
    registerCommandActions(deps);
    registered.system();
    expect(deps.exitFly).toHaveBeenCalledOnce();
    expect(deps.setCamLabel).toHaveBeenCalledWith('orbit');
  });
});
