// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { CommandPalette } from './commandPalette.js';

describe('CommandPalette', () => {
  let palette;

  beforeEach(() => {
    document.body.innerHTML = '';
    palette = new CommandPalette();
  });

  it('initializes and toggles visibility', () => {
    expect(palette.isOpen).toBe(false);

    palette.show();
    expect(palette.isOpen).toBe(true);
    expect(document.getElementById('commandPalette')).not.toBeNull();

    palette.hide();
    expect(palette.isOpen).toBe(false);
  });

  it('renders search results correctly and highlights items without errors', () => {
    palette.show();
    palette.input.value = 'Terra';
    palette._render();

    expect(palette.currentItems.length).toBeGreaterThan(0);
    palette._highlight();

    const items = palette.results.querySelectorAll('.cmd-item');
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].style.background).toContain('rgba');
  });

  it('closes on Escape or Ctrl+K key events inside input', () => {
    palette.show();
    palette._onKey({ key: 'Escape', preventDefault: () => {} });
    expect(palette.isOpen).toBe(false);

    palette.show();
    palette._onKey({ ctrlKey: true, key: 'k', preventDefault: () => {} });
    expect(palette.isOpen).toBe(false);
  });
});
