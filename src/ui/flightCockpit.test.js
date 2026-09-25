// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FlightCockpit } from './flightCockpit.js';

describe('FlightCockpit', () => {
  let cockpit;

  beforeEach(() => {
    document.body.innerHTML = '';
    cockpit = new FlightCockpit();
  });

  it('initializes and starts cockpit flight HUD screen', () => {
    const onComplete = vi.fn();
    cockpit.startFlight({
      originBody: { label: 'Terra', icon: '🌍' },
      targetBody: { label: 'Marte', icon: '🔴' },
      craft: { name: 'Parker Solar Probe', speedKmh: 692000 },
      totalDays: 180,
      onComplete,
    });

    expect(cockpit.active).toBe(true);
    const overlay = document.getElementById('flightCockpitOverlay');
    expect(overlay).not.toBeNull();
    expect(overlay.querySelector('#cockpitWarpCanvas')).not.toBeNull();
  });

  it('finishes flight on skip button click', () => {
    const onComplete = vi.fn();
    cockpit.startFlight({
      originBody: { label: 'Terra' },
      targetBody: { label: 'Giove' },
      totalDays: 500,
      onComplete,
    });

    cockpit._finishFlight(true);
    expect(cockpit.active).toBe(false);
    expect(onComplete).toHaveBeenCalledWith(true);
  });

  it('aborts flight on abort button click', () => {
    const onCancel = vi.fn();
    cockpit.startFlight({
      originBody: { label: 'Terra' },
      targetBody: { label: 'Marte' },
      onCancel,
    });

    cockpit._abortFlight();
    expect(cockpit.active).toBe(false);
    expect(onCancel).toHaveBeenCalled();
  });
});
