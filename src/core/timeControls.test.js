// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { createTimeControls } from './timeControls.js';
import { setLang } from '../i18n/index.js';

function makeDeps(overrides = {}) {
  const state = { customDate: null };
  return {
    state,
    deps: {
      getSimDate: () => state.customDate || new Date('2026-01-01T00:00:00Z'),
      setCustomDate: (d) => {
        state.customDate = d;
      },
      clickNowBtn: vi.fn(),
      showHintFn: vi.fn(),
      ...overrides,
    },
  };
}

describe('createTimeControls', () => {
  it('jumpToNow azzera la data e mostra il suggerimento localizzato', () => {
    const { state, deps } = makeDeps();
    state.customDate = new Date('2030-05-05T00:00:00Z');
    setLang('it');
    const { jumpToNow } = createTimeControls(deps);
    jumpToNow();
    expect(state.customDate).toBeNull();
    expect(deps.clickNowBtn).toHaveBeenCalledOnce();
    expect(deps.showHintFn).toHaveBeenCalledWith('Torna al presente');
    setLang('en');
    jumpToNow();
    expect(deps.showHintFn).toHaveBeenCalledWith('Back to present');
    setLang('it');
  });

  it('jumpYears sposta di anni con unità singolare/plurale', () => {
    const { state, deps } = makeDeps();
    setLang('it');
    const { jumpYears } = createTimeControls(deps);
    jumpYears(1);
    expect(state.customDate.getUTCFullYear()).toBe(2027);
    expect(deps.showHintFn).toHaveBeenCalledWith('+1 anno');
    jumpYears(-10);
    expect(state.customDate.getUTCFullYear()).toBe(2017);
    expect(deps.showHintFn).toHaveBeenCalledWith('-10 anni');
  });
});
