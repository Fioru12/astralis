import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdaptiveQualityManager } from './adaptiveQuality.js';

describe('AdaptiveQualityManager', () => {
  let manager;

  beforeEach(() => {
    manager = new AdaptiveQualityManager({
      sampleWindow: 10,
      lowFpsThreshold: 40,
      highFpsThreshold: 58,
      initialLevel: 'high',
    });
  });

  it('initializes with default high profile and expected properties', () => {
    expect(manager.getQualityLevel()).toBe('high');
    const profile = manager.getCurrentProfile();
    expect(profile.bloom).toBe(true);
    expect(profile.particlesMultiplier).toBe(1.0);
  });

  it('allows manually setting quality levels', () => {
    const callback = vi.fn();
    manager.onChange(callback);

    manager.setQualityLevel('low', true);
    expect(manager.getQualityLevel()).toBe('low');
    expect(manager.autoScale).toBe(false);
    expect(callback).toHaveBeenCalledWith('low', expect.objectContaining({ bloom: false }));
  });

  it('downgrades quality when FPS is below lowFpsThreshold in auto mode', () => {
    manager.setQualityLevel('high', false);
    manager.setAutoScale(true);
    manager.cooldownFrames = 0;

    let time = 1000;
    // Simulate low FPS (delta = 50ms -> 20 FPS)
    for (let i = 0; i < 15; i++) {
      time += 50;
      manager.update(time);
    }

    expect(manager.getQualityLevel()).toBe('medium');
  });

  it('upgrades quality when FPS is consistently high', () => {
    manager.setQualityLevel('low', false);
    manager.setAutoScale(true);
    manager.cooldownFrames = 0;

    let time = 1000;
    // Simulate high FPS (delta = 16.6ms -> ~60 FPS)
    for (let i = 0; i < 20; i++) {
      time += 16.6;
      manager.update(time);
    }

    expect(manager.getQualityLevel()).toBe('medium');
  });

  it('handles unsubscribing from quality change listener', () => {
    const callback = vi.fn();
    const unsub = manager.onChange(callback);

    manager.setQualityLevel('ultra');
    expect(callback).toHaveBeenCalledTimes(1);

    unsub();
    manager.setQualityLevel('low');
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
