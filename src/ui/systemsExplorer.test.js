// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SystemsExplorer, STAR_SYSTEMS } from './systemsExplorer.js';

describe('SystemsExplorer', () => {
  let explorer;
  let warpMock;
  const dummyBodies = [
    { key: 'Sun', label: 'Sole', type: 'star' },
    { key: 'ProximaCentauri', label: 'Proxima Centauri', type: 'star' },
    { key: 'Trappist1', label: 'TRAPPIST-1', type: 'star' },
  ];

  beforeEach(() => {
    document.body.innerHTML = '';
    warpMock = vi.fn();
    explorer = new SystemsExplorer({
      allBodies: dummyBodies,
      onWarpJump: warpMock,
    });
  });

  it('contains famous star systems and exoplanetary worlds', () => {
    expect(STAR_SYSTEMS.length).toBeGreaterThanOrEqual(8);
    const trappist = STAR_SYSTEMS.find((s) => s.key === 'Trappist1');
    expect(trappist).toBeDefined();
    expect(trappist.planetsCount).toBe(7);
  });

  it('opens modal and renders cards into grid', () => {
    explorer.open();
    const modal = document.getElementById('systemsExplorerModal');
    expect(modal).not.toBeNull();
    expect(modal.style.display).toBe('flex');

    const cards = modal.querySelectorAll('.system-card');
    expect(cards.length).toBe(STAR_SYSTEMS.length);
  });

  it('filters system cards by habitable zone and distance', () => {
    explorer.open();
    explorer.currentFilter = 'habitable';
    explorer._renderCards();

    const grid = document.getElementById('systemsGrid');
    const cards = grid.querySelectorAll('.system-card');
    expect(cards.length).toBeLessThan(STAR_SYSTEMS.length);
    expect(cards.length).toBeGreaterThan(0);
  });

  it('executes warp jump and triggers onWarpJump callback', () => {
    explorer.open();
    explorer._executeWarp('ProximaCentauri', 'Proxima Centauri');

    expect(warpMock).toHaveBeenCalledWith(expect.objectContaining({ key: 'ProximaCentauri' }));
    expect(explorer.modalEl.style.display).toBe('none');
  });
});
