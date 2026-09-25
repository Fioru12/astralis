// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GravitySandbox } from './gravitySandbox.js';

describe('GravitySandbox', () => {
  let sandbox;
  let mockScene;

  beforeEach(() => {
    document.body.innerHTML = '';
    mockScene = {
      add: vi.fn(),
      remove: vi.fn(),
    };
    sandbox = new GravitySandbox(mockScene);
  });

  it('initializes and toggles panel visibility', () => {
    expect(sandbox.isOpen).toBe(false);

    sandbox.show();
    expect(sandbox.isOpen).toBe(true);
    expect(document.getElementById('sandboxPanel')).not.toBeNull();
  });

  it('adds bodies to scene and cleans them up on clear', () => {
    sandbox.show();
    sandbox._addBody();

    expect(sandbox.bodies.length).toBe(1);
    expect(mockScene.add).toHaveBeenCalled();

    sandbox._clearAll();
    expect(sandbox.bodies.length).toBe(0);
    expect(mockScene.remove).toHaveBeenCalled();
  });

  it('cleans up scene bodies on panel hide', () => {
    vi.useFakeTimers();
    sandbox.show();
    sandbox._addBody();
    expect(sandbox.bodies.length).toBe(1);

    sandbox.hide();
    vi.advanceTimersByTime(300);

    expect(sandbox.bodies.length).toBe(0);
    expect(mockScene.remove).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
