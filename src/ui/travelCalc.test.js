// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  travelCalc,
  computeRelativisticTrip,
  formatDuration,
  SPACECRAFT_PROFILES,
} from './travelCalc.js';
import { flightCockpit } from './flightCockpit.js';
import { setLang } from '../i18n/index.js';

describe('TravelCalc', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    setLang('it');
  });

  it('contains valid spacecraft profiles with speed values', () => {
    expect(SPACECRAFT_PROFILES.length).toBeGreaterThan(0);
    const parker = SPACECRAFT_PROFILES.find((p) => p.id === 'parker');
    expect(parker).toBeDefined();
    expect(parker.speedKmh).toBe(692000);
  });

  it('computes relativistic trips correctly', () => {
    const trip = computeRelativisticTrip(4.24, 1.0);
    expect(trip.distLy).toBe(4.24);
    expect(trip.earthYears).toBeGreaterThan(0);
    expect(trip.shipDays).toBeGreaterThan(0);
  });

  it('formats duration in Italian accurately', () => {
    setLang('it');
    expect(formatDuration(0.5)).toBe('12 ore');
    expect(formatDuration(15)).toBe('15 giorni');
    expect(formatDuration(180)).toContain('mesi');
    expect(formatDuration(3650)).toContain('anni');
  });

  it('formats duration in English when selected', () => {
    setLang('en');
    expect(formatDuration(0.5)).toBe('12 hours');
    expect(formatDuration(15)).toBe('15 days');
    expect(formatDuration(3650)).toContain('years');
    setLang('it');
  });

  it('provides bilingual spacecraft profiles', () => {
    for (const craft of SPACECRAFT_PROFILES) {
      expect(craft.desc?.it, `${craft.id}: desc.it`).toBeTruthy();
      expect(craft.desc?.en, `${craft.id}: desc.en`).toBeTruthy();
    }
  });

  it('initializes and opens travel modal', () => {
    const dummyBodies = [
      { key: 'Earth', label: 'Terra', icon: '🌍' },
      { key: 'Mars', label: 'Marte', icon: '🔴', distAU: 1.52 },
    ];
    const selectBody = vi.fn();
    const zoomToBody = vi.fn();

    travelCalc.init({ allBodies: dummyBodies, selectBody, zoomToBody });
    travelCalc.open(dummyBodies[1], dummyBodies[0]);

    expect(travelCalc.isOpen).toBe(true);
    const modal = document.getElementById('spaceTravelModal');
    expect(modal).not.toBeNull();
    expect(modal.style.display).toBe('flex');
  });

  it('executes travel and triggers callback with simulated date advancement', () => {
    const dummyBodies = [
      { key: 'Earth', label: 'Terra', icon: '🌍' },
      { key: 'Mars', label: 'Marte', icon: '🔴', distAU: 1.52 },
    ];
    const selectBody = vi.fn();
    const zoomToBody = vi.fn();
    const onTravelExecute = vi.fn();

    travelCalc.init({ allBodies: dummyBodies, selectBody, zoomToBody, onTravelExecute });
    travelCalc.open(dummyBodies[1], dummyBodies[0]);

    travelCalc._executeTravel();
    flightCockpit._finishFlight();

    expect(travelCalc.isOpen).toBe(false);
    expect(selectBody).toHaveBeenCalledWith(dummyBodies[1]);
    expect(zoomToBody).toHaveBeenCalledWith(dummyBodies[1], 1200);
    expect(onTravelExecute).toHaveBeenCalled();
  });
});
