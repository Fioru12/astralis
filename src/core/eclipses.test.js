// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EclipseSimulator, ECLIPSE_EVENTS } from './eclipses.js';

describe('EclipseSimulator', () => {
  let simulator;
  let dateChangeMock;
  let focusMock;

  beforeEach(() => {
    dateChangeMock = vi.fn();
    focusMock = vi.fn();
    simulator = new EclipseSimulator({
      onDateChange: dateChangeMock,
      onFocus: focusMock,
    });
  });

  it('contains historical and future solar and lunar eclipse events', () => {
    expect(ECLIPSE_EVENTS.length).toBeGreaterThanOrEqual(5);
    const events = simulator.getEvents();
    expect(events[0].displayName).toBeDefined();
    expect(events[0].displayDesc).toBeDefined();
  });

  it('jumps to eclipse event and triggers callbacks with target date and body focus', () => {
    const ev = simulator.jumpToEclipse('solar_2024');
    expect(ev).toBeDefined();
    expect(ev.key).toBe('solar_2024');
    expect(dateChangeMock).toHaveBeenCalledWith(new Date('2024-04-08T18:17:00Z'));
    expect(focusMock).toHaveBeenCalledWith('Earth', ev);
  });

  it('returns null for unknown eclipse key', () => {
    const ev = simulator.jumpToEclipse('non_existent');
    expect(ev).toBeNull();
    expect(dateChangeMock).not.toHaveBeenCalled();
  });
});
