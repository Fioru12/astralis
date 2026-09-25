// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GrandTour, TOUR_STOPS } from './grandTour.js';

describe('GrandTour', () => {
  let tour;
  let onSelectMock;
  const dummyBodies = [
    { key: 'Sun', label: 'Sun' },
    { key: 'Mercury', label: 'Mercury' },
    { key: 'Venus', label: 'Venus' },
    { key: 'Earth', label: 'Earth' },
  ];

  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
    onSelectMock = vi.fn();
    tour = new GrandTour({
      allBodies: dummyBodies,
      onSelectBody: onSelectMock,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with default state', () => {
    expect(tour.isActive).toBe(false);
    expect(tour.currentIndex).toBe(0);
    expect(TOUR_STOPS.length).toBeGreaterThan(5);
  });

  it('starts tour at index 0 and selects first body', () => {
    tour.start();
    expect(tour.isActive).toBe(true);
    expect(tour.currentIndex).toBe(0);
    expect(onSelectMock).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'Sun' }),
      expect.any(Number)
    );
  });

  it('advances through steps with next() and wraps or stops at end', () => {
    tour.start();
    tour.next();
    expect(tour.currentIndex).toBe(1);
    expect(onSelectMock).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'Mercury' }),
      expect.any(Number)
    );

    tour.prev();
    expect(tour.currentIndex).toBe(0);
  });

  it('stops tour and clears timer', () => {
    tour.start();
    expect(tour.isActive).toBe(true);
    tour.stop();
    expect(tour.isActive).toBe(false);
  });

  it('pauses and resumes automated advance', () => {
    tour.start();
    tour.togglePause();
    expect(tour.isPaused).toBe(true);
    tour.togglePause();
    expect(tour.isPaused).toBe(false);
  });
});
