// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Minimap } from './minimap.js';

describe('Minimap', () => {
  let container;

  beforeEach(() => {
    document.body.innerHTML = '<div id="minimapContainer"></div>';
    container = document.getElementById('minimapContainer');
  });

  it('initializes DOM header, canvas, buttons, and scale badge correctly', () => {
    const minimap = new Minimap({ container });
    expect(minimap.container).toBe(container);
    expect(container.querySelector('#minimapTitle')).not.toBeNull();
    expect(container.querySelector('#minimapCanvas')).not.toBeNull();
    expect(container.querySelector('#minimapZoomIn')).not.toBeNull();
    expect(container.querySelector('#minimapZoomOut')).not.toBeNull();
    expect(container.querySelector('#minimapToggleCollapse')).not.toBeNull();
    expect(container.querySelector('#minimapScale').textContent).toBe('35 AU');
  });

  it('toggles visibility and collapse state', () => {
    const minimap = new Minimap({ container });
    expect(minimap.visible).toBe(true);

    const isVisibleNow = minimap.toggle();
    expect(isVisibleNow).toBe(false);
    expect(container.style.display).toBe('none');

    minimap.setVisible(true);
    expect(minimap.visible).toBe(true);
    expect(container.style.display).toBe('flex');

    expect(minimap.collapsed).toBe(false);
    minimap.toggleCollapse();
    expect(minimap.collapsed).toBe(true);
    expect(container.querySelector('#minimapCanvasWrap').style.display).toBe('none');
  });

  it('handles zoom levels accurately', () => {
    const minimap = new Minimap({ container });
    expect(minimap.zoomIndex).toBe(2); // 35 AU

    minimap.zoomIn();
    expect(minimap.zoomIndex).toBe(1);
    expect(container.querySelector('#minimapScale').textContent).toBe('12 AU');

    minimap.zoomIn();
    expect(minimap.zoomIndex).toBe(0);
    expect(container.querySelector('#minimapScale').textContent).toBe('5 AU');

    // Should not zoom past min index
    minimap.zoomIn();
    expect(minimap.zoomIndex).toBe(0);

    minimap.zoomOut();
    expect(minimap.zoomIndex).toBe(1);
    expect(container.querySelector('#minimapScale').textContent).toBe('12 AU');
  });

  it('renders planetary system radar and handles clicks on planet blips', () => {
    const onSelectBody = vi.fn();
    const minimap = new Minimap({ container, onSelectBody });

    // Mock canvas 2D context
    const mockCtx = {
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      setLineDash: vi.fn(),
      fillRect: vi.fn(),
      closePath: vi.fn(),
      createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    };
    minimap.ctx = mockCtx;

    const dummyBodies = [
      { key: 'Sun', type: 'star', pivot: { position: { x: 0, y: 0, z: 0 } }, color: 0xffdd44 },
      { key: 'Earth', type: 'planet', pivot: { position: { x: 30, y: 0, z: 0 } }, color: 0x5bc4cf },
      { key: 'Mars', type: 'planet', pivot: { position: { x: 45, y: 0, z: 0 } }, color: 0xff6644 },
    ];

    minimap.render({
      allBodies: dummyBodies,
      cameraSystem: { theta: 0.5 },
      selectedBody: dummyBodies[1],
      isGalaxyMode: false,
    });

    expect(mockCtx.beginPath).toHaveBeenCalled();
    expect(minimap.renderedBlips.length).toBeGreaterThan(0);

    // Test simulated click on Earth blip
    const earthBlip = minimap.renderedBlips.find((b) => b.body.key === 'Earth');
    expect(earthBlip).toBeDefined();

    // Mock getBoundingClientRect
    minimap.canvas.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      top: 0,
      width: 220,
      height: 220,
    }));

    minimap._handleCanvasClick({ clientX: earthBlip.x, clientY: earthBlip.y });
    expect(onSelectBody).toHaveBeenCalledWith(dummyBodies[1]);
  });
});
