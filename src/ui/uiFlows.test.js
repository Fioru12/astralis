// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setupTabs } from './tabs.js';
import { setupGlobalSearch } from './search.js';

describe('controlli UI accessibili', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('consente di cambiare pannello con le frecce della tastiera', () => {
    document.body.innerHTML = `
      <div><button class="tab-btn active" data-tab="simulazione">Simulazione</button><button class="tab-btn" data-tab="vista">Vista</button></div>
      <section class="tab-content active" id="tab-simulazione"></section><section class="tab-content" id="tab-vista"></section>`;
    setupTabs();

    const [simulation, view] = document.querySelectorAll('.tab-btn');
    simulation.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

    expect(view.getAttribute('role')).toBe('tab');
    expect(view.getAttribute('aria-selected')).toBe('true');
    expect(document.getElementById('tab-vista').hidden).toBe(false);
    expect(document.getElementById('tab-simulazione').hidden).toBe(true);
  });

  it('trova un corpo e lo seleziona con Invio', () => {
    document.body.innerHTML = '<input id="globalSearch"><div id="searchResults"></div>';
    const earth = { key: 'Earth', label: 'Terra', type: 'planet', icon: '🌍', pivot: {} };
    const selectBody = vi.fn();
    const zoomToBody = vi.fn();
    setupGlobalSearch([earth], selectBody, zoomToBody);

    const input = document.getElementById('globalSearch');
    input.value = 'terr';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(selectBody).toHaveBeenCalledWith(earth);
    expect(zoomToBody).toHaveBeenCalledWith(earth);
    expect(input.value).toBe('');
  });
});
