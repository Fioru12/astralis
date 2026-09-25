// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TimeTravel } from './timeTravel.js';

describe('TimeTravel', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.stubGlobal('requestAnimationFrame', (callback) => callback());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('opens an accessible dialog with all highlighted events', () => {
    const timeTravel = new TimeTravel();
    timeTravel.show();

    const panel = document.querySelector('#timeTravelPanel');
    expect(panel).not.toBeNull();
    expect(panel.getAttribute('role')).toBe('dialog');
    expect(panel.querySelectorAll('[data-tt-event]')).toHaveLength(8);
  });

  it('sends the date of a selected event to the simulation', () => {
    const onDateChange = vi.fn();
    const timeTravel = new TimeTravel({ onDateChange });
    timeTravel.show();

    document.querySelector('[data-tt-event="apollo11"]').click();

    expect(onDateChange).toHaveBeenCalledOnce();
    expect(onDateChange.mock.calls[0][0].toISOString()).toBe('1969-07-20T20:17:00.000Z');
  });
});
